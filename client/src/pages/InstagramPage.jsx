import { Camera } from 'lucide-react';
import { DownloaderLayout } from './DownloaderLayout';

export function InstagramPage() {
    return (
        <DownloaderLayout
            title="Instagram Saver"
            theme="instagram"
            icon={Camera}
            placeholder="Paste Instagram Post, Reel, or Story link..."
            description="Save Instagram Reels, photos, and stories directly to your device. No login required for public posts."
        />
    );
}
