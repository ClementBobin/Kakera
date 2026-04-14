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

/**
 * Registers a listener so that when the OS colour-scheme changes and the app
 * is set to "auto" mode the theme is reapplied automatically.
 * Returns a cleanup function to remove the listener.
 */
export function watchSystemTheme(preset: ThemePreset): () => void {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = () => applyTheme('auto', preset)
  mq.addEventListener('change', handler)
  return () => mq.removeEventListener('change', handler)
}
