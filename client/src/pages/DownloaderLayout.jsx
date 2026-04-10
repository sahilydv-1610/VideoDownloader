import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VideoCard } from '../components/VideoCard';
import { PlaylistCard } from '../components/PlaylistCard';
import { DownloadsList } from '../components/DownloadsList';
import { Clipboard, AlertCircle, Loader2, Search, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDownloads } from '../contexts/DownloadContext';
import clsx from 'clsx';
import { useSettings } from '../contexts/SettingsContext';

const API_Base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export function DownloaderLayout({ header, placeholder }) {
    const [searchParams] = useSearchParams();
    const urlParam = searchParams.get('url');
    const [url, setUrl] = useState(urlParam || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState(null);
    const { startDownload } = useDownloads();
    const { settings } = useSettings();

    useEffect(() => {
        if (urlParam) {
            fetchInfo(null, urlParam);
        }
    }, [urlParam]);

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                setUrl(text);
            }
        } catch (err) {
            console.error('Failed to read clipboard', err);
            setError('Please paste the URL manually.');
        }
    };

    const clearError = () => setError('');

    const fetchInfo = async (e, overrideUrl) => {
        if (e) e.preventDefault();
        const targetUrl = overrideUrl || url;
        if (!targetUrl) return;

        setLoading(true);
        setError('');
        setInfo(null);

        try {
            const res = await fetch(`${API_Base}/api/video-info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: targetUrl })
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || data.details || `Error ${res.status}: ${res.statusText}`);
            }

            const data = await res.json();
            if (!data || typeof data !== 'object') throw new Error("Received invalid data from server");
            setInfo(data);
        } catch (err) {
            console.error("Fetch Info Error:", err);
            setError(err.message || "Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (quality, format_id, optionsOrUrl) => {
        try {
            let overrideUrl = null;
            let options = {};
            if (typeof optionsOrUrl === 'string') {
                overrideUrl = optionsOrUrl;
            } else if (typeof optionsOrUrl === 'object') {
                options = optionsOrUrl;
            }

            if (!info && !overrideUrl) return;

            await startDownload(overrideUrl || url, quality, info, { ...options, format_id });
        } catch (err) {
            console.error("Download Error:", err);
            setError(err.message || "Failed to start download");
        }
    };

    return (
        <div className="flex flex-col animate-fade-in w-full max-w-7xl mx-auto px-4 md:px-0">
            {/* Header Content */}
            <div className="mb-8">
                {header}
            </div>

            {/* Input Module */}
            <div className="relative group w-full max-w-4xl mx-auto mb-16 z-20">
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 rounded-[2rem] opacity-30 blur-2xl group-hover:opacity-60 transition duration-1000 animate-pulse-slow"></div>
                
                <form onSubmit={(e) => fetchInfo(e)} className="relative flex items-center bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] p-3 shadow-2xl transition-all hover:border-white/20 hover:bg-black/50 overflow-hidden ring-1 ring-white/5">
                    
                    <div className="pl-6 text-cyan-400 animate-pulse-slow">
                        <Sparkles className="w-6 h-6" />
                    </div>

                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder={placeholder || "Paste any video link..."}
                        className="flex-1 bg-transparent border-none outline-none px-6 py-5 text-white placeholder-white/30 text-lg md:text-xl font-semibold w-full"
                    />

                    <AnimatePresence>
                        {url && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                type="button"
                                onClick={() => setUrl('')}
                                className="p-3 text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {!url && (
                        <button
                            type="button"
                            onClick={handlePaste}
                            className="hidden md:flex items-center gap-2 px-4 py-2 mr-3 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white text-xs font-bold text-gray-400 transition-all border border-white/5"
                        >
                            <Clipboard className="w-4 h-4" />
                            PASTE
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={clsx(
                            "px-8 py-4 rounded-xl font-bold text-white transition-all shadow-2xl flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-cyan-500/25 border border-white/10 relative overflow-hidden group/btn"
                        )}
                    >
                        <div className="absolute inset-0 bg-white/20 group-hover/btn:-translate-x-full ease-out duration-500 -skew-x-12 translate-x-[150%]"></div>
                        {loading ? <Loader2 className="w-6 h-6 animate-spin relative z-10" /> : <Search className="w-6 h-6 relative z-10" />}
                        <span className="hidden md:inline relative z-10 text-lg">{loading ? 'Fetching...' : 'Download'}</span>
                    </button>
                </form>
            </div>

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="max-w-2xl mx-auto mb-10 w-full overflow-hidden"
                    >
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-4 text-sm font-bold shadow-xl backdrop-blur-md">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <p className="flex-1 leading-relaxed">{error}</p>
                            <button onClick={clearError} className="p-2 hover:bg-red-500/20 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Area */}
            <AnimatePresence mode="wait">
                {info && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ type: "spring", stiffness: 50, damping: 20 }}
                        className="w-full mb-20"
                    >
                        {info.entries ? (
                            <PlaylistCard info={info} onDownload={handleDownload} />
                        ) : (
                            <VideoCard info={info} onDownload={handleDownload} />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <DownloadsList />
        </div>
    );
}
