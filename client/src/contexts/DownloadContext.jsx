import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSettings } from './SettingsContext';

const DownloadContext = createContext();

const API_Base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export function DownloadProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [jobs, setJobs] = useState({}); // Map of jobId -> jobData
    const [activeDownloads, setActiveDownloads] = useState([]);
    const { settings } = useSettings();
    const settingsRef = useRef(settings); // Track latest settings

    useEffect(() => {
        settingsRef.current = settings;
    }, [settings]);

    useEffect(() => {
        // Request Notification Permission on mount
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const newSocket = io(API_Base);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Global Socket Connected:', newSocket.id);
        });

        // Listen for updates on ANY job but only process if we have it in our list
        newSocket.on('job-progress', ({ jobId, progress, status }) => {
            setJobs(prev => {
                if (!prev[jobId]) return prev;
                return {
                    ...prev,
                    [jobId]: { ...prev[jobId], progress, status }
                };
            });
        });

        newSocket.on('job-complete', ({ jobId, filename }) => {
            setJobs(prev => {
                if (!prev[jobId]) return prev;
                // Guard: If already completed, don't download again
                if (prev[jobId].status === 'completed') return prev;

                // Trigger actual file download ONLY if we are tracking this job
                downloadFile(jobId, filename);

                // Desktop Notification
                if (settingsRef.current.notifications && 'Notification' in window && Notification.permission === 'granted') {
                    new Notification('Download Complete', {
                        body: `${filename} has finished processing.`,
                        icon: '/vite.svg'
                    });
                }

                return {
                    ...prev,
                    [jobId]: { ...prev[jobId], progress: 100, status: 'completed', filename }
                };
            });
        });

        newSocket.on('job-error', ({ jobId, message }) => {
            setJobs(prev => {
                if (!prev[jobId]) return prev;
                return {
                    ...prev,
                    [jobId]: { ...prev[jobId], status: 'failed', error: message }
                };
            });
        });

        newSocket.on('job-update', ({ jobId, status }) => {
            setJobs(prev => {
                if (!prev[jobId]) return prev;
                return {
                    ...prev,
                    [jobId]: { ...prev[jobId], status }
                };
            });
        });

        return () => newSocket.close();
    }, []);

    const startDownload = useCallback(async (url, quality, info, options = {}) => {
        try {
            const res = await fetch(`${API_Base}/api/process-video`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, quality, auth_browser: info.auth_browser, ...options })
            });
            const data = await res.json();

            if (data.jobId) {
                // Add to jobs
                setJobs(prev => ({
                    ...prev,
                    [data.jobId]: {
                        id: data.jobId,
                        title: info.title || url,
                        thumbnail: info.thumbnail,
                        status: 'starting',
                        progress: 0,
                        createdAt: Date.now()
                    }
                }));
                return data.jobId;
            }
        } catch (err) {
            console.error("Failed to start download:", err);
            throw err;
        }
    }, []);

    const downloadFile = (jobId, filename) => {
        // Trigger browser download
        const link = document.createElement('a');
        link.href = `${API_Base}/api/download-file/${jobId}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const cancelDownload = useCallback(async (jobId) => {
        try {
            await fetch(`${API_Base}/api/cancel-download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId })
            });
            // Update local state immediately for better UX
            setJobs(prev => ({
                ...prev,
                [jobId]: { ...prev[jobId], status: 'cancelled' }
            }));
        } catch (err) {
            console.error("Failed to cancel download:", err);
        }
    }, []);

    const dismissJob = (jobId) => {
        setJobs(prev => {
            const newJobs = { ...prev };
            delete newJobs[jobId];
            return newJobs;
        });
    };

    const startStreamDownload = useCallback(async (url, quality, info, options = {}) => {
        try {
            // 1. Prepare ticket
            const res = await fetch(`${API_Base}/api/prepare-stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url,
                    quality,
                    auth_browser: info.auth_browser,
                    ...options
                })
            });
            const data = await res.json();

            if (data.ticketId) {
                // 2. Trigger Download via invisible iframe to prevent navigation on error
                // Using iframe allows "background" feel - user stays on page
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = `${API_Base}/api/stream-download/${data.ticketId}`;
                document.body.appendChild(iframe);

                // Cleanup after a delay (long enough for download to start)
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 60000);

                return true;
            }
        } catch (err) {
            console.error("Failed to start stream download:", err);
            throw err;
        }
    }, []);

    const value = {
        jobs,
        startDownload,
        startStreamDownload,
        cancelDownload,
        dismissJob,
        activeCount: Object.values(jobs).filter(j => j.status === 'downloading' || j.status === 'starting' || j.status === 'merging').length
    };

    return (
        <DownloadContext.Provider value={value}>
            {children}
        </DownloadContext.Provider>
    );
}

export const useDownloads = () => useContext(DownloadContext);
