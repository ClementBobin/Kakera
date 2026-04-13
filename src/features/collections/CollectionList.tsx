import { useState } from 'react'
import { useCollectionsStore } from '@/stores/collectionsStore'
import { useLibraryStore } from '@/stores/libraryStore'
import { Button } from '@/components/ui/Button'
import { CollectionEditor } from '@/features/collections/CollectionEditor'

export interface CollectionListProps {
  onSelect: (id: string) => void
}

export function CollectionList({ onSelect }: CollectionListProps) {
  const collections = useCollectionsStore((s) => s.collections)
  const entries = useLibraryStore((s) => s.entries)
  const [editorOpen, setEditorOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Collections</h2>
        <Button size="sm" onClick={() => setEditorOpen(true)} aria-label="Create new collection">
          + New Collection
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {collections.map((col) => {
          const count = col.animeIds.filter((id) => entries.some((e) => e.id === id)).length
          return (
            <button
              key={col.id}
              onClick={() => onSelect(col.id)}
              className="flex flex-col gap-2 p-4 rounded-xl bg-kakera-primary-800 border border-kakera-primary-700
                hover:border-kakera-accent transition-colors text-left
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
              style={{ borderLeftColor: col.color, borderLeftWidth: 3 }}
              aria-label={`Open collection ${col.name}`}
            >
              <span className="text-2xl">{col.icon}</span>
              <div>
                <p className="text-sm font-semibold text-white">{col.name}</p>
                <p className="text-xs text-kakera-muted">{count} anime</p>
              </div>
            </button>
          )
        })}
        {collections.length === 0 && (
          <p className="col-span-full text-kakera-muted text-sm">No collections yet. Create one to get started.</p>
        )}
      </div>
      <CollectionEditor open={editorOpen} onClose={() => setEditorOpen(false)} />
    </div>
  )
}
