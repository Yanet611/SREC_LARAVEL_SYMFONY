import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Palette institutionnelle SREC UGANC
                srec: {
                    50:  '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a5f',
                    950: '#0d1f3c',
                },
                gold: {
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                },
                surface: {
                    900: '#0a0f1e',
                    800: '#0f172a',
                    700: '#1e293b',
                    600: '#334155',
                    500: '#475569',
                    950: '#030712',
                },
            },
            backgroundImage: {
                'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(218,100%,12%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(225,70%,20%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(220,80%,15%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(240,60%,15%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(215,80%,10%,1) 0px, transparent 50%)',
                'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            },
            boxShadow: {
                'glass':     '0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                'glass-lg':  '0 10px 40px -10px rgba(0,0,0,0.5), 0 4px 6px -4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)',
                'glow-blue': '0 0 20px rgba(37,99,235,0.35)',
                'glow-gold': '0 0 20px rgba(245,158,11,0.35)',
            },
            animation: {
                'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in':      'fadeIn 0.3s ease-out',
                'slide-in':     'slideIn 0.35s ease-out',
                'slide-up':     'slideUp 0.3s ease-out',
            },
            keyframes: {
                fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                slideIn: { '0%': { transform: 'translateX(-20px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
                slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
            },
        },
    },

    plugins: [forms],
};
