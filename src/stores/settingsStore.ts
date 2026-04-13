import { create } from 'zustand'
import type { AppSettings } from '@/types'

interface SettingsState {
  settings: AppSettings
  updateSettings: (partial: Partial<AppSettings>) => void
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  themePreset: 'slate',
  downloadDirectory: '',
  defaultQuality: '1080p',
  viewMode: 'grid',
  gridDensity: 'normal',
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  updateSettings: (partial) =>
    set((state) => ({ settings: { ...state.settings, ...partial } })),
}))
