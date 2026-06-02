import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'rs-theme';
const VALID_THEMES = ['light', 'dark'];

const ThemeContext = createContext({
    theme: 'light',
    setTheme: () => { },
    toggleTheme: () => { },
});

/**
 * Resolves the initial theme:
 * 1. localStorage preference
 * 2. System preference (prefers-color-scheme)
 * 3. Fallback to 'light'
 */
function getInitialTheme(defaultTheme) {
    if (defaultTheme && VALID_THEMES.includes(defaultTheme)) return defaultTheme;
    if (typeof window === 'undefined') return 'dark';

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && VALID_THEMES.includes(stored)) return stored;
        const legacy = localStorage.getItem('bd-theme');
        if (legacy && VALID_THEMES.includes(legacy)) return legacy;
    } catch {
        // localStorage blocked
    }

    if (defaultTheme === 'system' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
        return 'light';
    }

    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }

    return 'dark';
}

export function ThemeProvider({ children, defaultTheme = 'dark' }) {
    const [theme, setThemeState] = useState(() => getInitialTheme(defaultTheme));

    const setTheme = useCallback((newTheme) => {
        if (!VALID_THEMES.includes(newTheme)) return;
        setThemeState(newTheme);
        try {
            localStorage.setItem(STORAGE_KEY, newTheme);
        } catch {
            // localStorage unavailable
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    }, [theme, setTheme]);

    // Sync `dark` class on <html> so Tailwind dark: variants work
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        root.setAttribute('data-theme', theme);
    }, [theme]);

    // Listen for system preference changes (only when no stored preference)
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');

        const handler = (e) => {
            try {
                if (!localStorage.getItem(STORAGE_KEY)) {
                    setThemeState(e.matches ? 'dark' : 'light');
                }
            } catch {
                setThemeState(e.matches ? 'dark' : 'light');
            }
        };

        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return ctx;
}

export default ThemeProvider;
