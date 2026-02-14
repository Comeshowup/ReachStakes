import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'bd-theme';
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
function getInitialTheme() {
    if (typeof window === 'undefined') return 'light';

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && VALID_THEMES.includes(stored)) return stored;
    } catch {
        // localStorage blocked
    }

    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }

    return 'light';
}

export function ThemeProvider({ children, defaultTheme }) {
    const [theme, setThemeState] = useState(() => defaultTheme || getInitialTheme());

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
