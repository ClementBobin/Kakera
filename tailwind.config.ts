import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kakera: {
          primary: {
            DEFAULT: 'var(--kakera-primary)',
            50: 'var(--kakera-primary-50)',
            100: 'var(--kakera-primary-100)',
            200: 'var(--kakera-primary-200)',
            300: 'var(--kakera-primary-300)',
            400: 'var(--kakera-primary-400)',
            500: 'var(--kakera-primary-500)',
            600: 'var(--kakera-primary-600)',
            700: 'var(--kakera-primary-700)',
            800: 'var(--kakera-primary-800)',
            900: 'var(--kakera-primary-900)',
            950: 'var(--kakera-primary-950)',
          },
          surface: {
            DEFAULT: 'var(--kakera-surface)',
            light: 'var(--kakera-surface-light)',
            dark: 'var(--kakera-surface-dark)',
          },
          muted: {
            DEFAULT: 'var(--kakera-muted)',
            light: 'var(--kakera-muted-light)',
            dark: 'var(--kakera-muted-dark)',
          },
          accent: {
            DEFAULT: 'var(--kakera-accent)',
            light: 'var(--kakera-accent-light)',
            dark: 'var(--kakera-accent-dark)',
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
