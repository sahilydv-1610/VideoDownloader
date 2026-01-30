const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const https = require('https');
const http = require('http');
const { Server } = require("socket.io");

// We use local copies of ffmpeg/ffprobe to avoid path/env issues
const ffmpegPath = require('ffmpeg-static');
const app = express();
const PORT = process.env.PORT || 5001;
console.log('ffmpeg-static path:', ffmpegPath);

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "*", // Allow all
  methods: ["GET", "POST"]
}));

// Root Health Route
app.get('/', (req, res) => {
  res.send('API is running');
});
app.use(express.json({ limit: '50mb' }));

// Path to vt-dlp binary within node_modules
const YTDLP_PATH = path.join(__dirname, 'node_modules', 'youtube-dl-exec', 'bin', 'yt-dlp.exe');

// Helper to log to file
const logToFile = (msg) => {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] ${msg}\n`;
  try {
    fs.appendFileSync(path.join(__dirname, 'server.log'), logMsg);
  } catch (e) {
    console.error("Logging failed:", e);
  }
  console.log(msg); // Also log to console
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Capture global errors to log file to debug crashes
process.on('uncaughtException', (err) => {
  logToFile(`CRASH: Uncaught Exception: ${err.message}\n${err.stack}`);
  process.exit(1);
});

server.on('error', (err) => {
  logToFile(`SERVER ERROR: ${err.message}`);
});

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Video Downloader API is running' });
});

// Helper to run yt-dlp
const runYtDlp = (args, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const process = spawn(YTDLP_PATH, args, options);
      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data;
      });

      process.stderr.on('data', (data) => {
        stderr += data;
      });

      process.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(stderr || `Process exited with code ${code}`));
        } else {
          resolve(stdout);
        }
      });

      process.on('error', (err) => {
        reject(err);
      });
    } catch (e) {
      reject(e);
    }
  });
};

// Image Proxy to bypass CORS/NotSameOrigin
app.get('/api/proxy', (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('No URL provided');

  const protocol = url.startsWith('https') ? https : http;

  protocol.get(url, (proxyRes) => {
    // Forward content type
    if (proxyRes.headers['content-type']) {
      res.setHeader('Content-Type', proxyRes.headers['content-type']);
    }
    // Allow caching
    res.setHeader('Cache-Control', 'public, max-age=86400');

    proxyRes.pipe(res);
  }).on('error', (err) => {
    console.error('Proxy Error:', err.message);
    res.status(500).send('Failed to fetch image');
  });
});

// Helper to try fetching info with different browsers
const fetchInfoWithRetry = async (url, browsers = [null, 'chrome', 'edge', 'firefox']) => {
  let lastError = null;

  for (const browser of browsers) {
    try {
      console.log(`Attempting fetch with browser: ${browser}`);
      const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
      const hasList = url.includes('list=');
      const hasVideo = url.includes('v=') || url.includes('youtu.be/');
      // detailed check: if it has both v and list, user likely wants the video
      // If user pasted a direct playlist link (no v=), they want playlist.
      const preferVideo = hasVideo && hasList;

      const args = [
        url,
        '--dump-single-json',
        '--no-warnings',
        '--prefer-free-formats',
        preferVideo ? '--no-playlist' : '--flat-playlist',
        '--js-runtimes', `node:${process.execPath}`,
        '--add-header', 'User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ];

      if (browser) {
        args.push('--cookies-from-browser', browser);
      }

      // if (isYoutube) {
      //   args.push('--youtube-skip-dash-manifest');
      // }

      const outputStr = await runYtDlp(args);
      return { output: JSON.parse(outputStr), browser };
    } catch (error) {
      console.log(`Failed with ${browser}: ${error.message}`);
      lastError = error;
      // If error is NOT related to cookies/auth, maybe don't retry? 
      // But safe to retry anyway.
    }
  }
  throw lastError;
};

// Video Info Endpoint
app.post('/api/video-info', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  // Basic Security Check
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('Invalid protocol');
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL provided' });
  }

  try {
    const { output, browser } = await fetchInfoWithRetry(url);

    // Check if Playlist
    if (output._type === 'playlist' && output.entries) {
      return res.json({
        is_playlist: true,
        id: output.id,
        title: output.title,
        webpage_url: output.webpage_url,
        extractor: output.extractor,
        auth_browser: browser,
        entries: output.entries.map(entry => ({
          id: entry.id,
          title: entry.title,
          description: entry.description,
          duration: entry.duration,
          thumbnail: entry.thumbnails ? entry.thumbnails[0].url : null,
          url: entry.url || entry.webpage_url
        })).slice(0, 50)
      });
    }

    // Normal Video Handling
    const formats = output.formats || [];
    const qualities = new Map();

    formats.forEach(f => {
      if (f.vcodec !== 'none' && f.height) {
        const height = f.height;
        const qualityLabel = `${height}p`;
        const bestAudio = formats.find(af => af.acodec !== 'none' && af.vcodec === 'none' && (af.filesize || af.filesize_approx));
        let size = f.filesize || f.filesize_approx || 0;
        if (bestAudio) size += (bestAudio.filesize || bestAudio.filesize_approx || 0);

        if (!qualities.has(qualityLabel) || (f.tbr > qualities.get(qualityLabel).tbr)) {
          qualities.set(qualityLabel, {
            quality: qualityLabel,
            height: height,
            filesize: size,
            format_id: f.format_id
          });
        }
      }
    });

    const bestAudioOnly = formats.find(f => f.acodec !== 'none' && f.vcodec === 'none');
    if (bestAudioOnly) {
      qualities.set('Audio Only', {
        quality: 'Audio Only',
        params: 'audio',
        filesize: bestAudioOnly.filesize || bestAudioOnly.filesize_approx || 0,
        format_id: bestAudioOnly.format_id
      });
    }

    const bestVideo = formats.find(f => f.vcodec !== 'none' && f.url);
    const qualitiesArray = Array.from(qualities.values()).sort((a, b) => {
      if (a.quality === 'Audio Only') return 1;
      if (b.quality === 'Audio Only') return -1;
      return b.height - a.height;
    });

    const info = {
      is_playlist: false,
      id: output.id,
      webpage_url: output.webpage_url,
      preview_url: bestVideo ? bestVideo.url : null,
      extractor: output.extractor,
      title: output.title,
      thumbnail: output.thumbnail,
      duration: output.duration,
      description: output.description,
      qualities: qualitiesArray,
      auth_browser: browser
    };

    res.json(info);
  } catch (error) {
    logToFile(`Error fetching info for ${url}: ${error.message}`);
    console.error('Error fetching info:', error);
    res.status(500).json({ error: 'Failed to fetch video info', details: error.message });
  }
});



// Job Store
const jobs = new Map();
const JOB_TIMEOUT = 1000 * 60 * 60; // 1 Hour

// Helper to cleanup old jobs
setInterval(() => {
  const now = Date.now();
  for (const [id, job] of jobs.entries()) {
    if (now - job.createdAt > JOB_TIMEOUT) {
      if (fs.existsSync(job.filePath)) {
        try { fs.unlinkSync(job.filePath); } catch (e) { }
      }
      jobs.delete(id);
    }
  }
}, 1000 * 60 * 5); // Check every 5 mins

// Async Process Endpoint
app.post('/api/process-video', async (req, res) => {
  const { url, quality, auth_browser = 'chrome', watermark = false } = req.body;
  const jobId = Math.random().toString(36).substring(7);

  const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
  if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

  const isAudio = quality === 'Audio Only';
  const filename = `download-${jobId}-${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`;
  const filePath = path.join(DOWNLOAD_DIR, filename);

  // Store Job
  jobs.set(jobId, {
    id: jobId,
    url,
    status: 'queued',
    progress: 0,
    filePath,
    filename,
    isAudio,
    watermark, // Store watermark preference
    createdAt: Date.now(),
    subprocess: null
  });

  res.json({ jobId, status: 'started' });

  // Start Processing Async
  logToFile(`Starting Job ${jobId}: URL=${url} Watermark=${watermark}`);
  io.emit('job-update', { jobId, status: 'getting info', progress: 0 });

  try {
    let args = [];
    if (isAudio) {
      // Audio Quality Logic
      const bitrate = req.body.audioBitrate || '192'; // Default to 192k
      args = [
        url, '-o', filePath, '-f', 'bestaudio/best',
        '--extract-audio', '--audio-format', 'mp3',
        '--postprocessor-args', `ffmpeg:-b:a ${bitrate}k`, // Force bitrate
        '--ffmpeg-location', __dirname, '--no-playlist',
        '--retries', '10', '--fragment-retries', '10',
        '--buffer-size', '16M', '--http-chunk-size', '10M', '-N', '16',
        '--js-runtimes', `node:${process.execPath}`,
        '--add-header', 'User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ];
    } else {
      let formatSelector = 'bestvideo+bestaudio/best';
      if (quality && quality.endsWith('p')) {
        const height = quality.replace('p', '');
        formatSelector = `bestvideo[height<=${height}]+bestaudio/best[height<=${height}]`;
      }
      const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
      args = [
        url, '-o', filePath, '-f', formatSelector,
        '--merge-output-format', 'mp4', '--ffmpeg-location', __dirname, '--no-playlist',
        // '--cookies-from-browser', auth_browser,
        '-S', 'vcodec:h264,res,acodec:m4a',
        '--retries', '10', '--fragment-retries', '10',
        '--buffer-size', '16M', '--http-chunk-size', '10M', '-N', '16',
        '--js-runtimes', `node:${process.execPath}`,
        '--add-header', 'User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ];
      if (auth_browser) {
        args.push('--cookies-from-browser', auth_browser);
      }
      if (!isYoutube) {
        // Use bestvideo+bestaudio/best to avoid "best" warning and get better quality
        args = [url, '-o', filePath, '-f', 'bestvideo+bestaudio/best', '--ffmpeg-location', __dirname, '--no-playlist'];
        if (auth_browser) {
          args.push('--cookies-from-browser', auth_browser);
        }
      }
    }

    const ffmpegDir = path.dirname(ffmpegPath);
    const newPath = ffmpegDir + path.delimiter + process.env.PATH;
    const env = { ...process.env, PATH: newPath };

    // Handle Manual FFmpeg location replacement if needed
    const ffmpegLocIndex = args.indexOf('--ffmpeg-location');
    if (ffmpegLocIndex !== -1) args[ffmpegLocIndex + 1] = ffmpegDir;

    const subprocess = spawn(YTDLP_PATH, args, { env });
    jobs.get(jobId).subprocess = subprocess;
    const progressRegex = /\[download\]\s+(\d+\.?\d*)%/;

    subprocess.stderr.on('data', (data) => {
      const msg = data.toString();
      // Only log errors, ignore generic info if it's not crucial
      if (msg.includes('ERROR') || msg.toLowerCase().includes('failed')) {
        logToFile(`Job ${jobId} STDERR: ${msg}`);
      }
      // io.emit('job-update', { jobId, status: 'error', message: msg });
    });

    subprocess.stdout.on('data', (data) => {
      const text = data.toString();
      const match = text.match(progressRegex);
      if (match) {
        const percentage = parseFloat(match[1]);
        const currentJob = jobs.get(jobId);

        currentJob.progress = percentage;

        // If we hit 100%, we are entering the merge/processing phase
        if (percentage >= 100) {
          currentJob.status = 'merging';
          io.emit('job-progress', { jobId, progress: 100, status: 'merging' });
        } else {
          currentJob.status = 'downloading';
          io.emit('job-progress', { jobId, progress: percentage, status: 'downloading' });
        }
      }
    });

    subprocess.on('close', (code) => {
      if (code !== 0) {
        // Fallback Logic Simplified for brevity (can re-add if strict robustness needed, but skipping for logic clarity now)
        if (fs.existsSync(filePath)) {
          // Assume success if file exists despite code (sometimes warnings trigger code 1)
          const stats = fs.statSync(filePath);
          if (stats.size > 0) {
            handleCompletion(jobId, filename, filePath, watermark);
            return;
          }
        }
        jobs.get(jobId).status = 'failed';
        logToFile(`Job ${jobId} exited with code ${code}`);
        io.emit('job-error', { jobId, message: `Process exited with code ${code}` });
      } else {
        if (fs.existsSync(filePath)) {
          handleCompletion(jobId, filename, filePath, watermark);
        } else {
          // Check parts if merged failed (omitted for brevity, assuming standard success first)
          jobs.get(jobId).status = 'failed';
          io.emit('job-error', { jobId, message: 'File not found after download' });
        }
      }
    });

  } catch (error) {
    logToFile(`Job ${jobId} Exception: ${error.message}`);
    const job = jobs.get(jobId);
    if (job) job.status = 'failed';
    io.emit('job-error', { jobId, message: error.message });
  }
});

// Separate function to handle completion and optional watermarking
const handleCompletion = (jobId, filename, filePath, watermark) => {
  const job = jobs.get(jobId);
  if (!job) return;

  if (watermark && !job.isAudio) {
    // Apply Watermark
    job.status = 'processing_watermark';
    io.emit('job-update', { jobId, status: 'Adding Watermark...', progress: 100 });

    const tempPath = filePath + '.raw.mp4';
    try {
      fs.renameSync(filePath, tempPath); // Rename original to temp
    } catch (e) {
      io.emit('job-error', { jobId, message: 'Failed to prepare video for watermarking' });
      return;
    }

    let ffmpegArgs = [];
    let watermarkPath = null;

    // Check if watermark is a Base64 Image string
    if (typeof watermark === 'string' && watermark.startsWith('data:image')) {
      try {
        const matches = watermark.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const buffer = Buffer.from(matches[2], 'base64');
          watermarkPath = path.join(path.dirname(filePath), `watermark-${jobId}.png`);
          fs.writeFileSync(watermarkPath, buffer);
        }
      } catch (e) {
        logToFile(`Error saving watermark image: ${e.message}`);
      }
    }

    if (watermarkPath) {
      // Use Image Overlay (Top-Left, Ratio-Safe)
      // Horizontal Gap: 2.5% | Vertical Gap: 4%
      logToFile(`Using Image Overlay for Job ${jobId}`);
      ffmpegArgs = [
        '-i', tempPath,
        '-i', watermarkPath,
        // Overlay at Top-Left
        // x = MainWidth * 0.025
        // y = MainHeight * 0.04
        '-filter_complex', "[0:v][1:v]overlay=x=main_w*0.025:y=main_h*0.04",
        '-c:v', 'libx264',
        '-profile:v', 'main',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-preset', 'ultrafast',
        '-y',
        filePath
      ];
    } else {
      // No Watermark Image? Skip (Strict Mode)
      // User requested "Unified rendering method only"
      // Fallback to simpler copy or error
      logToFile(`Watermark Image Missing for Job ${jobId}. Skipping watermark to preserve quality.`);
      fs.renameSync(tempPath, filePath); // Restore original
      job.status = 'completed';
      job.progress = 100;
      io.emit('job-complete', { jobId, filename });
      return;
    }

    logToFile(`Applying watermark for Job ${jobId}`);
    const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);

    ffmpegProcess.on('close', (fCode) => {
      // Cleanup watermark file if it exists
      if (watermarkPath && fs.existsSync(watermarkPath)) {
        try { fs.unlinkSync(watermarkPath); } catch (e) { }
      }

      if (fCode === 0) {
        // Success
        try { fs.unlinkSync(tempPath); } catch (e) { } // Clean up raw
        job.status = 'completed';
        job.progress = 100;
        io.emit('job-complete', { jobId, filename });
      } else {
        // Restore original on failure
        try {
          if (fs.existsSync(tempPath) && !fs.existsSync(filePath)) {
            fs.renameSync(tempPath, filePath);
          }
        } catch (e) { }

        logToFile(`Watermark failed for Job ${jobId} with code ${fCode}. Returning clean video.`);
        job.status = 'completed';
        job.progress = 100;
        io.emit('job-complete', { jobId, filename });
      }
    });

  } else {
    // No watermark needed
    job.status = 'completed';
    job.progress = 100;
    io.emit('job-complete', { jobId, filename });
  }
};

// Cancel Download Endpoint
app.post('/api/cancel-download', (req, res) => {
  const { jobId } = req.body;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  logToFile(`Cancelling Job ${jobId}`);

  // Kill subprocess if exists
  if (job.subprocess) {
    try {
      // On Windows, taskkill might be needed for tree kill
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', job.subprocess.pid, '/f', '/t']);
      } else {
        job.subprocess.kill('SIGKILL');
      }
    } catch (e) {
      logToFile(`Failed to kill process: ${e.message}`);
    }
  }

  job.status = 'cancelled';
  io.emit('job-update', { jobId, status: 'cancelled' });

  // Delete partial file
  setTimeout(() => {
    if (fs.existsSync(job.filePath)) {
      try {
        fs.unlinkSync(job.filePath);
        logToFile(`Deleted partial file for job ${jobId}`);
      } catch (e) {
        logToFile(`Failed to delete partial file: ${e.message}`);
      }
    }
  }, 1000); // Small delay to ensure process handle is released

  res.json({ status: 'cancelled' });
});

// Download File Endpoint
app.get('/api/download-file/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job || !fs.existsSync(job.filePath)) {
    return res.status(404).send('File expired or not found');
  }

  res.download(job.filePath, job.filename, (err) => {
    if (!err) {
      // Optional: delete after download? Or keep for cache?
      // Let's keep for cache until timeout
    }
  });
});

// Original Sync Download (Deprecated/Legacy support)
app.get('/api/download', async (req, res) => {
  // Redirect to use new Async system if possible, but for now keep legacy simple catch
  return res.status(400).send("Please use the new async V2 API");
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
