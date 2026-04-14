import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLibraryStore, useFilteredEntries } from '@/stores/libraryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { Select } from '@/components/ui/Select'
import { Tooltip } from '@/components/ui/Tooltip'
import { X } from 'lucide-react'
import type { SortStrategy, FilterValue } from '@/types/filters'
import type { SearchToken } from '@/utils/filter'

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

// ── Types ─────────────────────────────────────────────────────────────────────

type CommittedTag = SearchToken & { type: 'genre' | 'studio' }

function serializeCommitted(tags: CommittedTag[]): string {
  return tags
    .map((t) => `${t.negate ? '-' : ''}${t.type}:${t.value.replace(/ /g, '_')}`)
    .join(' ')
}

function buildFullValue(committed: CommittedTag[], inputText: string): string {
  const parts = [
    serializeCommitted(committed),
    inputText.trim(),
  ].filter(Boolean)
  return parts.join(' ')
}

/** Parse a raw search string: all complete tag tokens → committed badges, rest → inputText */
function parseIntoCommitted(raw: string): { committed: CommittedTag[]; inputText: string } {
  if (!raw.trim()) return { committed: [], inputText: '' }

  const committed: CommittedTag[] = []
  const titleParts: string[] = []

  const parts = raw.trim().split(/\s+/)

  for (const part of parts) {
    const negate = part.startsWith('-')
    const clean = negate ? part.slice(1) : part
    const colonIdx = clean.indexOf(':')

    if (colonIdx > 0) {
      const type = clean.slice(0, colonIdx).toLowerCase()
      const val = clean.slice(colonIdx + 1).replace(/_/g, ' ').trim()
      if (val && (type === 'genre' || type === 'studio')) {
        committed.push({ type: type as 'genre' | 'studio', value: val, negate })
        continue
      }
    }
    if (clean) titleParts.push(part)
  }

  return { committed, inputText: titleParts.join(' ') }
}

// ── SmartSearch ───────────────────────────────────────────────────────────────

interface SmartSearchProps {
  value: string
  onChange: (v: string) => void
  allEntries: { genres: string[]; studios: string[] }[]
}

