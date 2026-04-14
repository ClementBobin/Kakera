import type { AnimeRelation } from '@/types/anime'
import { Badge } from '@/components/ui/Badge'
import { ExternalLink } from 'lucide-react'

export interface RelationsTimelineProps {
  relations: AnimeRelation[]
  currentAnimeId: string
  /** Set of anime IDs that exist in the local library */
  libraryIds?: Set<string>
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

function formatYearRange(startYear: number | null, endYear: number | null): string | null {
  if (!startYear) return null
  if (!endYear || endYear === startYear) return String(startYear)
  return `${startYear} – ${endYear}`
}

export function RelationsTimeline({ relations, libraryIds, onSelect }: RelationsTimelineProps) {
  if (relations.length === 0) return null

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {relations.map((rel) => {
        const isInLibrary = libraryIds?.has(rel.id) ?? false
        const yearRange = formatYearRange(rel.releaseYear, rel.endYear)

        if (isInLibrary) {
          return (
            <button
              key={rel.id}
              onClick={() => onSelect?.(rel.id)}
              className="flex-shrink-0 w-32 flex flex-col gap-1.5 rounded-xl overflow-hidden
                bg-kakera-primary-800 border border-kakera-accent/50 hover:border-kakera-accent
                transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
              aria-label={`${rel.title} (${rel.relationType.replace(/_/g, ' ')}) — open detail`}
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
                {yearRange && (
                  <p className="text-[10px] text-kakera-muted mt-0.5">{yearRange}</p>
                )}
              </div>
            </button>
          )
        }

        // Not in library — show external links
        const anilistUrl = `https://anilist.co/anime/${rel.id}`
        return (
          <div
            key={rel.id}
            className="flex-shrink-0 w-32 flex flex-col gap-1.5 rounded-xl overflow-hidden
              bg-kakera-primary-800 border border-kakera-primary-700
              transition-colors"
          >
            <div className="relative">
              <img
                src={rel.coverImage}
                alt={rel.title}
                loading="lazy"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
                className="w-full aspect-[2/3] object-cover bg-kakera-primary-700"
              />
              {/* External link buttons overlay */}
              <div className="absolute bottom-1 right-1 flex gap-1">
                <a
                  href={anilistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded bg-black/60 hover:bg-kakera-accent text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-kakera-accent"
                  aria-label={`Open ${rel.title} on AniList`}
                  title="AniList"
                >
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
            <div className="px-2 pb-2">
              <p className="text-xs font-medium text-kakera-primary-300 truncate">{rel.title}</p>
              <Badge variant={RELATION_COLORS[rel.relationType]} className="mt-1 text-[10px]">
                {rel.relationType.replace(/_/g, ' ')}
              </Badge>
              {yearRange && (
                <p className="text-[10px] text-kakera-muted mt-0.5">{yearRange}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
