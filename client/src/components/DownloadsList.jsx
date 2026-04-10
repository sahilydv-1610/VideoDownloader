import { useDownloads } from '../contexts/DownloadContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, X, Minus, Download, Trash2, Activity } from 'lucide-react';
import clsx from 'clsx';
import { memo, useState } from 'react';

const DownloadItem = memo(({ job, onDismiss, onDownload }) => {
    const isCompleted = job.status === 'completed';
    const isFailed = job.status === 'failed';
    const isProcessing = !isCompleted && !isFailed;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="group relative w-full mb-3 last:mb-0"
        >
            <div className="relative overflow-hidden bg-white/5 p-3 rounded-2xl border border-white/10 hover:border-white/20 transition-all shadow-lg backdrop-blur-md">

                {/* Processing Progress Bar Background */}
                {isProcessing && (
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/5">
                        <motion.div
                            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${job.progress}%` }}
                        />
                    </div>
                )}

                <div className="flex items-center gap-3 relative z-10">
                    <div className="relative w-12 h-12 shrink-0 bg-black/40 rounded-xl overflow-hidden border border-white/10 shadow-inner">
                        {job.thumbnail ? (
                            <img src={job.thumbnail} className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100" alt="" onError={e => e.target.style.display = 'none'} />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full">
                                <Activity className="w-5 h-5 text-violet-400 animate-pulse" />
                            </div>
                        )}

                        {/* Overlay Status */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                            {isProcessing && <Loader2 className="w-5 h-5 text-white animate-spin drop-shadow-md" />}
                            {isCompleted && <Check className="w-5 h-5 text-emerald-400 drop-shadow-md" />}
                            {isFailed && <X className="w-5 h-5 text-rose-500 drop-shadow-md" />}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="font-semibold text-xs text-white/90 truncate mb-1" title={job.title}>
                            {job.title || 'Initializing...'}
                        </h4>
                        <div className="flex items-center justify-between">
                            <span className={clsx(
                                "text-[10px] font-bold uppercase tracking-wider",
                                isCompleted ? "text-emerald-400" : isFailed ? "text-rose-400" : "text-violet-400"
                            )}>
                                {isFailed ? 'FAILED' : isCompleted ? 'DONE' : `${Math.round(job.progress)}%`}
                            </span>

                            <div className="flex items-center gap-1">
                                {isCompleted && (
                                    <button
                                        onClick={() => onDownload(job.id, job.filename)}
                                        className="p-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-all shadow-lg shadow-violet-600/20"
                                        title="Save"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <button
                                    onClick={() => onDismiss(job.id)}
                                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

export function DownloadsList() {
    const { jobs, dismissJob } = useDownloads();
    const [minimized, setMinimized] = useState(false);

    const handleDownload = (jobId, filename) => {
        const API_Base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
        const link = document.createElement('a');
        link.href = `${API_Base}/api/download-file/${jobId}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleClearAll = () => {
        const completedJobs = Object.values(jobs).filter(j => j.status === 'completed' || j.status === 'failed');
        completedJobs.forEach(job => dismissJob(job.id));
    }

    const jobsList = Object.values(jobs).sort((a, b) => b.createdAt - a.createdAt);
    if (jobsList.length === 0) return null;

    const activeCount = jobsList.filter(j => j.status !== 'completed' && j.status !== 'failed').length;
    const completedCount = jobsList.length - activeCount;

    return (
        <div className="fixed bottom-24 md:bottom-8 right-6 z-[100] flex flex-col items-end pointer-events-none">
            <div className="pointer-events-auto">
                <AnimatePresence mode="wait">
                    {minimized ? (
                        <motion.button
                            key="minimized"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            onClick={() => setMinimized(false)}
                            className="w-14 h-14 rounded-2xl glass flex items-center justify-center relative group hover:scale-105 transition-transform"
                        >
                            {activeCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-violet-500 rounded-full animate-pulse border border-black/50" />
                            )}
                            <div className="flex flex-col items-center leading-none">
                                <span className="font-bold text-white text-sm">{jobsList.length}</span>
                            </div>
                        </motion.button>
                    ) : (
                        <motion.div
                            key="expanded"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-[340px] max-w-[calc(100vw-2rem)]"
                        >
                            <div className="glass rounded-3xl overflow-hidden flex flex-col shadow-2xl ring-1 ring-white/10">
                                {/* Header */}
                                <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 bg-white/5 backdrop-blur-3xl">
                                    <div className="flex items-center gap-2.5">
                                        <div className={clsx("w-2 h-2 rounded-full ring-2 ring-white/10", activeCount > 0 ? "bg-violet-500 animate-pulse" : "bg-emerald-500")} />
                                        <span className="text-[11px] font-black tracking-widest uppercase text-white/80">Active Downloads</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {completedCount > 0 && (
                                            <button
                                                onClick={handleClearAll}
                                                className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-rose-400 transition-colors"
                                                title="Clear Completed"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button onClick={() => setMinimized(true)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                                            <Minus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* List */}
                                <div className="p-4 max-h-[50vh] overflow-y-auto no-scrollbar space-y-3 bg-black/20">
                                    <AnimatePresence initial={false}>
                                        {jobsList.map(job => (
                                            <DownloadItem
                                                key={job.id}
                                                job={job}
                                                onDismiss={dismissJob}
                                                onDownload={handleDownload}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
