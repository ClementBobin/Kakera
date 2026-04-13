import type { AnimeEntry } from '@/types/anime'

const MAL_API = 'https://api.myanimelist.net/v2'

interface MalStatus {
  status: string
  score: number
  num_episodes_watched: number
  updated_at: string
  start_date: string
}

interface MalAnime {
  id: number
  title: string
  main_picture: { medium: string; large: string } | null
  num_episodes: number
  genres: { id: number; name: string }[]
  start_season: { year: number; season: string } | null
  media_type: string
  list_status?: MalStatus
  related_anime?: { node: { id: number; title: string; main_picture: { medium: string } | null }; relation_type: string }[]
}

interface MalListResponse {
  data: { node: MalAnime; list_status: MalStatus }[]
  paging: { next?: string }
}

interface MalSearchResponse {
  data: { node: MalAnime }[]
}

function mapMalStatus(s: string): AnimeEntry['status'] {
  const map: Record<string, AnimeEntry['status']> = {
    watching: 'watching',
    completed: 'completed',
    on_hold: 'on_hold',
    dropped: 'dropped',
    plan_to_watch: 'plan_to_watch',
  }
  return map[s] ?? 'plan_to_watch'
}

function mapMalFormat(f: string): AnimeEntry['format'] {
  const map: Record<string, AnimeEntry['format']> = {
    tv: 'TV',
    movie: 'MOVIE',
    ova: 'OVA',
    ona: 'ONA',
    special: 'SPECIAL',
    music: 'MUSIC',
  }
  return map[f.toLowerCase()] ?? 'TV'
}

function mapMalSeason(s: string): AnimeEntry['season'] {
  const map: Record<string, AnimeEntry['season']> = {
    winter: 'WINTER',
    spring: 'SPRING',
    summer: 'SUMMER',
    fall: 'FALL',
  }
  return map[s.toLowerCase()] ?? null
}

function malAnimeToEntry(anime: MalAnime, listStatus?: MalStatus): AnimeEntry {
  return {
    id: String(anime.id),
    serviceId: { anilist: null, myanimelist: String(anime.id) },
    title: { romaji: anime.title, english: null, native: anime.title },
    coverImage: anime.main_picture?.large ?? anime.main_picture?.medium ?? '',
    bannerImage: null,
    status: listStatus ? mapMalStatus(listStatus.status) : 'plan_to_watch',
    progress: listStatus?.num_episodes_watched ?? 0,
    totalEpisodes: anime.num_episodes || null,
    score: listStatus ? (listStatus.score > 0 ? listStatus.score * 10 : null) : null,
    isFavorite: false,
    isDownloaded: false,
    downloadedEpisodes: [],
    lastWatched: null,
    lastUpdated: listStatus?.updated_at ?? new Date().toISOString(),
    addedAt: listStatus?.start_date ?? new Date().toISOString(),
    nextEpisodeAt: null,
    nextEpisodeNumber: null,
    genres: anime.genres.map((g) => g.name),
    studios: [],
    season: anime.start_season ? mapMalSeason(anime.start_season.season) : null,
    seasonYear: anime.start_season?.year ?? null,
    format: mapMalFormat(anime.media_type),
    source: 'myanimelist',
    localPath: null,
    language: null,
    relations: (anime.related_anime ?? []).map((r) => ({
      id: String(r.node.id),
      title: r.node.title,
      coverImage: r.node.main_picture?.medium ?? '',
      relationType: 'OTHER' as const,
      releaseYear: null,
      format: 'TV' as const,
    })),
  }
}

export class MyAnimeListClient {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private async get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${MAL_API}${path}`)
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${this.token}` },
    })
    if (!response.ok) {
      throw new Error(`MAL API error: ${response.statusText}`)
    }
    return response.json() as Promise<T>
  }

  async getUserLibrary(): Promise<AnimeEntry[]> {
    const fields = 'list_status,num_episodes,genres,start_season,media_type'
    const results: AnimeEntry[] = []
    let url: string | undefined = `/users/@me/animelist?fields=${fields}&limit=1000`

    while (url) {
      const page: MalListResponse = await this.get<MalListResponse>(
        url.startsWith('/') ? url : url.replace(MAL_API, '')
      )
      for (const item of page.data) {
        results.push(malAnimeToEntry(item.node, item.list_status))
      }
      url = page.paging.next
    }

    return results
  }

  async searchAnime(query: string): Promise<AnimeEntry[]> {
    const fields = 'num_episodes,genres,start_season,media_type'
    const data = await this.get<MalSearchResponse>('/anime', { q: query, fields, limit: '20' })
    return data.data.map((item) => malAnimeToEntry(item.node))
  }

  async getAnimeDetails(id: number): Promise<AnimeEntry> {
    const fields = 'num_episodes,genres,start_season,media_type,related_anime,main_picture'
    const anime = await this.get<MalAnime>(`/anime/${id}`, { fields })
    return malAnimeToEntry(anime)
  }
}
