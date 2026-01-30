import { Youtube } from 'lucide-react';
import { DownloaderLayout } from './DownloaderLayout';

export function YouTubePage() {
    return (
        <DownloaderLayout
            title="YouTube Downloader"
            theme="youtube"
            icon={Youtube}
            placeholder="Paste YouTube video, Short, or Playlist URL..."
            description="Download high-quality videos, Shorts, and audio from YouTube in MP4, WebM, and MP3 formats. Supports 4K/8K resolutions."
        />
    );
}
