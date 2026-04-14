import { useEffect, useMemo, useState } from 'react'
import { useCollectionsStore } from '@/stores/collectionsStore'
import { useLibraryStore } from '@/stores/libraryStore'
import { Button, Input, Dialog } from '@/components/ui'
import { Tooltip } from '@/components/ui/Tooltip'
import { X } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import type { CustomCollection } from '@/types/collection'

export interface CollectionEditorProps {
  open: boolean
  onClose: () => void
  collection?: CustomCollection
}

// ── Icon picker ───────────────────────────────────────────────────────────────

// Common icons shown in the default grid (name → LucideIcon)
const COMMON_ICON_NAMES = [
  'BookOpen', 'Star', 'Heart', 'Film', 'Gamepad2', 'Trophy',
  'Sword', 'Flame', 'Gem', 'Music', 'Globe', 'Zap',
  'Eye', 'Clock', 'Bookmark', 'Tag', 'List', 'Layers',
  'Users', 'Sparkles', 'Moon', 'Sun', 'Rocket', 'ShieldCheck',
]

const ALL_ICON_NAMES = Object.keys(LucideIcons).filter(
  (k) => k !== 'default' && k !== 'createLucideIcon' && /^[A-Z]/.test(k)
)

function IconPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 200)
    return () => clearTimeout(id)
  }, [search])

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim()
    if (!q || q.length < 2) return COMMON_ICON_NAMES
    return ALL_ICON_NAMES
      .filter((n) => n.toLowerCase().includes(q))
      .slice(0, 24)
  }, [debouncedSearch])

  return (
    <div>
      <p className="text-sm font-medium text-kakera-primary-300 mb-2">Icon</p>
      <Input
        placeholder="Search icons…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2"
        aria-label="Search icons"
      />
      <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
        {filtered.map((name) => {
          const Icon = (LucideIcons as Record<string, unknown>)[name] as React.ComponentType<{ size?: number }>
          if (!Icon) return null
          return (
            <Tooltip key={name} content={name}>
              <button
                type="button"
                onClick={() => onChange(name)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent
                  ${value === name ? 'bg-kakera-accent text-white' : 'bg-kakera-primary-700 text-kakera-primary-300 hover:bg-kakera-primary-600 hover:text-white'}`}
                aria-label={`Select icon ${name}`}
                aria-pressed={value === name}
              >
                <Icon size={16} />
              </button>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}

// ── Color swatch ──────────────────────────────────────────────────────────────

const COLOR_OPTIONS = ['#7c3aed', '#2563eb', '#16a34a', '#dc2626', '#d97706', '#db2777', '#0891b2', '#65a30d']

// ── CollectionEditor ──────────────────────────────────────────────────────────

export function CollectionEditor({ open, onClose, collection }: CollectionEditorProps) {
  const [name, setName] = useState(collection?.name ?? '')
  const [description, setDescription] = useState(collection?.description ?? '')
  const [icon, setIcon] = useState(collection?.icon ?? 'BookOpen')
  const [color, setColor] = useState(collection?.color ?? '#7c3aed')
  const [search, setSearch] = useState('')
  const [selectedAnimeIds, setSelectedAnimeIds] = useState<string[]>(collection?.animeIds ?? [])

  // Reset when the dialog re-opens for a different collection
  useEffect(() => {
    if (open) {
      setName(collection?.name ?? '')
      setDescription(collection?.description ?? '')
      setIcon(collection?.icon ?? 'BookOpen')
      setColor(collection?.color ?? '#7c3aed')
      setSelectedAnimeIds(collection?.animeIds ?? [])
      setSearch('')
    }
  }, [open, collection])

  const addCollection = useCollectionsStore((s) => s.addCollection)
  const updateCollection = useCollectionsStore((s) => s.updateCollection)
  const entries = useLibraryStore((s) => s.entries)

  // Anime search suggestions (not yet selected)
  const filteredEntries = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return entries
      .filter(
        (e) =>
          !selectedAnimeIds.includes(e.id) &&
          (e.title.romaji.toLowerCase().includes(q) ||
            (e.title.english?.toLowerCase().includes(q) ?? false))
      )
      .slice(0, 8)
  }, [search, entries, selectedAnimeIds])

  // Entries for the selected anime list
  const selectedEntries = useMemo(
    () => entries.filter((e) => selectedAnimeIds.includes(e.id)),
    [entries, selectedAnimeIds]
  )

  const addAnime = (id: string) => {
    setSelectedAnimeIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setSearch('')
  }

  const removeAnime = (id: string) => {
    setSelectedAnimeIds((prev) => prev.filter((x) => x !== id))
  }

  const handleSave = () => {
    if (!name.trim()) return
    if (collection) {
      updateCollection(collection.id, {
        name,
        description: description || null,
        icon,
        color,
        animeIds: selectedAnimeIds,
      })
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
    <Dialog
      open={open}
      onClose={onClose}
      title={collection ? 'Edit Collection' : 'New Collection'}
      className="max-w-md max-h-[80vh] overflow-y-auto"
    >
      <div className="flex flex-col gap-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Collection name" />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />

        <IconPicker value={icon} onChange={setIcon} />

        {/* Color */}
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

        {/* Anime search + selected list */}
        <div>
          <p className="text-sm font-medium text-kakera-primary-300 mb-2">Anime</p>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search to add anime…"
            aria-label="Add anime to collection"
          />
          {filteredEntries.length > 0 && (
            <div className="mt-1 flex flex-col gap-0.5 max-h-36 overflow-y-auto border border-kakera-primary-700 rounded-lg">
              {filteredEntries.map((e) => (
                <button
                  key={e.id}
                  onClick={() => addAnime(e.id)}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-left hover:bg-kakera-primary-700
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
                >
                  <img src={e.coverImage} alt="" className="w-7 h-10 object-cover rounded shrink-0" loading="lazy" />
                  <span className="text-kakera-primary-200 truncate">{e.title.romaji}</span>
                </button>
              ))}
            </div>
          )}

          {/* Selected anime list */}
          {selectedEntries.length > 0 && (
            <div className="mt-2 flex flex-col gap-1">
              <p className="text-xs text-kakera-muted">{selectedEntries.length} anime added</p>
              {selectedEntries.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-2 px-2 py-1 rounded bg-kakera-primary-800 border border-kakera-primary-700"
                >
                  <img src={e.coverImage} alt="" className="w-7 h-10 object-cover rounded shrink-0" loading="lazy" />
                  <span className="flex-1 text-sm text-kakera-primary-200 truncate">{e.title.romaji}</span>
                  <button
                    type="button"
                    onClick={() => removeAnime(e.id)}
                    className="shrink-0 text-kakera-muted hover:text-red-400 transition-colors
                      focus-visible:outline-none"
                    aria-label={`Remove ${e.title.romaji} from collection`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {collection ? 'Save Changes' : 'Create'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
