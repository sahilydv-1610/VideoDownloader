import React, { useState, useMemo } from 'react';
import { Download, ListVideo, ExternalLink, Play, Check, Copy, CheckSquare, Square, MoreVertical, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClipboard } from '../hooks/useClipboard';

export function PlaylistCard({ info, onDownload }) {
    const entries = info.entries || [];
    const [selectedIds, setSelectedIds] = useState(new Set());

    // Use robust clipboard hook
    const { copyToClipboard, isCopied } = useClipboard();

    /* Selection Logic */
    const isAllSelected = entries.length > 0 && selectedIds.size === entries.length;

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(new Set());
        } else {
            const allIds = new Set(entries.map(e => e.id));
            setSelectedIds(allIds);
        }
    };

    const toggleSelection = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    /* Bulk Download Logic */
    const handleBulkDownload = async () => {
        const selectedVideos = entries.filter(e => selectedIds.has(e.id));
        for (const video of selectedVideos) {
            // Trigger download for each using best guess defaults or extraction
            await onDownload(null, null, video.url);
        }
        setSelectedIds(new Set());
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full relative group/card"
        >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-[2rem] blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative w-full glass-card rounded-[2rem] overflow-hidden backdrop-blur-md border border-white/60 dark:border-white/5 shadow-xl transition-shadow hover:shadow-2xl">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-slate-200/50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-5 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-white/[0.02] dark:to-transparent">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0 ring-4 ring-white dark:ring-white/5">
                            <ListVideo className="w-7 h-7" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white line-clamp-1 break-words tracking-tight">
                                {info.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1">
                                {entries.length} Videos &bull; {selectedIds.size} Selected
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSelectAll}
                            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors flex items-center gap-2 text-slate-600 dark:text-slate-300 active:scale-95"
                        >
                            {isAllSelected ? <CheckSquare className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4" />}
                            {isAllSelected ? 'Deselect All' : 'Select All'}
                        </button>

                        <AnimatePresence>
                            {selectedIds.size > 0 && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={handleBulkDownload}
                                    className="px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
                                >
                                    <Download className="w-4 h-4" />
                                    Download ({selectedIds.size})
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* List */}
                <div className="max-h-[600px] overflow-y-auto divided-y divide-slate-100 dark:divide-white/5 bg-white/40 dark:bg-white/[0.02] custom-scrollbar">
                    {entries.map((video, index) => {
                        const isSelected = selectedIds.has(video.id);
                        return (
                            <div
                                key={video.id || index}
                                className={`group flex flex-col md:flex-row items-center gap-4 p-4 transition-colors border-b border-slate-100 dark:border-white/5 last:border-0 ${isSelected ? 'bg-blue-50/50 dark:bg-blue-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                            >
                                {/* Checkbox */}
                                <div className="hidden md:flex items-center justify-center shrink-0 w-8">
                                    <button
                                        onClick={() => toggleSelection(video.id)}
                                        className={`transition-colors text-slate-400 hover:text-blue-500 ${isSelected ? 'text-blue-500' : ''}`}
                                    >
                                        {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Thumbnail */}
                                {video.thumbnail && (
                                    <div className="w-full md:w-36 aspect-video rounded-xl overflow-hidden bg-slate-900 relative shrink-0 border border-slate-200 dark:border-white/10 cursor-pointer shadow-sm group-hover:shadow-md transition-all" onClick={() => toggleSelection(video.id)}>
                                        <img
                                            src={
                                                (video.thumbnail && (video.thumbnail.includes('youtube.com') || video.thumbnail.includes('youtu.be')))
                                                    ? video.thumbnail
                                                    : `/api/proxy?url=${encodeURIComponent(video.thumbnail)}`
                                            }
                                            onError={(e) => {
                                                // Fallback
                                                if (e.target.src.includes('/api/proxy')) {
                                                    e.target.src = video.thumbnail;
                                                }
                                            }}
                                            alt={video.title}
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                        />
                                        {video.duration && (
                                            <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[10px] text-white font-mono font-bold backdrop-blur-sm">
                                                {Math.floor(video.duration / 60)}:{Math.floor(video.duration % 60).toString().padStart(2, '0')}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 w-full text-left min-w-0 self-start md:self-center">
                                    <h4
                                        className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base line-clamp-2 md:line-clamp-1 mb-1.5 group-hover:text-blue-500 transition-colors cursor-pointer"
                                        onClick={() => toggleSelection(video.id)}
                                    >
                                        {video.title || 'Untitled Video'}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap font-medium">
                                        <button
                                            onClick={() => copyToClipboard(video.title, `${video.id}-title`)}
                                            className="hover:text-sky-500 flex items-center gap-1.5 transition-colors"
                                            title="Copy Title"
                                        >
                                            {isCopied(`${video.id}-title`) ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                            Title
                                        </button>
                                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                        <button
                                            onClick={() => copyToClipboard(video.description, `${video.id}-desc`)}
                                            className="hover:text-sky-500 flex items-center gap-1.5 transition-colors"
                                            title="Copy Description"
                                        >
                                            {isCopied(`${video.id}-desc`) ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                            Desc
                                        </button>
                                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                        <a
                                            href={video.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-sky-500 flex items-center gap-1.5 transition-colors"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            Link
                                        </a>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="w-full md:w-auto flex items-center gap-2 justify-end mt-2 md:mt-0">
                                    <button
                                        onClick={() => onDownload(null, null, video.url)}
                                        className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-2 border border-slate-200 dark:border-white/10 hover:border-transparent shrink-0 active:scale-95"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
