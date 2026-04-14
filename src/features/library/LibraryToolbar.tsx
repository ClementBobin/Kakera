import { useLibraryStore, useFilteredEntries } from '@/stores/libraryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useUiStore } from '@/stores/uiStore'
import { useSyncLibrary } from '@/hooks/useLibrary'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { formatRelativeDate } from '@/utils/format'
import { RefreshCw, Shuffle, LayoutGrid, Grid2x2, Square, List, type LucideProps } from 'lucide-react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import type { DisplayMode } from '@/types/settings'

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>

const DISPLAY_MODES: { value: DisplayMode; label: string; Icon: LucideIcon }[] = [
  { value: 'grid_compact', label: 'Grid (Compact)', Icon: LayoutGrid },
  { value: 'grid_spacious', label: 'Grid (Spacious)', Icon: Grid2x2 },
  { value: 'grid_cover_only', label: 'Grid (Cover Only)', Icon: Square },
  { value: 'list', label: 'List', Icon: List },
]

export function LibraryToolbar() {
  const isSyncing = useLibraryStore((s) => s.isSyncing)
  const lastSyncedAt = useLibraryStore((s) => s.lastSyncedAt)
  const settings = useSettingsStore((s) => s.settings)
  const updateSettings = useSettingsStore((s) => s.updateSettings)
  const setSelectedAnimeId = useUiStore((s) => s.setSelectedAnimeId)
  const setIsDetailOpen = useUiStore((s) => s.setIsDetailOpen)
  const filteredEntries = useFilteredEntries()
  const syncMutation = useSyncLibrary()

  const handleSync = () => {
    if (settings.services.anilist.enabled) {
      syncMutation.mutate('anilist')
    } else if (settings.services.myanimelist.enabled) {
      syncMutation.mutate('myanimelist')
    }
  }

  const handleRandom = () => {
    if (filteredEntries.length === 0) return
    const random = filteredEntries[Math.floor(Math.random() * filteredEntries.length)]
    setSelectedAnimeId(random.id)
    setIsDetailOpen(true)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Tooltip content={lastSyncedAt ? `Last synced ${formatRelativeDate(lastSyncedAt)}` : 'Never synced'}>
        <Button
          variant="ghost"
          size="sm"
          loading={isSyncing}
          onClick={handleSync}
          aria-label="Sync library"
        >
          <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
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
  )
}
