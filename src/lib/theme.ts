import type { Theme, ThemePreset } from '@/types/settings'

export function applyTheme(theme: Theme, preset: ThemePreset): void {
  const root = document.documentElement

  let resolvedTheme: 'light' | 'dark'
  if (theme === 'auto') {
    resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } else {
    resolvedTheme = theme
  }

  root.setAttribute('data-theme', resolvedTheme)
  root.setAttribute('data-preset', preset)

  if (resolvedTheme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}
