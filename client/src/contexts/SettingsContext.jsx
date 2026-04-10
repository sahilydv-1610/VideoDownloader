import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('app_settings');
            if (saved) {
                return JSON.parse(saved);
            }
            // Migration: Check for legacy individual keys if main key missing
            const legacyTheme = localStorage.getItem('theme');
            return {
                notifications: true,
                defaultQuality: 'best',
                autoConvertAudio: true,
                audioBitrate: '320',
                theme: legacyTheme || 'system'
            };
        } catch (e) {
            console.error("Failed to load settings:", e);
            return {
                notifications: true,
                defaultQuality: 'best',
                autoConvertAudio: true,
                audioBitrate: '320',
                theme: 'system'
            };
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('app_settings', JSON.stringify(settings));
        } catch (e) {
            console.error("Failed to save settings:", e);
        }
    }, [settings]);

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, toggleSetting }}>
            {children}
        </SettingsContext.Provider>
    );
}
