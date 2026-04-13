import type { AnimeEntry } from '@/types/anime'
import type { SortStrategy } from '@/types/filters'

const SEASON_ORDER: Record<string, number> = { WINTER: 0, SPRING: 1, SUMMER: 2, FALL: 3 }

export function compareAlphabetical(a: AnimeEntry, b: AnimeEntry): number {
  return a.title.romaji.localeCompare(b.title.romaji)
}

export function compareAlphabeticalDesc(a: AnimeEntry, b: AnimeEntry): number {
  return b.title.romaji.localeCompare(a.title.romaji)
}

export function compareEpisodeCount(a: AnimeEntry, b: AnimeEntry): number {
  const aEps = a.totalEpisodes ?? -1
  const bEps = b.totalEpisodes ?? -1
  if (aEps === -1 && bEps === -1) return 0
  if (aEps === -1) return 1
  if (bEps === -1) return -1
  return bEps - aEps
}

export function compareLastWatched(a: AnimeEntry, b: AnimeEntry): number {
  if (a.lastWatched === null && b.lastWatched === null) return 0
  if (a.lastWatched === null) return 1
  if (b.lastWatched === null) return -1
  return new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime()
}

export function compareLastUpdated(a: AnimeEntry, b: AnimeEntry): number {
  return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
}

export function compareUnwatchedCount(a: AnimeEntry, b: AnimeEntry): number {
  const aUnwatched = a.totalEpisodes !== null ? a.totalEpisodes - a.progress : 0
  const bUnwatched = b.totalEpisodes !== null ? b.totalEpisodes - b.progress : 0
  return bUnwatched - aUnwatched
}

export function compareLastEpisode(a: AnimeEntry, b: AnimeEntry): number {
  if (a.nextEpisodeAt === null && b.nextEpisodeAt === null) return 0
  if (a.nextEpisodeAt === null) return 1
  if (b.nextEpisodeAt === null) return -1
  return new Date(a.nextEpisodeAt).getTime() - new Date(b.nextEpisodeAt).getTime()
}

export function compareAddedDate(a: AnimeEntry, b: AnimeEntry): number {
  return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
}

export function compareScore(a: AnimeEntry, b: AnimeEntry): number {
  if (a.score === null && b.score === null) return 0
  if (a.score === null) return 1
  if (b.score === null) return -1
  return b.score - a.score
}

export function compareBroadcastSeason(a: AnimeEntry, b: AnimeEntry): number {
  const aYear = a.seasonYear ?? 0
  const bYear = b.seasonYear ?? 0
  if (bYear !== aYear) return bYear - aYear
  const aSeason = a.season !== null ? (SEASON_ORDER[a.season] ?? 0) : -1
  const bSeason = b.season !== null ? (SEASON_ORDER[b.season] ?? 0) : -1
  return bSeason - aSeason
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function sortAnime(list: AnimeEntry[], strategy: SortStrategy): AnimeEntry[] {
  if (strategy === 'random') return shuffle(list)

  const comparators: Record<Exclude<SortStrategy, 'random'>, (a: AnimeEntry, b: AnimeEntry) => number> = {
    alphabetical: compareAlphabetical,
    alphabetical_desc: compareAlphabeticalDesc,
    episode_count: compareEpisodeCount,
    last_watched: compareLastWatched,
    last_updated: compareLastUpdated,
    unwatched_count: compareUnwatchedCount,
    last_episode: compareLastEpisode,
    fetch_date: compareLastUpdated,
    added_date: compareAddedDate,
    score: compareScore,
    broadcast_season: compareBroadcastSeason,
  }

  return [...list].sort(comparators[strategy])
}
