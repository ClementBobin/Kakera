import { useAnimeDetails } from '@/hooks/useAnimeDetails'
import { RelationsTimeline } from '@/features/franchise/RelationsTimeline'
import { Skeleton } from '@/components/ui/Skeleton'

export interface FranchiseTreeProps {
  animeId: string
  onSelectAnime?: (id: string) => void
}

export function FranchiseTree({ animeId, onSelectAnime }: FranchiseTreeProps) {
  const { data: anime, isLoading } = useAnimeDetails(animeId)

  if (isLoading) {
    return (
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="w-32 h-52" />
        ))}
      </div>
    )
  }

  if (!anime || anime.relations.length === 0) {
    return <p className="text-kakera-muted text-sm">No related entries found.</p>
  }

  // Sort: prequels first, then current, then sequels, then others
  const order: Record<string, number> = { PREQUEL: 0, SEQUEL: 2, SIDE_STORY: 3, SPIN_OFF: 3, ALTERNATIVE: 4, SUMMARY: 4, OTHER: 5 }
  const sorted = [...anime.relations].sort((a, b) => (order[a.relationType] ?? 5) - (order[b.relationType] ?? 5))

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-white">Franchise</h3>
      <RelationsTimeline
        relations={sorted}
        currentAnimeId={animeId}
        onSelect={onSelectAnime}
      />
    </div>
  )
}
