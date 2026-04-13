import type { AnimeEntry, SortStrategy } from '@/types'

export function sortAnime(list: AnimeEntry[], strategy: SortStrategy): AnimeEntry[] {
  const sorted = [...list]

  switch (strategy) {
    case 'alphabetical':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))

    case 'episodeCount':
      return sorted.sort((a, b) => (b.episodes ?? 0) - (a.episodes ?? 0))

    case 'score':
      return sorted.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

    case 'lastWatched':
      return sorted.sort((a, b) => {
        const aTime = a.lastWatched?.getTime() ?? 0
        const bTime = b.lastWatched?.getTime() ?? 0
        return bTime - aTime
      })

    case 'lastUpdated':
      return sorted.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())

    case 'unwatchedCount':
      return sorted.sort((a, b) => {
        const aUnwatched = (a.episodes ?? 0) - a.episodesWatched
        const bUnwatched = (b.episodes ?? 0) - b.episodesWatched
        return bUnwatched - aUnwatched
      })

    case 'random': {
      for (let i = sorted.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[sorted[i], sorted[j]] = [sorted[j], sorted[i]]
      }
      return sorted
    }

    default:
      return sorted
  }
}
