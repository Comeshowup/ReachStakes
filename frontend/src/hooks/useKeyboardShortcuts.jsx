/**
 * useKeyboardShortcuts
 * Dashboard keyboard navigation and shortcuts
 */

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Shortcut definitions
const SHORTCUTS = {
    // Navigation
    'g+h': { action: 'navigate', path: '/brand', description: 'Go to Dashboard' },
    'g+c': { action: 'navigate', path: '/brand/campaigns', description: 'Go to Campaigns' },
    'g+a': { action: 'navigate', path: '/brand/approvals', description: 'Go to Approvals' },
    'g+e': { action: 'navigate', path: '/brand/escrow', description: 'Go to Escrow' },
    'g+s': { action: 'navigate', path: '/brand/settings', description: 'Go to Settings' },

    // Actions
    'n': { action: 'callback', key: 'newCampaign', description: 'New Campaign' },
    'r': { action: 'callback', key: 'refresh', description: 'Refresh Data' },
    '?': { action: 'callback', key: 'showHelp', description: 'Show Shortcuts' },
    'Escape': { action: 'callback', key: 'escape', description: 'Close Modal/Cancel' }
};

/**
 * Hook for dashboard keyboard shortcuts
 * 
 * @example
 * useKeyboardShortcuts({
 *   newCampaign: () => navigate('/brand/campaigns/new'),
 *   refresh: () => queryClient.invalidateQueries(),
 *   showHelp: () => setShowShortcuts(true)
 * });
 */
export const useKeyboardShortcuts = (callbacks = {}) => {
    const navigate = useNavigate();

    const handleKeyDown = useCallback((event) => {
        // Don't trigger shortcuts when typing in inputs
        const target = event.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            // Only allow Escape in inputs
            if (event.key !== 'Escape') return;
        }

        const key = event.key;
        const shortcut = SHORTCUTS[key];

        if (shortcut) {
            event.preventDefault();

            if (shortcut.action === 'navigate') {
                navigate(shortcut.path);
            } else if (shortcut.action === 'callback' && callbacks[shortcut.key]) {
                callbacks[shortcut.key]();
            }
        }
    }, [navigate, callbacks]);

    // Track key sequences (for g+x patterns)
    useEffect(() => {
        let keySequence = '';
        let sequenceTimer = null;

        const handleSequence = (event) => {
            const target = event.target;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

            const key = event.key.toLowerCase();

            // Start or continue sequence
            if (key === 'g') {
                keySequence = 'g';
                clearTimeout(sequenceTimer);
                sequenceTimer = setTimeout(() => { keySequence = ''; }, 1000);
                return;
            }

            // Check for sequence match
            if (keySequence === 'g') {
                const fullKey = `g+${key}`;
                const shortcut = SHORTCUTS[fullKey];

                if (shortcut) {
                    event.preventDefault();
                    if (shortcut.action === 'navigate') {
                        navigate(shortcut.path);
                    }
                }
                keySequence = '';
            }
        };

        window.addEventListener('keydown', handleSequence);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleSequence);
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(sequenceTimer);
        };
    }, [handleKeyDown, navigate]);

    return { shortcuts: SHORTCUTS };
};

/**
 * Keyboard shortcut help component
 */
export const ShortcutHelp = ({ onClose }) => {
    const categories = {
        'Navigation': ['g+h', 'g+c', 'g+a', 'g+e', 'g+s'],
        'Actions': ['n', 'r', '?', 'Escape']
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-[#0F0F12] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
                    <button
                        onClick={onClose}
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {Object.entries(categories).map(([category, keys]) => (
                    <div key={category} className="mb-6 last:mb-0">
                        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                            {category}
                        </h3>
                        <div className="space-y-2">
                            {keys.map(key => {
                                const shortcut = SHORTCUTS[key];
                                return (
                                    <div key={key} className="flex items-center justify-between py-2">
                                        <span className="text-sm text-white/70">{shortcut.description}</span>
                                        <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-white/60">
                                            {key}
                                        </kbd>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default useKeyboardShortcuts;
