import { create } from 'zustand'
import { useMemo } from 'react'
import type { AnimeEntry } from '@/types/anime'
import type { LibraryFilters, FilterStatus, SortStrategy } from '@/types/filters'
import { filterAnime } from '@/utils/filter'
import { sortAnime } from '@/utils/sort'

const DEFAULT_FILTERS: LibraryFilters = {
  status: 'all',
  sort: 'alphabetical',
  search: '',
  genres: [],
  studios: [],
  formats: [],
  seasons: [],
  scoreMin: 0,
  scoreMax: 100,
}

interface LibraryState {
  entries: AnimeEntry[]
  filters: LibraryFilters
  isSyncing: boolean
  lastSyncedAt: string | null
  setEntries: (entries: AnimeEntry[]) => void
  setFilter: <K extends keyof LibraryFilters>(key: K, value: LibraryFilters[K]) => void
  resetFilters: () => void
  setIsSyncing: (v: boolean) => void
  setLastSyncedAt: (date: string) => void
}

export const useLibraryStore = create<LibraryState>((set) => ({
  entries: [],
  filters: DEFAULT_FILTERS,
  isSyncing: false,
  lastSyncedAt: null,
  setEntries: (entries) => set({ entries }),
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
}))

export function useFilteredEntries(): AnimeEntry[] {
  const entries = useLibraryStore((s) => s.entries)
  const filters = useLibraryStore((s) => s.filters)
  return useMemo(() => {
    const filtered = filterAnime(entries, filters)
    return sortAnime(filtered, filters.sort)
  }, [entries, filters])
}

// Re-export types consumed by downstream code
export type { FilterStatus, SortStrategy }
