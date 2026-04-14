import { invoke } from '@tauri-apps/api/core'
import type { AnimeEntry } from '@/types/anime'
import type { DisplayMode } from '@/types/settings'
import { useSettingsStore } from '@/stores/settingsStore'
import { useUiStore } from '@/stores/uiStore'
import { useLibraryStore } from '@/stores/libraryStore'
import { ContextMenu } from '@/components/ui/ContextMenu'
import { Badge } from '@/components/ui/Badge'
import { formatEpisodeProgress } from '@/utils/format'

export interface AnimeCardProps {
  entry: AnimeEntry
  displayMode: DisplayMode
}

export function AnimeCard({ entry, displayMode }: AnimeCardProps) {
  const overlay = useSettingsStore((s) => s.settings.overlay)
  const aniCliQuality = useSettingsStore((s) => s.settings.aniCliQuality)
  const setSelectedAnimeId = useUiStore((s) => s.setSelectedAnimeId)
  const setIsDetailOpen = useUiStore((s) => s.setIsDetailOpen)
  const entries = useLibraryStore((s) => s.entries)
  const setEntries = useLibraryStore((s) => s.setEntries)

  const unwatched = entry.totalEpisodes != null ? entry.totalEpisodes - entry.progress : null

  const openDetail = () => {
    setSelectedAnimeId(entry.id)
    setIsDetailOpen(true)
  }

  const handlePlay = async () => {
    const nextEp = entry.progress + 1
    try {
      await invoke('launch_ani_cli', {
        slug: entry.title.romaji,
        episode: nextEp,
        quality: aniCliQuality,
      })
    } catch (error) {
      console.error('Failed to launch ani-cli:', error)
    }
  }

  const handleMarkWatched = () => {
    const updated = entries.map((e) =>
      e.id === entry.id
        ? { ...e, progress: e.totalEpisodes ?? e.progress, status: 'completed' as const, lastWatched: new Date().toISOString() }
        : e
    )
    setEntries(updated)
  }

  const contextItems = [
    { label: 'Play', onClick: () => void handlePlay() },
    { label: 'Resume', onClick: () => void handlePlay() },
    { label: 'Mark as Watched', onClick: handleMarkWatched, dividerAfter: true },
    ...(entry.serviceId.anilist
      ? [{ label: 'Open on AniList', onClick: () => window.open(`https://anilist.co/anime/${entry.serviceId.anilist}`) }]
      : []),
    ...(entry.serviceId.myanimelist
      ? [{ label: 'Open on MyAnimeList', onClick: () => window.open(`https://myanimelist.net/anime/${entry.serviceId.myanimelist}`) }]
      : []),
  ]

  if (displayMode === 'list') {
    return (
      <ContextMenu items={contextItems}>
        <button
          onClick={openDetail}
          className="flex items-center gap-3 w-full p-3 rounded-xl bg-kakera-primary-800 border border-kakera-primary-700
            hover:border-kakera-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
          aria-label={`Open details for ${entry.title.romaji}`}
        >
          <img
            src={entry.coverImage}
            alt={entry.title.romaji}
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
            className="w-10 h-14 object-cover rounded-md flex-shrink-0 bg-kakera-primary-700"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{entry.title.romaji}</p>
            {entry.title.english && (
              <p className="text-xs text-kakera-muted truncate">{entry.title.english}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-kakera-muted">{formatEpisodeProgress(entry.progress, entry.totalEpisodes)}</span>
            {entry.isDownloaded && overlay.showDownloadedCount && (
              <Badge variant="success">DL</Badge>
            )}
          </div>
        </button>
      </ContextMenu>
    )
  }

  return (
    <ContextMenu items={contextItems}>
      <div className="group relative rounded-xl overflow-hidden bg-kakera-primary-800 border border-kakera-primary-700
        hover:border-kakera-accent transition-colors cursor-pointer"
        onClick={openDetail}
        role="button"
        tabIndex={0}
        aria-label={`Open details for ${entry.title.romaji}`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openDetail() }}
      >
        {/* Cover image */}
        <div className="relative aspect-[2/3] overflow-hidden bg-kakera-primary-700">
          <img
            src={entry.coverImage}
            alt={entry.title.romaji}
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
            className="w-full h-full object-cover"
          />
          {/* Overlay badges */}
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 items-start">
            {overlay.showUnwatchedCount && unwatched !== null && unwatched > 0 && (
              <Badge variant="info">{unwatched} new</Badge>
            )}
            {overlay.showDownloadedCount && entry.isDownloaded && (
              <Badge variant="success">DL</Badge>
            )}
            {overlay.showLanguage && entry.language && (
              <Badge variant="default">{entry.language}</Badge>
            )}
          </div>
          {overlay.showLocalSource && entry.localPath && (
            <div className="absolute top-1.5 right-1.5">
              <Badge variant="warning">Local</Badge>
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
            {overlay.showResumeButton && entry.progress > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); void handlePlay() }}
                className="px-3 py-1.5 bg-kakera-accent rounded-lg text-xs font-medium text-white
                  hover:bg-kakera-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label={`Resume ${entry.title.romaji}`}
              >
                ▶ Resume
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); void handlePlay() }}
              className="px-3 py-1.5 bg-white/20 rounded-lg text-xs font-medium text-white
                hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label={`Play ${entry.title.romaji}`}
            >
              Play
            </button>
          </div>
        </div>
        {/* Title and meta */}
        {displayMode !== 'grid_cover_only' && (
          <div className="p-2">
            <p className="text-xs font-medium text-white truncate leading-snug">{entry.title.romaji}</p>
            {displayMode === 'grid_spacious' && (
              <p className="text-[10px] text-kakera-muted mt-0.5">{formatEpisodeProgress(entry.progress, entry.totalEpisodes)}</p>
            )}
          </div>
        )}
      </div>
    </ContextMenu>
  )
}
