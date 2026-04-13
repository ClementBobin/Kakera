import { useLibraryStore, useFilteredEntries } from '@/stores/libraryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useUiStore } from '@/stores/uiStore'
import { useSyncLibrary } from '@/hooks/useLibrary'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { formatRelativeDate } from '@/utils/format'
import type { DisplayMode } from '@/types/settings'

const DISPLAY_MODES: { value: DisplayMode; label: string; icon: string }[] = [
  { value: 'grid_compact', label: 'Grid (Compact)', icon: '⊞' },
  { value: 'grid_spacious', label: 'Grid (Spacious)', icon: '⊡' },
  { value: 'grid_cover_only', label: 'Grid (Cover Only)', icon: '⊟' },
  { value: 'list', label: 'List', icon: '☰' },
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
          🔄 Sync
        </Button>
      </Tooltip>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRandom}
        disabled={filteredEntries.length === 0}
        aria-label="Open random anime"
      >
        🎲 Random
      </Button>
      <div className="flex gap-1 ml-auto">
        {DISPLAY_MODES.map((mode) => (
          <Tooltip key={mode.value} content={mode.label}>
            <button
              onClick={() => updateSettings({ displayMode: mode.value })}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent
                ${settings.displayMode === mode.value
                  ? 'bg-kakera-accent text-white'
                  : 'text-kakera-primary-400 hover:bg-kakera-primary-700 hover:text-white'
                }`}
              aria-label={mode.label}
              aria-pressed={settings.displayMode === mode.value}
            >
              {mode.icon}
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
