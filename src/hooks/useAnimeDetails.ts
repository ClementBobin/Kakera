import { useQuery } from '@tanstack/react-query'
import { isMockMode, MOCK_ANIME } from '@/mocks'
import type { AnimeEntry } from '@/types/anime'

export function useAnimeDetails(id: string) {
  return useQuery<AnimeEntry | null>({
    queryKey: ['animeDetails', id],
    queryFn: async () => {
      if (isMockMode) {
        return MOCK_ANIME.find((a) => a.id === id) ?? null
      }
      return null
    },
    enabled: !!id,
  })
}
