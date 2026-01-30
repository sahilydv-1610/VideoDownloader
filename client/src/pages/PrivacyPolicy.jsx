import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Shield } from 'lucide-react';

export function PrivacyPolicy() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200">
            <Navbar />
            <div className="container-width py-28 md:py-36 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-500">
                            <Shield className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">Privacy Policy</h1>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none prose-lg">
                        <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>

                        <h3>1. Introduction</h3>
                        <p>Welcome to MediaUnlocked ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share your information when you use our website and services.</p>

                        <h3>2. Information We Collect</h3>
                        <p>We do not require you to create an account to use our video downloading services. However, we may collect the following types of information:</p>
                        <ul>
                            <li><strong>Usage Data:</strong> We may collect generic information about how you interact with our services, such as the pages you visit and the time spent on them.</li>
                            <li><strong>URLs Processed:</strong> We process the URLs you submit to generate download links. We do not store the content of the videos you download indefinitely.</li>
                        </ul>

                        <h3>3. How We Use Your Information</h3>
                        <p>We use the information we collect to:</p>
                        <ul>
                            <li>Provide, operate, and maintain our website.</li>
                            <li>Improve, personalize, and expand our website.</li>
                            <li>Understand and analyze how you use our website.</li>
                            <li>Develop new products, services, features, and functionality.</li>
                        </ul>

                        <h3>4. Log Files</h3>
                        <p>MediaUnlocked follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files incudes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.</p>

                        <h3>5. Third-Party Links</h3>
                        <p>Our Service may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.</p>

                        <h3>6. Changes to This Privacy Policy</h3>
                        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

                        <h3>7. Contact Us</h3>
                        <p>If you have any questions about this Privacy Policy, please contact us via email.</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
