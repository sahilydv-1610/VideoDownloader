import React, { useState, memo } from 'react';
import { Download, ExternalLink, Library, Check, CheckSquare, Square, FolderOpen, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useSettings } from '../contexts/SettingsContext';

export const PlaylistCard = memo(({ info, onDownload }) => {
    const entries = info.entries || [];
    const [selectedIds, setSelectedIds] = useState(new Set());
    const { settings } = useSettings();

    // Selection Logic
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
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleBulkDownload = async () => {
        const selectedVideos = entries.filter(e => selectedIds.has(e.id));
        // Use default settings for bulk download
        const options = {
            audioBitrate: settings.audioBitrate
        };
        const quality = settings.defaultQuality;

        for (const video of selectedVideos) {
            await onDownload(quality, null, video.url); // Pass quality and URL
        }
        setSelectedIds(new Set());
    };

    const getProxiedUrl = (url) => {
        if (!url) return '';
        if (url.includes('youtube.com') || url.includes('youtu.be')) return url;
        return `/api/proxy?url=${encodeURIComponent(url)}`;
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
            className="w-full relative group"
        >
            <div className="relative w-full glass-card rounded-3xl flex flex-col overflow-hidden border border-white/10 shadow-2xl">

                {/* Header */}
                <div className="relative p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-violet-600/20 rounded-2xl flex items-center justify-center border border-violet-500/30 shadow-inner">
                            <Library className="w-7 h-7 text-violet-400" />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20">Playlist</span>
                                <span className="textxs text-gray-500 font-medium">{entries.length} videos</span>
                            </div>
                            <h2 className="text-xl font-bold text-white line-clamp-1 tracking-tight select-text">
                                {info.title}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSelectAll}
                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold text-gray-400 flex items-center gap-2 transition-all hover:text-white"
                        >
                            {isAllSelected ? <CheckSquare className="w-4 h-4 text-violet-500" /> : <Square className="w-4 h-4" />}
                            {isAllSelected ? 'Deselect All' : 'Select All'}
                        </button>

                        <AnimatePresence>
                            {selectedIds.size > 0 && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={handleBulkDownload}
                                    className="px-5 py-2 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-500 flex items-center gap-2 shadow-lg shadow-violet-600/20 active:scale-95 transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                    Download ({selectedIds.size})
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="p-3 bg-black/20 max-h-[60vh] overflow-y-auto no-scrollbar">
                    <div className="grid grid-cols-1 gap-2">
                        {entries.map((video, index) => {
                            const isSelected = selectedIds.has(video.id);
                            return (
                                <motion.div
                                    layout
                                    key={video.id || index}
                                    onClick={() => toggleSelection(video.id)}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(index * 0.05, 1) }}
                                    className={clsx(
                                        "group relative flex items-center p-3 rounded-2xl cursor-pointer transition-all duration-200 border",
                                        isSelected
                                            ? "bg-violet-600/10 border-violet-500/30 shadow-inner"
                                            : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/5"
                                    )}
                                >
                                    {/* Selection Checkbox */}
                                    <div className="shrink-0 mr-4">
                                        <div className={clsx(
                                            "w-6 h-6 rounded-lg border flex items-center justify-center transition-all",
                                            isSelected
                                                ? "bg-violet-600 border-violet-600"
                                                : "border-white/10 group-hover:border-white/30 bg-black/20"
                                        )}>
                                            <Check className={clsx("w-3.5 h-3.5 text-white transition-opacity", isSelected ? "opacity-100" : "opacity-0")} />
                                        </div>
                                    </div>

                                    {/* Thumbnail */}
                                    <div className="w-28 aspect-video rounded-xl overflow-hidden bg-black/50 relative shrink-0 border border-white/5">
                                        <img
                                            src={getProxiedUrl(video.thumbnail)}
                                            alt=""
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            onError={(e) => { e.target.src = video.thumbnail; }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                            <Play className="w-6 h-6 text-white fill-current drop-shadow-lg" />
                                        </div>
                                    </div>

                                    {/* Meta */}
                                    <div className="flex-1 min-w-0 ml-5">
                                        <div className="flex items-center gap-2.5 mb-1.5">
                                            <span className="text-[10px] font-mono text-gray-500 px-1.5 py-0.5 rounded bg-black/20">#{String(index + 1).padStart(2, '0')}</span>
                                            {video.duration && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-gray-400">
                                                    {Math.floor(video.duration / 60)}:{Math.floor(video.duration % 60).toString().padStart(2, '0')}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className={clsx(
                                            "font-semibold text-sm mb-1.5 line-clamp-1 transition-colors leading-tight select-text",
                                            isSelected ? "text-violet-300" : "text-white/90"
                                        )}>
                                            {video.title}
                                        </h4>
                                        <a href={video.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-[10px] font-medium text-gray-500 hover:text-white flex items-center gap-1 w-fit transition-colors px-2 py-1 rounded-md hover:bg-white/5">
                                            <ExternalLink className="w-3 h-3" />
                                            Open Original
                                        </a>
                                    </div>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDownload(settings.defaultQuality, null, video.url); }}
                                        className="p-2.5 rounded-xl bg-white/5 hover:bg-violet-600 hover:text-white transition-all text-gray-400 opacity-0 group-hover:opacity-100 border border-white/5 hover:border-violet-500 shadow-lg"
                                        title="Download Single"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});
