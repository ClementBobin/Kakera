import { create } from 'zustand'
import type { AnimeEntry, SortStrategy } from '@/types'

interface LibraryState {
  animeList: AnimeEntry[]
  sortStrategy: SortStrategy
  filterService: 'all' | 'anilist' | 'mal' | 'kitsu'
  viewMode: 'grid' | 'list'
  setAnimeList: (list: AnimeEntry[]) => void
  setSortStrategy: (strategy: SortStrategy) => void
  setFilterService: (service: LibraryState['filterService']) => void
  setViewMode: (mode: 'grid' | 'list') => void
}

export const useLibraryStore = create<LibraryState>((set) => ({
  animeList: [],
  sortStrategy: 'alphabetical',
  filterService: 'all',
  viewMode: 'grid',
  setAnimeList: (list) => set({ animeList: list }),
  setSortStrategy: (strategy) => set({ sortStrategy: strategy }),
  setFilterService: (service) => set({ filterService: service }),
  setViewMode: (mode) => set({ viewMode: mode }),
}))
