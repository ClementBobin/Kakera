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
  /** null = show all anime; a collection id = show only that collection */
  selectedCollectionId: string | null
  setEntries: (entries: AnimeEntry[]) => void
  setFilter: <K extends keyof LibraryFilters>(key: K, value: LibraryFilters[K]) => void
  resetFilters: () => void
  setIsSyncing: (v: boolean) => void
  setLastSyncedAt: (date: string) => void
  setSelectedCollectionId: (id: string | null) => void
}

export const useLibraryStore = create<LibraryState>((set) => ({
  entries: [],
  filters: DEFAULT_FILTERS,
  isSyncing: false,
  lastSyncedAt: null,
  selectedCollectionId: null,
  setEntries: (entries) => set({ entries }),
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
  setSelectedCollectionId: (selectedCollectionId) => set({ selectedCollectionId }),
}))

/**
 * Returns entries filtered by the active collection (if any) and then by the
 * current search/status/sort filters.
 */
export function useFilteredEntries(collectionAnimeIds?: string[]): AnimeEntry[] {
  const entries = useLibraryStore((s) => s.entries)
  const filters = useLibraryStore((s) => s.filters)
  return useMemo(() => {
    const base = collectionAnimeIds
      ? entries.filter((e) => collectionAnimeIds.includes(e.id))
      : entries
    const filtered = filterAnime(base, filters)
    return sortAnime(filtered, filters.sort)
  }, [entries, filters, collectionAnimeIds])
}

// Re-export types consumed by downstream code
export type { FilterStatus, SortStrategy }
