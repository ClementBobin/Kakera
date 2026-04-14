import { useMemo, useState } from 'react'
import { useCalendarQuery } from '@/hooks/useCalendar'
import { useUiStore } from '@/stores/uiStore'
import { CalendarEntry } from '@/features/calendar/CalendarEntry'
import { Tabs } from '@/components/ui/Tabs'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tooltip } from '@/components/ui/Tooltip'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import type { AnimeCalendarEntry } from '@/types/anime'

const TAB_ITEMS = [
  { value: 'list', label: 'List' },
  { value: 'calendar', label: 'Calendar' },
]

// Hashed deterministic colour for an animeId (for pastilles)
function animeColor(id: string): string {
  const COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
  ]
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return COLORS[hash % COLORS.length]
}

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

function formatDayLabel(day: string): string {
  return new Date(day + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export function CalendarView() {
  const calendarView = useUiStore((s) => s.calendarView)
  const setCalendarView = useUiStore((s) => s.setCalendarView)

  // Fetch a wide window so the month view never needs to re-fetch when navigating
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const to   = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString()
  const { data: entries = [], isLoading } = useCalendarQuery({ from, to })

  // Current displayed month (year+month)
  const [displayDate, setDisplayDate] = useState(() => ({
    year: now.getFullYear(),
    month: now.getMonth(), // 0-indexed
  }))

  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const grouped = useMemo(() => groupByDay(entries), [entries])
  const sortedDays = useMemo(() => Array.from(grouped.keys()).sort(), [grouped])

  // Month navigation
  const prevMonth = () =>
    setDisplayDate(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    )
  const nextMonth = () =>
    setDisplayDate(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    )
  const goToToday = () => setDisplayDate({ year: now.getFullYear(), month: now.getMonth() })

  const monthLabel = new Date(displayDate.year, displayDate.month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  // Build the full month grid (42 cells = 6 weeks)
  const calendarCells: { date: Date; dayStr: string | null }[] = useMemo(() => {
    const firstOfMonth = new Date(displayDate.year, displayDate.month, 1)
    const firstDayOfWeek = firstOfMonth.getDay() // 0 = Sun
    const daysInMonth = new Date(displayDate.year, displayDate.month + 1, 0).getDate()

    const cells: { date: Date; dayStr: string | null }[] = []

    // Leading empty cells
    for (let i = 0; i < firstDayOfWeek; i++) {
      const d = new Date(displayDate.year, displayDate.month, -firstDayOfWeek + 1 + i)
      cells.push({ date: d, dayStr: null })
    }
    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(displayDate.year, displayDate.month, d)
      const dayStr = date.toISOString().slice(0, 10)
      cells.push({ date, dayStr })
    }
    // Trailing cells to complete the 6-row grid
    while (cells.length % 7 !== 0) {
      const d = new Date(displayDate.year, displayDate.month + 1, cells.length - firstDayOfWeek - daysInMonth + 1)
      cells.push({ date: d, dayStr: null })
    }
    return cells
  }, [displayDate])

  const todayStr = now.toISOString().slice(0, 10)

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

      {/* ── List view ── */}
      {calendarView === 'list' && (
        <div className="flex flex-col gap-6">
          {sortedDays.filter((d) => d >= todayStr).map((day) => (
            <div key={day}>
              <h3 className="text-sm font-semibold text-kakera-muted mb-2">{formatDayLabel(day)}</h3>
              <div className="flex flex-col gap-2">
                {grouped.get(day)?.map((entry) => (
                  <CalendarEntry key={`${entry.animeId}-${entry.episodeNumber}`} entry={entry} />
                ))}
              </div>
            </div>
          ))}
          {sortedDays.filter((d) => d >= todayStr).length === 0 && (
            <p className="text-kakera-muted text-sm">No upcoming episodes in the next few weeks.</p>
          )}
        </div>
      )}

      {/* ── Calendar (month grid) view ── */}
      {calendarView === 'calendar' && (
        <div className="flex flex-col gap-3">
          {/* Month header */}
          <div className="flex items-center gap-2">
            <Tooltip content="Previous month">
              <button
                onClick={prevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-kakera-primary-400
                  hover:bg-kakera-primary-700 hover:text-white transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
            </Tooltip>
            <span className="flex-1 text-center text-sm font-semibold text-white">{monthLabel}</span>
            <Tooltip content="Next month">
              <button
                onClick={nextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-kakera-primary-400
                  hover:bg-kakera-primary-700 hover:text-white transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </Tooltip>
            <Tooltip content="Go to today">
              <button
                onClick={goToToday}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-kakera-primary-400
                  hover:bg-kakera-primary-700 hover:text-white transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
                aria-label="Go to today"
              >
                <CalendarDays size={15} />
              </button>
            </Tooltip>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-[10px] text-kakera-muted text-center py-1 font-medium tracking-wide">{d}</div>
            ))}
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map(({ date, dayStr }, idx) => {
              const isCurrentMonth = dayStr !== null
              // Safe: dayStr is non-null when isCurrentMonth is true
              const ds = dayStr ?? ''
              const isPast = isCurrentMonth && ds < todayStr
              const isToday = isCurrentMonth && ds === todayStr
              const events = isCurrentMonth ? (grouped.get(ds) ?? []) : []
              const isSelected = isCurrentMonth && ds === selectedDay

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (!isCurrentMonth) return
                    setSelectedDay(ds === selectedDay ? null : ds)
                  }}
                  disabled={!isCurrentMonth}
                  className={`relative flex flex-col items-center justify-start pt-1 pb-2 rounded-lg min-h-[3.5rem]
                    transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent
                    ${!isCurrentMonth ? 'opacity-0 pointer-events-none' : ''}
                    ${isSelected ? 'bg-kakera-accent text-white' : ''}
                    ${!isSelected && isToday ? 'bg-kakera-accent/20 ring-1 ring-kakera-accent text-white' : ''}
                    ${!isSelected && !isToday && isPast ? 'bg-kakera-primary-900 text-kakera-muted' : ''}
                    ${!isSelected && !isToday && !isPast && isCurrentMonth && events.length === 0 ? 'bg-kakera-primary-800 text-kakera-primary-300 hover:bg-kakera-primary-700' : ''}
                    ${!isSelected && !isToday && !isPast && events.length > 0 ? 'bg-kakera-primary-800 text-white hover:bg-kakera-primary-700' : ''}
                  `}
                  aria-label={isCurrentMonth ? `${formatDayLabel(ds)}${events.length > 0 ? `: ${events.length} episode${events.length > 1 ? 's' : ''}` : ''}` : undefined}
                  aria-pressed={isSelected}
                >
                  <span className={`text-xs font-medium ${isToday && !isSelected ? 'text-kakera-accent font-bold' : ''}`}>
                    {isCurrentMonth ? date.getDate() : ''}
                  </span>
                  {/* Event pastilles */}
                  {events.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-0.5 mt-0.5 px-1">
                      {events.slice(0, 4).map((ev) => (
                        <span
                          key={ev.animeId}
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: isSelected ? 'white' : animeColor(ev.animeId) }}
                          aria-hidden
                        />
                      ))}
                      {events.length > 4 && (
                        <span className={`text-[8px] leading-none ${isSelected ? 'text-white/70' : 'text-kakera-muted'}`}>+{events.length - 4}</span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Selected day events */}
          {selectedDay && grouped.has(selectedDay) && (
            <div className="mt-2 flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-white">{formatDayLabel(selectedDay)}</h3>
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
