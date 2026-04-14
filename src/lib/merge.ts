import type { AnimeEntry } from '@/types/anime'

/**
 * Fields that the user can edit locally and should "win" over remote
 * when the local version is newer, or always win regardless of timestamp.
 */
const LOCAL_ALWAYS_WINS = ['downloadedEpisodes', 'localPath', 'isDownloaded'] as const

/**
 * Fields that the remote service is authoritative for.
 * These are always taken from the incoming remote entry.
 */
const REMOTE_ALWAYS_WINS = [
  'title',
  'coverImage',
  'bannerImage',
  'totalEpisodes',
  'genres',
  'studios',
  'season',
  'seasonYear',
  'format',
  'description',
  'nextEpisodeAt',
  'nextEpisodeNumber',
  'relations',
] as const

export interface MergeResult {
  entries: AnimeEntry[]
  added: number
  updated: number
  unchanged: number
}

/**
 * Merges incoming remote entries with the existing local library.
 *
 * Strategy (per entry):
 * 1. Local-only fields (downloads, paths) always come from local.
 * 2. Metadata fields (title, cover, genres…) always come from remote.
 * 3. User-editable fields (progress, score, status, isFavorite):
 *    - Use whichever was updated more recently (lastUpdated timestamp).
 *    - If timestamps are equal or both missing, remote wins.
 * 4. Entries that exist locally but not in remote are kept as-is.
 */
export function mergeEntries(
  existing: AnimeEntry[],
  incoming: AnimeEntry[]
): MergeResult {
  const localMap = new Map(existing.map((e) => [e.id, e]))
  const result: AnimeEntry[] = []
  let added = 0
  let updated = 0
  let unchanged = 0

  for (const remote of incoming) {
    const local = localMap.get(remote.id)

    if (!local) {
      result.push(remote)
      added++
      continue
    }

    const localTime = local.lastUpdated ? new Date(local.lastUpdated).getTime() : 0
    const remoteTime = remote.lastUpdated ? new Date(remote.lastUpdated).getTime() : 0
    const localIsNewer = localTime > remoteTime

    // Start with remote as base (gets all the metadata fields)
    const merged: AnimeEntry = { ...remote }

    // Local-always-wins fields
    for (const key of LOCAL_ALWAYS_WINS) {
      (merged as unknown as Record<string, unknown>)[key] = local[key]
    }

    // User-editable: local wins only if it was updated more recently
    const userEditable: (keyof AnimeEntry)[] = ['progress', 'score', 'status', 'isFavorite']
    if (localIsNewer) {
      for (const key of userEditable) {
        (merged as unknown as Record<string, unknown>)[key] = local[key]
      }
      merged.lastUpdated = local.lastUpdated
      merged.lastWatched = local.lastWatched
    }

    // Detect if anything actually changed to decide added/unchanged
    const hasChanged = userEditable.some((k) => merged[k] !== local[k]) ||
      REMOTE_ALWAYS_WINS.some((k) => JSON.stringify(merged[k]) !== JSON.stringify(local[k]))

    if (hasChanged) {
      updated++
    } else {
      unchanged++
    }

    result.push(merged)
    localMap.delete(remote.id)
  }

  // Keep local-only entries (not returned from remote)
  for (const leftover of localMap.values()) {
    result.push(leftover)
    unchanged++
  }

  return { entries: result, added, updated, unchanged }
}