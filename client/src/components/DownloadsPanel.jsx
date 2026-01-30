import { useDownloads } from '../contexts/DownloadContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, X, Minimize2, Maximize2, Download } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export function DownloadsPanel() {
    const { jobs, cancelDownload, dismissJob } = useDownloads();
    const [isMinimized, setIsMinimized] = useState(false);

    const activeJobs = Object.values(jobs).filter(j => j.status !== 'dismissed');

    if (activeJobs.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 200, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={clsx(
                    "fixed z-[100] transition-all duration-500 ease-spring",
                    // Mobile: Full width bottom sheet or floating pill
                    "bottom-0 left-0 right-0 md:left-auto md:right-6 md:bottom-6",
                    // Width logic
                    isMinimized
                        ? "w-full md:w-auto p-4 md:p-0 bg-transparent pointer-events-none md:pointer-events-auto"
                        : "w-full md:w-96"
                )}
            >
                <div className={clsx(
                    "glass-premium overflow-hidden shadow-2xl transition-all duration-300 pointer-events-auto",
                    isMinimized
                        ? "rounded-2xl md:rounded-full mx-4 md:mx-0 flex items-center justify-between p-3 border-white/20"
                        : "rounded-t-2xl md:rounded-3xl border-b-0 md:border-b border-t border-l border-r border-white/20"
                )}>
                    {/* Header */}
                    <div
                        className={clsx(
                            "flex items-center justify-between cursor-pointer group",
                            isMinimized ? "" : "p-4 border-b border-white/10 bg-white/5"
                        )}
                        onClick={() => setIsMinimized(!isMinimized)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-sky-500 blur rounded-full opacity-50 animate-pulse" />
                                <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                                    <Download className="w-4 h-4" />
                                </div>
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border border-white dark:border-slate-900 text-[10px] font-bold text-white flex items-center justify-center">
                                    {activeJobs.length}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Downloads</span>
                                {!isMinimized && (
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                        {activeJobs.filter(j => j.status === 'downloading').length} active
                                    </span>
                                )}
                            </div>
                        </div>
                        <button className="p-2 rounded-full hover:bg-white/10 text-slate-500 hover:text-white transition-colors">
                            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* List */}
                    {!isMinimized && (
                        <div className="max-h-[60vh] md:max-h-96 overflow-y-auto p-2 space-y-2 custom-scrollbar bg-slate-50/50 dark:bg-black/20">
                            {activeJobs.map((job) => (
                                <div key={job.id} className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 flex gap-3 items-center shadow-sm relative overflow-hidden group">
                                    {/* Progress background for downloading */}
                                    {job.status === 'downloading' && (
                                        <div
                                            className="absolute bottom-0 left-0 h-0.5 bg-sky-500 transition-all duration-300"
                                            style={{ width: `${job.progress}%` }}
                                        />
                                    )}

                                    {/* Thumb */}
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/10 overflow-hidden shrink-0 relative border border-black/5 dark:border-white/5">
                                        {job.thumbnail ? (
                                            <img
                                                src={
                                                    (job.thumbnail && (job.thumbnail.includes('youtube.com') || job.thumbnail.includes('youtu.be')))
                                                        ? job.thumbnail
                                                        : `/api/proxy?url=${encodeURIComponent(job.thumbnail)}`
                                                }
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    // Fallback to original if proxy fails or just show placeholder
                                                    if (e.target.src.includes('/api/proxy')) {
                                                        e.target.src = job.thumbnail;
                                                    } else {
                                                        e.target.style.display = 'none';
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full animate-pulse bg-slate-200 dark:bg-white/10" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate pr-2">
                                            {job.title}
                                        </h4>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                            <span className={clsx(
                                                "capitalize",
                                                job.status === 'failed' ? "text-red-500" :
                                                    job.status === 'completed' ? "text-green-500" : "text-sky-500"
                                            )}>
                                                {job.status === 'downloading' ? `${Math.round(job.progress)}%` : job.status}
                                            </span>
                                            {job.watermark && (
                                                <span className="px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[9px] font-bold uppercase tracking-wider">
                                                    Watermarked
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status Icon & Actions */}
                                    <div className="shrink-0 flex items-center gap-1">
                                        {job.status === 'downloading' || job.status === 'starting' || job.status === 'merging' ? (
                                            <button
                                                onClick={() => cancelDownload(job.id)}
                                                className="p-1.5 rounded-full hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <>
                                                {job.status === 'completed' && (
                                                    <a
                                                        href={`${import.meta.env.VITE_API_URL || ''}/api/download-file/${job.id}`}
                                                        download
                                                        className="p-1.5 rounded-full hover:bg-green-500/10 text-green-500 transition-colors"
                                                        title="Save File"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => dismissJob(job.id)}
                                                    className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
