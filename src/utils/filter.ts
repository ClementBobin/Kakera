import type { AnimeEntry } from '@/types/anime'
import type { LibraryFilters, FilterStatus } from '@/types/filters'

function matchesStatus(entry: AnimeEntry, status: FilterStatus): boolean {
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

function matchesSearch(entry: AnimeEntry, search: string): boolean {
  if (search === '') return true
  const q = search.toLowerCase()
  if (entry.title.romaji.toLowerCase().includes(q)) return true
  if (entry.title.english !== null && entry.title.english.toLowerCase().includes(q)) return true
  if (entry.title.native.toLowerCase().includes(q)) return true
  if (entry.genres.some((g) => g.toLowerCase().includes(q))) return true
  if (entry.studios.some((s) => s.toLowerCase().includes(q))) return true
  return false
}

export function filterAnime(list: AnimeEntry[], filters: LibraryFilters): AnimeEntry[] {
  return list.filter((entry) => {
    if (!matchesStatus(entry, filters.status)) return false
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
