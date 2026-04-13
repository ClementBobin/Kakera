import { useState } from 'react'
import { useLibraryStore } from '@/stores/libraryStore'

function App() {
  const [activeTab, setActiveTab] = useState<'library' | 'calendar' | 'settings'>('library')
  const { animeList } = useLibraryStore()

  return (
    <div className="min-h-screen bg-kakera-surface-dark text-white">
      <nav aria-label="main navigation" className="flex items-center gap-4 border-b border-kakera-primary-700 px-6 py-3">
        <span className="text-xl font-bold tracking-tight text-kakera-accent">KAKERA</span>
        <button
          className={`px-3 py-1 rounded ${activeTab === 'library' ? 'bg-kakera-primary-600' : 'hover:bg-kakera-primary-800'}`}
          onClick={() => setActiveTab('library')}
        >
          Library
        </button>
        <button
          className={`px-3 py-1 rounded ${activeTab === 'calendar' ? 'bg-kakera-primary-600' : 'hover:bg-kakera-primary-800'}`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar
        </button>
        <button
          className={`px-3 py-1 rounded ${activeTab === 'settings' ? 'bg-kakera-primary-600' : 'hover:bg-kakera-primary-800'}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </nav>

      <main className="p-6">
        {activeTab === 'library' && (
          <div>
            <h1 className="text-2xl font-semibold mb-4">My Library</h1>
            {animeList.length === 0 ? (
              <p className="text-kakera-muted">No anime in your library yet. Sync with a tracking service to get started.</p>
            ) : (
              <ul>
                {animeList.map((anime) => (
                  <li key={anime.id}>{anime.title}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {activeTab === 'calendar' && (
          <div>
            <h1 className="text-2xl font-semibold mb-4">Release Calendar</h1>
            <p className="text-kakera-muted">Upcoming releases will appear here.</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div>
            <h1 className="text-2xl font-semibold mb-4">Settings</h1>
            <p className="text-kakera-muted">Configure your preferences here.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
