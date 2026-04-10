import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import clsx from 'clsx';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-deep))] p-6 text-center font-sans overflow-hidden relative">

                    {/* Background Noise/Grid */}
                    <div className="absolute inset-0 opacity-10 bg-[url('/noise.png')] pointer-events-none" />
                    <div className="absolute inset-0 opacity-5 bg-gradient-to-b from-transparent to-red-500/10 pointer-events-none" />

                    <div className="relative max-w-md w-full bg-[rgb(var(--bg-card))] p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col items-center">

                        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8 relative group">
                            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse" />
                            <AlertTriangle className="w-8 h-8 text-red-500 relative z-10" />
                        </div>

                        <h1 className="text-3xl font-black text-white mb-3 tracking-tight">System Halted</h1>
                        <p className="text-sm text-[rgb(var(--text-secondary))] mb-8 leading-relaxed max-w-xs mx-auto">
                            A critical runtime anomaly was detected. The system has paused to prevent damage.
                        </p>

                        <div className="w-full bg-black/40 rounded-xl p-4 mb-8 text-left border border-white/5 overflow-hidden">
                            <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2">
                                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                <span className="text-[10px] font-mono text-[rgb(var(--text-tertiary))] uppercase">Error Log</span>
                            </div>
                            <p className="text-[10px] font-mono text-red-400 break-all leading-relaxed opacity-80 line-clamp-4">
                                {this.state.error?.toString() || "Unknown Critical Failure"}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full">
                            <button
                                onClick={() => window.location.reload()}
                                className="col-span-1 px-4 py-3 bg-white text-black rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
                            >
                                <RefreshCcw className="w-3.5 h-3.5" /> Reboot
                            </button>
                            <a
                                href="/"
                                className="col-span-1 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                            >
                                <Home className="w-3.5 h-3.5" /> Home
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
