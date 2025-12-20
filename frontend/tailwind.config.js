/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Newsreader', 'serif'],
            },
            colors: {
                slate: {
                    950: '#020617',
                },
                brand: {
                    sky: '#38BDF8',
                    dark: '#050505',
                    panel: '#0F110E',
                }
            },
            backgroundImage: {
                'radial-glow': 'radial-gradient(circle at 70% 50%, rgba(56, 189, 248, 0.25) 0%, rgba(5, 5, 5, 0) 60%)',
            },
            animation: {
                'beam': 'beam 3s linear infinite',
                'spin-slow': 'spin 12s linear infinite',
                'spin-slow-reverse': 'spin 15s linear infinite reverse',
                'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'sonar': 'sonar-wave 3s cubic-bezier(0, 0, 0.2, 1) infinite',
                'border-spin': 'border-spin 2.5s linear infinite',
                'shimmer': 'shimmer 4s linear infinite',
                'breathe': 'breathe 4.5s linear infinite',
            },
            keyframes: {
                beam: {
                    '0%': { strokeDashoffset: '1000' },
                    '100%': { strokeDashoffset: '0' },
                },
                'sonar-wave': {
                    '0%': { r: '10px', opacity: '0.8', strokeWidth: '1px' },
                    '100%': { r: '80px', opacity: '0', strokeWidth: '0px' },
                },
                'border-spin': {
                    to: { '--gradient-angle': '360deg' }
                },
                shimmer: {
                    to: { transform: 'translate(-50%, -50%) rotate(360deg)' }
                },
                breathe: {
                    '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
                    '50%': { transform: 'translate(-50%, -50%) scale(1.20)' },
                }
            }
        },
    },
    plugins: [],
}
