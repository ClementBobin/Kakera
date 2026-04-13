import { invoke } from '@tauri-apps/api/core'
import { useUiStore } from '@/stores/uiStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useLibraryStore } from '@/stores/libraryStore'
import { useAnimeDetails } from '@/hooks/useAnimeDetails'
import { RelationsTimeline } from '@/features/franchise/RelationsTimeline'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatEpisodeProgress, formatScore, formatSeason } from '@/utils/format'

export function AnimeDetail() {
  const selectedAnimeId = useUiStore((s) => s.selectedAnimeId)
  const isDetailOpen = useUiStore((s) => s.isDetailOpen)
  const setIsDetailOpen = useUiStore((s) => s.setIsDetailOpen)
  const setSelectedAnimeId = useUiStore((s) => s.setSelectedAnimeId)
  const setFilter = useLibraryStore((s) => s.setFilter)
  const entries = useLibraryStore((s) => s.entries)
  const setEntries = useLibraryStore((s) => s.setEntries)
  const aniCliQuality = useSettingsStore((s) => s.settings.aniCliQuality)
  const { data: anime, isLoading } = useAnimeDetails(selectedAnimeId ?? '')

  if (!isDetailOpen) return null

  const close = () => {
    setIsDetailOpen(false)
    setSelectedAnimeId(null)
  }

  const handlePlay = async () => {
    if (!anime) return
    try {
      await invoke('launch_ani_cli', {
        slug: anime.title.romaji,
        episode: anime.progress + 1,
        quality: aniCliQuality,
      })
    } catch (error) {
      console.error('Failed to launch ani-cli:', error)
    }
  }

  const incrementProgress = () => {
    if (!anime) return
    const updated = entries.map((e) =>
      e.id === anime.id
        ? { ...e, progress: Math.min(e.progress + 1, e.totalEpisodes ?? Infinity), lastWatched: new Date().toISOString() }
        : e
    )
    setEntries(updated)
  }

  const decrementProgress = () => {
    if (!anime) return
    const updated = entries.map((e) =>
      e.id === anime.id ? { ...e, progress: Math.max(0, e.progress - 1) } : e
    )
    setEntries(updated)
  }

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} aria-hidden="true" />
      <div className="relative ml-auto w-full max-w-xl h-full bg-kakera-primary-900 border-l border-kakera-primary-700 overflow-y-auto shadow-2xl">
        <button
          onClick={close}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg text-kakera-muted hover:text-white hover:bg-kakera-primary-700
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
          aria-label="Close detail panel"
        >
          ✕
        </button>

        {isLoading || !anime ? (
          <div className="p-6 flex flex-col gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <>
            {/* Banner */}
            <div className="relative h-48 bg-kakera-primary-800">
              {anime.bannerImage && (
                <img
                  src={anime.bannerImage}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-kakera-primary-900 to-transparent" />
            </div>

            <div className="px-6 -mt-16 relative flex gap-4">
              <img
                src={anime.coverImage}
                alt={anime.title.romaji}
                loading="lazy"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
                className="w-24 h-36 object-cover rounded-xl border-2 border-kakera-primary-700 flex-shrink-0 bg-kakera-primary-700"
              />
              <div className="flex-1 pt-16 min-w-0">
                <h2 className="text-lg font-bold text-white leading-tight">{anime.title.romaji}</h2>
                {anime.title.native && (
                  <p className="text-sm text-kakera-muted">{anime.title.native}</p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 flex flex-col gap-6">
              {/* Score + status + progress */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-bold text-kakera-accent">{formatScore(anime.score)}</span>
                  <span className="text-xs text-kakera-muted">/10</span>
                </div>
                <Badge variant="info" className="capitalize">{anime.status.replace(/_/g, ' ')}</Badge>
                <Badge variant="default">{anime.format}</Badge>
                {anime.season && anime.seasonYear && (
                  <Badge variant="default">{formatSeason(anime.season, anime.seasonYear)}</Badge>
                )}
              </div>

              {/* Progress editor */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-kakera-primary-300">Progress:</span>
                <button
                  onClick={decrementProgress}
                  className="w-7 h-7 rounded bg-kakera-primary-700 text-white hover:bg-kakera-primary-600
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
                  aria-label="Decrease progress"
                >
                  −
                </button>
                <span className="text-sm font-medium text-white tabular-nums">
                  {formatEpisodeProgress(anime.progress, anime.totalEpisodes)}
                </span>
                <button
                  onClick={incrementProgress}
                  className="w-7 h-7 rounded bg-kakera-primary-700 text-white hover:bg-kakera-primary-600
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
                  aria-label="Increase progress"
                >
                  +
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => void handlePlay()} aria-label="Play next episode">
                  ▶ Play Next
                </Button>
                {anime.serviceId.anilist && (
                  <Button
                    variant="ghost"
                    onClick={() => window.open(`https://anilist.co/anime/${anime.serviceId.anilist}`)}
                    aria-label="Open on AniList"
                  >
                    AniList ↗
                  </Button>
                )}
                {anime.serviceId.myanimelist && (
                  <Button
                    variant="ghost"
                    onClick={() => window.open(`https://myanimelist.net/anime/${anime.serviceId.myanimelist}`)}
                    aria-label="Open on MyAnimeList"
                  >
                    MAL ↗
                  </Button>
                )}
              </div>

              {/* Metadata */}
              <div className="flex flex-col gap-2">
                {anime.studios.length > 0 && (
                  <div className="flex gap-2 items-start">
                    <span className="text-xs text-kakera-muted w-16 flex-shrink-0 pt-0.5">Studio</span>
                    <div className="flex gap-1 flex-wrap">{anime.studios.map((s) => <Badge key={s}>{s}</Badge>)}</div>
                  </div>
                )}
                {anime.genres.length > 0 && (
                  <div className="flex gap-2 items-start">
                    <span className="text-xs text-kakera-muted w-16 flex-shrink-0 pt-0.5">Genres</span>
                    <div className="flex gap-1 flex-wrap">
                      {anime.genres.map((g) => (
                        <button
                          key={g}
                          onClick={() => { setFilter('genres', [g]); close() }}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent rounded"
                          aria-label={`Filter by genre ${g}`}
                        >
                          <Badge variant="default" className="cursor-pointer hover:bg-kakera-accent hover:text-white transition-colors">{g}</Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Relations */}
              {anime.relations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">Related</h3>
                  <RelationsTimeline
                    relations={anime.relations}
                    currentAnimeId={anime.id}
                    onSelect={(id) => { setSelectedAnimeId(id) }}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
