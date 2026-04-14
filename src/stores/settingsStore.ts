import { create } from 'zustand'
import type { AppSettings } from '@/types/settings'

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  themePreset: 'slate',
  displayMode: 'grid_compact',
  gridSize: 5,
  gridSizeAuto: true,
  overlay: {
    showDownloadedCount: true,
    showUnwatchedCount: true,
    showLocalSource: true,
    showResumeButton: true,
  },
  tabs: {
    showCategoryTabs: true,
    showEntryCount: true,
  },
  aniCliQuality: '1080p',
  aniCliAlwaysUsePreferredQuality: false,
  downloadDir: '',
  services: {
    anilist: { enabled: false, token: null, username: null },
    myanimelist: { enabled: false, token: null, username: null },
  },
}

interface SettingsState {
  settings: AppSettings
  updateSettings: (partial: Partial<AppSettings>) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  updateSettings: (partial) =>
    set((state) => ({ settings: { ...state.settings, ...partial } })),
  resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
}))
