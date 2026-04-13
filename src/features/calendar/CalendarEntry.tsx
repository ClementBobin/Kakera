import type { AnimeCalendarEntry } from '@/types/anime'
import { Badge } from '@/components/ui/Badge'
import { formatAiringDate } from '@/utils/format'

export interface CalendarEntryProps {
  entry: AnimeCalendarEntry
  onSelect?: (entry: AnimeCalendarEntry) => void
}

export function CalendarEntry({ entry, onSelect }: CalendarEntryProps) {
  return (
    <button
      onClick={() => onSelect?.(entry)}
      className="flex items-center gap-3 p-3 rounded-xl bg-kakera-primary-800 border border-kakera-primary-700
        hover:border-kakera-accent transition-colors text-left w-full
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
      aria-label={`${entry.title} episode ${entry.episodeNumber}`}
    >
      <img
        src={entry.coverImage}
        alt={entry.title}
        loading="lazy"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
        className="w-12 h-16 object-cover rounded-md flex-shrink-0 bg-kakera-primary-700"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{entry.title}</p>
        <p className="text-xs text-kakera-muted mt-0.5">Episode {entry.episodeNumber}</p>
        <p className="text-xs text-kakera-muted mt-0.5">{formatAiringDate(entry.airingAt)}</p>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {entry.isInLibrary && <Badge variant="success">In Library</Badge>}
          {entry.isNewSeason && <Badge variant="info">New Season</Badge>}
        </div>
      </div>
    </button>
  )
}
