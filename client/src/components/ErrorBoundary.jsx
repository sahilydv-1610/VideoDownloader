import React from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

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
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617] p-6 text-center selection:bg-rose-500/30">
                    {/* Background blob for atmosphere */}
                    <div className="fixed inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-normal" />
                    </div>

                    <div className="relative max-w-md w-full glass-card p-10 rounded-[2rem] border border-white/60 dark:border-white/5 shadow-2xl shadow-rose-900/5 backdrop-blur-xl">
                        <div className="w-20 h-20 rounded-2xl bg-rose-50 dark:bg-rose-900/10 flex items-center justify-center mx-auto mb-8 border border-rose-100 dark:border-rose-500/20 shadow-inner">
                            <AlertCircle className="w-10 h-10 text-rose-500" />
                        </div>

                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Something went wrong</h1>
                        <p className="text-base text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-medium">
                            An unexpected error occurred. We've logged this issue and are looking into it.
                        </p>

                        <div className="bg-slate-100 dark:bg-black/30 rounded-xl p-4 mb-8 text-left overflow-auto max-h-32 custom-scrollbar border border-slate-200 dark:border-white/5 shadow-inner">
                            <p className="text-[10px] font-mono text-rose-500 break-all leading-relaxed">
                                {this.state.error?.toString() || "Unknown Error"}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl"
                            >
                                <RefreshCcw className="w-4 h-4" /> Reload Page
                            </button>
                            <a
                                href="/"
                                className="w-full py-4 bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm hover:shadow-md"
                            >
                                <Home className="w-4 h-4" /> Back to Home
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
