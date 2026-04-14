import type { AnimeEntry, MediaSeason, TrackingService } from '@/types/anime'

/** 1 = positive (include), 0 = neutral (don't care), -1 = negative (exclude) */
export type FilterValue = 1 | 0 | -1

export interface StatusFilters {
  watching: FilterValue
  completed: FilterValue
  downloaded: FilterValue
  favorites: FilterValue
  unwatched: FilterValue
}

export const DEFAULT_STATUS_FILTERS: StatusFilters = {
  watching: 0,
  completed: 0,
  downloaded: 0,
  favorites: 0,
  unwatched: 0,
}

/** Kept for test backward-compat; runtime code should use StatusFilters */
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
  /** Cumulative per-status filter values */
  statusFilters: StatusFilters
  /** @deprecated use statusFilters — kept for test backward-compat */
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
