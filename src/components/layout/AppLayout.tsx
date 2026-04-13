import { useState } from 'react'
import { TitleBar } from '@/components/layout/TitleBar'
import { Sidebar } from '@/components/layout/Sidebar'
import { SettingsPanel } from '@/features/settings/SettingsPanel'
import { AnimeDetail } from '@/features/library/AnimeDetail'
import { useUiStore } from '@/stores/uiStore'
import { Dialog } from '@/components/ui/Dialog'

export interface AppLayoutProps {
  currentPage: 'library' | 'calendar' | 'collections'
  onNavigate: (page: 'library' | 'calendar' | 'collections') => void
  children: React.ReactNode
}

export function AppLayout({ currentPage, onNavigate, children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const isSettingsOpen = useUiStore((s) => s.isSettingsOpen)
  const setIsSettingsOpen = useUiStore((s) => s.setIsSettingsOpen)

  return (
    <div className="flex flex-col h-screen bg-kakera-surface-dark text-white overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 min-h-0">
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} collapsed={collapsed} />
        <div className="flex flex-col flex-1 min-w-0">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="absolute z-10 mt-14 ml-0 p-1 text-kakera-muted hover:text-white
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{ left: collapsed ? '3.5rem' : '13rem' }}
          >
            {collapsed ? '›' : '‹'}
          </button>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
      <Dialog open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Settings" className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <SettingsPanel />
      </Dialog>
      <AnimeDetail />
    </div>
  )
}
