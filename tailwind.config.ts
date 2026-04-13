import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kakera: {
          primary: {
            DEFAULT: '#64748b',
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
            950: '#020617',
          },
          surface: {
            DEFAULT: '#1e293b',
            light: '#f1f5f9',
            dark: '#0f172a',
          },
          muted: {
            DEFAULT: '#94a3b8',
            light: '#cbd5e1',
            dark: '#475569',
          },
          accent: {
            DEFAULT: '#7c3aed',
            light: '#a78bfa',
            dark: '#5b21b6',
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
