import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { useUiStore } from '@/stores/uiStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useLibraryStore } from '@/stores/libraryStore'
import { useAnimeDetails } from '@/hooks/useAnimeDetails'
import { RelationsTimeline } from '@/features/franchise/RelationsTimeline'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Input } from '@/components/ui/Input'
import { formatEpisodeProgress, formatScore, formatSeason, formatAiringDate } from '@/utils/format'
import { Download, Play, CheckCircle, Clock, Lock } from 'lucide-react'

// ── Episode row helpers ────────────────────────────────────────────────────────

interface EpisodeRowProps {
  episodeNumber: number
  isWatched: boolean
  isDownloaded: boolean
  isFuture: boolean
  futureAirDate?: string
  lastWatchedDate?: string | null
  onPlay: (ep: number) => void
}

function EpisodeRow({ episodeNumber, isWatched, isDownloaded, isFuture, futureAirDate, lastWatchedDate, onPlay }: EpisodeRowProps) {
  let rowClass = 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors'
  let icon = <Play size={12} className="shrink-0 text-kakera-muted" />
  let sub: React.ReactNode = null

  if (isFuture) {
    rowClass += ' bg-kakera-primary-800/50 opacity-60'
    icon = <Lock size={12} className="shrink-0 text-kakera-muted" />
    if (futureAirDate) {
      sub = <span className="text-[10px] text-kakera-muted">{formatAiringDate(futureAirDate)}</span>
    }
  } else if (isWatched) {
    rowClass += ' bg-kakera-primary-900'
    icon = <CheckCircle size={12} className="shrink-0 text-green-400" />
    if (lastWatchedDate) {
      sub = <span className="text-[10px] text-kakera-muted">{new Date(lastWatchedDate).toLocaleDateString()}</span>
    }
  } else {
    rowClass += ' bg-kakera-primary-800 hover:bg-kakera-primary-700 cursor-pointer'
    icon = <Play size={12} className="shrink-0 text-kakera-accent" />
  }

  return (
    <div
      className={rowClass}
      onClick={isFuture ? undefined : () => onPlay(episodeNumber)}
      role={isFuture ? undefined : 'button'}
      tabIndex={isFuture ? undefined : 0}
      onKeyDown={isFuture ? undefined : (e) => { if (e.key === 'Enter' || e.key === ' ') onPlay(episodeNumber) }}
      aria-label={`Episode ${episodeNumber}`}
    >
      {icon}
      <span className={`font-medium ${isWatched ? 'text-kakera-primary-400' : isFuture ? 'text-kakera-primary-500' : 'text-white'}`}>
        Ep {episodeNumber}
      </span>
      {sub && <span className="flex-1">{sub}</span>}
      {isDownloaded && !isFuture && (
        <Download size={10} className="shrink-0 text-green-400" />
      )}
      {isFuture && futureAirDate && (
        <Clock size={10} className="shrink-0 text-kakera-muted ml-auto" />
      )}
    </div>
  )
}

// ── Main AnimeDetail component ─────────────────────────────────────────────────

