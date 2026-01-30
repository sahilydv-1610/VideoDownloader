import { Download, Clock, Play, Check, Copy, FileVideo, Music, ChevronDown, ChevronUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, memo, useMemo } from 'react';
import clsx from 'clsx';
import { useClipboard } from '../hooks/useClipboard';

export const VideoCard = memo(({ info, onDownload }) => {
    const [showPreview, setShowPreview] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isWatermarkEnabled, setIsWatermarkEnabled] = useState(false);

    // Use our new robust hook
    const { copyToClipboard, isCopied } = useClipboard();

    // Professional Watermark Generator (Muted Tricolor / "Enterprise Grade")
    const generateWatermarkDataUrl = (videoHeight) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Standardized Scaling: 1/35th of video height (Compact Top-Left)
            const baseSize = Math.max(20, Math.round(videoHeight / 35));

            // Font Definitions (Neo-grotesk / Humanist)
            const fontPrimary = `500 ${baseSize}px "Inter", "Roboto", sans-serif`;
            const fontMono = `400 ${baseSize * 0.75}px "Roboto Mono", monospace`; // Smaller 24x7
            const fontSecondary = `500 ${baseSize}px "Inter", "Roboto", sans-serif`;

            // Text Segments
            const txt1 = "INDIA";
            const txt2 = "24×7";
            const txt3 = "Viral";

            // Spacing (Slightly wide tracking)
            const tracking = baseSize * 0.15;
            const gap = baseSize * 0.4;

            ctx.font = fontPrimary;
            const m1 = ctx.measureText(txt1);

            ctx.font = fontMono;
            const m2 = ctx.measureText(txt2);

            ctx.font = fontSecondary;
            const m3 = ctx.measureText(txt3);

            // Total Width
            const totalWidth = m1.width + tracking + m2.width + gap + m3.width + (baseSize);
            const totalHeight = baseSize * 1.8; // Increased height for underline

            // Canvas Setup
            canvas.width = totalWidth;
            canvas.height = totalHeight;

            // Render Logic: Muted Tricolor + Higher Opacity for Visibility
            ctx.textBaseline = 'middle';

            // Adjusted Opacity: 25% (Visible but still professional)
            // 5% was too subtle for user preference.
            ctx.globalAlpha = .8;
            ctx.globalCompositeOperation = 'source-over';

            let x = 0;
            const y = totalHeight / 2;

            // 1. INDIA (Muted Saffron - #F09659)
            ctx.font = fontPrimary;
            ctx.fillStyle = '#F09659';
            ctx.fillText(txt1, x, y);
            x += m1.width + tracking;

            // 2. 24x7 (Soft Off-White - #F5F5F5)
            ctx.font = fontMono;
            ctx.fillStyle = '#F5F5F5';
            ctx.fillText(txt2, x, y + (baseSize * 0.15)); // Lowered slightly
            x += m2.width;

            // 3. Viral (Muted Green - #4A7C59)
            ctx.font = fontSecondary;
            ctx.fillStyle = '#4A7C59';
            ctx.fillText(txt3, x, y);

            // 4. Tricolor Underline (Professional Accent)
            const lineY = y + (baseSize * 0.65); // Just below text
            const lineWidth = x + m3.width; // Span full text width
            const lineHeight = Math.max(2, baseSize * 0.2); // Proportional thickness

            const grad = ctx.createLinearGradient(0, 0, lineWidth, 0);
            grad.addColorStop(0, '#F09659'); // Saffron
            grad.addColorStop(0.5, '#F5F5F5'); // White
            grad.addColorStop(1, '#4A7C59'); // Green

            ctx.globalAlpha = 0.8; // Distinct line
            ctx.fillStyle = grad;
            ctx.fillRect(0, lineY, lineWidth, lineHeight);

            return canvas.toDataURL('image/png');
        } catch (e) {
            console.error("Watermark generation failed", e);
            return null;
        }
    };

    // Memoize the preview watermark (assuming standard 1080p preview for consistency)
    const previewWatermarkUrl = useMemo(() => {
        if (!isWatermarkEnabled) return null;
        return generateWatermarkDataUrl(1080);
    }, [isWatermarkEnabled]);

    if (!info) return null;

    const formatBytes = (bytes) => {
        if (!bytes) return '-';
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 B';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    };

    const getProxiedUrl = (url) => {
        if (!url) return '';
        if (url.includes('youtube.com') || url.includes('youtu.be')) return url;
        // Use environment variable if available, else relative
        return `/api/proxy?url=${encodeURIComponent(url)}`;
    };

    const videoQualities = (info?.qualities || []).filter(q => q.quality !== 'Audio Only');
    const audioQualities = (info?.qualities || []).filter(q => q.quality === 'Audio Only');

    const handleDownloadClick = (quality, format_id, options) => {
        let finalOptions = { ...options };
        if (isWatermarkEnabled && !options.audioBitrate) { // Only for video
            // Generate exact size watermark for target resolution
            const targetHeight = quality.endsWith('p') ? parseInt(quality) : 1080;
            const wmUrl = generateWatermarkDataUrl(targetHeight || 1080);
            if (wmUrl) {
                finalOptions.watermark = wmUrl; // Send Data URL
            } else {
                finalOptions.watermark = true; // Fallback to boolean (server might handle text fallback)
            }
        }
        onDownload(quality, format_id, finalOptions);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full relative group/card"
            >
                {/* Simplified Glow for Performance */}
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/20 to-violet-500/20 rounded-[2rem] blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative w-full glass-card rounded-[2rem] overflow-hidden backdrop-blur-md border border-white/60 dark:border-white/5 flex flex-col lg:flex-row shadow-xl">

                    {/* Thumbnail Section */}
                    <div className="w-full lg:w-[400px] relative group cursor-pointer overflow-hidden bg-slate-950 flex-shrink-0 aspect-video lg:aspect-auto" onClick={() => setShowPreview(true)}>
                        <div className="w-full h-full relative z-10">
                            <img
                                src={getProxiedUrl(info.thumbnail)}
                                alt={info.title}
                                className="w-full h-full object-cover opacity-90 group-hover:opacity-75 transition-all duration-500 scale-100 group-hover:scale-105"
                                onError={(e) => { e.target.src = info.thumbnail; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl hover:scale-110 transition-transform">
                                    <Play className="w-6 h-6 ml-1 text-white" fill="currentColor" />
                                </div>
                            </div>

                            {/* Safe Mode Watermark (Preview) */}
                            {previewWatermarkUrl && (
                                <img
                                    src={previewWatermarkUrl}
                                    alt="Watermark"
                                    className="absolute top-[4%] left-[2.5%] z-50 pointer-events-none select-none h-auto w-auto"
                                    style={{ height: 'calc(100% / 35 * 1.5)' }} // Standardized visual matching
                                />
                            )}

                            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-white flex items-center gap-1.5 border border-white/10">
                                <Clock className="w-3 h-3 text-sky-400" />
                                {info.duration_string || (`${Math.floor(info.duration / 60)}:${(info.duration % 60).toString().padStart(2, '0')}`)}
                            </div>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 p-6 lg:p-8 flex flex-col min-w-0 bg-gradient-to-b from-white/50 to-transparent dark:from-white/[0.02] dark:to-transparent">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/20">
                                    {info.extractor || 'Source'}
                                </span>
                            </div>

                            <div className="flex items-start justify-between gap-4 mb-4">
                                <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white leading-tight line-clamp-2 break-words tracking-tight">
                                    {info.title}
                                </h2>
                                <button
                                    onClick={() => copyToClipboard(info.title, 'title')}
                                    className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-sky-50 dark:hover:bg-white/10 text-slate-400 hover:text-sky-500 transition-all flex-shrink-0 active:scale-95"
                                    title="Copy Title"
                                >
                                    {isCopied('title') ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>

                            {info.description && (
                                <div className="bg-slate-50/50 dark:bg-black/20 rounded-2xl p-4 border border-slate-100 dark:border-white/5 relative group/desc transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            Description
                                        </h3>
                                        <button
                                            onClick={() => copyToClipboard(info.description, 'desc')}
                                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-sky-500 transition-colors flex items-center gap-1.5 text-xs font-bold active:scale-95"
                                            title="Copy Description"
                                        >
                                            {isCopied('desc') ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span className="hidden sm:inline">Copy</span>
                                        </button>
                                    </div>
                                    <div className={clsx(
                                        "text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line overflow-hidden transition-all duration-300 font-medium",
                                        isDescriptionExpanded ? "max-h-[500px] overflow-y-auto custom-scrollbar" : "max-h-[60px]"
                                    )}>
                                        {info.description}
                                    </div>
                                    {info.description.length > 100 && (
                                        <button
                                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                            className="w-full mt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors py-1 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/10"
                                        >
                                            {isDescriptionExpanded ? (
                                                <><ChevronUp className="w-3.5 h-3.5" /> Show Less</>
                                            ) : (
                                                <><ChevronDown className="w-3.5 h-3.5" /> Show More</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Formats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                            {/* Video Qualities */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <FileVideo className="w-3.5 h-3.5 text-sky-500" /> Video
                                    </h3>

                                    {/* Watermark Toggle */}
                                    <button
                                        onClick={() => setIsWatermarkEnabled(!isWatermarkEnabled)}
                                        className={clsx(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border outline-none",
                                            isWatermarkEnabled
                                                ? "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20"
                                                : "bg-slate-100 dark:bg-white/5 text-slate-500 border-transparent hover:bg-slate-200 dark:hover:bg-white/10"
                                        )}
                                        title="Toggle Watermark"
                                    >
                                        <div className={clsx(
                                            "w-2 h-2 rounded-full transition-colors",
                                            isWatermarkEnabled ? "bg-orange-500 animate-pulse" : "bg-slate-400"
                                        )} />
                                        {isWatermarkEnabled ? "Watermark ON" : "Watermark OFF"}
                                    </button>
                                </div>

                                {videoQualities.slice(0, 4).map((item, idx) => (
                                    <button
                                        key={`${item.quality}-${idx}`}
                                        onClick={() => handleDownloadClick(item.quality, item.format_id, {})}
                                        className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-sky-500/30 transition-all group text-left active:scale-[0.98] shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-xs">
                                                {item.height}p
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">MP4 Video</div>
                                                <div className="text-[10px] text-slate-400 font-medium">{formatBytes(item.filesize)}</div>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:bg-sky-500 group-hover:border-transparent group-hover:text-white transition-all">
                                            <Download className="w-4 h-4" />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Audio Qualities */}
                            {audioQualities.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <Music className="w-3.5 h-3.5 text-violet-500" /> Audio
                                    </h3>
                                    {audioQualities.map((item, idx) => (
                                        <div key={`${item.quality}-${idx}`} className="p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-xs">
                                                        MP3
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-900 dark:text-white">Audio Only</div>
                                                        <div className="text-[10px] text-slate-400 font-medium">Select Quality</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2">
                                                {['128', '192', '320'].map((bitrate) => (
                                                    <button
                                                        key={bitrate}
                                                        onClick={() => handleDownloadClick(item.quality, item.format_id, { audioBitrate: bitrate })}
                                                        className="flex flex-col items-center justify-center py-2 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-violet-500 hover:text-white dark:hover:bg-violet-600 transition-all active:scale-95 group/btn"
                                                    >
                                                        <span className="text-xs font-bold">{bitrate}k</span>
                                                        <span className="text-[9px] opacity-60 font-medium group-hover/btn:text-white/80">{bitrate === '320' ? 'HQ' : bitrate === '128' ? 'Low' : 'Mid'}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8"
                        onClick={() => setShowPreview(false)}
                    >
                        <div className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="absolute top-4 right-4 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors border border-white/10 backdrop-blur-md"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Watermark Preview Overlay */}
                            {previewWatermarkUrl && (
                                <img
                                    src={previewWatermarkUrl}
                                    alt="Watermark"
                                    className="absolute top-[4%] left-[2.5%] z-50 pointer-events-none select-none h-auto w-auto"
                                    style={{ height: 'calc(100% / 35 * 1.5)' }} // Consistent Scaling
                                />
                            )}

                            {info.extractor === 'youtube' ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${info.id}?autoplay=1`}
                                    title="Preview"
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : info.preview_url ? (
                                <video
                                    src={getProxiedUrl(info.preview_url)}
                                    controls
                                    autoPlay
                                    className="w-full h-full"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center flex-col text-slate-500">
                                    <FileVideo className="w-20 h-20 mb-6 opacity-20" />
                                    <p className="font-bold tracking-widest uppercase opacity-50">Preview unavailable</p>
                                </div>
                            )}
                        </div>
                    </motion.div >
                )}
            </AnimatePresence >
        </>
    );
});
