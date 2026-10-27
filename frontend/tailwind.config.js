/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1526',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#0B1526',
        },
        brand: {
          blue: '#0077EE',
          blueDark: '#0055BB',
          cyan: '#00B4D8',
          sky: '#0284C7',
          accent: '#0090FF',
          glow: 'rgba(0, 119, 238, 0.15)',
        },
      },
      fontFamily: {
        heading: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'Cascadia Code', 'Source Code Pro', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        clay: '1.25rem',
        'clay-sm': '0.5rem',
        'clay-md': '0.75rem',
        'clay-lg': '1rem',
        'clay-xl': '1.25rem',
      },
      boxShadow: {
        card: '0 2px 10px -1px rgba(11, 21, 38, 0.05), 0 1px 4px -1px rgba(11, 21, 38, 0.03)',
        cardHover: '0 12px 28px -4px rgba(0, 119, 238, 0.12), 0 4px 10px -2px rgba(11, 21, 38, 0.04)',
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'clay-card': '0 8px 24px rgba(11, 21, 38, 0.08), inset 0 2px 4px rgba(255, 255, 255, 0.9), inset 0 -4px 8px rgba(11, 21, 38, 0.04)',
        'clay-card-hover': '0 14px 36px rgba(0, 119, 238, 0.14), inset 0 2px 4px rgba(255, 255, 255, 0.9), inset 0 -4px 8px rgba(11, 21, 38, 0.04)',
        'clay-btn-primary': '0 6px 18px rgba(0, 119, 238, 0.35), inset 0 2px 3px rgba(255, 255, 255, 0.45), inset 0 -3px 6px rgba(0, 85, 187, 0.3)',
        'clay-btn-primary-hover': '0 10px 26px rgba(0, 119, 238, 0.45), inset 0 2px 3px rgba(255, 255, 255, 0.55)',
        'clay-btn-secondary': '0 4px 14px rgba(11, 21, 38, 0.07), inset 0 2px 4px rgba(255, 255, 255, 0.9), inset 0 -3px 6px rgba(11, 21, 38, 0.03)',
        'clay-btn-secondary-hover': '0 8px 22px rgba(0, 119, 238, 0.12), inset 0 2px 4px rgba(255, 255, 255, 0.9), inset 0 -3px 6px rgba(11, 21, 38, 0.03)',
        'clay-input': 'inset 0 2px 6px rgba(11, 21, 38, 0.05), inset 0 -1px 2px rgba(255, 255, 255, 0.8)',
        'clay-input-focus': 'inset 0 2px 6px rgba(11, 21, 38, 0.05), 0 0 0 4px rgba(0, 119, 238, 0.22)',
        'clay-pill': '0 3px 8px rgba(11, 21, 38, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 119, 238, 0.5)' },
          '50%': { boxShadow: '0 0 0 8px rgba(0, 119, 238, 0)' },
        },
        'float-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'caret-blink': {
          '0%, 45%': { opacity: '1' },
          '50%, 95%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.5s ease-in-out infinite',
        'float': 'float-subtle 3.2s ease-in-out infinite',
        'caret-blink': 'caret-blink 1.1s steps(1) infinite',
      },
      transitionTimingFunction: {
        'clay-settle': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
