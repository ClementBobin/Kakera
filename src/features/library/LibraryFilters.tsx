import { useCallback, useMemo, useRef, useState } from 'react'
import { useLibraryStore, useFilteredEntries } from '@/stores/libraryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { parseSearchTokens } from '@/utils/filter'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Tooltip } from '@/components/ui/Tooltip'
import { X } from 'lucide-react'
import type { SortStrategy, FilterValue } from '@/types/filters'

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

const STATUS_KEYS = [
  { key: 'watching' as const, label: 'Watching' },
  { key: 'completed' as const, label: 'Completed' },
  { key: 'downloaded' as const, label: 'Downloaded' },
  { key: 'favorites' as const, label: 'Favorites' },
  { key: 'unwatched' as const, label: 'Unwatched' },
]

const FILTER_VALUE_STYLES: Record<FilterValue, string> = {
  1: 'bg-kakera-accent text-white',
  0: 'bg-kakera-primary-800 text-kakera-primary-300 hover:bg-kakera-primary-700 hover:text-white',
  '-1': 'bg-red-500/20 text-red-300 hover:bg-red-500/30',
}

const FILTER_VALUE_TOOLTIP: Record<FilterValue, string> = {
  1: 'Include (click to exclude)',
  0: 'Filter off (click to include)',
  '-1': 'Exclude (click to reset)',
}

export interface LibraryFiltersProps {
  collectionAnimeIds?: string[]
}

// ── Smart search input ────────────────────────────────────────────────────────

interface SmartSearchProps {
  value: string
  onChange: (v: string) => void
  entries: ReturnType<typeof useFilteredEntries>
  allEntries: ReturnType<typeof useFilteredEntries>
}

