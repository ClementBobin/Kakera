import type { AnimeEntry, MediaSeason, TrackingService } from '@/types/anime'

export type FilterStatus = 'all' | 'downloaded' | 'unwatched' | 'started' | 'favorites' | 'completed' | TrackingService

export type SortStrategy =
  | 'alphabetical'
  | 'alphabetical_desc'
  | 'episode_count'
  | 'last_watched'
  | 'last_updated'
  | 'unwatched_count'
  | 'last_episode'
  | 'fetch_date'
  | 'added_date'
  | 'score'
  | 'broadcast_season'
  | 'random'

export interface LibraryFilters {
  status: FilterStatus
  sort: SortStrategy
  search: string
  genres: string[]
  studios: string[]
  formats: AnimeEntry['format'][]
  seasons: MediaSeason[]
  scoreMin: number
  scoreMax: number
}
