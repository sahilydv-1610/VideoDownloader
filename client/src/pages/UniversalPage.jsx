import { Globe } from 'lucide-react';
import { DownloaderLayout } from './DownloaderLayout';

export function UniversalPage() {
    return (
        <DownloaderLayout
            title="Any Site Downloader"
            theme="universal"
            icon={Globe}
            placeholder="Paste URL from any supported site..."
            description="Our powerful universal engine extracts video and audio from thousands of websites including TikTok, Vimeo, Facebook, and Twitter."
        />
    );
}