export function AnimeDetail() {
  const selectedAnimeId = useUiStore((s) => s.selectedAnimeId)
  const isDetailOpen = useUiStore((s) => s.isDetailOpen)
  const setIsDetailOpen = useUiStore((s) => s.setIsDetailOpen)
  const setSelectedAnimeId = useUiStore((s) => s.setSelectedAnimeId)
  const setFilter = useLibraryStore((s) => s.setFilter)
  const entries = useLibraryStore((s) => s.entries)
  const setEntries = useLibraryStore((s) => s.setEntries)
  const settings = useSettingsStore((s) => s.settings)
  const { data: anime, isLoading } = useAnimeDetails(selectedAnimeId ?? '')

  const [dlEpStart, setDlEpStart] = useState('')
  const [dlEpEnd, setDlEpEnd] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)

  if (!isDetailOpen) return null

  const close = () => {
    setIsDetailOpen(false)
    setSelectedAnimeId(null)
  }

  const handlePlay = async (ep?: number) => {
    if (!anime) return
    try {
      await invoke('launch_ani_cli', {
        slug: anime.title.romaji,
        episode: ep ?? anime.progress + 1,
        quality: settings.aniCliQuality,
      })
    } catch (error) {
      console.error('Failed to launch ani-cli:', error)
    }
  }

  const handleDownload = async () => {
    if (!anime) return
    const startRaw = parseInt(dlEpStart, 10)
    const endRaw = parseInt(dlEpEnd, 10)
    const maxEp = anime.totalEpisodes ?? anime.progress
    const start = dlEpStart && !isNaN(startRaw) && startRaw > 0 ? startRaw : 1
    const end = dlEpEnd && !isNaN(endRaw) && endRaw > 0 ? endRaw : maxEp
    if (start > end) {
      console.warn('Download range invalid: start > end')
      return
    }
    setIsDownloading(true)
    try {
      await invoke('download_anime', {
        slug: anime.title.romaji,
        episodeStart: start,
        episodeEnd: end,
        quality: settings.aniCliQuality,
        downloadDir: settings.downloadDir || null,
      })
    } catch (error) {
      console.error('Failed to download:', error)
    } finally {
      setIsDownloading(false)
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

  // Build episode list — show at least 1 episode if progress > 0 even when totalEpisodes is unknown
  const buildEpisodes = () => {
    if (!anime) return []
    const total = anime.totalEpisodes
      ?? Math.max(anime.progress, anime.nextEpisodeNumber ?? 0)
    // If we still have no information about episode count, skip the list
    if (total <= 0 && anime.progress === 0) return []
    const count = Math.max(total, anime.progress)
    return Array.from({ length: count }, (_, i) => i + 1)
  }

  /** Returns true when an episode number has not yet aired. */
  const isEpisodeFuture = (ep: number): boolean =>
    anime != null &&
    anime.nextEpisodeNumber != null &&
    ep >= anime.nextEpisodeNumber &&
    anime.nextEpisodeAt != null

  const episodes = anime ? buildEpisodes() : []
  const isCompleted = anime?.status === 'completed' || (anime?.totalEpisodes != null && anime.progress >= anime.totalEpisodes)

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
            <div className="relative h-48 bg-kakera-primary-800 shrink-0">
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

            {/* Cover + title */}
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
                {anime.title.english && anime.title.english !== anime.title.romaji && (
                  <p className="text-xs text-kakera-muted mt-0.5">{anime.title.english}</p>
                )}
                {anime.title.native && (
                  <p className="text-xs text-kakera-muted">{anime.title.native}</p>
                )}
                {isCompleted && anime.lastWatched && (
                  <p className="text-xs text-green-400 mt-1">
                    Completed · {new Date(anime.lastWatched).toLocaleDateString()}
                  </p>
                )}
                {/* Season / broadcast timeline */}
                {anime.season && anime.seasonYear && (
                  <p className="text-xs text-kakera-muted mt-0.5">{formatSeason(anime.season, anime.seasonYear)}</p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 flex flex-col gap-6">
              {/* Score + badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-kakera-accent">{formatScore(anime.score)}</span>
                  <span className="text-xs text-kakera-muted">/10</span>
                </div>
                <Badge variant="info" className="capitalize">{anime.status.replace(/_/g, ' ')}</Badge>
                <Badge variant="default">{anime.format}</Badge>
                {anime.addedAt && (
                  <span className="text-xs text-kakera-muted">Added {new Date(anime.addedAt).toLocaleDateString()}</span>
                )}
              </div>

              {/* Description */}
              {anime.description && (
                <p className="text-sm text-kakera-primary-300 leading-relaxed">{anime.description}</p>
              )}

              {/* Studio + genres metadata */}
              <div className="flex flex-col gap-2">
                {anime.studios.length > 0 && (
                  <div className="flex gap-2 items-start">
                    <span className="text-xs text-kakera-muted w-14 shrink-0 pt-0.5">Studio</span>
                    <div className="flex gap-1 flex-wrap">{anime.studios.map((s) => <Badge key={s}>{s}</Badge>)}</div>
                  </div>
                )}
                {anime.genres.length > 0 && (
                  <div className="flex gap-2 items-start">
                    <span className="text-xs text-kakera-muted w-14 shrink-0 pt-0.5">Genres</span>
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

              {/* Play + external links */}
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

              {/* Download section */}
              <div className="p-3 rounded-xl bg-kakera-primary-800 border border-kakera-primary-700 flex flex-col gap-3">
                <p className="text-xs font-semibold text-kakera-primary-300 uppercase tracking-wide">Download</p>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="From ep"
                    type="number"
                    min={1}
                    value={dlEpStart}
                    onChange={(e) => setDlEpStart(e.target.value)}
                    className="w-24"
                    aria-label="Download from episode"
                  />
                  <span className="text-kakera-muted text-sm">–</span>
                  <Input
                    placeholder="To ep"
                    type="number"
                    min={1}
                    value={dlEpEnd}
                    onChange={(e) => setDlEpEnd(e.target.value)}
                    className="w-24"
                    aria-label="Download to episode"
                  />
                  <Button
                    size="sm"
                    loading={isDownloading}
                    onClick={() => void handleDownload()}
                    aria-label="Download episodes"
                  >
                    <Download size={13} />
                    Download
                  </Button>
                </div>
                {settings.downloadDir && (
                  <p className="text-[10px] text-kakera-muted truncate">→ {settings.downloadDir}</p>
                )}
              </div>

              {/* Episode list */}
              {episodes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">Episodes</h3>
                  <div className="flex flex-col gap-1 max-h-72 overflow-y-auto scrollbar-thin">
                    {episodes.map((ep) => {
                      const isWatched = ep <= anime.progress
                      const isDownloaded = anime.downloadedEpisodes.includes(ep)
                      const isFuture = isEpisodeFuture(ep)
                      const futureAirDate = (isFuture && anime.nextEpisodeNumber === ep) ? (anime.nextEpisodeAt ?? undefined) : undefined
                      const watchedDate = (isWatched && ep === anime.progress) ? anime.lastWatched : null

                      return (
                        <EpisodeRow
                          key={ep}
                          episodeNumber={ep}
                          isWatched={isWatched}
                          isDownloaded={isDownloaded}
                          isFuture={isFuture}
                          futureAirDate={futureAirDate}
                          lastWatchedDate={watchedDate}
                          onPlay={(e) => void handlePlay(e)}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Relations timeline */}
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
