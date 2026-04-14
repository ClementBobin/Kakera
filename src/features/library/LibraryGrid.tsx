import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useSettingsStore } from '@/stores/settingsStore'
import { useFilteredEntries } from '@/stores/libraryStore'
import { AnimeCard } from '@/features/library/AnimeCard'
import { Skeleton } from '@/components/ui/Skeleton'

export interface LibraryGridProps {
  isLoading?: boolean
  collectionAnimeIds?: string[]
}

export function LibraryGrid({ isLoading = false, collectionAnimeIds }: LibraryGridProps) {
  const entries = useFilteredEntries(collectionAnimeIds)
  const settings = useSettingsStore((s) => s.settings)
  const displayMode = settings.displayMode
  const gridSize = settings.gridSize
  const gridSizeAuto = settings.gridSizeAuto

  const isList = displayMode === 'list'
  const containerRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: isLoading ? 20 : (isList ? entries.length : Math.ceil(entries.length / (gridSizeAuto ? 5 : gridSize))),
    getScrollElement: () => containerRef.current,
    estimateSize: () => isList ? 72 : 280,
    overscan: 5,
  })

  if (isLoading) {
    return (
      <div
        className={isList ? 'flex flex-col gap-2' : 'grid gap-3'}
        style={!isList ? { gridTemplateColumns: gridSizeAuto ? 'repeat(auto-fill, minmax(160px, 1fr))' : `repeat(${gridSize}, minmax(0, 1fr))` } : undefined}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} className={isList ? 'h-16 w-full' : 'aspect-[2/3] w-full'} />
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-kakera-muted">
        <p className="text-lg">No anime found</p>
        <p className="text-sm mt-1">Try adjusting your filters or sync your library</p>
      </div>
    )
  }

  if (isList) {
    return (
      <div ref={containerRef} className="overflow-auto" style={{ height: '100%' }}>
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const entry = entries[virtualRow.index]
            if (!entry) return null
            return (
              <div
                key={virtualRow.key}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${virtualRow.start}px)` }}
              >
                <AnimeCard entry={entry} displayMode={displayMode} />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: gridSizeAuto ? 'repeat(auto-fill, minmax(160px, 1fr))' : `repeat(${gridSize}, minmax(0, 1fr))` }}
    >
      {entries.map((entry) => (
        <AnimeCard key={entry.id} entry={entry} displayMode={displayMode} />
      ))}
    </div>
  )
}
