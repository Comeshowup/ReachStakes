/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: ["class", '[data-theme="dark"]'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
                mono: ['"JetBrains Mono"', '"SFMono-Regular"', 'Consolas', 'ui-monospace', 'monospace'],
            },
            fontSize: {
                display: ['2.25rem', { lineHeight: '1.08', fontWeight: '650' }],
                heading: ['1.5rem', { lineHeight: '1.2', fontWeight: '650' }],
                body: ['0.9375rem', { lineHeight: '1.55' }],
                label: ['0.8125rem', { lineHeight: '1.35', fontWeight: '600' }],
                caption: ['0.75rem', { lineHeight: '1.35' }],
            },
            colors: {
                background: 'var(--rs-bg-primary)',
                foreground: 'var(--rs-text-primary)',
                card: {
                    DEFAULT: 'var(--rs-surface-card)',
                    foreground: 'var(--rs-text-primary)',
                },
                popover: {
                    DEFAULT: 'var(--rs-surface-elevated)',
                    foreground: 'var(--rs-text-primary)',
                },
                primary: {
                    DEFAULT: 'var(--rs-brand-primary)',
                    foreground: '#ffffff',
                    hover: 'var(--rs-brand-primary-hover)',
                    pressed: 'var(--rs-brand-primary-pressed)',
                    light: 'var(--rs-brand-primary-light)',
                },
                secondary: {
                    DEFAULT: 'var(--rs-surface-elevated)',
                    foreground: 'var(--rs-text-secondary)',
                    brand: 'var(--rs-brand-secondary)',
                },
                muted: {
                    DEFAULT: 'var(--rs-bg-tertiary)',
                    foreground: 'var(--rs-text-muted)',
                },
                accent: {
                    DEFAULT: 'var(--rs-surface-hover)',
                    foreground: 'var(--rs-text-primary)',
                    cyan: 'var(--rs-accent-cyan)',
                },
                destructive: {
                    DEFAULT: 'var(--rs-status-danger)',
                    foreground: '#ffffff',
                },
                border: 'var(--rs-border-default)',
                input: 'var(--rs-border-default)',
                ring: 'var(--rs-ring)',
                surface: {
                    primary: 'var(--rs-bg-secondary)',
                    card: 'var(--rs-surface-card)',
                    elevated: 'var(--rs-surface-elevated)',
                    hover: 'var(--rs-surface-hover)',
                    input: 'var(--rs-surface-input)',
                },
                text: {
                    primary: 'var(--rs-text-primary)',
                    secondary: 'var(--rs-text-secondary)',
                    muted: 'var(--rs-text-muted)',
                    disabled: 'var(--rs-text-disabled)',
                    inverse: 'var(--rs-text-inverse)',
                },
                success: 'var(--rs-status-success)',
                warning: 'var(--rs-status-warning)',
                danger: 'var(--rs-status-danger)',
                info: 'var(--rs-status-info)',
                campaign: {
                    draft: 'var(--rs-campaign-draft)',
                    pending: 'var(--rs-campaign-pending-review)',
                    active: 'var(--rs-campaign-active)',
                    inviting: 'var(--rs-campaign-inviting)',
                    funded: 'var(--rs-campaign-funded)',
                    progress: 'var(--rs-campaign-in-progress)',
                    completed: 'var(--rs-campaign-completed)',
                    cancelled: 'var(--rs-campaign-cancelled)',
                    disputed: 'var(--rs-campaign-disputed)',
                    escrow: 'var(--rs-campaign-escrow-protected)',
                },
                chart: {
                    1: 'var(--rs-chart-1)',
                    2: 'var(--rs-chart-2)',
                    3: 'var(--rs-chart-3)',
                    4: 'var(--rs-chart-4)',
                    5: 'var(--rs-chart-5)',
                    6: 'var(--rs-chart-6)',
                },
                brand: {
                    sky: 'var(--rs-accent-cyan)',
                    dark: 'var(--rs-bg-primary)',
                    panel: 'var(--rs-surface-card)',
                },
                slate: {
                    950: 'var(--rs-bg-primary)',
                },
            },
            borderRadius: {
                sm: 'var(--rs-radius-sm)',
                md: 'var(--rs-radius-md)',
                lg: 'var(--rs-radius-lg)',
                xl: 'var(--rs-radius-xl)',
                '2xl': 'var(--rs-radius-xl)',
            },
            boxShadow: {
                xs: 'var(--rs-shadow-xs)',
                sm: 'var(--rs-shadow-sm)',
                md: 'var(--rs-shadow-md)',
                lg: 'var(--rs-shadow-lg)',
                focus: 'var(--rs-shadow-focus)',
                primary: 'var(--rs-shadow-primary)',
            },
            transitionDuration: {
                150: '150ms',
            },
            transitionTimingFunction: {
                standard: 'var(--rs-ease-standard)',
                emphasized: 'var(--rs-ease-emphasized)',
            },
            backgroundImage: {
                'radial-glow': 'radial-gradient(circle at 70% 50%, rgba(99, 102, 241, 0.12) 0%, rgba(10, 10, 11, 0) 58%)',
            },
            animation: {
                shimmer: 'shimmer 2s linear infinite',
            },
            keyframes: {
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
            },
        },
    },
    plugins: [],
}
