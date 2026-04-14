import { useCallback } from 'react'
import { useLibraryStore, useFilteredEntries } from '@/stores/libraryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Tabs } from '@/components/ui/Tabs'
import type { FilterStatus, SortStrategy } from '@/types/filters'

const STATUS_TABS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'started', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'downloaded', label: 'Downloaded' },
  { value: 'favorites', label: 'Favorites' },
  { value: 'unwatched', label: 'Unwatched' },
]

const SORT_OPTIONS: { value: SortStrategy; label: string }[] = [
  { value: 'alphabetical', label: 'A → Z' },
  { value: 'alphabetical_desc', label: 'Z → A' },
  { value: 'last_watched', label: 'Last Watched' },
  { value: 'last_updated', label: 'Last Updated' },
  { value: 'added_date', label: 'Date Added' },
  { value: 'score', label: 'Score' },
  { value: 'episode_count', label: 'Episode Count' },
  { value: 'unwatched_count', label: 'Unwatched Count' },
  { value: 'broadcast_season', label: 'Broadcast Season' },
  { value: 'random', label: 'Random' },
]

export function LibraryFilters() {
  const filters = useLibraryStore((s) => s.filters)
  const setFilter = useLibraryStore((s) => s.setFilter)
  const showCategoryTabs = useSettingsStore((s) => s.settings.tabs.showCategoryTabs)
  const filteredEntries = useFilteredEntries()

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilter('search', e.target.value)
    },
    [setFilter]
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search anime..."
          value={filters.search}
          onChange={handleSearch}
          className="flex-1"
          aria-label="Search anime"
        />
        <Select
          options={SORT_OPTIONS}
          value={filters.sort}
          onChange={(e) => setFilter('sort', e.target.value as SortStrategy)}
          aria-label="Sort strategy"
          className="w-44"
        />
      </div>
      {showCategoryTabs && (
        <div className="flex items-center gap-3">
          <div className="overflow-x-auto flex-1">
            <Tabs
              items={STATUS_TABS}
              value={filters.status}
              onChange={(v) => setFilter('status', v as FilterStatus)}
            />
          </div>
          <span className="text-xs text-kakera-muted shrink-0 tabular-nums">
            {filteredEntries.length} anime
          </span>
        </div>
      )}
    </div>
  )
}
