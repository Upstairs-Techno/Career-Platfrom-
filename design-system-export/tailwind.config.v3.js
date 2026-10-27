/**
 * tailwind.config.v3.js
 * Upstairs Job Platform — "Ink + Acid Lime" Claymorphism Design Language v2
 *
 * For Tailwind CSS v3 Projects
 * Merge this into your `tailwind.config.js` `theme.extend` section.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        clay: {
          bg: '#F7F5F0',          // warm paper
          surface: '#FFFFFF',     // card surface
          text: '#16181D',        // ink text & borders
          muted: '#5A5E68',       // ink-soft
          line: '#E7E3DA',        // warm hairline
          success: '#B6F03C',     // verdict success
          warning: '#E8A317',     // timer / warning
          danger: '#E11D48',      // error / danger
          'danger-dark': '#BE123C'
        },
        accent: {
          DEFAULT: '#B6F03C',     // acid lime base fill
          bright: '#C7F85A',      // lime hover
          light: '#ECFBC8',       // pale lime tint fill
          dark: '#3D5300',        // deep lime (safe for text/links)
        },
        code: {
          bg: '#0E0F13',
          fg: '#E8E6DF',
        },
      },
      fontFamily: {
        heading: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'Cascadia Code', 'Source Code Pro', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        clay: '1.25rem', // 20px
      },
      boxShadow: {
        'clay-card': '0 8px 24px rgba(22, 24, 29, 0.09), inset 0 2px 4px rgba(255, 255, 255, 0.9), inset 0 -4px 8px rgba(22, 24, 29, 0.05)',
        'clay-card-hover': '0 14px 36px rgba(22, 24, 29, 0.14), inset 0 2px 4px rgba(255, 255, 255, 0.9), inset 0 -4px 8px rgba(22, 24, 29, 0.05)',
        'clay-btn-primary': '0 6px 18px rgba(22, 24, 29, 0.18), inset 0 2px 3px rgba(255, 255, 255, 0.55), inset 0 -3px 6px rgba(22, 24, 29, 0.10)',
        'clay-btn-primary-hover': '0 10px 26px rgba(22, 24, 29, 0.22), inset 0 2px 3px rgba(255, 255, 255, 0.55)',
        'clay-btn-ghost': '0 4px 12px rgba(22, 24, 29, 0.08), inset 0 2px 4px rgba(255, 255, 255, 0.9), inset 0 -3px 6px rgba(22, 24, 29, 0.05)',
        'clay-btn-ghost-hover': '0 8px 20px rgba(22, 24, 29, 0.12), inset 0 2px 4px rgba(255, 255, 255, 0.9), inset 0 -3px 6px rgba(22, 24, 29, 0.05)',
        'clay-input': 'inset 0 2px 6px rgba(22, 24, 29, 0.06), inset 0 -1px 2px rgba(255, 255, 255, 0.8)',
        'clay-pill': '0 3px 8px rgba(22, 24, 29, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(182, 240, 60, 0.55)' },
          '50%': { boxShadow: '0 0 0 6px rgba(182, 240, 60, 0)' },
        },
        'caret-blink': {
          '0%, 45%': { opacity: '1' },
          '50%, 95%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.5s ease-in-out infinite',
        'caret-blink': 'caret-blink 1.1s steps(1) infinite',
      },
    },
  },
  plugins: [],
};
