import { useLibraryStore, useFilteredEntries } from '@/stores/libraryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useUiStore } from '@/stores/uiStore'
import { useSync } from '@/hooks/useSync'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { formatRelativeDate } from '@/utils/format'
import { RefreshCw, Shuffle, LayoutGrid, Grid2x2, Square, List, AlertCircle, type LucideProps } from 'lucide-react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import type { DisplayMode } from '@/types/settings'
import type { SyncService } from '@/features/sync/syncService'

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>

const DISPLAY_MODES: { value: DisplayMode; label: string; Icon: LucideIcon }[] = [
  { value: 'grid_compact', label: 'Grid (Compact)', Icon: LayoutGrid },
  { value: 'grid_spacious', label: 'Grid (Spacious)', Icon: Grid2x2 },
  { value: 'grid_cover_only', label: 'Grid (Cover Only)', Icon: Square },
  { value: 'list', label: 'List', Icon: List },
]

export function LibraryToolbar() {
  const lastSyncedAt = useLibraryStore((s) => s.lastSyncedAt)
  const settings = useSettingsStore((s) => s.settings)
  const updateSettings = useSettingsStore((s) => s.updateSettings)
  const setSelectedAnimeId = useUiStore((s) => s.setSelectedAnimeId)
  const setIsDetailOpen = useUiStore((s) => s.setIsDetailOpen)
  const filteredEntries = useFilteredEntries()
  const { sync, isSyncing, progress, error } = useSync()

  const handleSync = () => {
    const service = (Object.keys(settings.services) as SyncService[]).find(
      (s) => settings.services[s].enabled
    )
    if (service) sync(service)
  }

  const handleRandom = () => {
    if (filteredEntries.length === 0) return
    const random = filteredEntries[Math.floor(Math.random() * filteredEntries.length)]
    setSelectedAnimeId(random.id)
    setIsDetailOpen(true)
  }

  const syncTooltip = error
    ? `Sync failed: ${error}`
    : lastSyncedAt
    ? `Last synced ${formatRelativeDate(lastSyncedAt)}`
    : 'Never synced'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Tooltip content={syncTooltip}>
          <Button
            variant="ghost"
            size="sm"
            loading={isSyncing}
            onClick={handleSync}
            aria-label="Sync library"
            className={error ? 'text-red-400 hover:text-red-300' : ''}
          >
            {error ? (
              <AlertCircle size={13} />
            ) : (
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            )}
            Sync
          </Button>
        </Tooltip>
        <Tooltip content="Open a random anime from the current view">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRandom}
            disabled={filteredEntries.length === 0}
            aria-label="Open random anime"
          >
            <Shuffle size={13} />
            Random
          </Button>
        </Tooltip>
        <div className="flex gap-1 ml-auto">
          {DISPLAY_MODES.map(({ value, label, Icon }) => (
            <Tooltip key={value} content={label}>
              <button
                onClick={() => updateSettings({ displayMode: value })}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent
                  ${settings.displayMode === value
                    ? 'bg-kakera-accent text-white'
                    : 'text-kakera-primary-400 hover:bg-kakera-primary-700 hover:text-white'
                  }`}
                aria-label={label}
                aria-pressed={settings.displayMode === value}
              >
                <Icon size={14} strokeWidth={1.75} />
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Inline progress bar — only shown during active sync */}
      {isSyncing && progress && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-0.5 bg-kakera-primary-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-kakera-accent rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <span className="text-[10px] text-kakera-muted whitespace-nowrap shrink-0">
            {progress.message}
          </span>
        </div>
      )}
    </div>
  )
}