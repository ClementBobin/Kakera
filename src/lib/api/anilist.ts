import type { AnimeEntry, AnimeCalendarEntry, MediaSeason } from '@/types/anime'

const ANILIST_API = 'https://graphql.anilist.co'

const LIBRARY_QUERY = `
query ($userId: Int) {
  MediaListCollection(userId: $userId, type: ANIME) {
    lists {
      entries {
        id
        status
        score(format: POINT_100)
        progress
        updatedAt
        createdAt
        media {
          id
          title { romaji english native }
          coverImage { large }
          bannerImage
          episodes
          genres
          studios(isMain: true) { nodes { name } }
          season
          seasonYear
          format
          nextAiringEpisode { airingAt episode }
          relations {
            edges {
              relationType
              node {
                id
                title { romaji }
                coverImage { large }
                startDate { year }
                format
              }
            }
          }
        }
      }
    }
  }
}
`

const SEARCH_QUERY = `
query ($query: String) {
  Page(page: 1, perPage: 20) {
    media(type: ANIME, search: $query) {
      id
      title { romaji english native }
      coverImage { large }
      bannerImage
      episodes
      genres
      studios(isMain: true) { nodes { name } }
      season
      seasonYear
      format
    }
  }
}
`

const DETAILS_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english native }
    coverImage { large }
    bannerImage
    episodes
    genres
    studios(isMain: true) { nodes { name } }
    season
    seasonYear
    format
    nextAiringEpisode { airingAt episode }
    relations {
      edges {
        relationType
        node {
          id
          title { romaji }
          coverImage { large }
          startDate { year }
          format
        }
      }
    }
  }
}
`

const CALENDAR_QUERY = `
query ($season: MediaSeason, $year: Int) {
  Page(page: 1, perPage: 50) {
    airingSchedules(season: $season, seasonYear: $year, notYetAired: true) {
      id
      airingAt
      episode
      media {
        id
        title { romaji english native }
        coverImage { large }
      }
    }
  }
}
`

interface AniListTitle {
  romaji: string
  english: string | null
  native: string
}

interface AniListCoverImage {
  large: string
}

interface AniListStudioNode {
  name: string
}

interface AniListStudios {
  nodes: AniListStudioNode[]
}

interface AniListRelationNode {
  id: number
  title: AniListTitle
  coverImage: AniListCoverImage
  startDate: { year: number | null }
  format: string
}

interface AniListRelationEdge {
  relationType: string
  node: AniListRelationNode
}

interface AniListRelations {
  edges: AniListRelationEdge[]
}

interface AniListNextAiring {
  airingAt: number
  episode: number
}

interface AniListMedia {
  id: number
  title: AniListTitle
  coverImage: AniListCoverImage
  bannerImage: string | null
  episodes: number | null
  genres: string[]
  studios: AniListStudios
  season: string | null
  seasonYear: number | null
  format: string
  nextAiringEpisode: AniListNextAiring | null
  relations: AniListRelations
}

interface AniListListEntry {
  id: number
  status: string
  score: number
  progress: number
  updatedAt: number
  createdAt: number
  media: AniListMedia
}

interface AniListList {
  entries: AniListListEntry[]
}

interface AniListSchedule {
  id: number
  airingAt: number
  episode: number
  media: {
    id: number
    title: AniListTitle
    coverImage: AniListCoverImage
  }
}

function mapStatus(s: string): AnimeEntry['status'] {
  const map: Record<string, AnimeEntry['status']> = {
    CURRENT: 'watching',
    COMPLETED: 'completed',
    PAUSED: 'on_hold',
    DROPPED: 'dropped',
    PLANNING: 'plan_to_watch',
  }
  return map[s] ?? 'plan_to_watch'
}

function mapFormat(f: string): AnimeEntry['format'] {
  const map: Record<string, AnimeEntry['format']> = {
    TV: 'TV',
    MOVIE: 'MOVIE',
    OVA: 'OVA',
    ONA: 'ONA',
    SPECIAL: 'SPECIAL',
    MUSIC: 'MUSIC',
  }
  return map[f] ?? 'TV'
}

function mapRelationType(r: string): AnimeEntry['relations'][number]['relationType'] {
  const map: Record<string, AnimeEntry['relations'][number]['relationType']> = {
    PREQUEL: 'PREQUEL',
    SEQUEL: 'SEQUEL',
    SIDE_STORY: 'SIDE_STORY',
    SPIN_OFF: 'SPIN_OFF',
    ALTERNATIVE: 'ALTERNATIVE',
    SUMMARY: 'SUMMARY',
    OTHER: 'OTHER',
  }
  return map[r] ?? 'OTHER'
}

function mediaToEntry(media: AniListMedia, listEntry?: AniListListEntry): AnimeEntry {
  return {
    id: String(media.id),
    serviceId: { anilist: String(media.id), myanimelist: null },
    title: {
      romaji: media.title.romaji,
      english: media.title.english,
      native: media.title.native,
    },
    coverImage: media.coverImage.large,
    bannerImage: media.bannerImage,
    status: listEntry ? mapStatus(listEntry.status) : 'plan_to_watch',
    progress: listEntry?.progress ?? 0,
    totalEpisodes: media.episodes,
    score: listEntry?.score ?? null,
    isFavorite: false,
    isDownloaded: false,
    downloadedEpisodes: [],
    lastWatched: null,
    lastUpdated: listEntry ? new Date(listEntry.updatedAt * 1000).toISOString() : new Date().toISOString(),
    addedAt: listEntry ? new Date(listEntry.createdAt * 1000).toISOString() : new Date().toISOString(),
    nextEpisodeAt: media.nextAiringEpisode
      ? new Date(media.nextAiringEpisode.airingAt * 1000).toISOString()
      : null,
    nextEpisodeNumber: media.nextAiringEpisode?.episode ?? null,
    genres: media.genres,
    studios: media.studios.nodes.map((n) => n.name),
    season: media.season as AnimeEntry['season'],
    seasonYear: media.seasonYear,
    format: mapFormat(media.format),
    source: 'anilist',
    description: null,
    localPath: null,
    language: null,
    relations: media.relations.edges.map((e) => ({
      id: String(e.node.id),
      title: e.node.title.romaji,
      coverImage: e.node.coverImage.large,
      relationType: mapRelationType(e.relationType),
      releaseYear: e.node.startDate.year,
      format: mapFormat(e.node.format),
    })),
  }
}

export class AniListClient {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private async query<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ query, variables }),
    })
    if (!response.ok) {
      throw new Error(`AniList API error: ${response.statusText}`)
    }
    const json = await response.json() as { data: T; errors?: { message: string }[] }
    if (json.errors?.length) {
      throw new Error(json.errors[0].message)
    }
    return json.data
  }

  async getViewerLibrary(): Promise<AnimeEntry[]> {
    const data = await this.query<{ MediaListCollection: { lists: AniListList[] } }>(
      LIBRARY_QUERY,
      { userId: null }
    )
    return data.MediaListCollection.lists.flatMap((list) =>
      list.entries.map((entry) => mediaToEntry(entry.media, entry))
    )
  }

  async searchAnime(query: string): Promise<AnimeEntry[]> {
    const data = await this.query<{ Page: { media: AniListMedia[] } }>(
      SEARCH_QUERY,
      { query }
    )
    return data.Page.media.map((m) => mediaToEntry(m))
  }

  async getAnimeDetails(id: number): Promise<AnimeEntry> {
    const data = await this.query<{ Media: AniListMedia }>(DETAILS_QUERY, { id })
    return mediaToEntry(data.Media)
  }

  async getSeasonalCalendar(season: MediaSeason, year: number): Promise<AnimeCalendarEntry[]> {
    const data = await this.query<{ Page: { airingSchedules: AniListSchedule[] } }>(
      CALENDAR_QUERY,
      { season, year }
    )
    return data.Page.airingSchedules.map((s) => ({
      animeId: String(s.media.id),
      title: s.media.title.romaji,
      coverImage: s.media.coverImage.large,
      episodeNumber: s.episode,
      airingAt: new Date(s.airingAt * 1000).toISOString(),
      isInLibrary: false,
      isNewSeason: false,
    }))
  }
}
