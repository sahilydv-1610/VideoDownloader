import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const DownloadContext = createContext();

const API_Base = "";

export function DownloadProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [jobs, setJobs] = useState({}); // Map of jobId -> jobData
    const [activeDownloads, setActiveDownloads] = useState([]);

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
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Download Complete', {
                        body: `${filename} has finished processing.`,
                        icon: '/vite.svg' // Fallback icon
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

    const value = {
        jobs,
        startDownload,
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
