export type DisplayMode = 'grid_compact' | 'grid_spacious' | 'grid_cover_only' | 'list'
export type Theme = 'light' | 'dark' | 'auto'
export type ThemePreset =
  | 'slate'
  | 'wallbash'
  | 'cloudflare'
  | 'barbe-a-papa'
  | 'doom'
  | 'pomme-verte'
  | 'lavande'
  | 'matrix'
  | 'crepuscule-de-minuit'
export type VideoQuality = '360p' | '720p' | '1080p' | 'best'

export interface OverlaySettings {
  showDownloadedCount: boolean
  showUnwatchedCount: boolean
  showLocalSource: boolean
  showLanguage: boolean
  showResumeButton: boolean
}

export interface TabSettings {
  showCategoryTabs: boolean
  showEntryCount: boolean
}

export interface AppSettings {
  theme: Theme
  themePreset: ThemePreset
  displayMode: DisplayMode
  gridSize: number
  gridSizeAuto: boolean
  overlay: OverlaySettings
  tabs: TabSettings
  aniCliQuality: VideoQuality
  aniCliAlwaysUsePreferredQuality: boolean
  downloadDir: string
  services: {
    anilist: { enabled: boolean; token: string | null; username: string | null }
    myanimelist: { enabled: boolean; token: string | null; username: string | null }
  }
}
