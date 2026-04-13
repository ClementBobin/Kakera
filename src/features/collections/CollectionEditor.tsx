import { useState } from 'react'
import { useCollectionsStore } from '@/stores/collectionsStore'
import { useLibraryStore } from '@/stores/libraryStore'
import { Button, Input, Dialog } from '@/components/ui'
import type { CustomCollection } from '@/types/collection'

export interface CollectionEditorProps {
  open: boolean
  onClose: () => void
  collection?: CustomCollection
}

const EMOJI_OPTIONS = ['📚', '🎬', '🎮', '⭐', '🔥', '💎', '🌸', '⚔️', '🏆', '🎭']
const COLOR_OPTIONS = ['#7c3aed', '#2563eb', '#16a34a', '#dc2626', '#d97706', '#db2777', '#0891b2', '#65a30d']

export function CollectionEditor({ open, onClose, collection }: CollectionEditorProps) {
  const [name, setName] = useState(collection?.name ?? '')
  const [description, setDescription] = useState(collection?.description ?? '')
  const [icon, setIcon] = useState(collection?.icon ?? '📚')
  const [color, setColor] = useState(collection?.color ?? '#7c3aed')
  const [search, setSearch] = useState('')
  const [selectedAnimeIds, setSelectedAnimeIds] = useState<string[]>([])

  const addCollection = useCollectionsStore((s) => s.addCollection)
  const updateCollection = useCollectionsStore((s) => s.updateCollection)
  const entries = useLibraryStore((s) => s.entries)

  const filteredEntries = entries.filter((e) =>
    search
      ? e.title.romaji.toLowerCase().includes(search.toLowerCase()) ||
        (e.title.english?.toLowerCase().includes(search.toLowerCase()) ?? false)
      : true
  )

  const handleSave = () => {
    if (!name.trim()) return
    if (collection) {
      updateCollection(collection.id, { name, description: description || null, icon, color })
    } else {
      addCollection({
        id: String(Date.now()),
        name,
        description: description || null,
        animeIds: selectedAnimeIds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color,
        icon,
      })
    }
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title={collection ? 'Edit Collection' : 'New Collection'} className="max-w-md">
      <div className="flex flex-col gap-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Collection name" />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
        <div>
          <p className="text-sm font-medium text-kakera-primary-300 mb-2">Icon</p>
          <div className="flex gap-2 flex-wrap">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                onClick={() => setIcon(e)}
                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent
                  ${icon === e ? 'bg-kakera-accent' : 'bg-kakera-primary-700 hover:bg-kakera-primary-600'}`}
                aria-label={`Select icon ${e}`}
                aria-pressed={icon === e}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-kakera-primary-300 mb-2">Color</p>
          <div className="flex gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-kakera-accent
                  ${color === c ? 'ring-2 ring-white' : ''}`}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
                aria-pressed={color === c}
              />
            ))}
          </div>
        </div>
        {!collection && (
          <div>
            <Input label="Add Anime" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search to add anime..." />
            {search && (
              <div className="mt-2 flex flex-col gap-1 max-h-40 overflow-y-auto">
                {filteredEntries.slice(0, 10).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      setSelectedAnimeIds((prev) =>
                        prev.includes(e.id) ? prev.filter((id) => id !== e.id) : [...prev, e.id]
                      )
                    }}
                    className="flex items-center gap-2 p-2 rounded text-sm text-left hover:bg-kakera-primary-700
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
                    aria-label={`Add ${e.title.romaji} to collection`}
                  >
                    <img src={e.coverImage} alt="" className="w-8 h-10 object-cover rounded" loading="lazy" />
                    <span className="text-kakera-primary-200 truncate">{e.title.romaji}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>Save</Button>
        </div>
      </div>
    </Dialog>
  )
}
