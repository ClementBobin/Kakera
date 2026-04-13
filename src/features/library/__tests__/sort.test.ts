import { describe, it, expect } from 'vitest'
import { sortAnime } from '@/features/library/utils/sort'
import type { AnimeEntry } from '@/types'

const makeAnime = (overrides: Partial<AnimeEntry> & { id: number; title: string }): AnimeEntry => ({
  id: overrides.id,
  title: overrides.title,
  episodes: overrides.episodes ?? 12,
  episodesWatched: overrides.episodesWatched ?? 0,
  score: overrides.score,
  status: overrides.status ?? 'PLANNING',
  genres: overrides.genres ?? [],
  lastWatched: overrides.lastWatched,
  lastUpdated: overrides.lastUpdated ?? new Date('2024-01-01'),
  isDownloaded: overrides.isDownloaded ?? false,
  downloadedEpisodes: overrides.downloadedEpisodes ?? [],
  isFavorite: overrides.isFavorite ?? false,
  service: overrides.service ?? 'anilist',
  serviceId: overrides.serviceId ?? String(overrides.id),
})

const sampleList: AnimeEntry[] = [
  makeAnime({ id: 1, title: 'Cowboy Bebop', episodes: 26, score: 9.0, episodesWatched: 26, lastWatched: new Date('2024-03-01'), lastUpdated: new Date('2024-03-01') }),
  makeAnime({ id: 2, title: 'Attack on Titan', episodes: 87, score: 9.1, episodesWatched: 50, lastWatched: new Date('2024-01-15'), lastUpdated: new Date('2024-01-15') }),
  makeAnime({ id: 3, title: 'Berserk', episodes: 25, score: 8.7, episodesWatched: 10, lastWatched: new Date('2023-12-01'), lastUpdated: new Date('2023-12-01') }),
  makeAnime({ id: 4, title: 'Demon Slayer', episodes: 26, score: 8.5, episodesWatched: 0, lastUpdated: new Date('2024-02-01') }),
  makeAnime({ id: 5, title: 'Fullmetal Alchemist', episodes: 64, score: 9.2, episodesWatched: 30, lastWatched: new Date('2024-02-20'), lastUpdated: new Date('2024-02-20') }),
]

describe('sortAnime', () => {
  it('sorts alphabetically by title', () => {
    const result = sortAnime(sampleList, 'alphabetical')
    expect(result[0].title).toBe('Attack on Titan')
    expect(result[1].title).toBe('Berserk')
    expect(result[4].title).toBe('Fullmetal Alchemist')
  })

  it('sorts by episode count descending', () => {
    const result = sortAnime(sampleList, 'episodeCount')
    expect(result[0].title).toBe('Attack on Titan')
    expect(result[1].title).toBe('Fullmetal Alchemist')
  })

  it('sorts by score descending', () => {
    const result = sortAnime(sampleList, 'score')
    expect(result[0].score).toBe(9.2)
    expect(result[1].score).toBe(9.1)
    expect(result[4].score).toBe(8.5)
  })

  it('sorts by last watched date descending', () => {
    const result = sortAnime(sampleList, 'lastWatched')
    expect(result[0].title).toBe('Cowboy Bebop')
    expect(result[1].title).toBe('Fullmetal Alchemist')
    // Demon Slayer has no lastWatched, so it goes last
    expect(result[4].title).toBe('Demon Slayer')
  })

  it('sorts randomly but returns same length', () => {
    const result = sortAnime(sampleList, 'random')
    expect(result).toHaveLength(sampleList.length)
  })
})