function SmartSearch({ value, onChange, allEntries }: SmartSearchProps) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Collect all suggestions
  const { allGenres, allStudios } = useMemo(() => {
    const genres = new Set<string>()
    const studios = new Set<string>()
    for (const e of allEntries) {
      e.genres.forEach((g) => genres.add(g))
      e.studios.forEach((s) => studios.add(s))
    }
    return { allGenres: [...genres].sort(), allStudios: [...studios].sort() }
  }, [allEntries])

  // Parse tokens to know current search state
  const tokens = useMemo(() => parseSearchTokens(value), [value])
  const titleToken = tokens.find((t) => t.type === 'title')
  const tagTokens = tokens.filter((t) => t.type !== 'title')

  // Current partial word being typed (for suggestions)
  const parts = value.trim().split(/\s+/)
  const lastPart = parts[parts.length - 1] ?? ''
  const lastNegate = lastPart.startsWith('-')
  const lastClean = lastNegate ? lastPart.slice(1) : lastPart
  const colonIdx = lastClean.indexOf(':')
  const isTypingTag = colonIdx > 0
  const tagType = isTypingTag ? lastClean.slice(0, colonIdx).toLowerCase() : ''
  const tagPartial = isTypingTag ? lastClean.slice(colonIdx + 1).replace(/_/g, ' ').toLowerCase() : lastClean.toLowerCase()

  let suggestions: string[] = []
  if (isTypingTag && tagPartial.length > 0) {
    if (tagType === 'genre') {
      suggestions = allGenres.filter((g) => g.toLowerCase().startsWith(tagPartial))
    } else if (tagType === 'studio') {
      suggestions = allStudios.filter((s) => s.toLowerCase().startsWith(tagPartial))
    }
  } else if (!isTypingTag && tagPartial.length > 1) {
    // Show both genre and studio suggestions for plain text
    const genreHits = allGenres.filter((g) => g.toLowerCase().startsWith(tagPartial)).map((g) => `genre:${g}`)
    const studioHits = allStudios.filter((s) => s.toLowerCase().startsWith(tagPartial)).map((s) => `studio:${s}`)
    suggestions = [...genreHits.slice(0, 5), ...studioHits.slice(0, 5)]
  }

  const removeToken = (tokenIdx: number) => {
    const token = tokens[tokenIdx]
    if (!token) return
    if (token.type === 'title') {
      // Remove the plain-text portion
      const newParts = value.trim().split(/\s+/).filter((p) => {
        const neg = p.startsWith('-')
        const cl = neg ? p.slice(1) : p
        return cl.includes(':') // keep tag tokens
      })
      onChange(newParts.join(' '))
    } else {
      const prefix = token.negate ? '-' : ''
      const tag = `${prefix}${token.type}:${token.value.replace(/ /g, '_')}`
      // Remove this exact tag token from the search string
      const remaining = value.trim().split(/\s+/).filter((p) => p !== tag && p !== `${prefix}${token.type}:${token.value}`)
      onChange(remaining.join(' '))
    }
  }

  const applySuggestion = (suggestion: string) => {
    const withUnderscore = suggestion.replace(/ /g, '_')
    const restParts = parts.slice(0, -1)
    onChange([...restParts, withUnderscore].join(' ').trim())
    inputRef.current?.focus()
  }

  const showSuggestions = focused && suggestions.length > 0

  return (
    <div className="relative flex-1">
      {/* Tag + input row */}
      <div
        className="flex flex-wrap items-center gap-1.5 min-h-9 px-2.5 py-1.5 rounded-lg
          bg-kakera-primary-800 border border-kakera-primary-600
          focus-within:border-kakera-accent transition-colors"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Parsed tag badges */}
        {tagTokens.map((token, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium shrink-0
              ${token.negate ? 'bg-red-500/20 text-red-300' : 'bg-kakera-accent/20 text-kakera-accent-light'}`}
          >
            <span className="opacity-60">{token.negate ? '−' : '+'}{token.type}:</span>
            {token.value}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeToken(tokens.indexOf(token)) }}
              className="hover:opacity-75 focus-visible:outline-none"
              aria-label={`Remove ${token.type} filter`}
            >
              <X size={10} />
            </button>
          </span>
        ))}
        {/* Text input for title/raw part */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={tagTokens.length > 0 ? (titleToken ? undefined : 'Add more filters…') : 'Search anime, studio:Bones, genre:Action…'}
          className="flex-1 min-w-20 bg-transparent text-sm text-white placeholder-kakera-muted outline-none"
          aria-label="Search anime"
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-kakera-muted hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-kakera-primary-800 border border-kakera-primary-600 rounded-lg shadow-xl overflow-hidden">
          {suggestions.slice(0, 10).map((s) => {
            const isTag = s.includes(':')
            const [type, val] = isTag ? s.split(':') : ['', s]
            return (
              <button
                key={s}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applySuggestion(s)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left
                  hover:bg-kakera-primary-700 transition-colors"
              >
                {isTag && (
                  <Badge variant="default" className="shrink-0 text-[10px]">{type}</Badge>
                )}
                <span className="text-white">{val ?? s}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main LibraryFilters component ─────────────────────────────────────────────

export function LibraryFilters({ collectionAnimeIds }: LibraryFiltersProps) {
  const filters = useLibraryStore((s) => s.filters)
  const setFilter = useLibraryStore((s) => s.setFilter)
  const cycleStatusFilter = useLibraryStore((s) => s.cycleStatusFilter)
  const showCategoryTabs = useSettingsStore((s) => s.settings.tabs.showCategoryTabs)
  const filteredEntries = useFilteredEntries(collectionAnimeIds)
  const allEntries = useLibraryStore((s) => s.entries)

  const handleSearch = useCallback(
    (v: string) => setFilter('search', v),
    [setFilter]
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <SmartSearch
          value={filters.search}
          onChange={handleSearch}
          entries={filteredEntries}
          allEntries={allEntries}
        />
        <Select
          options={SORT_OPTIONS}
          value={filters.sort}
          onChange={(e) => setFilter('sort', e.target.value as SortStrategy)}
          aria-label="Sort strategy"
          className="w-44 shrink-0"
        />
      </div>
      {showCategoryTabs && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-kakera-muted shrink-0">Filter:</span>
          {STATUS_KEYS.map(({ key, label }) => {
            const val: FilterValue = filters.statusFilters[key]
            return (
              <Tooltip key={key} content={FILTER_VALUE_TOOLTIP[val]}>
                <button
                  onClick={() => cycleStatusFilter(key)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent
                    border border-transparent
                    ${FILTER_VALUE_STYLES[val]}`}
                  aria-pressed={val !== 0}
                  aria-label={`${label} filter: ${FILTER_VALUE_TOOLTIP[val]}`}
                >
                  {val === -1 && <span className="text-[10px] leading-none">−</span>}
                  {val === 1 && <span className="text-[10px] leading-none">+</span>}
                  {label}
                </button>
              </Tooltip>
            )
          })}
          <span className="text-xs text-kakera-muted shrink-0 tabular-nums ml-auto">
            {filteredEntries.length} anime
          </span>
        </div>
      )}
    </div>
  )
}
