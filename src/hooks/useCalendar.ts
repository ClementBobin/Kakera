import { useQuery } from '@tanstack/react-query'
import { isMockMode, MOCK_CALENDAR } from '@/mocks'
import type { AnimeCalendarEntry } from '@/types/anime'

interface CalendarRange {
  from: string
  to: string
}

export function useCalendarQuery(range: CalendarRange) {
  return useQuery<AnimeCalendarEntry[]>({
    queryKey: ['calendar', range.from, range.to],
    queryFn: async () => {
      if (isMockMode) return MOCK_CALENDAR
      return []
    },
  })
}
