import type { AnimeEntry } from '@/types/anime'
import type { AppSettings } from '@/types/settings'
import type { CustomCollection } from '@/types/collection'
import { mergeEntries, type MergeResult } from '@/lib/merge'
import { savePersistedState } from '@/lib/persistence'

export type SyncService = 'anilist' | 'myanimelist'

export interface SyncProgress {
  phase: 'connecting' | 'fetching' | 'merging' | 'saving' | 'done' | 'error'
  service: SyncService
  /** 0–100 */
  percent: number
  message: string
  error?: string
}

export type SyncProgressCallback = (progress: SyncProgress) => void

export interface SyncOptions {
  service: SyncService
  settings: AppSettings
  existingEntries: AnimeEntry[]
  collections: CustomCollection[]
  lastSyncedAt: string | null
  onProgress?: SyncProgressCallback
}

export interface SyncResult extends MergeResult {
  service: SyncService
  syncedAt: string
}

function emit(
  cb: SyncProgressCallback | undefined,
  progress: SyncProgress
): void {
  cb?.(progress)
}

export async function syncLibrary(opts: SyncOptions): Promise<SyncResult> {
  const { service, settings, existingEntries, collections, onProgress } = opts

  emit(onProgress, {
    phase: 'connecting',
    service,
    percent: 5,
    message: `Connecting to ${service === 'anilist' ? 'AniList' : 'MyAnimeList'}…`,
  })

  const serviceConfig = settings.services[service]
  if (!serviceConfig.enabled || !serviceConfig.token) {
    throw new Error(
      `${service} is not connected. Please add your API token in Settings → Services.`
    )
  }

  let incoming: AnimeEntry[]

  emit(onProgress, {
    phase: 'fetching',
    service,
    percent: 20,
    message: 'Fetching your anime list…',
  })

  try {
    if (service === 'anilist') {
      const { AniListClient } = await import('@/lib/api/anilist')
      const client = new AniListClient(serviceConfig.token)
      incoming = await client.getViewerLibrary()
    } else {
      const { MyAnimeListClient } = await import('@/lib/api/myanimelist')
      const client = new MyAnimeListClient(serviceConfig.token)
      incoming = await client.getUserLibrary()
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    emit(onProgress, {
      phase: 'error',
      service,
      percent: 0,
      message: 'Fetch failed',
      error: message,
    })
    throw err
  }

  emit(onProgress, {
    phase: 'merging',
    service,
    percent: 65,
    message: `Merging ${incoming.length} entries…`,
  })

  const mergeResult = mergeEntries(existingEntries, incoming)

  emit(onProgress, {
    phase: 'saving',
    service,
    percent: 85,
    message: 'Saving to disk…',
  })

  const syncedAt = new Date().toISOString()

  try {
    await savePersistedState({
      library: mergeResult.entries,
      collections,
      lastSyncedAt: syncedAt,
      schemaVersion: 1,
    })
  } catch (err) {
    // Non-fatal — in-memory state is still good
    console.warn('[sync] Failed to persist state to disk:', err)
  }

  emit(onProgress, {
    phase: 'done',
    service,
    percent: 100,
    message: `Synced ${mergeResult.added} new, ${mergeResult.updated} updated`,
  })

  return { ...mergeResult, service, syncedAt }
}

// Re-export merge for components that need it directly
export { mergeEntries } from '@/lib/merge'
export { syncFromAniList, syncFromMAL } from './syncLegacy'