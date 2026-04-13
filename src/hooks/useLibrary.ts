import { useQuery, useMutation } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'
import { useLibraryStore } from '@/stores/libraryStore'
import { isMockMode, MOCK_ANIME } from '@/mocks'
import type { AnimeEntry } from '@/types/anime'

export function useLibraryQuery() {
  const setEntries = useLibraryStore((s) => s.setEntries)

  return useQuery({
    queryKey: ['library'],
    queryFn: async () => {
      if (isMockMode) {
        setEntries(MOCK_ANIME)
        return MOCK_ANIME
      }
      try {
        const data = await invoke<AnimeEntry[]>('get_library')
        setEntries(data)
        return data
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error))
      }
    },
  })
}

export function useSyncLibrary() {
  const setIsSyncing = useLibraryStore((s) => s.setIsSyncing)
  const setLastSyncedAt = useLibraryStore((s) => s.setLastSyncedAt)

  return useMutation({
    mutationFn: async (service: string) => {
      if (isMockMode) return
      await invoke<void>('sync_library', { service })
    },
    onMutate: () => setIsSyncing(true),
    onSettled: () => {
      setIsSyncing(false)
      setLastSyncedAt(new Date().toISOString())
    },
  })
}

export function useSyncCategory(category: string) {
  return useMutation({
    mutationFn: async () => {
      if (isMockMode) return
      await invoke<void>('sync_category', { category })
    },
  })
}
