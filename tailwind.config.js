/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // STRICT PALETTE: Black #000000, Navy #14213D, Orange #FCA311, Light Gray #E5E5E5, White #FFFFFF
        black: '#000000',
        navy: {
          DEFAULT: '#14213D',
          950: '#060B16',
          900: '#0A1222',
          850: '#0E192E',
          800: '#14213D',
          700: '#1C2E52',
          600: '#253B68',
          500: '#324D82',
        },
        orange: {
          DEFAULT: '#FCA311',
          500: '#FCA311',
          400: '#FDB642',
          300: '#FEC96A',
          600: '#E08C05',
          dark: '#B87203',
        },
        cyan: {
          DEFAULT: '#22D3EE',
          500: '#22D3EE',
          400: '#67E8F9',
          300: '#A5F3FC',
          600: '#0891B2',
        },
        lightgray: {
          DEFAULT: '#E5E5E5',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          800: '#262626',
        },
        white: '#FFFFFF',
        hud: {
          bg: 'rgba(6, 11, 22, 0.88)',
          border: 'rgba(252, 163, 17, 0.35)',
          accent: '#FCA311',
          text: '#FFFFFF',
          muted: '#94A3B8',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'scan-line': 'scanLine 4s linear infinite',
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.3s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 6px rgba(252,163,17,0.3), 0 0 12px rgba(252,163,17,0.1)' },
          '50%': { boxShadow: '0 0 12px rgba(252,163,17,0.6), 0 0 24px rgba(252,163,17,0.2)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      boxShadow: {
        'glow-orange': '0 0 12px rgba(252,163,17,0.5), 0 0 24px rgba(252,163,17,0.2)',
        'glow-orange-sm': '0 0 6px rgba(252,163,17,0.4)',
        'glow-cyan': '0 0 12px rgba(34,211,238,0.5), 0 0 24px rgba(34,211,238,0.2)',
        'glow-cyan-sm': '0 0 6px rgba(34,211,238,0.4)',
        'glow-red': '0 0 12px rgba(239,68,68,0.5), 0 0 24px rgba(239,68,68,0.2)',
        'glass': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'panel': '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
