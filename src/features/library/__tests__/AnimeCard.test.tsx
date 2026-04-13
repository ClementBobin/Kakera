import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimeCard } from '@/features/library/AnimeCard'
import { MOCK_ANIME } from '@/mocks/anime'
import { useSettingsStore } from '@/stores/settingsStore'

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

const entry = MOCK_ANIME[0]

describe('AnimeCard', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      settings: {
        ...useSettingsStore.getState().settings,
        overlay: {
          showDownloadedCount: true,
          showUnwatchedCount: true,
          showLocalSource: true,
          showLanguage: true,
          showResumeButton: true,
        },
      },
    })
  })

  it('renders cover image', () => {
    renderWithProviders(<AnimeCard entry={entry} displayMode="grid_compact" />)
    const img = screen.getAllByRole('img')[0]
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', entry.coverImage)
  })

  it('shows unwatched badge when overlay enabled and unwatched count > 0', () => {
    const entryWithUnwatched = { ...entry, progress: 0, totalEpisodes: 12 }
    renderWithProviders(<AnimeCard entry={entryWithUnwatched} displayMode="grid_compact" />)
    expect(screen.getByText(/12 new/i)).toBeInTheDocument()
  })

  it('hides unwatched badge when overlay disabled', () => {
    useSettingsStore.setState({
      settings: {
        ...useSettingsStore.getState().settings,
        overlay: {
          showDownloadedCount: false,
          showUnwatchedCount: false,
          showLocalSource: false,
          showLanguage: false,
          showResumeButton: false,
        },
      },
    })
    const entryWithUnwatched = { ...entry, progress: 0, totalEpisodes: 12 }
    renderWithProviders(<AnimeCard entry={entryWithUnwatched} displayMode="grid_compact" />)
    expect(screen.queryByText(/12 new/i)).not.toBeInTheDocument()
  })
})
