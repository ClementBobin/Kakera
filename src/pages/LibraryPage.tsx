import { useMemo, useState } from 'react'
import { LibraryFilters } from '@/features/library/LibraryFilters'
import { LibraryGrid } from '@/features/library/LibraryGrid'
import { LibraryToolbar } from '@/features/library/LibraryToolbar'
import { CollectionEditor } from '@/features/collections/CollectionEditor'
import { useLibraryQuery } from '@/hooks/useLibrary'
import { useCollectionsStore } from '@/stores/collectionsStore'
import { useLibraryStore } from '@/stores/libraryStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog } from '@/components/ui/Dialog'
import { Tooltip } from '@/components/ui/Tooltip'
import { Plus, Library, Pencil, Trash2 } from 'lucide-react'
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
  const setSelectedCollectionId = useLibraryStore((s) => s.setSelectedCollectionId)
  const collections = useCollectionsStore((s) => s.collections)
  const deleteCollection = useCollectionsStore((s) => s.deleteCollection)
  const addAnimeToCollection = useCollectionsStore((s) => s.addAnimeToCollection)
  const entries = useLibraryStore((s) => s.entries)
  const activeCollection = collections.find((c) => c.id === selectedCollectionId) ?? null
  const collectionAnimeIds = activeCollection?.animeIds

  const [editorOpen, setEditorOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addSearch, setAddSearch] = useState('')

  const handleDelete = () => {
    if (!activeCollection) return
    if (window.confirm(`Delete "${activeCollection.name}"?`)) {
      deleteCollection(activeCollection.id)
      setSelectedCollectionId(null)
    }
  }

  const filteredAddEntries = useMemo(() => {
    if (!activeCollection) return []
    const q = addSearch.toLowerCase().trim()
    if (!q) return []
    return entries
      .filter(
        (e) =>
          !activeCollection.animeIds.includes(e.id) &&
          (e.title.romaji.toLowerCase().includes(q) ||
            (e.title.english?.toLowerCase().includes(q) ?? false))
      )
      .slice(0, 8)
  }, [addSearch, entries, activeCollection])

  return (
    <div className="flex flex-col gap-4 flex-1 min-w-0">
      {activeCollection && (
        <div className="flex items-center gap-2">
          <span style={{ color: activeCollection.color }}>
            <CollectionIcon icon={activeCollection.icon} size={18} />
          </span>
          <h2 className="text-base font-semibold text-kakera-primary-100 flex-1">{activeCollection.name}</h2>
          {activeCollection.description && (
            <span className="text-sm text-kakera-muted mr-auto">— {activeCollection.description}</span>
          )}
          <Tooltip content="Edit collection">
            <button
              onClick={() => setEditorOpen(true)}
              className="p-1.5 rounded-lg text-kakera-muted hover:text-kakera-primary-100 hover:bg-kakera-primary-700
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent transition-colors"
              aria-label="Edit collection"
            >
              <Pencil size={14} />
            </button>
          </Tooltip>
          <Tooltip content="Delete collection">
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-kakera-muted hover:text-red-400 hover:bg-red-500/10
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition-colors"
              aria-label="Delete collection"
            >
              <Trash2 size={14} />
            </button>
          </Tooltip>
        </div>
      )}
      <LibraryToolbar />
      <LibraryFilters collectionAnimeIds={collectionAnimeIds} />
      <LibraryGrid isLoading={isLoading} collectionAnimeIds={collectionAnimeIds} collectionId={activeCollection?.id} />

      {/* Full-width + Add Anime button for collections */}
      {activeCollection && (
        <button
          onClick={() => { setAddSearch(''); setAddDialogOpen(true) }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
            border-2 border-dashed border-kakera-primary-600 text-kakera-muted
            hover:border-kakera-accent hover:text-kakera-accent transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
          aria-label="Add anime to collection"
        >
          <Plus size={18} />
          <span className="text-sm font-medium">Add Anime</span>
        </button>
      )}

      {/* Quick-add dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} title="Add Anime">
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Search anime…"
            value={addSearch}
            onChange={(e) => setAddSearch(e.target.value)}
            autoFocus
          />
          <div className="flex flex-col gap-0.5 min-h-16 max-h-60 overflow-y-auto">
            {filteredAddEntries.map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  if (activeCollection) addAnimeToCollection(activeCollection.id, e.id)
                  setAddSearch('')
                  setAddDialogOpen(false)
                }}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left hover:bg-kakera-primary-700
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
              >
                <img src={e.coverImage} alt="" className="w-7 h-10 object-cover rounded shrink-0" loading="lazy" />
                <span className="text-kakera-primary-200 truncate">{e.title.romaji}</span>
              </button>
            ))}
            {addSearch.trim().length > 0 && filteredAddEntries.length === 0 && (
              <p className="text-kakera-muted text-sm px-2 py-2">No matching anime found.</p>
            )}
            {addSearch.trim().length === 0 && (
              <p className="text-kakera-muted text-xs px-2 py-2">Start typing to search…</p>
            )}
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setAddDialogOpen(false)}>Close</Button>
          </div>
        </div>
      </Dialog>

      {activeCollection && (
        <CollectionEditor open={editorOpen} onClose={() => setEditorOpen(false)} collection={activeCollection} />
      )}
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
