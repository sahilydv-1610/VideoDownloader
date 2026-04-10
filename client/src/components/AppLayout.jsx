import React from 'react';

// Ambient Background Component
const BackgroundGlow = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[rgb(var(--bg-main))]">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[150px] animate-pulse-slow mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[900px] h-[900px] bg-teal-500/10 rounded-full blur-[150px] animate-pulse-slow mix-blend-screen" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[120px] animate-float mix-blend-screen" />
    </div>
);

const Header = () => (
    <header className="h-16 border-b border-white/[0.06] flex items-center justify-between px-6 bg-[rgb(var(--bg-surface))]/60 backdrop-blur-2xl sticky top-0 z-40 w-full shadow-lg">
        <div className="flex items-center gap-3">
            <div className="flex items-stretch h-6 shadow-md rounded overflow-hidden select-none hover:scale-[1.02] transition-transform duration-300">
                <div className="bg-[#0f0f11] px-2 flex items-center justify-center border-r border-white/5 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50" />
                    <span className="text-white font-[800] tracking-tighter text-xs font-sans relative z-10">INDIA</span>
                </div>
                <div className="bg-[#FFB400] px-1.5 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                    <span className="text-black font-[900] tracking-tight text-xs font-sans relative z-10">24x7</span>
                </div>
            </div>
            <div className="hidden md:flex items-center gap-2 pl-0.5 opacity-60">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">
                    Official Media Downloader
                </span>
            </div>
        </div>
    </header>
);

export const AppLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-[rgb(var(--bg-main))] text-white overflow-hidden relative selection:bg-violet-500/30">
            <BackgroundGlow />
            
            <Header />

            <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth overscroll-none relative z-10">
                <div className="w-full max-w-7xl mx-auto p-4 md:p-10 pt-10">
                    {children}
                </div>
            </main>
        </div>
    );
};
