import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
    isDark: true,
    toggleTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(true);

    // Initial Theme Load
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        } else {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        setIsDark(prev => {
            const newIsDark = !prev;
            localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
            return newIsDark;
        });
    };

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
