import { useMemo, useState } from 'react'
import { useCollectionsStore } from '@/stores/collectionsStore'
import { useLibraryStore } from '@/stores/libraryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { AnimeCard } from '@/features/library/AnimeCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog } from '@/components/ui/Dialog'
import { Tooltip } from '@/components/ui/Tooltip'
import { CollectionEditor } from '@/features/collections/CollectionEditor'
import { ArrowLeft, Plus } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

export interface CollectionDetailProps {
  collectionId: string
  onBack: () => void
}

/** Render a collection icon: if it matches a Lucide icon name use that, otherwise render raw string */
function CollectionIcon({ icon, size = 24 }: { icon: string; size?: number }) {
  const Icon = (LucideIcons as Record<string, unknown>)[icon] as React.ComponentType<{ size?: number }> | undefined
  if (Icon) return <Icon size={size} />
  return <span style={{ fontSize: size * 0.75 }}>{icon}</span>
}

export function CollectionDetail({ collectionId, onBack }: CollectionDetailProps) {
  const collections = useCollectionsStore((s) => s.collections)
  const deleteCollection = useCollectionsStore((s) => s.deleteCollection)
  const addAnimeToCollection = useCollectionsStore((s) => s.addAnimeToCollection)
  const removeAnimeFromCollection = useCollectionsStore((s) => s.removeAnimeFromCollection)
  const entries = useLibraryStore((s) => s.entries)
  const displayMode = useSettingsStore((s) => s.settings.displayMode)
  const [editorOpen, setEditorOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addSearch, setAddSearch] = useState('')

  const collection = collections.find((c) => c.id === collectionId)
  if (!collection) return <p className="text-kakera-muted">Collection not found.</p>

  const animeEntries = entries.filter((e) => collection.animeIds.includes(e.id))

  const handleDelete = () => {
    if (window.confirm(`Delete "${collection.name}"?`)) {
      deleteCollection(collectionId)
      onBack()
    }
  }

  // ── Quick-add dialog helpers ──────────────────────────────────────────────
  const filteredAddEntries = useMemo(() => {
    const q = addSearch.toLowerCase().trim()
    if (!q) return []
    return entries
      .filter(
        (e) =>
          !collection.animeIds.includes(e.id) &&
          (e.title.romaji.toLowerCase().includes(q) ||
            (e.title.english?.toLowerCase().includes(q) ?? false))
      )
      .slice(0, 8)
  }, [addSearch, entries, collection.animeIds])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Tooltip content="Back to collections">
          <button
            onClick={onBack}
            className="p-2 rounded-lg text-kakera-muted hover:text-kakera-primary-100 hover:bg-kakera-primary-700
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
            aria-label="Back to collections"
          >
            <ArrowLeft size={16} />
          </button>
        </Tooltip>
        <span className="text-kakera-accent">
          <CollectionIcon icon={collection.icon} size={22} />
        </span>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-kakera-primary-100">{collection.name}</h2>
          {collection.description && <p className="text-sm text-kakera-muted">{collection.description}</p>}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setEditorOpen(true)} aria-label="Edit collection">Edit</Button>
        <Button variant="danger" size="sm" onClick={handleDelete} aria-label="Delete collection">Delete</Button>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {animeEntries.map((entry) => (
          <AnimeCard
            key={entry.id}
            entry={entry}
            displayMode={displayMode}
            onRemove={() => removeAnimeFromCollection(collectionId, entry.id)}
          />
        ))}
        {animeEntries.length === 0 && (
          <p className="text-kakera-muted text-sm col-span-full">No anime in this collection yet.</p>
        )}
      </div>

      {/* Big + button to add anime */}
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
                  addAnimeToCollection(collectionId, e.id)
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

      <CollectionEditor open={editorOpen} onClose={() => setEditorOpen(false)} collection={collection} />
    </div>
  )
}
