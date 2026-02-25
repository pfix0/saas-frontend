import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ساس Brand Colors
        brand: {
          DEFAULT: '#660033',    // Burgundy - Primary
          light: '#8a1a52',
          dark: '#4d0026',
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#f9c2d9',
          300: '#f09abb',
          400: '#e06694',
          500: '#cc3370',
          600: '#a8194f',
          700: '#8a1a52',
          800: '#660033',
          900: '#4d0026',
        },
        grey: {
          DEFAULT: '#666666',    // Grey - Secondary
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#666666',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Semantic Colors
        success: '#1a8a5c',
        warning: '#d4850a',
        danger: '#c0392b',
        info: '#2874a6',
      },
      fontFamily: {
        tajawal: ['Tajawal', 'system-ui', 'sans-serif'],
        ibm: ['IBM Plex Sans Arabic', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        saas: '12px',
      },
      boxShadow: {
        saas: '0 2px 12px rgba(0, 0, 0, 0.04)',
        'saas-lg': '0 4px 24px rgba(0, 0, 0, 0.08)',
        'saas-brand': '0 4px 16px rgba(102, 0, 51, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
