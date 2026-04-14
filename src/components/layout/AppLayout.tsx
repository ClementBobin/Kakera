import { TitleBar } from '@/components/layout/TitleBar'
import { SettingsPanel } from '@/features/settings/SettingsPanel'
import { AnimeDetail } from '@/features/library/AnimeDetail'
import { useUiStore } from '@/stores/uiStore'
import { Dialog } from '@/components/ui/Dialog'
import { Library, Calendar, Layers, Settings, RefreshCw } from 'lucide-react'
import { useLibraryStore } from '@/stores/libraryStore'
import { Tooltip } from '@/components/ui/Tooltip'

export interface AppLayoutProps {
  currentPage: 'library' | 'calendar' | 'collections'
  onNavigate: (page: 'library' | 'calendar' | 'collections') => void
  children: React.ReactNode
}

const NAV_ITEMS = [
  { page: 'library' as const, label: 'Library', Icon: Library },
  { page: 'calendar' as const, label: 'Calendar', Icon: Calendar },
  { page: 'collections' as const, label: 'Collections', Icon: Layers },
]

export function AppLayout({ currentPage, onNavigate, children }: AppLayoutProps) {
  const isSettingsOpen = useUiStore((s) => s.isSettingsOpen)
  const setIsSettingsOpen = useUiStore((s) => s.setIsSettingsOpen)
  const isSyncing = useLibraryStore((s) => s.isSyncing)

  return (
    <div className="flex flex-col h-screen bg-kakera-primary-950 text-white overflow-hidden">
      <TitleBar />
      {/* Top navigation bar */}
      <nav
        aria-label="Main navigation"
        className="flex items-center px-4 h-12 bg-kakera-primary-900 border-b border-kakera-primary-800 shrink-0"
      >
        {/* Left spacer */}
        <div className="flex-1" />

        {/* Centered page tabs */}
        <div className="flex items-center gap-1" role="tablist">
          {NAV_ITEMS.map(({ page, label, Icon }) => (
            <Tooltip key={page} content={label}>
              <button
                role="tab"
                aria-selected={currentPage === page}
                aria-label={label}
                onClick={() => onNavigate(page)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent
                  ${currentPage === page
                    ? 'bg-kakera-accent text-white'
                    : 'text-kakera-primary-400 hover:bg-kakera-primary-800 hover:text-white'
                  }`}
              >
                <Icon size={18} strokeWidth={1.75} />
              </button>
            </Tooltip>
          ))}
        </div>

        {/* Right: syncing indicator + settings */}
        <div className="flex-1 flex items-center justify-end gap-2">
          {isSyncing && (
            <RefreshCw size={14} className="text-kakera-accent animate-spin" aria-label="Syncing" />
          )}
          <Tooltip content="Settings">
            <button
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Open settings"
              className="w-10 h-10 flex items-center justify-center rounded-lg text-kakera-primary-400
                hover:bg-kakera-primary-800 hover:text-white transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
            >
              <Settings size={18} strokeWidth={1.75} />
            </button>
          </Tooltip>
        </div>
      </nav>

      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>

      <Dialog open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Settings" className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <SettingsPanel />
      </Dialog>
      <AnimeDetail />
    </div>
  )
}
