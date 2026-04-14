import { SettingsPanel } from '@/features/settings/SettingsPanel'
import { AnimeDetail } from '@/features/library/AnimeDetail'
import { useUiStore } from '@/stores/uiStore'
import { Dialog } from '@/components/ui/Dialog'
import { Library, Calendar, Settings, RefreshCw } from 'lucide-react'
import { useLibraryStore } from '@/stores/libraryStore'
import { Tooltip } from '@/components/ui/Tooltip'

export interface AppLayoutProps {
  currentPage: 'library' | 'calendar'
  onNavigate: (page: 'library' | 'calendar') => void
  children: React.ReactNode
}

const NAV_ITEMS = [
  { page: 'library' as const, label: 'Library', Icon: Library },
  { page: 'calendar' as const, label: 'Calendar', Icon: Calendar },
]

export function AppLayout({ currentPage, onNavigate, children }: AppLayoutProps) {
  const isSettingsOpen = useUiStore((s) => s.isSettingsOpen)
  const setIsSettingsOpen = useUiStore((s) => s.setIsSettingsOpen)
  const isSyncing = useLibraryStore((s) => s.isSyncing)

  return (
    <div className="flex flex-col h-screen bg-kakera-primary-950 text-white overflow-hidden">
      {/* Top navigation bar — also acts as drag region for the Tauri window */}
      <nav
        data-tauri-drag-region
        aria-label="Main navigation"
        className="flex items-center px-4 h-10 bg-kakera-primary-900 border-b border-kakera-primary-800 shrink-0"
      >
        {/* Left spacer */}
        <div className="flex-1" data-tauri-drag-region />

        {/* Centered page tabs — not drag region so clicks work */}
        <div className="flex items-center gap-1" role="tablist">
          {NAV_ITEMS.map(({ page, label, Icon }) => (
            <Tooltip key={page} content={label}>
              <button
                role="tab"
                aria-selected={currentPage === page}
                aria-label={label}
                onClick={() => onNavigate(page)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent
                  ${currentPage === page
                    ? 'bg-kakera-accent text-white'
                    : 'text-kakera-primary-400 hover:bg-kakera-primary-800 hover:text-white'
                  }`}
              >
                <Icon size={16} strokeWidth={1.75} />
              </button>
            </Tooltip>
          ))}
        </div>

        {/* Right: syncing indicator + settings */}
        <div className="flex-1 flex items-center justify-end gap-1">
          {isSyncing && (
            <RefreshCw size={13} className="text-kakera-accent animate-spin" aria-label="Syncing" />
          )}
          <Tooltip content="Settings">
            <button
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Open settings"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-kakera-primary-400
                hover:bg-kakera-primary-800 hover:text-white transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
            >
              <Settings size={16} strokeWidth={1.75} />
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
