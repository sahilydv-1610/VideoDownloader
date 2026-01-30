import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { FileText } from 'lucide-react';

export function TermsOfService() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200">
            <Navbar />
            <div className="container-width py-28 md:py-36 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">Terms of Service</h1>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none prose-lg">
                        <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>

                        <h3>1. Agreement to Terms</h3>
                        <p>By accessing or using MediaUnlocked, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.</p>

                        <h3>2. Allowable Use</h3>
                        <p>Our service is intended for personal use only. You agree to use the service only for lawful purposes and in accordance with these Terms.</p>
                        <p>You specifically agree NOT to:</p>
                        <ul>
                            <li>Use the service to download copyrighted content that you do not have permission to download.</li>
                            <li>Use the service for any illegal or unauthorized purpose.</li>
                            <li>Attempt to disrupt or overload our servers or networks.</li>
                            <li>Use automated systems (bots) to access the service without our permission.</li>
                        </ul>

                        <h3>3. Intellectual Property</h3>
                        <p>We respect the intellectual property rights of others. You are solely responsible for the content you download using our service. MediaUnlocked does not host any content; we act as a tool to facilitate the downloading of content available publicly on third-party platforms.</p>

                        <h3>4. Disclaimer of Warranties</h3>
                        <p>The service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, regarding the operation or availability of the service.</p>

                        <h3>5. Limitation of Liability</h3>
                        <p>In no event shall MediaUnlocked be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>

                        <h3>6. Termination</h3>
                        <p>We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
