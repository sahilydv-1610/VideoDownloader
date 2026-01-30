import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VideoCard } from '../components/VideoCard';
import { PlaylistCard } from '../components/PlaylistCard';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';
import { Clipboard, AlertCircle, Loader2, Link as LinkIcon, ArrowLeft, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDownloads } from '../contexts/DownloadContext';

const API_Base = import.meta.env.VITE_API_URL || "";

export function DownloaderLayout({ title, description, icon: Icon, placeholder, theme = 'default' }) {
    const [searchParams] = useSearchParams();
    const urlParam = searchParams.get('url');
    const [url, setUrl] = useState(urlParam || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState(null);
    const { startDownload } = useDownloads();

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
                // Optional: auto-submit? No, let user confirm.
            }
        } catch (err) {
            console.error('Failed to read clipboard', err);
            // Fallback: Focus input so user can paste manually
            const input = document.getElementById('url-input');
            if (input) input.focus();
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

            // Handle flexible arguments
            if (typeof optionsOrUrl === 'string') {
                overrideUrl = optionsOrUrl;
            } else if (typeof optionsOrUrl === 'object') {
                options = optionsOrUrl;
            }

            if (!info && !overrideUrl) return;
            await startDownload(overrideUrl || url, quality, info, options);
        } catch (err) {
            console.error("Download failed to start", err);
            setError('Failed to start download: ' + err.message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 overflow-x-hidden bg-slate-50 dark:bg-[#020617] selection:bg-sky-500/30">
            <Navbar />

            {/* Static Background for Performance */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-sky-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-600/5 rounded-full blur-3xl border border-white/5" />
            </div>

            {/* Content Container */}
            <main className="relative z-10 flex-1 pt-32 pb-20 px-4 md:px-6">

                {/* Header with Back Button */}
                <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center mb-12">
                    <Link
                        to="/"
                        className="mb-8 px-4 py-1.5 rounded-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-white transition-all hover:scale-105 active:scale-95 group flex items-center gap-2 backdrop-blur-sm"
                    >
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-6 mb-6"
                    >
                        <div className="p-5 bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl shadow-sky-500/10 ring-1 ring-slate-100 dark:ring-white/5 relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-violet-500/20 rounded-3xl blur opacity-50" />
                            {Icon && <Icon className="w-10 h-10 text-sky-500 relative z-10" strokeWidth={1.5} />}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white relative">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                                {title}
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="text-slate-600 dark:text-slate-400 max-w-lg text-lg leading-relaxed font-medium"
                    >
                        {description}
                    </motion.p>
                </div>

                {/* Input Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-3xl mx-auto mb-16"
                >
                    <form onSubmit={(e) => fetchInfo(e)} className="relative group z-20">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-violet-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />

                        <div className="relative flex items-center bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl p-2 shadow-2xl transition-all transform focus-within:scale-[1.01]">
                            <div className="pl-4 pr-3 text-sky-500 hidden sm:block">
                                <LinkIcon className="w-6 h-6" strokeWidth={2} />
                            </div>
                            <input
                                id="url-input"
                                placeholder={placeholder || "Paste link here..."}
                                value={url}
                                onChange={(e) => { setUrl(e.target.value); clearError(); }}
                                className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 h-12 md:h-14 text-base md:text-lg font-medium px-2 min-w-0"
                                required
                            />
                            {url ? (
                                <button
                                    type="button"
                                    onClick={() => { setUrl(''); clearError(); }}
                                    className="p-3 text-slate-400 hover:text-rose-500 transition-colors"
                                    title="Clear"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handlePaste}
                                    className="p-3 text-slate-400 hover:text-sky-500 transition-colors active:scale-90"
                                    title="Paste"
                                >
                                    <Clipboard className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 md:px-8 h-12 md:h-14 rounded-xl flex items-center justify-center gap-2 transition-all font-bold ml-2 shadow-lg hover:shadow-sky-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Process'}
                            </button>
                        </div>
                    </form>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 overflow-hidden"
                            >
                                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 text-center font-medium shadow-sm flex items-center justify-center gap-2 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Results Area */}
                <div className="w-full max-w-5xl mx-auto min-h-[300px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-sky-500 blur-xl opacity-20 animate-pulse" />
                                <Loader2 className="w-12 h-12 animate-spin text-sky-500 relative z-10" />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-50 animate-pulse">Analyzing Source...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {info && (
                                <motion.div
                                    key={info.id || 'results'}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    {info.is_playlist ? (
                                        <PlaylistCard info={info} onDownload={handleDownload} />
                                    ) : (
                                        <VideoCard info={info} onDownload={handleDownload} />
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>

            </main>

            <Footer />
        </div>
    );
}
