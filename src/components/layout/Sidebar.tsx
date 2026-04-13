import { useUiStore } from '@/stores/uiStore'
import { useLibraryStore } from '@/stores/libraryStore'

export interface SidebarProps {
  currentPage: 'library' | 'calendar' | 'collections'
  onNavigate: (page: 'library' | 'calendar' | 'collections') => void
  collapsed?: boolean
}

const NAV_ITEMS = [
  { page: 'library' as const, label: 'Library', icon: '📚' },
  { page: 'calendar' as const, label: 'Calendar', icon: '📅' },
  { page: 'collections' as const, label: 'Collections', icon: '🗂️' },
]

export function Sidebar({ currentPage, onNavigate, collapsed = false }: SidebarProps) {
  const setIsSettingsOpen = useUiStore((s) => s.setIsSettingsOpen)
  const isSyncing = useLibraryStore((s) => s.isSyncing)

  return (
    <nav
      aria-label="Main navigation"
      className={`flex flex-col h-full bg-kakera-primary-950 border-r border-kakera-primary-800 transition-all ${collapsed ? 'w-14' : 'w-52'}`}
    >
      <div className="h-14 flex items-center px-4 border-b border-kakera-primary-800">
        <span className="text-lg font-bold text-kakera-accent tracking-widest">
          {collapsed ? 'K' : 'KAKERA'}
        </span>
      </div>
      <div className="flex-1 flex flex-col gap-1 p-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent
              ${currentPage === item.page
                ? 'bg-kakera-accent text-white'
                : 'text-kakera-primary-300 hover:bg-kakera-primary-800 hover:text-white'
              }`}
            aria-label={item.label}
            aria-current={currentPage === item.page ? 'page' : undefined}
          >
            <span className="text-base flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </div>
      <div className="p-2 border-t border-kakera-primary-800">
        {isSyncing && (
          <div className={`flex items-center gap-2 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
            <span className="w-2 h-2 rounded-full bg-kakera-accent animate-pulse flex-shrink-0" aria-label="Syncing" />
            {!collapsed && <span className="text-xs text-kakera-muted">Syncing...</span>}
          </div>
        )}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
            text-kakera-primary-300 hover:bg-kakera-primary-800 hover:text-white transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
          aria-label="Open settings"
        >
          <span className="text-base flex-shrink-0">⚙️</span>
          {!collapsed && <span>Settings</span>}
        </button>
      </div>
    </nav>
  )
}
