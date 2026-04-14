import { useState } from 'react'
import { LibraryFilters } from '@/features/library/LibraryFilters'
import { LibraryGrid } from '@/features/library/LibraryGrid'
import { LibraryToolbar } from '@/features/library/LibraryToolbar'
import { CollectionEditor } from '@/features/collections/CollectionEditor'
import { useLibraryQuery } from '@/hooks/useLibrary'
import { useCollectionsStore } from '@/stores/collectionsStore'
import { useLibraryStore } from '@/stores/libraryStore'
import { Tooltip } from '@/components/ui/Tooltip'
import { Plus, Library } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

function CollectionIcon({ icon, size = 14 }: { icon: string; size?: number }) {
  const Icon = (LucideIcons as Record<string, unknown>)[icon] as React.ComponentType<{ size?: number }> | undefined
  if (Icon) return <Icon size={size} />
  return <span style={{ fontSize: size }}>{icon}</span>
}

function CollectionSidebar() {
  const collections = useCollectionsStore((s) => s.collections)
  const entries = useLibraryStore((s) => s.entries)
  const selectedCollectionId = useLibraryStore((s) => s.selectedCollectionId)
  const setSelectedCollectionId = useLibraryStore((s) => s.setSelectedCollectionId)
  const [editorOpen, setEditorOpen] = useState(false)

  const allCount = entries.length

  return (
    <>
      <nav
        aria-label="Collections"
        className="flex flex-col gap-1 w-44 shrink-0 border-r border-kakera-primary-800 pr-2 overflow-y-auto"
      >
        {/* All anime */}
        <button
          onClick={() => setSelectedCollectionId(null)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent
            ${selectedCollectionId === null
              ? 'bg-kakera-accent text-white'
              : 'text-kakera-primary-300 hover:bg-kakera-primary-800 hover:text-kakera-primary-100'
            }`}
          aria-current={selectedCollectionId === null ? 'true' : undefined}
        >
          <Library size={14} className="shrink-0" />
          <span className="flex-1 truncate">All anime</span>
          <span className="text-xs opacity-60 tabular-nums">{allCount}</span>
        </button>

        {/* Each collection */}
        {collections.map((col) => {
          const count = col.animeIds.filter((id) => entries.some((e) => e.id === id)).length
          const isActive = selectedCollectionId === col.id
          return (
            <button
              key={col.id}
              onClick={() => setSelectedCollectionId(col.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent
                ${isActive
                  ? 'bg-kakera-accent text-white'
                  : 'text-kakera-primary-300 hover:bg-kakera-primary-800 hover:text-kakera-primary-100'
                }`}
              style={isActive ? undefined : { borderLeftColor: col.color, borderLeftWidth: 2 }}
              aria-current={isActive ? 'true' : undefined}
            >
              <span className="shrink-0" style={{ color: isActive ? 'white' : col.color }}>
                <CollectionIcon icon={col.icon} size={14} />
              </span>
              <span className="flex-1 truncate">{col.name}</span>
              <span className="text-xs opacity-60 tabular-nums">{count}</span>
            </button>
          )
        })}

        {/* New collection */}
        <Tooltip content="New collection" side="right">
          <button
            onClick={() => setEditorOpen(true)}
            aria-label="Create new collection"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-kakera-primary-400
              hover:bg-kakera-primary-800 hover:text-kakera-primary-100 transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
          >
            <Plus size={14} className="shrink-0" />
            <span>New collection</span>
          </button>
        </Tooltip>
      </nav>
      <CollectionEditor open={editorOpen} onClose={() => setEditorOpen(false)} />
    </>
  )
}

function LibraryContent({ isLoading }: { isLoading: boolean }) {
  const selectedCollectionId = useLibraryStore((s) => s.selectedCollectionId)
  const collections = useCollectionsStore((s) => s.collections)
  const activeCollection = collections.find((c) => c.id === selectedCollectionId) ?? null
  const collectionAnimeIds = activeCollection?.animeIds

  return (
    <div className="flex flex-col gap-4 flex-1 min-w-0">
      {activeCollection && (
        <div className="flex items-center gap-2">
          <span style={{ color: activeCollection.color }}>
            <CollectionIcon icon={activeCollection.icon} size={18} />
          </span>
          <h2 className="text-base font-semibold text-kakera-primary-100">{activeCollection.name}</h2>
          {activeCollection.description && (
            <span className="text-sm text-kakera-muted">— {activeCollection.description}</span>
          )}
        </div>
      )}
      <LibraryToolbar />
      <LibraryFilters collectionAnimeIds={collectionAnimeIds} />
      <LibraryGrid isLoading={isLoading} collectionAnimeIds={collectionAnimeIds} />
    </div>
  )
}

export default function LibraryPage() {
  const { isLoading } = useLibraryQuery()
  return (
    <div className="flex gap-4 h-full">
      <CollectionSidebar />
      <LibraryContent isLoading={isLoading} />
    </div>
  )
}
