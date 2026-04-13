import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LibraryFilters } from '@/features/library/LibraryFilters'
import { useLibraryStore } from '@/stores/libraryStore'

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('LibraryFilters', () => {
  beforeEach(() => {
    useLibraryStore.setState({ filters: useLibraryStore.getState().filters, entries: [] })
  })

  it('renders search input', () => {
    renderWithProviders(<LibraryFilters />)
    expect(screen.getByRole('textbox', { name: /search anime/i })).toBeInTheDocument()
  })

  it('changing search input updates store filter', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LibraryFilters />)
    const input = screen.getByRole('textbox', { name: /search anime/i })
    await user.type(input, 'naruto')
    expect(useLibraryStore.getState().filters.search).toBe('naruto')
  })
})
