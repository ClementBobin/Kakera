import { useLibraryStore } from '@/stores/libraryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSync } from '@/hooks/useSync'
import { Button } from '@/components/ui/Button'
import { formatRelativeDate } from '@/utils/format'
import { RefreshCw, CheckCircle, AlertCircle, Wifi } from 'lucide-react'
import type { SyncService } from '@/features/sync/syncService'

export function SyncStatus() {
  const lastSyncedAt = useLibraryStore((s) => s.lastSyncedAt)
  const services = useSettingsStore((s) => s.settings.services)
  const { sync, isSyncing, progress, lastResult, error } = useSync()

  const connectedServices = (Object.keys(services) as SyncService[]).filter(
    (s) => services[s].enabled
  )

  const handleSync = (service: SyncService) => sync(service)

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-kakera-primary-800 border border-kakera-primary-700">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Sync Status</h3>
        {lastSyncedAt && (
          <span className="text-xs text-kakera-muted">
            {formatRelativeDate(lastSyncedAt)}
          </span>
        )}
      </div>

      {/* Per-service rows */}
      <div className="flex flex-col gap-2">
        {(['anilist', 'myanimelist'] as SyncService[]).map((service) => {
          const cfg = services[service]
          const label = service === 'myanimelist' ? 'MyAnimeList' : 'AniList'
          return (
            <div key={service} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.enabled ? 'bg-green-400' : 'bg-kakera-muted'}`} />
                <span className="text-sm text-kakera-primary-200">{label}</span>
                {cfg.username && (
                  <span className="text-xs text-kakera-muted truncate">({cfg.username})</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                loading={isSyncing && progress?.service === service}
                disabled={!cfg.enabled || isSyncing}
                onClick={() => handleSync(service)}
                aria-label={`Sync ${label}`}
              >
                <RefreshCw size={12} />
                Sync
              </Button>
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      {isSyncing && progress && (
        <SyncProgressBar progress={progress} />
      )}

      {/* Result summary */}
      {!isSyncing && lastResult && (
        <div className="flex items-center gap-2 text-xs text-green-400">
          <CheckCircle size={12} />
          <span>
            +{lastResult.added} new · {lastResult.updated} updated · {lastResult.unchanged} unchanged
          </span>
        </div>
      )}

      {/* Error */}
      {!isSyncing && error && (
        <div className="flex items-start gap-2 text-xs text-red-400">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {/* No services connected hint */}
      {connectedServices.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-kakera-muted">
          <Wifi size={12} />
          <span>Connect a service in Settings to sync your library.</span>
        </div>
      )}
    </div>
  )
}

// ── Progress bar sub-component ────────────────────────────────────────────────

import type { SyncProgress } from '@/features/sync/syncService'

function SyncProgressBar({ progress }: { progress: SyncProgress }) {
  const phaseLabel: Record<SyncProgress['phase'], string> = {
    connecting: 'Connecting…',
    fetching: 'Fetching list…',
    merging: 'Merging entries…',
    saving: 'Saving…',
    done: 'Done!',
    error: 'Error',
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-kakera-muted">{phaseLabel[progress.phase]}</span>
        <span className="text-kakera-muted tabular-nums">{progress.percent}%</span>
      </div>
      <div className="h-1 w-full rounded-full bg-kakera-primary-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-kakera-accent transition-all duration-300 ease-out"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <p className="text-xs text-kakera-muted truncate">{progress.message}</p>
    </div>
  )
}