import { Link } from 'react-router-dom';
import { Download, Heart, Github, Twitter, Mail, Sparkles } from 'lucide-react';
import { memo } from 'react';

export const Footer = memo(() => {
    return (
        <footer className="w-full border-t border-slate-200 dark:border-white/5 bg-slate-50/80 dark:bg-[#020617]/80 backdrop-blur-md mt-auto z-10 relative overflow-hidden">
            {/* Gradient Overlay - Simplified */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />

            <div className="w-full max-w-7xl mx-auto px-6 py-12 md:py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-12">

                    {/* Brand */}
                    <div className="col-span-1 md:col-span-5 space-y-6">
                        <Link to="/" className="flex items-center gap-2 group w-fit">
                            <div className="relative w-9 h-9 flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-tr from-sky-500 to-violet-600 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300 opacity-90" />
                                <div className="absolute inset-0 bg-gradient-to-bl from-sky-400 to-indigo-500 rounded-xl -rotate-3 group-hover:-rotate-6 transition-transform duration-300" />
                                <Sparkles className="relative z-10 w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                                Media<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500">Unlocked</span>
                            </span>
                        </Link>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
                            The next-generation media archiving tool. Built for speed, privacy, and quality.
                        </p>
                        <div className="flex gap-3">
                            <SocialLink icon={Twitter} href="#" label="Twitter" />
                            <SocialLink icon={Github} href="#" label="GitHub" />
                            <SocialLink icon={Mail} href="#" label="Email" />
                        </div>
                    </div>

                    {/* Spacer */}
                    <div className="hidden md:block col-span-1" />

                    {/* Quick Links */}
                    <div className="col-span-1 md:col-span-3">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-5 text-xs uppercase tracking-widest">Product</h4>
                        <ul className="space-y-3">
                            <FooterLink to="/youtube">YouTube Downloader</FooterLink>
                            <FooterLink to="/instagram">Instagram Saver</FooterLink>
                            <FooterLink to="/universal">Universal Tool</FooterLink>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="col-span-1 md:col-span-3">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-5 text-xs uppercase tracking-widest">Legal</h4>
                        <ul className="space-y-3">
                            <FooterLink to="/privacy">Privacy Policy</FooterLink>
                            <FooterLink to="/terms">Terms of Service</FooterLink>
                            <FooterLink to="/dmca">DMCA</FooterLink>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-xs text-slate-500 dark:text-slate-500 font-medium text-center md:text-left">
                        &copy; {new Date().getFullYear()} MediaUnlocked. All rights reserved.
                    </div>
                    <div className="flex gap-2 items-center text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/5">
                        Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" /> by
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-violet-500">Sahil</span>
                    </div>
                </div>
            </div>
        </footer>
    );
});

const SocialLink = ({ icon: Icon, href, label }) => (
    <a
        href={href}
        aria-label={label}
        className="w-9 h-9 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 dark:hover:text-white transition-all duration-300"
    >
        <Icon className="w-4 h-4" />
    </a>
);

const FooterLink = ({ to, children }) => (
    <li>
        <Link
            to={to}
            className="text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-medium hover:translate-x-1 inline-block duration-200"
        >
            {children}
        </Link>
    </li>
);
