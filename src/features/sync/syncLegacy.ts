import type { AnimeEntry } from '@/types/anime'

// LibraryStore action subset used in sync
interface LibraryStore {
  setEntries: (entries: AnimeEntry[]) => void
}

export async function syncFromAniList(token: string, store: LibraryStore): Promise<void> {
  const { AniListClient } = await import('@/lib/api/anilist')
  const client = new AniListClient(token)
  const entries = await client.getViewerLibrary()
  const existing = [] as AnimeEntry[] // would come from store in real impl
  const merged = await mergeEntries(existing, entries)
  store.setEntries(merged)
}

export async function syncFromMAL(token: string, store: LibraryStore): Promise<void> {
  const { MyAnimeListClient } = await import('@/lib/api/myanimelist')
  const client = new MyAnimeListClient(token)
  const entries = await client.getUserLibrary()
  const existing = [] as AnimeEntry[]
  const merged = await mergeEntries(existing, entries)
  store.setEntries(merged)
}

export async function mergeEntries(
  existing: AnimeEntry[],
  incoming: AnimeEntry[]
): Promise<AnimeEntry[]> {
  const existingMap = new Map(existing.map((e) => [e.id, e]))
  const result: AnimeEntry[] = []

  for (const entry of incoming) {
    const prev = existingMap.get(entry.id)
    result.push({
      ...entry,
      // Local fields win
      downloadedEpisodes: prev?.downloadedEpisodes ?? entry.downloadedEpisodes,
      localPath: prev?.localPath ?? entry.localPath,
      isDownloaded: prev?.isDownloaded ?? entry.isDownloaded,
    })
    existingMap.delete(entry.id)
  }

  // Keep remaining local-only entries
  for (const leftover of existingMap.values()) {
    result.push(leftover)
  }

  return result
}
