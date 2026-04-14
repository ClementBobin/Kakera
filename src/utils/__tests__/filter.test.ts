import { describe, it, expect } from 'vitest'
import { filterAnime } from '@/utils/filter'
import { MOCK_ANIME } from '@/mocks/anime'
import type { LibraryFilters } from '@/types/filters'
import { DEFAULT_STATUS_FILTERS } from '@/types/filters'
import type { AnimeEntry } from '@/types/anime'

const DEFAULT_FILTERS: LibraryFilters = {
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
}

function makeFilters(overrides: Partial<LibraryFilters>): LibraryFilters {
  return { ...DEFAULT_FILTERS, ...overrides }
}

describe('filterAnime — search', () => {
  it('returns all entries when search is empty', () => {
    expect(filterAnime(MOCK_ANIME, DEFAULT_FILTERS)).toHaveLength(MOCK_ANIME.length)
  })

  it('finds by title.romaji (case-insensitive)', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ search: 'cowboy bebop' }))
    expect(result.some((e) => e.id === '13')).toBe(true)
  })

  it('finds by title.english', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ search: 'Death Note' }))
    expect(result.some((e) => e.id === '11')).toBe(true)
  })

  it('finds by genre', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ search: 'Sci-Fi' }))
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((e) => e.genres.some((g) => g.toLowerCase().includes('sci-fi')))).toBe(true)
  })

  it('finds by studio name', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ search: 'MAPPA' }))
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((e) => e.studios.some((s) => s.toLowerCase().includes('mappa')))).toBe(true)
  })

  it('returns empty when nothing matches', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ search: 'xyzzy-no-match' }))
    expect(result).toHaveLength(0)
  })
})

describe('filterAnime — status', () => {
  it('status all: returns everything', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ status: 'all' }))
    expect(result).toHaveLength(MOCK_ANIME.length)
  })

  it('status downloaded: only isDownloaded entries', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ status: 'downloaded' }))
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((e) => e.isDownloaded)).toBe(true)
  })

  it('status unwatched: entries with progress 0 or remaining episodes > 0', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ status: 'unwatched' }))
    expect(result.length).toBeGreaterThan(0)
    result.forEach((e) => {
      const hasRemaining = e.totalEpisodes !== null && e.totalEpisodes - e.progress > 0
      expect(e.progress === 0 || hasRemaining).toBe(true)
    })
  })

  it('status started: progress > 0 and not completed', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ status: 'started' }))
    expect(result.length).toBeGreaterThan(0)
    result.forEach((e) => {
      expect(e.progress).toBeGreaterThan(0)
      expect(e.status).not.toBe('completed')
    })
  })

  it('status favorites: only isFavorite entries', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ status: 'favorites' }))
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((e) => e.isFavorite)).toBe(true)
  })

  it('status completed: only completed entries', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ status: 'completed' }))
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((e) => e.status === 'completed')).toBe(true)
  })

  it('status anilist: only anilist source entries', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ status: 'anilist' }))
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((e) => e.source === 'anilist')).toBe(true)
  })

  it('status myanimelist: only myanimelist source entries', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ status: 'myanimelist' }))
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((e) => e.source === 'myanimelist')).toBe(true)
  })
})

describe('filterAnime — genres', () => {
  it('returns entries with ALL specified genres', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ genres: ['Action', 'Drama'] }))
    expect(result.length).toBeGreaterThan(0)
    result.forEach((e) => {
      expect(e.genres).toContain('Action')
      expect(e.genres).toContain('Drama')
    })
  })

  it('returns nothing when genre does not match', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ genres: ['Action', 'Nonexistent Genre XYZ'] }))
    expect(result).toHaveLength(0)
  })
})

describe('filterAnime — studios', () => {
  it('returns entries with at least one matching studio', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ studios: ['MAPPA', 'Bones'] }))
    expect(result.length).toBeGreaterThan(0)
    result.forEach((e) => {
      expect(e.studios.some((s) => s === 'MAPPA' || s === 'Bones')).toBe(true)
    })
  })
})

describe('filterAnime — formats', () => {
  it('no filter when formats array is empty', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ formats: [] }))
    expect(result).toHaveLength(MOCK_ANIME.length)
  })

  it('filters to only TV entries', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ formats: ['TV'] }))
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((e) => e.format === 'TV')).toBe(true)
  })
})

describe('filterAnime — seasons', () => {
  it('no filter when seasons array is empty', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ seasons: [] }))
    expect(result).toHaveLength(MOCK_ANIME.length)
  })

  it('filters to FALL entries', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ seasons: ['FALL'] }))
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((e) => e.season === 'FALL')).toBe(true)
  })

  it('excludes entries with null season', () => {
    const withNull: AnimeEntry[] = [{ ...MOCK_ANIME[0], season: null }]
    const result = filterAnime(withNull, makeFilters({ seasons: ['FALL'] }))
    expect(result).toHaveLength(0)
  })
})

describe('filterAnime — score range', () => {
  it('no filter when scoreMin=0 and scoreMax=100', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ scoreMin: 0, scoreMax: 100 }))
    expect(result).toHaveLength(MOCK_ANIME.length)
  })

  it('filters by scoreMin > 0', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ scoreMin: 90, scoreMax: 100 }))
    expect(result.length).toBeGreaterThan(0)
    result.forEach((e) => {
      expect(e.score).not.toBeNull()
      expect(e.score!).toBeGreaterThanOrEqual(90)
    })
  })

  it('excludes null-score entries when scoreMin > 0', () => {
    const withNull: AnimeEntry[] = [{ ...MOCK_ANIME[11], score: null }] // HxH has null score
    const result = filterAnime(withNull, makeFilters({ scoreMin: 1, scoreMax: 100 }))
    expect(result).toHaveLength(0)
  })

  it('includes null-score entries when scoreMin = 0', () => {
    const withNull: AnimeEntry[] = [{ ...MOCK_ANIME[11], score: null }]
    const result = filterAnime(withNull, makeFilters({ scoreMin: 0, scoreMax: 100 }))
    expect(result).toHaveLength(1)
  })
})

describe('filterAnime — combined filters', () => {
  it('search + status combined', () => {
    const result = filterAnime(
      MOCK_ANIME,
      makeFilters({ status: 'favorites', search: 'Fullmetal' })
    )
    expect(result.every((e) => e.isFavorite)).toBe(true)
    expect(result.every((e) => e.title.romaji.toLowerCase().includes('fullmetal'))).toBe(true)
  })

  it('genre + studio combined', () => {
    const result = filterAnime(MOCK_ANIME, makeFilters({ genres: ['Action'], studios: ['MAPPA'] }))
    expect(result.length).toBeGreaterThan(0)
    result.forEach((e) => {
      expect(e.genres).toContain('Action')
      expect(e.studios).toContain('MAPPA')
    })
  })
})
