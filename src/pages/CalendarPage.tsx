import { CalendarView } from '@/features/calendar/CalendarView'

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-white">Release Calendar</h1>
      <CalendarView />
    </div>
  )
}
