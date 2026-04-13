import type { AnimeRelation } from '@/types/anime'
import { Badge } from '@/components/ui/Badge'

export interface RelationsTimelineProps {
  relations: AnimeRelation[]
  currentAnimeId: string
  onSelect?: (id: string) => void
}

const RELATION_COLORS: Record<AnimeRelation['relationType'], 'info' | 'success' | 'warning' | 'default' | 'danger'> = {
  PREQUEL: 'info',
  SEQUEL: 'success',
  SIDE_STORY: 'warning',
  SPIN_OFF: 'warning',
  ALTERNATIVE: 'default',
  SUMMARY: 'default',
  OTHER: 'default',
}

export function RelationsTimeline({ relations, currentAnimeId: _currentAnimeId, onSelect }: RelationsTimelineProps) {
  if (relations.length === 0) return null

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {relations.map((rel) => (
        <button
          key={rel.id}
          onClick={() => onSelect?.(rel.id)}
          className="flex-shrink-0 w-32 flex flex-col gap-1.5 rounded-xl overflow-hidden
            bg-kakera-primary-800 border border-kakera-primary-700 hover:border-kakera-accent
            transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
          aria-label={`${rel.title} (${rel.relationType.replace(/_/g, ' ')})`}
        >
          <img
            src={rel.coverImage}
            alt={rel.title}
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
            className="w-full aspect-[2/3] object-cover bg-kakera-primary-700"
          />
          <div className="px-2 pb-2">
            <p className="text-xs font-medium text-white truncate">{rel.title}</p>
            <Badge variant={RELATION_COLORS[rel.relationType]} className="mt-1 text-[10px]">
              {rel.relationType.replace(/_/g, ' ')}
            </Badge>
          </div>
        </button>
      ))}
    </div>
  )
}
