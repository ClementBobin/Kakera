export interface AnimeEntry {
  id: number
  title: string
  titleEnglish?: string
  titleRomaji?: string
  episodes?: number
  episodesWatched: number
  score?: number
  status: 'CURRENT' | 'COMPLETED' | 'PLANNING' | 'DROPPED' | 'PAUSED'
  coverImage?: string
  genres: string[]
  lastWatched?: Date
  lastUpdated: Date
  isDownloaded: boolean
  downloadedEpisodes: number[]
  isFavorite: boolean
  service: 'anilist' | 'mal' | 'kitsu'
  serviceId: string
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto'
  themePreset: 'slate' | 'wallbash'
  downloadDirectory: string
  defaultQuality: '360p' | '480p' | '720p' | '1080p'
  anilistToken?: string
  malToken?: string
  kitsuToken?: string
  viewMode: 'grid' | 'list'
  gridDensity: 'compact' | 'normal' | 'comfortable'
}

export type SortStrategy =
  | 'alphabetical'
  | 'episodeCount'
  | 'score'
  | 'lastWatched'
  | 'lastUpdated'
  | 'unwatchedCount'
  | 'broadcastSeason'
  | 'random'
