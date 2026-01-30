import { motion } from 'framer-motion';

export const Loading = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-50/90 dark:bg-[#020617]/90 backdrop-blur-3xl z-[100] transition-all duration-500">
            <div className="relative flex flex-col items-center">
                <div className="relative w-24 h-24">
                    {/* Outer Glow */}
                    <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-xl animate-pulse"></div>

                    {/* Spinner Rings */}
                    <div className="absolute inset-0 border-4 border-sky-500/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-sky-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>

                    <div className="absolute inset-3 border-4 border-violet-500/10 rounded-full"></div>
                    <div className="absolute inset-3 border-4 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>

                    {/* Inner Core */}
                    <div className="absolute inset-[38%] bg-white dark:bg-white rounded-full shadow-[0_0_15px_rgba(14,165,233,0.5)] animate-pulse"></div>
                </div>

                <div className="mt-8 text-center">
                    <span className="block text-xs font-black text-sky-600 dark:text-sky-400 tracking-[0.3em] uppercase animate-pulse mb-3">
                        Initializing
                    </span>
                    <div className="flex gap-1.5 justify-center">
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0 }}
                            className="w-1.5 h-1.5 rounded-full bg-violet-500"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.2 }}
                            className="w-1.5 h-1.5 rounded-full bg-sky-500"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.4 }}
                            className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
