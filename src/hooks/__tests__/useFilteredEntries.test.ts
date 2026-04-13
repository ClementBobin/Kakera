import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilteredEntries, useLibraryStore } from '@/stores/libraryStore'
import { MOCK_ANIME } from '@/mocks'

beforeEach(() => {
  useLibraryStore.setState({
    entries: MOCK_ANIME,
    filters: {
      status: 'all',
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

  it('returns only completed entries when status filter is completed', () => {
    act(() => {
      useLibraryStore.getState().setFilter('status', 'completed')
    })
    const { result } = renderHook(() => useFilteredEntries())
    expect(result.current.length).toBeGreaterThan(0)
    expect(result.current.every((e) => e.status === 'completed')).toBe(true)
  })

  it('returns only started entries when status filter is started', () => {
    act(() => {
      useLibraryStore.getState().setFilter('status', 'started')
    })
    const { result } = renderHook(() => useFilteredEntries())
    expect(result.current.every((e) => e.progress > 0 && e.status !== 'completed')).toBe(true)
  })

  it('returns only favorite entries when status filter is favorites', () => {
    act(() => {
      useLibraryStore.getState().setFilter('status', 'favorites')
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

  it('returns only downloaded entries when status filter is downloaded', () => {
    act(() => {
      useLibraryStore.getState().setFilter('status', 'downloaded')
    })
    const { result } = renderHook(() => useFilteredEntries())
    expect(result.current.every((e) => e.isDownloaded)).toBe(true)
  })
})
