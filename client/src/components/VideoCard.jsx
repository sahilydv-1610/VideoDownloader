import React, { useState, memo, useMemo, useEffect } from 'react';
import { Download, Play, Copy, CheckCircle2, FileVideo, Zap, X, Image as ImageIcon, Music, Film, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useClipboard } from '../hooks/useClipboard';
import { useSettings } from '../contexts/SettingsContext';

export const VideoCard = memo(({ info, onDownload }) => {
    const [showPreview, setShowPreview] = useState(false);
    const [isWatermarkEnabled, setIsWatermarkEnabled] = useState(false);
    const [wmOpacity, setWmOpacity] = useState(0.8);

    // Download Configuration State
    const [downloadMode, setDownloadMode] = useState('merged'); // 'merged' | 'video' | 'audio'
    const [selectedRes, setSelectedRes] = useState(1080);
    const [selectedFps, setSelectedFps] = useState(30);
    const [selectedAudioBitrate, setSelectedAudioBitrate] = useState('192');

    const { settings } = useSettings();
    const { copyToClipboard, isCopied } = useClipboard();

    // --- Format Parsing Logic ---
    const availableFormats = useMemo(() => {
        if (!info?.raw_formats) return { resolutions: [], fpsMap: {} };

        // Filter valid video formats
        const videoFormats = info.raw_formats.filter(f => f.vcodec !== 'none' && f.height);

        // Get unique resolutions (sorted desc)
        const resolutions = [...new Set(videoFormats.map(f => f.height))].sort((a, b) => b - a);

        // Map resolution -> available FPS options
        const fpsMap = {};
        resolutions.forEach(res => {
            const formatsAtRes = videoFormats.filter(f => f.height === res);
            const fpsOptions = [...new Set(formatsAtRes.map(f => f.fps || 30))].sort((a, b) => a - b);
            fpsMap[res] = fpsOptions;
        });

        return { resolutions, fpsMap, videoFormats };
    }, [info]);

    // Initialize defaults when info loads or settings change
    useEffect(() => {
        if (availableFormats.resolutions.length > 0) {
            let targetRes = availableFormats.resolutions[0]; // Default to highest (Best)

            // Apply User Preference
            if (settings.defaultQuality && settings.defaultQuality !== 'best') {
                const pref = parseInt(settings.defaultQuality);
                if (!isNaN(pref)) {
                    // Check if exact match exists
                    if (availableFormats.resolutions.includes(pref)) {
                        targetRes = pref;
                    } else {
                        // Fallback: If preference is 1080p but video is only 720p, ideally we take 720p (best available).
                        // If preference is 480p but video is 1080p, maybe we still want low quality?
                        // For now, "Fallback gracefully" -> "Best Available" is the safest simple default if exact match missing.
                        // Or we can find the closest resolution? 
                        // Let's stick to Best Available as fallback prevents "upscaling" thinking or "too low" quality.
                    }
                }
            }

            setSelectedRes(targetRes);

            // Check available FPS for this res
            const fpsOpts = availableFormats.fpsMap[targetRes] || [];
            if (fpsOpts.includes(30)) setSelectedFps(30);
            else if (fpsOpts.length > 0) setSelectedFps(fpsOpts[fpsOpts.length - 1]); // Max available logic
        }
    }, [availableFormats.resolutions, settings.defaultQuality]);

    // Initialize Audio Bitrate from Settings
    useEffect(() => {
        if (settings.audioBitrate) {
            setSelectedAudioBitrate(settings.audioBitrate);
        }
    }, [settings.audioBitrate]);

    // Ensure selected FPS is valid for selected Resolution
    useEffect(() => {
        const validFps = availableFormats.fpsMap[selectedRes] || [];
        if (validFps.length > 0 && !validFps.includes(selectedFps)) {
            // Auto-switch to nearest or max
            setSelectedFps(validFps[validFps.length - 1]);
        }
    }, [selectedRes, availableFormats.fpsMap]);


    // Updated 'News Pill' Watermark Logic
    const generateWatermark = (videoHeight, opacity = 1.0) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Responsive Scaling - Discrete 'Bug' Size
            const unit = Math.max(12, Math.round(videoHeight / 45)); // Much smaller (~2.2% height)
            const pillHeight = unit * 1.8;
            const fontSize = pillHeight * 0.72; // Bold text size

            ctx.font = `800 ${fontSize}px "Inter", "Roboto", sans-serif`;
            const mIndia = ctx.measureText("INDIA");

            ctx.font = `900 ${fontSize}px "Inter", "Roboto", sans-serif`; // Extra bold for 24x7
            const m247 = ctx.measureText("24x7");

            const paddingX = pillHeight * 0.4;
            const leftWidth = mIndia.width + (paddingX * 2);
            const rightWidth = m247.width + (paddingX * 2);
            const totalW = leftWidth + rightWidth;
            const totalH = pillHeight;

            canvas.width = totalW;
            canvas.height = totalH;

            // Draw Left Block (Black/Onyx)
            ctx.globalAlpha = opacity;
            ctx.fillStyle = "#0f0f11";
            ctx.beginPath();
            // Rounded corners only on left
            ctx.roundRect(0, 0, leftWidth + 5, totalH, [8, 0, 0, 8]);
            ctx.fill();

            // Draw Right Block (Amber)
            ctx.fillStyle = "#FFB400";
            ctx.beginPath();
            // Rounded corners only on right
            ctx.roundRect(leftWidth, 0, rightWidth, totalH, [0, 8, 8, 0]);
            ctx.fill();

            // Divider Line (Subtle)
            ctx.fillStyle = "rgba(255,255,255,0.1)";
            ctx.fillRect(leftWidth, 0, 1, totalH);

            // Draw Text: INDIA (White)
            ctx.fillStyle = "#FFFFFF";
            ctx.font = `800 ${fontSize}px "Inter", "Roboto", sans-serif`;
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillText("INDIA", leftWidth / 2, totalH / 2 + (unit * 0.05)); // slight optical adjust

            // Draw Text: 24x7 (Black)
            ctx.fillStyle = "#000000";
            ctx.font = `900 ${fontSize}px "Inter", "Roboto", sans-serif`;
            ctx.fillText("24x7", leftWidth + (rightWidth / 2), totalH / 2 + (unit * 0.05));

            /* 
               Optional: Add a "Live" dot if space permits, but user asked to be "small".
               The pill itself is the watermark now.
            */

            return canvas.toDataURL('image/png');
        } catch (e) {
            console.error("Watermark generation failed", e);
            return null;
        }
    };

    const getProxiedUrl = (url) => {
        if (!url) return '';
        if (url.includes('youtube.com') || url.includes('youtu.be')) return url;
        return `/api/proxy?url=${encodeURIComponent(url)}`;
    };

    const handleMainDownload = () => {
        let finalOptions = {
            mode: downloadMode === 'merged' ? 'video_audio' : (downloadMode === 'audio' ? 'audio_only' : 'video_only'),
            watermark: isWatermarkEnabled,
            audioBitrate: selectedAudioBitrate
        };

        let formatId = null;
        let qualityLabel = 'Best';

        if (downloadMode !== 'audio') {
            // Find specific video format ID
            const target = availableFormats.videoFormats.find(f =>
                f.height === selectedRes &&
                (Math.abs((f.fps || 30) - selectedFps) < 1) // approximate float match
            );

            if (target) {
                formatId = target.format_id;
                qualityLabel = `${selectedRes}p`;
            } else {
                // Fallback: just send height param if specific ID fails logic
                // But generally logic should be robust.
                qualityLabel = `${selectedRes}p`;
            }

            if (isWatermarkEnabled && downloadMode !== 'audio') {
                const wmUrl = generateWatermark(selectedRes, wmOpacity);
                if (wmUrl) finalOptions.watermark = wmUrl;
            }
        } else {
            qualityLabel = 'Audio Only';
        }

        onDownload(qualityLabel, formatId, finalOptions);
    };

    const isInstagram = info.extractor?.includes('instagram');

    // Helper for button text
    const getDownloadButtonText = () => {
        if (downloadMode === 'audio') {
            return `Download Audio (${selectedAudioBitrate}kbps)`;
        }
        const videoPart = `Download ${downloadMode === 'merged' ? 'Video' : 'Video Only'}`;
        const specs = `${selectedRes}p · ${selectedFps}FPS${downloadMode === 'merged' ? ` · ${selectedAudioBitrate}kbps` : ''}`;
        return `${videoPart} (${specs})`;
    };

    if (!info) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full glass-card rounded-3xl overflow-hidden group hover:shadow-2xl hover:shadow-violet-900/10 transition-all duration-300"
        >
            <div className="flex flex-col md:flex-row">
                {/* Thumbnail */}
                <div
                    className="w-full md:w-80 aspect-video md:aspect-auto relative cursor-pointer bg-black/60 overflow-hidden"
                    onClick={() => setShowPreview(true)}
                >
                    <img
                        src={getProxiedUrl(info.thumbnail)}
                        alt={info.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        onError={(e) => { e.target.src = info.thumbnail; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                            <Play className="w-6 h-6 fill-current ml-1" />
                        </div>
                    </div>
                    {/* Badge */}
                    <div className="absolute top-4 left-4 z-10">
                        <div className={clsx(
                            "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-md flex items-center gap-1.5 border border-white/10",
                            isInstagram ? "bg-gradient-to-r from-fuchsia-600 to-pink-600" : "bg-gradient-to-r from-red-600 to-red-500"
                        )}>
                            {isInstagram ? <Zap className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                            {isInstagram ? "INSTAGRAM" : "YOUTUBE"}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col relative">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-5 mb-6">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-white line-clamp-2 leading-snug tracking-tight select-text" title={info.title}>
                                {info.title}
                            </h2>
                            <p className="text-sm text-violet-200/60 font-medium flex items-center gap-2">
                                {info.uploader || 'Unknown Author'}
                                {info.duration && <span className="text-white/20">•</span>}
                                {info.duration && <span>{Math.floor(info.duration / 60)}:{Math.floor(info.duration % 60).toString().padStart(2, '0')}</span>}
                            </p>
                        </div>
                        <button
                            onClick={() => copyToClipboard(info.title, 'title')}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-violet-300 transition-colors border border-white/5"
                            title="Copy Title"
                        >
                            {isCopied('title') ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Description Section */}
                    {info.description && (
                        <div className="mb-6 relative group/desc">
                            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors">
                                <div className="flex justify-between gap-4">
                                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 font-light select-text">
                                        {info.description}
                                    </p>
                                    <button
                                        onClick={() => copyToClipboard(info.description, 'desc')}
                                        className="shrink-0 p-2 rounded-lg bg-black/20 hover:bg-black/40 text-white/40 hover:text-white transition-all self-start"
                                        title="Copy Description"
                                    >
                                        {isCopied('desc') ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- CONTROL CENTER --- */}
                    <div className="mt-auto bg-black/20 rounded-2xl p-4 border border-white/5">

                        {/* Mode Tabs */}
                        <div className="flex p-1 bg-black/40 rounded-xl mb-5">
                            {[
                                { id: 'merged', label: 'Video + Audio', icon: Layers },
                                { id: 'video', label: 'Video Only', icon: Film },
                                { id: 'audio', label: 'Audio Only', icon: Music },
                            ].map(mode => (
                                <button
                                    key={mode.id}
                                    onClick={() => setDownloadMode(mode.id)}
                                    className={clsx(
                                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all",
                                        downloadMode === mode.id
                                            ? "bg-violet-600 text-white shadow-lg"
                                            : "text-white/40 hover:text-white/70 hover:bg-white/5"
                                    )}
                                >
                                    <mode.icon className="w-3.5 h-3.5" />
                                    {mode.label}
                                </button>
                            ))}
                        </div>

                        {/* Video Controls (Persist visually but disabled if audio mode) */}
                        <div className={clsx("space-y-4 mb-5 animate-fade-in transition-opacity duration-300", downloadMode === 'audio' ? "opacity-30 pointer-events-none grayscale" : "opacity-100")}>
                            {/* Resolution */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Quality</label>
                                    <button
                                        onClick={() => setIsWatermarkEnabled(!isWatermarkEnabled)}
                                        className={clsx(
                                            "flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded transition-all border",
                                            isWatermarkEnabled
                                                ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                                                : "bg-white/5 text-gray-500 border-white/5 hover:text-gray-300"
                                        )}
                                    >
                                        <div className={clsx("w-2 h-2 rounded-full border flex items-center justify-center", isWatermarkEnabled ? "border-amber-500 bg-amber-500" : "border-current")} />
                                        Watermark
                                    </button>
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                    {availableFormats.resolutions.map(res => (
                                        <button
                                            key={res}
                                            onClick={() => setSelectedRes(res)}
                                            className={clsx(
                                                "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap",
                                                selectedRes === res
                                                    ? "bg-white text-black border-white"
                                                    : "bg-white/5 text-white/50 border-white/5 hover:bg-white/10"
                                            )}
                                        >
                                            {res}p
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* FPS */}
                            <div>
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2 block">Framerate</label>
                                <div className="flex gap-2">
                                    {[24, 30, 48, 60].map(fps => {
                                        const supported = availableFormats.fpsMap[selectedRes]?.some(f => Math.abs(f - fps) < 5);
                                        // Simple check: if exact FPS or close enough exists
                                        // The backend sends exact fps like 29.97. The map keys are mostly normalized in logic above?
                                        // Actually I didn't normalize heavily in useMemo.
                                        // Let's rely on strict check against what we put in map.
                                        // We stored `fpsOptions` as raw values.

                                        const isAvailable = availableFormats.fpsMap[selectedRes]?.some(availableFps =>
                                            Math.abs(availableFps - fps) < 2 // Tolerance
                                        );

                                        return (
                                            <button
                                                key={fps}
                                                disabled={!isAvailable}
                                                onClick={() => setSelectedFps(fps)}
                                                title={!isAvailable ? `Not available for ${selectedRes}p` : `${fps} FPS`}
                                                className={clsx(
                                                    "flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all",
                                                    selectedFps === fps
                                                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                                                        : isAvailable
                                                            ? "bg-white/5 text-white/50 border-white/5 hover:bg-white/10"
                                                            : "bg-black/20 text-white/10 border-transparent cursor-not-allowed opacity-50"
                                                )}
                                            >
                                                {fps}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>


                        {/* Audio Controls */}
                        <div className={clsx("mb-5 animate-fade-in transition-opacity", downloadMode === 'video' ? "opacity-30 pointer-events-none grayscale" : "opacity-100")}>
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2 block">Audio Quality</label>
                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                {['320', '256', '192', '128', '64'].map(bitrate => (
                                    <button
                                        key={bitrate}
                                        onClick={() => setSelectedAudioBitrate(bitrate)}
                                        className={clsx(
                                            "flex-1 min-w-[60px] py-1.5 rounded-lg text-xs font-bold border transition-all",
                                            selectedAudioBitrate === bitrate
                                                ? "bg-pink-500/20 text-pink-400 border-pink-500/50"
                                                : "bg-white/5 text-white/50 border-white/5 hover:bg-white/10"
                                        )}
                                    >
                                        {bitrate}k
                                    </button>
                                ))}
                            </div>
                        </div>


                        {/* MAIN DOWNLOAD BUTTON */}
                        <button
                            onClick={handleMainDownload}
                            className="w-full py-4 rounded-xl font-bold text-sm bg-white text-black hover:bg-gray-200 transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            <span>{getDownloadButtonText()}</span>
                        </button>

                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10"
                        onClick={() => setShowPreview(false)}
                    >
                        <div className="relative w-full max-w-6xl aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10 ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setShowPreview(false)} className="absolute top-6 right-6 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-white/10 border border-white/10 transition-all"><X className="w-6 h-6" /></button>
                            {info.extractor === 'youtube' ? (
                                <iframe src={`https://www.youtube.com/embed/${info.id}?autoplay=1`} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
                            ) : info.preview_url ? (
                                <video src={getProxiedUrl(info.preview_url)} controls autoPlay className="w-full h-full" />
                            ) : (
                                <div className="flex h-full items-center justify-center flex-col text-gray-500 gap-4">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                                        <FileVideo className="w-10 h-10 opacity-50" />
                                    </div>
                                    <p className="font-medium">No Preview Available</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});
