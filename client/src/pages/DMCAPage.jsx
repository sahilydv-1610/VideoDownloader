import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Scale } from 'lucide-react';

export function DMCAPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200">
            <Navbar />
            <div className="container-width py-28 md:py-36 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
                            <Scale className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">DMCA Policy</h1>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none prose-lg">
                        <h3>Digital Millennium Copyright Act Notice</h3>
                        <p>MediaUnlocked respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 ("DMCA"), we will respond expeditiously to claims of copyright infringement committed using our service.</p>

                        <h3>Takedown Procedure</h3>
                        <p>If you are a copyright owner, or are authorized to act on behalf of one, or authorized to act under any exclusive right under copyright, please report alleged copyright infringements taking place on or through the Site by completing the following DMCA Notice of Alleged Infringement and delivering it to our designated agent.</p>

                        <h3>DMCA Notice of Alleged Infringement</h3>
                        <ol>
                            <li>Identify the copyrighted work that you claim has been infringed, or - if multiple copyrighted works are covered by this Notice - you may provide a representative list of the copyrighted works that you claim have been infringed.</li>
                            <li>Identify the material that you claim is infringing (or to be the subject of infringing activity) and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit us to locate the material, including at a minimum, the URL of the link shown on the Site.</li>
                            <li>Provide your mailing address, telephone number, and, if available, email address.</li>
                            <li>Include both of the following statements in the body of the Notice:
                                <ul>
                                    <li>"I hereby state that I have a good faith belief that the disputed use of the copyrighted material is not authorized by the copyright owner, its agent, or the law (e.g., as a fair use)."</li>
                                    <li>"I hereby state that the information in this Notice is accurate and, under penalty of perjury, that I am the owner, or authorized to act on behalf of the owner, of the copyright or of an exclusive right under the copyright that is allegedly infringed."</li>
                                </ul>
                            </li>
                            <li>Provide your full legal name and your electronic or physical signature.</li>
                        </ol>

                        <p>Deliver this Notice, with all items completed, to our Designated Copyright Agent via email.</p>

                        <div className="bg-slate-100 dark:bg-white/5 p-6 rounded-xl border border-slate-200 dark:border-white/10 not-prose mt-8">
                            <h4 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Counter-Notice</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                If you believe that your material has been removed by mistake or misidentification, please provide a counter-notification containing the same information as above, including a statement under penalty of perjury that you have a good faith belief the material was removed by mistake.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
