import { describe, it, expect } from 'vitest'
import { sortAnime } from '@/utils/sort'
import { MOCK_ANIME } from '@/mocks/anime'
import type { AnimeEntry } from '@/types/anime'

function lastIndexWhere(arr: AnimeEntry[], pred: (e: AnimeEntry) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (pred(arr[i])) return i
  }
  return -1
}

describe('sortAnime', () => {
  it('alphabetical: sorts A-Z by romaji title', () => {
    const result = sortAnime(MOCK_ANIME, 'alphabetical')
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].title.romaji.localeCompare(result[i + 1].title.romaji)).toBeLessThanOrEqual(0)
    }
  })

  it('alphabetical_desc: sorts Z-A by romaji title', () => {
    const result = sortAnime(MOCK_ANIME, 'alphabetical_desc')
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].title.romaji.localeCompare(result[i + 1].title.romaji)).toBeGreaterThanOrEqual(0)
    }
  })

  it('episode_count: sorts by totalEpisodes descending, null last', () => {
    const result = sortAnime(MOCK_ANIME, 'episode_count')
    const withEps = result.filter((e) => e.totalEpisodes !== null)
    const withoutEps = result.filter((e) => e.totalEpisodes === null)
    if (withoutEps.length > 0 && withEps.length > 0) {
      const lastWithEps = lastIndexWhere(result, (e) => e.totalEpisodes !== null)
      const firstNull = result.findIndex((e) => e.totalEpisodes === null)
      expect(firstNull).toBeGreaterThan(lastWithEps)
    }
    for (let i = 0; i < withEps.length - 1; i++) {
      expect(withEps[i].totalEpisodes!).toBeGreaterThanOrEqual(withEps[i + 1].totalEpisodes!)
    }
  })

  it('last_watched: sorts by lastWatched descending, null last', () => {
    const result = sortAnime(MOCK_ANIME, 'last_watched')
    const watched = result.filter((e) => e.lastWatched !== null)
    const notWatched = result.filter((e) => e.lastWatched === null)
    if (watched.length > 0 && notWatched.length > 0) {
      const lastWatched = lastIndexWhere(result, (e) => e.lastWatched !== null)
      const firstNull = result.findIndex((e) => e.lastWatched === null)
      expect(firstNull).toBeGreaterThan(lastWatched)
    }
    for (let i = 0; i < watched.length - 1; i++) {
      expect(new Date(watched[i].lastWatched!).getTime()).toBeGreaterThanOrEqual(
        new Date(watched[i + 1].lastWatched!).getTime()
      )
    }
  })

  it('last_updated: sorts by lastUpdated descending', () => {
    const result = sortAnime(MOCK_ANIME, 'last_updated')
    for (let i = 0; i < result.length - 1; i++) {
      expect(new Date(result[i].lastUpdated).getTime()).toBeGreaterThanOrEqual(
        new Date(result[i + 1].lastUpdated).getTime()
      )
    }
  })

  it('unwatched_count: sorts by (total - progress) descending', () => {
    const result = sortAnime(MOCK_ANIME, 'unwatched_count')
    const unwatched = (e: (typeof MOCK_ANIME)[0]) =>
      e.totalEpisodes !== null ? e.totalEpisodes - e.progress : 0
    for (let i = 0; i < result.length - 1; i++) {
      expect(unwatched(result[i])).toBeGreaterThanOrEqual(unwatched(result[i + 1]))
    }
  })

  it('last_episode: sorts by nextEpisodeAt ascending, null last', () => {
    const result = sortAnime(MOCK_ANIME, 'last_episode')
    const withNext = result.filter((e) => e.nextEpisodeAt !== null)
    const noNext = result.filter((e) => e.nextEpisodeAt === null)
    if (withNext.length > 0 && noNext.length > 0) {
      const lastWithNext = lastIndexWhere(result, (e) => e.nextEpisodeAt !== null)
      const firstNull = result.findIndex((e) => e.nextEpisodeAt === null)
      expect(firstNull).toBeGreaterThan(lastWithNext)
    }
    for (let i = 0; i < withNext.length - 1; i++) {
      expect(new Date(withNext[i].nextEpisodeAt!).getTime()).toBeLessThanOrEqual(
        new Date(withNext[i + 1].nextEpisodeAt!).getTime()
      )
    }
  })

  it('fetch_date: sorts by lastUpdated descending (same as last_updated)', () => {
    const fetchResult = sortAnime(MOCK_ANIME, 'fetch_date')
    const updatedResult = sortAnime(MOCK_ANIME, 'last_updated')
    expect(fetchResult.map((e) => e.id)).toEqual(updatedResult.map((e) => e.id))
  })

  it('added_date: sorts by addedAt descending', () => {
    const result = sortAnime(MOCK_ANIME, 'added_date')
    for (let i = 0; i < result.length - 1; i++) {
      expect(new Date(result[i].addedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(result[i + 1].addedAt).getTime()
      )
    }
  })

  it('score: sorts by score descending, null last', () => {
    const result = sortAnime(MOCK_ANIME, 'score')
    const scored = result.filter((e) => e.score !== null)
    const unscored = result.filter((e) => e.score === null)
    if (scored.length > 0 && unscored.length > 0) {
      const lastScored = lastIndexWhere(result, (e) => e.score !== null)
      const firstNull = result.findIndex((e) => e.score === null)
      expect(firstNull).toBeGreaterThan(lastScored)
    }
    for (let i = 0; i < scored.length - 1; i++) {
      expect(scored[i].score!).toBeGreaterThanOrEqual(scored[i + 1].score!)
    }
  })

  it('broadcast_season: sorts by year desc then season order desc', () => {
    const result = sortAnime(MOCK_ANIME, 'broadcast_season')
    const withYear = result.filter((e) => e.seasonYear !== null)
    for (let i = 0; i < withYear.length - 1; i++) {
      expect(withYear[i].seasonYear!).toBeGreaterThanOrEqual(withYear[i + 1].seasonYear!)
    }
  })

  it('random: returns same length', () => {
    const result = sortAnime(MOCK_ANIME, 'random')
    expect(result).toHaveLength(MOCK_ANIME.length)
    expect(result.map((e) => e.id).sort()).toEqual(MOCK_ANIME.map((e) => e.id).sort())
  })
})
