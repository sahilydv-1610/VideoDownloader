import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, Home, Youtube, Camera, Globe, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect, memo } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = memo(() => {
    const { isDark, toggleTheme } = useTheme();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none'; // Prevent scrolling on mobile
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [mobileMenuOpen]);

    const navLinks = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'YouTube', path: '/youtube', icon: Youtube },
        { name: 'Instagram', path: '/instagram', icon: Camera },
        { name: 'Universal', path: '/universal', icon: Globe },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 pt-4 md:pt-6 pointer-events-none"
            >
                <div
                    className={clsx(
                        "w-full max-w-7xl pointer-events-auto transition-all duration-500 rounded-full px-4 md:px-6 py-2 md:py-3 flex items-center justify-between",
                        scrolled || mobileMenuOpen
                            ? "glass-premium backdrop-blur-xl md:max-w-5xl py-2 md:py-2.5 shadow-2xl border-white/20 dark:border-white/10"
                            : "bg-transparent md:max-w-7xl"
                    )}
                >
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 md:gap-3 group relative z-50">
                        <div className="relative w-8 h-8 md:w-9 md:h-9 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-tr from-sky-500 to-violet-600 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300 opacity-90" />
                            <div className="absolute inset-0 bg-gradient-to-bl from-sky-400 to-indigo-500 rounded-xl -rotate-3 group-hover:-rotate-6 transition-transform duration-300" />
                            <Sparkles className="relative z-10 w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <span className={clsx(
                            "font-bold text-lg md:text-xl tracking-tight transition-colors duration-300",
                            mobileMenuOpen ? "text-white" : "text-slate-900 dark:text-white"
                        )}>
                            Media<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500">Unlocked</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-white/5 dark:bg-black/20 backdrop-blur-sm border border-white/10">
                        {navLinks.map((link) => {
                            const active = isActive(link.path);
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={clsx(
                                        "relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                                        active
                                            ? "text-white"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                    )}
                                >
                                    {link.name}
                                    {active && (
                                        <motion.div
                                            layoutId="navbar-pill"
                                            className="absolute inset-0 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full shadow-lg shadow-sky-500/30 -z-10"
                                            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleTheme}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 hover:text-sky-500 dark:hover:text-amber-400 transition-all shadow-sm border border-slate-200 dark:border-white/5"
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </motion.button>
                    </div>

                    {/* Mobile Toggle */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className={clsx(
                            "md:hidden w-10 h-10 flex items-center justify-center rounded-full transition-all relative z-50",
                            mobileMenuOpen ? "bg-white/20 text-white rotate-90" : "bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white"
                        )}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </motion.button>
                </div>
            </motion.header>

            {/* Full Screen Mobile Menu - Performance Optimized */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.nav
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[90] bg-[#020617] md:hidden flex flex-col pt-28 px-6 pb-8"
                        style={{ willChange: 'opacity' }}
                    >
                        {/* Static Gradients instead of heavy blurs for mobile performance */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-b from-sky-500/10 to-transparent opacity-50 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-t from-indigo-600/10 to-transparent opacity-50 pointer-events-none" />

                        <div className="relative flex-1 flex flex-col gap-4 overflow-y-auto">
                            {navLinks.map((link, idx) => {
                                const active = isActive(link.path);
                                return (
                                    <motion.div
                                        key={link.path}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.05 + idx * 0.05, duration: 0.2 }}
                                    >
                                        <Link
                                            to={link.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={clsx(
                                                "flex items-center gap-4 py-4 px-4 rounded-2xl transition-all active:scale-98",
                                                active
                                                    ? "bg-gradient-to-r from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-white"
                                                    : "bg-white/5 border border-white/5 text-slate-400 hover:text-white"
                                            )}
                                        >
                                            <div className={clsx(
                                                "p-2.5 rounded-xl",
                                                active ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30" : "bg-white/5 text-slate-400"
                                            )}>
                                                <link.icon className="w-6 h-6" />
                                            </div>
                                            <span className="text-lg font-bold tracking-tight">{link.name}</span>
                                            {active && <div className="ml-auto w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,1)]" />}
                                        </Link>
                                    </motion.div>
                                )
                            })}
                        </div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mt-6 flex items-center justify-between gap-4"
                        >
                            <button
                                onClick={toggleTheme}
                                className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-white font-semibold active:scale-95 transition-transform"
                            >
                                {isDark ? <Moon className="w-5 h-5 text-sky-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
                                {isDark ? 'Dark Mode' : 'Light Mode'}
                            </button>
                        </motion.div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </>
    );
});
