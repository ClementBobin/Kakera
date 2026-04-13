import { useState } from 'react'
import { useCalendarQuery } from '@/hooks/useCalendar'
import { useUiStore } from '@/stores/uiStore'
import { CalendarEntry } from '@/features/calendar/CalendarEntry'
import { Tabs } from '@/components/ui/Tabs'
import { Skeleton } from '@/components/ui/Skeleton'
import type { AnimeCalendarEntry } from '@/types/anime'

const TAB_ITEMS = [
  { value: 'list', label: 'List' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'calendar', label: 'Calendar' },
]

function groupByDay(entries: AnimeCalendarEntry[]): Map<string, AnimeCalendarEntry[]> {
  const map = new Map<string, AnimeCalendarEntry[]>()
  for (const entry of entries) {
    const day = entry.airingAt.slice(0, 10)
    const existing = map.get(day) ?? []
    existing.push(entry)
    map.set(day, existing)
  }
  return map
}

export function CalendarView() {
  const calendarView = useUiStore((s) => s.calendarView)
  const setCalendarView = useUiStore((s) => s.setCalendarView)
  const now = new Date()
  const from = now.toISOString()
  const to = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()
  const { data: entries = [], isLoading } = useCalendarQuery({ from, to })

  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const grouped = groupByDay(entries)
  const sortedDays = Array.from(grouped.keys()).sort()

  const dayLabels: Record<string, string> = {}
  for (const day of sortedDays) {
    dayLabels[day] = new Date(day).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        items={TAB_ITEMS}
        value={calendarView}
        onChange={(v) => setCalendarView(v as typeof calendarView)}
      />

      {calendarView === 'list' && (
        <div className="flex flex-col gap-6">
          {sortedDays.map((day) => (
            <div key={day}>
              <h3 className="text-sm font-semibold text-kakera-muted mb-2">{dayLabels[day]}</h3>
              <div className="flex flex-col gap-2">
                {grouped.get(day)?.map((entry) => (
                  <CalendarEntry key={`${entry.animeId}-${entry.episodeNumber}`} entry={entry} />
                ))}
              </div>
            </div>
          ))}
          {sortedDays.length === 0 && (
            <p className="text-kakera-muted text-sm">No upcoming episodes in the next 14 days.</p>
          )}
        </div>
      )}

      {calendarView === 'timeline' && (
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4" style={{ minWidth: `${sortedDays.length * 200}px` }}>
            {sortedDays.map((day) => (
              <div key={day} className="flex-shrink-0 w-48">
                <h3 className="text-xs font-semibold text-kakera-muted mb-2">{dayLabels[day]}</h3>
                <div className="flex flex-col gap-2">
                  {grouped.get(day)?.map((entry) => (
                    <CalendarEntry key={`${entry.animeId}-${entry.episodeNumber}`} entry={entry} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {calendarView === 'calendar' && (
        <div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-xs text-kakera-muted text-center py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {sortedDays.map((day) => {
              const dayNum = new Date(day).getDate()
              const count = grouped.get(day)?.length ?? 0
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium
                    transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent
                    ${selectedDay === day ? 'bg-kakera-accent text-white' : count > 0 ? 'bg-kakera-primary-700 text-white hover:bg-kakera-primary-600' : 'bg-kakera-primary-900 text-kakera-muted'}`}
                  aria-label={`${dayLabels[day]}: ${count} episodes`}
                >
                  <span>{dayNum}</span>
                  {count > 0 && <span className="text-xs mt-0.5">{count}</span>}
                </button>
              )
            })}
          </div>
          {selectedDay && (
            <div className="mt-4 flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-white">{dayLabels[selectedDay]}</h3>
              {grouped.get(selectedDay)?.map((entry) => (
                <CalendarEntry key={`${entry.animeId}-${entry.episodeNumber}`} entry={entry} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
