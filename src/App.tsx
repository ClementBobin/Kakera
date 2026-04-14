import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { applyTheme } from '@/lib/theme'
import { useSettingsStore } from '@/stores/settingsStore'
import LibraryPage from '@/pages/LibraryPage'
import CalendarPage from '@/pages/CalendarPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

function AppInner() {
  const [currentPage, setCurrentPage] = useState<'library' | 'calendar'>('library')
  const settings = useSettingsStore((s) => s.settings)

  useEffect(() => {
    applyTheme(settings.theme, settings.themePreset)
  }, [settings.theme, settings.themePreset])

  return (
    <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'library' && <LibraryPage />}
      {currentPage === 'calendar' && <CalendarPage />}
    </AppLayout>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  )
}
