/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // New terracotta-based color palette
        primary: {
          DEFAULT: '#823D2C',
          50: '#FAF5F3',
          100: '#F5EBE7',
          200: '#EBD7CF',
          300: '#E0C3B7',
          400: '#D6AF9F',
          500: '#CB9B87',
          600: '#B5836C',
          700: '#9F6B51',
          800: '#823D2C',
          900: '#5C2B1E',
        },
        // Warm background colors
        background: {
          DEFAULT: '#F9F2EF',
          light: '#FEFCFB',
          warm: '#F7EDE8',
        },
        // Neutral colors with warm undertones
        neutral: {
          50: '#FAF9F8',
          100: '#F5F3F1',
          200: '#E8E4E0',
          300: '#DBD5CF',
          400: '#CEC6BE',
          500: '#A89B92',
          600: '#8B7D73',
          700: '#6E5F54',
          800: '#514135',
          900: '#342316',
        },
        // Secondary colors
        secondary: '#8B7D73',
        accent: '#06d6a0',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#06b6d4',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Open Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'sans-jp': ['Noto Sans JP', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['2.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-sm': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'heading-lg': ['2rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'heading-md': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.35', letterSpacing: '-0.005em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'slide-in': 'slideIn 300ms ease-out',
        'fade-in': 'fadeIn 300ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
      },
      keyframes: {
        slideIn: {
          from: {
            opacity: '0',
            transform: 'translateX(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        fadeIn: {
          from: {
            opacity: '0',
          },
          to: {
            opacity: '1',
          },
        },
        scaleIn: {
          from: {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          to: {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(130, 61, 44, 0.1), 0 4px 6px -2px rgba(130, 61, 44, 0.05)',
        'soft-lg': '0 10px 40px -12px rgba(130, 61, 44, 0.15), 0 4px 25px -5px rgba(130, 61, 44, 0.1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
};