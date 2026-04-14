import type { AppSettings } from '@/types/settings'

export const MOCK_SETTINGS: AppSettings = {
  theme: 'dark',
  themePreset: 'slate',
  displayMode: 'grid_compact',
  gridSize: 5,
  gridSizeAuto: true,
  overlay: {
    showDownloadedCount: true,
    showUnwatchedCount: true,
    showResumeButton: true,
  },
  tabs: {
    showCategoryTabs: true,
    showEntryCount: true,
  },
  aniCliQuality: '1080p',
  aniCliAlwaysUsePreferredQuality: false,
  aniCliDub: false,
  downloadDir: '',
  services: {
    anilist: { enabled: false, token: null, username: null },
    myanimelist: { enabled: false, token: null, username: null },
  },
}
