import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DownloadProvider } from './contexts/DownloadContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AppLayout } from './components/AppLayout';
import { ErrorBoundary } from './components/ErrorBoundary';

import { HomePage } from './pages/HomePage';

export function App() {
    return (
        <SettingsProvider>
            <DownloadProvider>
                <BrowserRouter>
                    <ErrorBoundary>
                        <AppLayout>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </AppLayout>
                    </ErrorBoundary>
                </BrowserRouter>
            </DownloadProvider>
        </SettingsProvider>
    );
}
