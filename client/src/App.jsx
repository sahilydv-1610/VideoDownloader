import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Youtube, Camera, Globe, ArrowRight, Link as LinkIcon, Sparkles } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ThemeProvider } from './contexts/ThemeContext';
import { DownloadProvider } from './contexts/DownloadContext';
import { DownloadsPanel } from './components/DownloadsPanel';
import { Loading } from './components/Loading';
import { motion } from 'framer-motion';
import { useState, Suspense, lazy, memo } from 'react';
import clsx from 'clsx';
import { ErrorBoundary } from './components/ErrorBoundary';

const YouTubePage = lazy(() => import('./pages/YouTubePage').then(module => ({ default: module.YouTubePage })));
const InstagramPage = lazy(() => import('./pages/InstagramPage').then(module => ({ default: module.InstagramPage })));
const UniversalPage = lazy(() => import('./pages/UniversalPage').then(module => ({ default: module.UniversalPage })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(module => ({ default: module.TermsOfService })));
const DMCAPage = lazy(() => import('./pages/DMCAPage').then(module => ({ default: module.DMCAPage })));

// Optimized Card Component - No Tilt, just smooth transform
const PremiumCard = memo(({ to, icon: Icon, title, description, badge, color = "text-sky-500" }) => {
    return (
        <Link to={to} className="block w-full group">
            <div className="relative h-full glass-card p-6 md:p-8 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 border-white/50 dark:border-white/5 bg-white/50 dark:bg-[#0f172a]/50 hover:-translate-y-1">
                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="relative flex justify-between items-start mb-6">
                    <div className={clsx(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105",
                        "bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-white/5",
                        color
                    )}>
                        <Icon className="w-7 h-7" strokeWidth={1.5} />
                    </div>
                    {badge && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/20">
                            {badge}
                        </span>
                    )}
                </div>

                <h3 className="relative text-xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
                    {title}
                </h3>
                <p className="relative text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                    {description}
                </p>

                <div className="relative flex items-center gap-2 text-sm font-bold text-sky-600 dark:text-sky-400 opacity-80 group-hover:opacity-100 transition-all">
                    Start Download <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
});

function Home() {
    const [url, setUrl] = useState('');
    const navigate = useNavigate();

    const handleQuickDownload = (e) => {
        e.preventDefault();
        if (url) {
            navigate(`/universal?url=${encodeURIComponent(url)}`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans overflow-x-hidden bg-slate-50 dark:bg-[#020617] selection:bg-sky-500/30 text-start">
            <Navbar />

            {/* Optimized Background - Static gradients instead of heavy blurs on mobile */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/5 rounded-full blur-3xl" />
            </div>

            <main className="relative z-10 flex-1 flex flex-col items-center pt-32 pb-20 px-4 md:px-6">

                {/* Hero Section */}
                <div className="w-full max-w-5xl mx-auto text-center mb-16 md:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky-500/20 bg-sky-500/5 backdrop-blur-md mb-8 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                            <span className="text-xs font-bold text-sky-600 dark:text-sky-300 tracking-widest uppercase">The Next Gen Downloader</span>
                        </div>

                        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-8 leading-[0.95] md:leading-[0.9]">
                            Media
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500">
                                Unlocked.
                            </span>
                        </h1>

                        <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
                            Archive content from universal sources without limits.
                            <br className="hidden md:block" />
                            <span className="text-slate-900 dark:text-slate-200">Fast, free, and secure.</span>
                        </p>

                        {/* Power Input - Simplified for Performance */}
                        <form onSubmit={handleQuickDownload} className="relative max-w-2xl mx-auto group z-20 px-2">
                            {/* Reduced blur radius for performance */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-violet-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
                            <div className="relative flex items-center bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl p-1.5 md:p-2 shadow-2xl transition-transform active:scale-[0.99] focus-within:scale-[1.01]">
                                <div className="pl-3 md:pl-4 pr-2 md:pr-3 text-sky-500 hidden sm:block">
                                    <LinkIcon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Paste video link..."
                                    className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 h-12 md:h-14 text-base md:text-lg font-medium px-2 min-w-0"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                                {url ? (
                                    <button
                                        type="button"
                                        onClick={() => setUrl('')}
                                        className="p-2 mr-2 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                const text = await navigator.clipboard.readText();
                                                if (text) setUrl(text);
                                            } catch (e) {
                                                console.error(e);
                                                // If clipboard read fails (permissions), rely on manual paste
                                            }
                                        }}
                                        className="p-2 mr-2 text-slate-400 hover:text-sky-500 transition-colors active:scale-95"
                                        title="Paste from Clipboard"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 md:px-6 h-12 md:h-14 rounded-xl flex items-center justify-center gap-2 font-bold transition-all hover:opacity-90 active:scale-95 shadow-lg whitespace-nowrap"
                                >
                                    <span className="hidden sm:inline">Download</span>
                                    <ArrowRight className="w-5 h-5" strokeWidth={3} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>

                {/* Feature Cards Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2"
                >
                    <PremiumCard
                        to="/youtube"
                        icon={Youtube}
                        title="YouTube"
                        description="Download 8K videos, Shorts, and convert to MP3 instantly."
                        color="text-red-500"
                        badge="Popular"
                    />
                    <PremiumCard
                        to="/instagram"
                        icon={Camera}
                        title="Instagram"
                        description="Archive Reels, Stories, and carousel posts in original quality."
                        color="text-pink-500"
                    />
                    <PremiumCard
                        to="/universal"
                        icon={Globe}
                        title="Universal"
                        description="Support for TikTok, Twitter (X), Facebook, and 1000+ sites."
                        color="text-sky-500"
                    />
                    {/* Placeholder for future expansion or About */}
                    <Link to="#" className="block w-full group opacity-80 hover:opacity-100 transition-opacity">
                        <div className="relative h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl hover:border-sky-500/50 transition-colors">
                            <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-4" />
                            <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">More Coming Soon</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">We are adding new sources weekly.</p>
                        </div>
                    </Link>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <DownloadProvider>
                    <BrowserRouter>
                        <Suspense fallback={<Loading />}>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/youtube" element={<YouTubePage />} />
                                <Route path="/instagram" element={<InstagramPage />} />
                                <Route path="/universal" element={<UniversalPage />} />

                                <Route path="/privacy" element={<PrivacyPolicy />} />
                                <Route path="/terms" element={<TermsOfService />} />
                                <Route path="/dmca" element={<DMCAPage />} />
                            </Routes>
                        </Suspense>
                        <DownloadsPanel />
                    </BrowserRouter>
                </DownloadProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
