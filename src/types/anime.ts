export type TrackingService = 'anilist' | 'myanimelist'

export type WatchStatus = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch'

export type MediaSeason = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL'

export interface AnimeEntry {
  id: string
  serviceId: Record<TrackingService, string | null>
  title: { romaji: string; english: string | null; native: string }
  coverImage: string
  bannerImage: string | null
  status: WatchStatus
  progress: number
  totalEpisodes: number | null
  score: number | null
  isFavorite: boolean
  isDownloaded: boolean
  downloadedEpisodes: number[]
  lastWatched: string | null
  lastUpdated: string
  addedAt: string
  nextEpisodeAt: string | null
  nextEpisodeNumber: number | null
  genres: string[]
  studios: string[]
  season: MediaSeason | null
  seasonYear: number | null
  format: 'TV' | 'MOVIE' | 'OVA' | 'ONA' | 'SPECIAL' | 'MUSIC'
  source: TrackingService
  localPath: string | null
  language: string | null
  relations: AnimeRelation[]
}

export interface AnimeRelation {
  id: string
  title: string
  coverImage: string
  relationType: 'PREQUEL' | 'SEQUEL' | 'SIDE_STORY' | 'SPIN_OFF' | 'ALTERNATIVE' | 'SUMMARY' | 'OTHER'
  releaseYear: number | null
  format: AnimeEntry['format']
}

export interface AnimeCalendarEntry {
  animeId: string
  title: string
  coverImage: string
  episodeNumber: number
  airingAt: string
  isInLibrary: boolean
  isNewSeason: boolean
}
