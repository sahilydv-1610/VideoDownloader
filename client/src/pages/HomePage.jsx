import { Globe } from 'lucide-react';
import { DownloaderLayout } from './DownloaderLayout';
import { PageHeader } from '../components/PageHeader';

export function HomePage() {
    return (
        <DownloaderLayout
            header={
                <PageHeader
                    title="Universal Downloader"
                    subtitle="Download video and audio from thousands of sites."
                    icon={Globe}
                    theme="universal"
                    tags={['Fast', 'No Limits', 'Free']}
                />
            }
            placeholder="Paste any video link here..."
        />
    );
}