function SmartSearch({ value, onChange, allEntries }: SmartSearchProps) {
  const [committed, setCommitted] = useState<CommittedTag[]>(() => parseIntoCommitted(value).committed)
  const [inputText, setInputText] = useState<string>(() => parseIntoCommitted(value).inputText)
  const [focused, setFocused] = useState(false)
  const [debouncedInput, setDebouncedInput] = useState(inputText)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync when value changes externally (e.g. from AnimeDetail)
  const prevValue = useRef(value)
  useEffect(() => {
    if (value !== prevValue.current) {
      prevValue.current = value
      const { committed: newC, inputText: newI } = parseIntoCommitted(value)
      setCommitted(newC)
      setInputText(newI)
      setDebouncedInput(newI)
    }
  }, [value])

  // Debounce input for suggestions
  useEffect(() => {
    const id = setTimeout(() => setDebouncedInput(inputText), 180)
    return () => clearTimeout(id)
  }, [inputText])

  // Gather suggestion pool
  const { allGenres, allStudios } = useMemo(() => {
    const genres = new Set<string>()
    const studios = new Set<string>()
    for (const e of allEntries) {
      e.genres.forEach((g) => genres.add(g))
      e.studios.forEach((s) => studios.add(s))
    }
    return { allGenres: [...genres].sort(), allStudios: [...studios].sort() }
  }, [allEntries])

  // Compute suggestions from debounced input
  const suggestions: Array<{ label: string; tag?: CommittedTag }> = useMemo(() => {
    const trimmed = debouncedInput.trimEnd()
    const lastWord = trimmed.split(/\s+/).pop() ?? ''
    const negate = lastWord.startsWith('-')
    const clean = negate ? lastWord.slice(1) : lastWord

    // User typed just '+', '-', or started with 'g'/'s' etc. → offer type prefixes
    if (clean === '+' || clean === '') {
      return [
        { label: 'genre:', tag: undefined },
        { label: 'studio:', tag: undefined },
      ]
    }
    if (clean === '-') {
      return [
        { label: '-genre:', tag: undefined },
        { label: '-studio:', tag: undefined },
      ]
    }

    const colonIdx = clean.indexOf(':')

    if (colonIdx > 0) {
      // Typing inside a tag value
      const type = clean.slice(0, colonIdx).toLowerCase()
      const partial = clean.slice(colonIdx + 1).replace(/_/g, ' ').toLowerCase()
      if (partial.length < 2) return []
      const pool = type === 'genre' ? allGenres : type === 'studio' ? allStudios : []
      return pool
        .filter((x) => x.toLowerCase().startsWith(partial))
        .slice(0, 3)
        .map((x) => ({
          label: `${negate ? '-' : ''}${type}:${x}`,
          tag: { type: type as 'genre' | 'studio', value: x, negate } satisfies CommittedTag,
        }))
    }

    // Plain text – suggest genre:/studio: prefixes matching the partial
    if (clean.length < 2) return []
    const partial = clean.toLowerCase()
    const genreHits = allGenres
      .filter((g) => g.toLowerCase().startsWith(partial))
      .slice(0, 2)
      .map((g) => ({
        label: `genre:${g}`,
        tag: { type: 'genre' as const, value: g, negate: false } satisfies CommittedTag,
      }))
    const studioHits = allStudios
      .filter((s) => s.toLowerCase().startsWith(partial))
      .slice(0, 2)
      .map((s) => ({
        label: `studio:${s}`,
        tag: { type: 'studio' as const, value: s, negate: false } satisfies CommittedTag,
      }))
    return [...genreHits, ...studioHits].slice(0, 3)
  }, [debouncedInput, allGenres, allStudios])

  const showSuggestions = focused && suggestions.length > 0

  /** Commit a tag and remove it from the inputText */
  const commitTag = useCallback(
    (tag: CommittedTag, inputAfter: string) => {
      setCommitted((prev) => {
        const next = [...prev, tag]
        const full = buildFullValue(next, inputAfter)
        onChange(full)
        return next
      })
      setInputText(inputAfter)
    },
    [onChange]
  )

  const removeCommitted = useCallback(
    (idx: number) => {
      setCommitted((prev) => {
        const next = prev.filter((_, i) => i !== idx)
        onChange(buildFullValue(next, inputText))
        return next
      })
    },
    [inputText, onChange]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value

    // Detect: user just typed a space after a complete tag token
    if (val.endsWith(' ')) {
      const words = val.trimEnd().split(/\s+/)
      const lastWord = words[words.length - 1] ?? ''
      const negate = lastWord.startsWith('-')
      const clean = negate ? lastWord.slice(1) : lastWord
      const colonIdx = clean.indexOf(':')
      if (colonIdx > 0) {
        const type = clean.slice(0, colonIdx).toLowerCase()
        const tagVal = clean.slice(colonIdx + 1).replace(/_/g, ' ').trim()
        if (tagVal && (type === 'genre' || type === 'studio')) {
          const tag: CommittedTag = { type: type as 'genre' | 'studio', value: tagVal, negate }
          const remainingInput = words.slice(0, -1).join(' ')
          commitTag(tag, remainingInput)
          return
        }
      }
    }

    setInputText(val)
    onChange(buildFullValue(committed, val))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && inputText === '' && committed.length > 0) {
      // Pop last committed tag back to input for editing
      const last = committed[committed.length - 1]
      const textForm = `${last.negate ? '-' : ''}${last.type}:${last.value.replace(/ /g, '_')}`
      const next = committed.slice(0, -1)
      setCommitted(next)
      setInputText(textForm)
      onChange(buildFullValue(next, textForm))
    }
  }

  const applySuggestion = (suggestion: { label: string; tag?: CommittedTag }) => {
    if (suggestion.tag) {
      // Remove the partial from inputText that triggered this suggestion
      const words = inputText.trimEnd().split(/\s+/)
      const rest = words.slice(0, -1).join(' ')
      commitTag(suggestion.tag, rest)
    } else {
      // Just a prefix like "genre:" or "-studio:" – put in input
      const words = inputText.trimEnd().split(/\s+/)
      const rest = [...words.slice(0, -1), suggestion.label].join(' ')
      setInputText(rest)
      onChange(buildFullValue(committed, rest))
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }

  const clearAll = () => {
    setCommitted([])
    setInputText('')
    onChange('')
  }

  const hasAnything = committed.length > 0 || inputText.trim().length > 0

  return (
    <div className="relative flex-1">
      <div
        className="flex flex-wrap items-center gap-1.5 min-h-9 px-2.5 py-1.5 rounded-lg
          bg-kakera-primary-800 border border-kakera-primary-600
          focus-within:border-kakera-accent transition-colors cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Committed tag badges */}
        {committed.map((tag, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium shrink-0
              ${tag.negate ? 'bg-red-500/20 text-red-300' : 'bg-kakera-accent/20 text-kakera-accent-light'}`}
          >
            <span className="opacity-60">{tag.negate ? '−' : '+'}{tag.type}:</span>
            {tag.value}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); removeCommitted(i) }}
              className="hover:opacity-75 focus-visible:outline-none"
              aria-label={`Remove ${tag.type} filter`}
            >
              <X size={10} />
            </button>
          </span>
        ))}
        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={committed.length > 0 ? 'Add more filters…' : 'Search anime, studio:Bones, genre:Action…'}
          className="flex-1 min-w-24 bg-transparent text-sm text-kakera-primary-100 placeholder-kakera-muted outline-none"
          aria-label="Search anime"
          autoComplete="off"
        />
        {hasAnything && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); clearAll() }}
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
          {suggestions.map((s) => {
            const colonIdx = s.label.indexOf(':')
            const isTag = colonIdx > 0
            const prefix = isTag ? s.label.slice(0, colonIdx + 1) : ''
            const rest = isTag ? s.label.slice(colonIdx + 1) : s.label
            return (
              <button
                key={s.label}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applySuggestion(s)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-kakera-primary-700 transition-colors"
              >
                {isTag && (
                  <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold
                    ${s.label.startsWith('-') ? 'bg-red-500/20 text-red-300' : 'bg-kakera-accent/20 text-kakera-accent-light'}`}>
                    {prefix}
                  </span>
                )}
                <span className="text-kakera-primary-200">{rest || s.label}</span>
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

