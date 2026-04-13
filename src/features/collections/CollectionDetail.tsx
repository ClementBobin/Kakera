import { useState } from 'react'
import { useCollectionsStore } from '@/stores/collectionsStore'
import { useLibraryStore } from '@/stores/libraryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { AnimeCard } from '@/features/library/AnimeCard'
import { Button } from '@/components/ui/Button'
import { CollectionEditor } from '@/features/collections/CollectionEditor'

export interface CollectionDetailProps {
  collectionId: string
  onBack: () => void
}

export function CollectionDetail({ collectionId, onBack }: CollectionDetailProps) {
  const collections = useCollectionsStore((s) => s.collections)
  const deleteCollection = useCollectionsStore((s) => s.deleteCollection)
  const entries = useLibraryStore((s) => s.entries)
  const displayMode = useSettingsStore((s) => s.settings.displayMode)
  const [editorOpen, setEditorOpen] = useState(false)

  const collection = collections.find((c) => c.id === collectionId)
  if (!collection) return <p className="text-kakera-muted">Collection not found.</p>

  const animeEntries = entries.filter((e) => collection.animeIds.includes(e.id))

  const handleDelete = () => {
    if (window.confirm(`Delete "${collection.name}"?`)) {
      deleteCollection(collectionId)
      onBack()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg text-kakera-muted hover:text-white hover:bg-kakera-primary-700
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
          aria-label="Back to collections"
        >
          ←
        </button>
        <span className="text-2xl">{collection.icon}</span>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-white">{collection.name}</h2>
          {collection.description && <p className="text-sm text-kakera-muted">{collection.description}</p>}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setEditorOpen(true)} aria-label="Edit collection">Edit</Button>
        <Button variant="danger" size="sm" onClick={handleDelete} aria-label="Delete collection">Delete</Button>
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {animeEntries.map((entry) => (
          <AnimeCard key={entry.id} entry={entry} displayMode={displayMode} />
        ))}
        {animeEntries.length === 0 && (
          <p className="text-kakera-muted text-sm col-span-full">No anime in this collection yet.</p>
        )}
      </div>
      <CollectionEditor open={editorOpen} onClose={() => setEditorOpen(false)} collection={collection} />
    </div>
  )
}
