import { useEffect, useRef } from 'react'
import { useLibraryStore } from '@/stores/libraryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useCollectionsStore } from '@/stores/collectionsStore'
import { useSync } from '@/hooks/useSync'
import { loadPersistedState, loadSettings } from '@/lib/persistence'
import { isMockMode, MOCK_ANIME, MOCK_COLLECTIONS, MOCK_SETTINGS } from '@/mocks'
import type { SyncService } from '@/features/sync/syncService'

/**
 * Runs once on mount:
 * 1. Loads persisted library + collections from disk (fast, no network).
 * 2. If a service is connected, triggers an auto-sync in the background.
 */
export function useStartup(): void {
  const setEntries = useLibraryStore((s) => s.setEntries)
  const setLastSyncedAt = useLibraryStore((s) => s.setLastSyncedAt)
  const updateSettings = useSettingsStore((s) => s.updateSettings)
  const setCollections = useCollectionsStore((s) => s.setCollections)
  const settings = useSettingsStore((s) => s.settings)
  const { sync } = useSync()
  const didRun = useRef(false)

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    void (async () => {
      if (isMockMode) {
        // In mock mode, seed stores immediately and fake a background sync
        setEntries(MOCK_ANIME)
        setCollections(MOCK_COLLECTIONS)
        updateSettings(MOCK_SETTINGS)
        // Auto-sync with first enabled mock service
        const enabledService = (Object.keys(MOCK_SETTINGS.services) as SyncService[]).find(
          (s) => MOCK_SETTINGS.services[s].enabled
        )
        if (enabledService) {
          setTimeout(() => sync(enabledService), 800)
        }
        return
      }

      // 1. Hydrate from disk (offline-first, fast)
      const [persistedState, savedSettings] = await Promise.all([
        loadPersistedState(),
        loadSettings(),
      ])

      if (persistedState) {
        setEntries(persistedState.library)
        if (persistedState.collections.length > 0) {
          setCollections(persistedState.collections)
        }
        if (persistedState.lastSyncedAt) {
          setLastSyncedAt(persistedState.lastSyncedAt)
        }
      }

      if (savedSettings) {
        updateSettings(savedSettings)
      }

      // 2. Auto-sync in background if a service is connected
      const currentSettings = savedSettings ?? settings
      const enabledService = (Object.keys(currentSettings.services ?? {}) as SyncService[]).find(
        (s) => currentSettings.services?.[s]?.enabled && currentSettings.services?.[s]?.token
      )
      if (enabledService) {
        // Small delay so the UI renders first before hitting the network
        setTimeout(() => sync(enabledService), 1200)
      }
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}