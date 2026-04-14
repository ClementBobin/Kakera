import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilteredEntries, useLibraryStore } from '@/stores/libraryStore'
import { MOCK_ANIME } from '@/mocks'
import { DEFAULT_STATUS_FILTERS } from '@/types/filters'

beforeEach(() => {
  useLibraryStore.setState({
    entries: MOCK_ANIME,
    filters: {
      status: 'all',
      statusFilters: { ...DEFAULT_STATUS_FILTERS },
      sort: 'alphabetical',
      search: '',
      genres: [],
      studios: [],
      formats: [],
      seasons: [],
      scoreMin: 0,
      scoreMax: 100,
    },
    isSyncing: false,
    lastSyncedAt: null,
  })
})

describe('useFilteredEntries', () => {
  it('returns all entries when filters are default', () => {
    const { result } = renderHook(() => useFilteredEntries())
    expect(result.current).toHaveLength(MOCK_ANIME.length)
  })

  it('returns only completed entries when statusFilters.completed = 1', () => {
    act(() => {
      useLibraryStore.getState().cycleStatusFilter('completed') // 0 → 1
    })
    const { result } = renderHook(() => useFilteredEntries())
    expect(result.current.length).toBeGreaterThan(0)
    expect(result.current.every((e) => e.status === 'completed')).toBe(true)
  })

  it('returns only watching entries when statusFilters.watching = 1', () => {
    act(() => {
      useLibraryStore.getState().cycleStatusFilter('watching') // 0 → 1
    })
    const { result } = renderHook(() => useFilteredEntries())
    expect(result.current.every((e) => e.progress > 0 && e.status !== 'completed')).toBe(true)
  })

  it('returns only favorite entries when statusFilters.favorites = 1', () => {
    act(() => {
      useLibraryStore.getState().cycleStatusFilter('favorites') // 0 → 1
    })
    const { result } = renderHook(() => useFilteredEntries())
    expect(result.current.every((e) => e.isFavorite)).toBe(true)
  })

  it('returns entries sorted alphabetically by default', () => {
    const { result } = renderHook(() => useFilteredEntries())
    const titles = result.current.map((e) => e.title.romaji)
    const sorted = [...titles].sort((a, b) => a.localeCompare(b))
    expect(titles).toEqual(sorted)
  })

  it('returns entries sorted alphabetically descending when sort is alphabetical_desc', () => {
    act(() => {
      useLibraryStore.getState().setFilter('sort', 'alphabetical_desc')
    })
    const { result } = renderHook(() => useFilteredEntries())
    const titles = result.current.map((e) => e.title.romaji)
    const sorted = [...titles].sort((a, b) => b.localeCompare(a))
    expect(titles).toEqual(sorted)
  })

  it('returns only downloaded entries when statusFilters.downloaded = 1', () => {
    act(() => {
      useLibraryStore.getState().cycleStatusFilter('downloaded') // 0 → 1
    })
    const { result } = renderHook(() => useFilteredEntries())
    expect(result.current.every((e) => e.isDownloaded)).toBe(true)
  })
})
