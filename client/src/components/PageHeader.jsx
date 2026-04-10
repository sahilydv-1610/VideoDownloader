import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Sparkles } from 'lucide-react';

export function PageHeader({ title, subtitle, icon: Icon, theme = 'default', tags = [] }) {

    const themes = {
        default: {
            accent: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            shadow: "shadow-emerald-500/20"
        },
        universal: {
            accent: "text-cyan-400",
            bg: "bg-cyan-500/10",
            border: "border-cyan-500/20",
            shadow: "shadow-cyan-500/20"
        }
    };

    const currentTheme = themes[theme] || themes.default;

    return (
        <div className="w-full py-12 mb-6 relative flex flex-col items-center justify-center">
            
            {/* Center-aligned Hero Layout */}
            <div className="flex flex-col items-center justify-center gap-6 relative z-10 text-center">

                {/* Icon Box */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className={clsx(
                        "w-24 h-24 rounded-[32px] flex items-center justify-center backdrop-blur-2xl border shadow-2xl shrink-0 transition-all duration-500 relative",
                        currentTheme.bg, currentTheme.border, currentTheme.shadow
                    )}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-[32px]" />
                    <Icon className={clsx("w-12 h-12 relative z-10", currentTheme.accent)} />
                </motion.div>

                {/* Text Content */}
                <div className="space-y-4">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 tracking-tight"
                    >
                        {title}
                    </motion.h1>
                    <motion.p
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed"
                    >
                        {subtitle}
                    </motion.p>

                    {/* Tags */}
                    {tags.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="flex flex-wrap justify-center gap-3 pt-4"
                        >
                            {tags.map((tag, i) => (
                                <span key={i} className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-emerald-100 flex items-center gap-2 hover:bg-white/15 hover:border-emerald-500/30 transition-all cursor-default shadow-lg shadow-black/20">
                                    <Sparkles className="w-4 h-4 text-emerald-400" />
                                    {tag}
                                </span>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
