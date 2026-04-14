import { useState, useCallback, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useLibraryStore } from '@/stores/libraryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useCollectionsStore } from '@/stores/collectionsStore'
import { isMockMode, MOCK_ANIME } from '@/mocks'
import { syncLibrary, type SyncProgress, type SyncResult, type SyncService } from '@/features/sync/syncService'

export interface UseSyncReturn {
  sync: (service: SyncService) => void
  isSyncing: boolean
  progress: SyncProgress | null
  lastResult: SyncResult | null
  error: string | null
  reset: () => void
}

export function useSync(): UseSyncReturn {
  const [progress, setProgress] = useState<SyncProgress | null>(null)
  const [lastResult, setLastResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef(false)

  const setEntries = useLibraryStore((s) => s.setEntries)
  const setIsSyncing = useLibraryStore((s) => s.setIsSyncing)
  const setLastSyncedAt = useLibraryStore((s) => s.setLastSyncedAt)
  const entries = useLibraryStore((s) => s.entries)
  const lastSyncedAt = useLibraryStore((s) => s.lastSyncedAt)
  const settings = useSettingsStore((s) => s.settings)
  const collections = useCollectionsStore((s) => s.collections)

  const mutation = useMutation({
    mutationFn: async (service: SyncService) => {
      abortRef.current = false

      if (isMockMode) {
        // Simulate sync in mock mode
        setProgress({ phase: 'fetching', service, percent: 20, message: 'Fetching mock data…' })
        await delay(400)
        setProgress({ phase: 'merging', service, percent: 65, message: 'Merging entries…' })
        await delay(300)
        setProgress({ phase: 'done', service, percent: 100, message: `Synced ${MOCK_ANIME.length} anime` })
        const result: SyncResult = {
          entries: MOCK_ANIME,
          added: MOCK_ANIME.length,
          updated: 0,
          unchanged: 0,
          service,
          syncedAt: new Date().toISOString(),
        }
        return result
      }

      return syncLibrary({
        service,
        settings,
        existingEntries: entries,
        collections,
        lastSyncedAt,
        onProgress: (p) => {
          if (!abortRef.current) setProgress(p)
        },
      })
    },
    onMutate: () => {
      setError(null)
      setProgress(null)
      setIsSyncing(true)
    },
    onSuccess: (result) => {
      setEntries(result.entries)
      setLastSyncedAt(result.syncedAt)
      setLastResult(result)
      setIsSyncing(false)
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      setIsSyncing(false)
    },
  })

  const sync = useCallback(
    (service: SyncService) => {
      mutation.mutate(service)
    },
    [mutation]
  )

  const reset = useCallback(() => {
    abortRef.current = true
    setProgress(null)
    setLastResult(null)
    setError(null)
    setIsSyncing(false)
  }, [setIsSyncing])

  return {
    sync,
    isSyncing: mutation.isPending,
    progress,
    lastResult,
    error,
    reset,
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}