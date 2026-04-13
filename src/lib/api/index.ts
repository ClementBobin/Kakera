import type { TrackingService } from '@/types/anime'
import { AniListClient } from '@/lib/api/anilist'
import { MyAnimeListClient } from '@/lib/api/myanimelist'

export { AniListClient } from '@/lib/api/anilist'
export { MyAnimeListClient } from '@/lib/api/myanimelist'

export function createApiClient(service: TrackingService, token: string): AniListClient | MyAnimeListClient {
  if (service === 'anilist') return new AniListClient(token)
  return new MyAnimeListClient(token)
}
