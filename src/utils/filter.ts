import type { AnimeEntry } from '@/types/anime'
import type { LibraryFilters, FilterStatus, StatusFilters } from '@/types/filters'

// ── Search token parsing ──────────────────────────────────────────────────────

export interface SearchToken {
  /** 'title' | 'studio' | 'genre' */
  type: 'title' | 'studio' | 'genre'
  value: string
  negate: boolean
}

/**
 * Parses a raw search string into structured tokens.
 *
 * Supported syntax (underscores are treated as spaces inside values):
 *   - `studio:Bones`        → include studio Bones
 *   - `-studio:Bones`       → exclude studio Bones
 *   - `genre:Action`        → include genre Action
 *   - `-genre:Isekai`       → exclude genre Isekai
 *   - `attack on titan`     → title search (plain words joined as single token)
 *
 * Multiple space-separated tokens are AND-ed together.
 */
export function parseSearchTokens(raw: string): SearchToken[] {
  if (!raw.trim()) return []

  const tokens: SearchToken[] = []
  const parts = raw.trim().split(/\s+/)
  const titleWords: string[] = []

  for (const part of parts) {
    const negate = part.startsWith('-')
    const clean = negate ? part.slice(1) : part
    const colonIdx = clean.indexOf(':')

    if (colonIdx > 0) {
      const type = clean.slice(0, colonIdx).toLowerCase()
      const value = clean.slice(colonIdx + 1).replace(/_/g, ' ').trim()
      if (value && (type === 'studio' || type === 'genre')) {
        tokens.push({ type, value, negate })
        continue
      }
    }
    // Plain word → accumulate for title search
    if (clean) titleWords.push(clean.replace(/_/g, ' '))
  }

  if (titleWords.length > 0) {
    tokens.push({ type: 'title', value: titleWords.join(' '), negate: false })
  }

  return tokens
}

// ── Legacy status-based matching (kept for test backward-compat) ──────────────

function matchesLegacyStatus(entry: AnimeEntry, status: FilterStatus): boolean {
  switch (status) {
    case 'all':
      return true
    case 'downloaded':
      return entry.isDownloaded
    case 'unwatched':
      return entry.progress === 0 || (entry.totalEpisodes !== null && entry.totalEpisodes - entry.progress > 0)
    case 'started':
      return entry.progress > 0 && entry.status !== 'completed'
    case 'favorites':
      return entry.isFavorite
    case 'completed':
      return entry.status === 'completed'
    case 'anilist':
    case 'myanimelist':
      return entry.source === status
  }
}

// ── Cumulative status matching ────────────────────────────────────────────────

function isWatching(e: AnimeEntry) { return e.progress > 0 && e.status !== 'completed' }
function isCompleted(e: AnimeEntry) { return e.status === 'completed' }
function isDownloaded(e: AnimeEntry) { return e.isDownloaded }
function isFavorite(e: AnimeEntry) { return e.isFavorite }
function isUnwatched(e: AnimeEntry) { return e.progress === 0 || (e.totalEpisodes !== null && e.totalEpisodes - e.progress > 0) }

const STATUS_CHECKERS: Record<keyof StatusFilters, (e: AnimeEntry) => boolean> = {
  watching: isWatching,
  completed: isCompleted,
  downloaded: isDownloaded,
  favorites: isFavorite,
  unwatched: isUnwatched,
}

function matchesCumulativeStatus(entry: AnimeEntry, sf: StatusFilters): boolean {
  const positives = (Object.keys(sf) as (keyof StatusFilters)[]).filter((k) => sf[k] === 1)
  const negatives = (Object.keys(sf) as (keyof StatusFilters)[]).filter((k) => sf[k] === -1)

  // Must NOT match any negative filter
  if (negatives.some((k) => STATUS_CHECKERS[k](entry))) return false

  // Must match at least one positive filter (if any positives are set)
  if (positives.length > 0 && !positives.some((k) => STATUS_CHECKERS[k](entry))) return false

  return true
}

// ── Search matching ───────────────────────────────────────────────────────────

function matchesToken(entry: AnimeEntry, token: SearchToken): boolean {
  const v = token.value.toLowerCase()
  let match: boolean

  switch (token.type) {
    case 'studio':
      match = entry.studios.some((s) => s.toLowerCase().includes(v))
      break
    case 'genre':
      match = entry.genres.some((g) => g.toLowerCase().includes(v))
      break
    case 'title':
    default:
      match =
        entry.title.romaji.toLowerCase().includes(v) ||
        (entry.title.english !== null && entry.title.english.toLowerCase().includes(v)) ||
        entry.title.native.toLowerCase().includes(v) ||
        entry.genres.some((g) => g.toLowerCase().includes(v)) ||
        entry.studios.some((s) => s.toLowerCase().includes(v))
  }

  return token.negate ? !match : match
}

function matchesSearch(entry: AnimeEntry, search: string): boolean {
  if (search === '') return true
  const tokens = parseSearchTokens(search)
  return tokens.every((token) => matchesToken(entry, token))
}

// ── Main filter function ──────────────────────────────────────────────────────

export function filterAnime(list: AnimeEntry[], filters: LibraryFilters): AnimeEntry[] {
  return list.filter((entry) => {
    // Status filtering: prefer cumulative statusFilters when any are set,
    // fall back to legacy `status` field for backward compat (tests).
    const hasAnyCumulative = filters.statusFilters
      ? Object.values(filters.statusFilters).some((v) => v !== 0)
      : false

    if (hasAnyCumulative) {
      if (!matchesCumulativeStatus(entry, filters.statusFilters)) return false
    } else if (filters.status && filters.status !== 'all') {
      if (!matchesLegacyStatus(entry, filters.status)) return false
    }

    if (!matchesSearch(entry, filters.search)) return false

    if (filters.genres.length > 0) {
      const hasAllGenres = filters.genres.every((g) => entry.genres.includes(g))
      if (!hasAllGenres) return false
    }

    if (filters.studios.length > 0) {
      const hasStudio = filters.studios.some((s) => entry.studios.includes(s))
      if (!hasStudio) return false
    }

    if (filters.formats.length > 0 && !filters.formats.includes(entry.format)) return false

    if (filters.seasons.length > 0) {
      if (entry.season === null || !filters.seasons.includes(entry.season)) return false
    }

    if (filters.scoreMin > 0 || filters.scoreMax < 100) {
      if (entry.score === null) {
        if (filters.scoreMin > 0) return false
      } else {
        if (entry.score < filters.scoreMin || entry.score > filters.scoreMax) return false
      }
    }

    return true
  })
}
