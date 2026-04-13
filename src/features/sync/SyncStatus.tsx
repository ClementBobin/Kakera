import { useLibraryStore } from '@/stores/libraryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSyncLibrary } from '@/hooks/useLibrary'
import { Button } from '@/components/ui/Button'
import { formatRelativeDate } from '@/utils/format'

export function SyncStatus() {
  const isSyncing = useLibraryStore((s) => s.isSyncing)
  const lastSyncedAt = useLibraryStore((s) => s.lastSyncedAt)
  const services = useSettingsStore((s) => s.settings.services)
  const syncMutation = useSyncLibrary()

  const handleSync = (service: 'anilist' | 'myanimelist') => {
    syncMutation.mutate(service)
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-kakera-primary-800 border border-kakera-primary-700">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Sync Status</h3>
        {lastSyncedAt && (
          <span className="text-xs text-kakera-muted">
            Last synced {formatRelativeDate(lastSyncedAt)}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {(['anilist', 'myanimelist'] as const).map((service) => (
          <div key={service} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${services[service].enabled ? 'bg-green-400' : 'bg-kakera-muted'}`} />
              <span className="text-sm text-kakera-primary-200 capitalize">
                {service === 'myanimelist' ? 'MyAnimeList' : 'AniList'}
              </span>
              {services[service].username && (
                <span className="text-xs text-kakera-muted">({services[service].username})</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              loading={isSyncing}
              disabled={!services[service].enabled}
              onClick={() => handleSync(service)}
              aria-label={`Sync ${service}`}
            >
              Sync
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
