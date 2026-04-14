import { useSettingsStore } from '@/stores/settingsStore'
import { useSaveSettings } from '@/hooks/useSettings'
import { applyTheme } from '@/lib/theme'
import { Button, Input, Select, Checkbox, Slider } from '@/components/ui'
import { Tooltip } from '@/components/ui/Tooltip'
import type { Theme, ThemePreset, DisplayMode, VideoQuality } from '@/types/settings'

const THEME_TOOLTIPS: Record<Theme, string> = {
  light: 'Always use light mode',
  dark: 'Always use dark mode',
  auto: 'Follow the OS colour-scheme preference',
}

const THEME_PRESETS: { value: ThemePreset; label: string; color: string }[] = [
  { value: 'slate',               label: 'Slate',              color: '#7c3aed' },
  { value: 'wallbash',            label: 'Wallbash',           color: '#f97316' },
  { value: 'cloudflare',          label: 'Cloudflare',         color: '#f6821f' },
  { value: 'barbe-a-papa',        label: 'Barbe à papa',       color: '#e040fb' },
  { value: 'doom',                label: 'Doom',               color: '#ef4444' },
  { value: 'pomme-verte',         label: 'Pomme verte',        color: '#22c55e' },
  { value: 'lavande',             label: 'Lavande',            color: '#818cf8' },
  { value: 'matrix',              label: 'Matrix',             color: '#00ff41' },
  { value: 'crepuscule-de-minuit',label: 'Crépuscule de minuit', color: '#6272e0' },
]

// OAuth client IDs must be set via environment variables or app configuration before shipping.
// Replace the placeholder values below with your registered application's client IDs.
const ANILIST_OAUTH_URL = 'https://anilist.co/api/v2/oauth/authorize?client_id=YOUR_ANILIST_CLIENT_ID&response_type=token'
const MAL_OAUTH_URL = 'https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=YOUR_MAL_CLIENT_ID'

export function SettingsPanel() {
  const settings = useSettingsStore((s) => s.settings)
  const updateSettings = useSettingsStore((s) => s.updateSettings)
  const saveSettings = useSaveSettings()

  const handleThemeChange = (theme: Theme) => {
    updateSettings({ theme })
    applyTheme(theme, settings.themePreset)
    saveSettings.mutate({ ...settings, theme })
  }

  const handlePresetChange = (themePreset: ThemePreset) => {
    updateSettings({ themePreset })
    applyTheme(settings.theme, themePreset)
    saveSettings.mutate({ ...settings, themePreset })
  }

  const handleUpdate = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    updateSettings({ [key]: value })
    saveSettings.mutate({ ...settings, [key]: value })
  }

  const displayModeOptions: { value: DisplayMode; label: string }[] = [
    { value: 'grid_compact', label: 'Grid — Compact' },
    { value: 'grid_spacious', label: 'Grid — Spacious' },
    { value: 'grid_cover_only', label: 'Grid — Cover Only' },
    { value: 'list', label: 'List' },
  ]

  const qualityOptions: { value: VideoQuality; label: string }[] = [
    { value: '360p', label: '360p' },
    { value: '720p', label: '720p' },
    { value: '1080p', label: '1080p' },
    { value: 'best', label: 'Best available' },
  ]

  const OVERLAY_TOOLTIPS: Record<string, string> = {
    showDownloadedCount: 'Show a "DL" badge on downloaded anime',
    showUnwatchedCount: 'Show how many unwatched episodes are available',
    showResumeButton: 'Show the "Resume" button in the hover overlay',
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      {/* Appearance */}
      <section>
        <h2 className="text-base font-semibold text-white mb-4">Appearance</h2>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-kakera-primary-300 mb-2">Theme</p>
            <div className="flex gap-2" role="group" aria-label="Theme selection">
              {(['light', 'dark', 'auto'] as Theme[]).map((t) => (
                <Tooltip key={t} content={THEME_TOOLTIPS[t]}>
                  <button
                    onClick={() => handleThemeChange(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize border transition-colors
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent
                      ${settings.theme === t
                        ? 'bg-kakera-accent text-white border-kakera-accent'
                        : 'bg-kakera-primary-800 text-kakera-primary-300 border-kakera-primary-600 hover:border-kakera-accent'
                      }`}
                    aria-pressed={settings.theme === t}
                  >
                    {t}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-kakera-primary-300 mb-2">Color Scheme</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Color scheme selection">
              {THEME_PRESETS.map((p) => (
                <Tooltip key={p.value} content={`Apply the ${p.label} colour scheme`}>
                  <button
                    onClick={() => handlePresetChange(p.value)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent
                      ${settings.themePreset === p.value
                        ? 'bg-kakera-accent text-white border-kakera-accent'
                        : 'bg-kakera-primary-800 text-kakera-primary-300 border-kakera-primary-600 hover:border-kakera-accent'
                      }`}
                    aria-pressed={settings.themePreset === p.value}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    {p.label}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Library Display */}
      <section>
        <h2 className="text-base font-semibold text-white mb-4">Library Display</h2>
        <div className="flex flex-col gap-4">
          <Select
            label="Display Mode"
            options={displayModeOptions}
            value={settings.displayMode}
            onChange={(e) => handleUpdate('displayMode', e.target.value as DisplayMode)}
          />
          <div className="flex flex-col gap-2">
            <Checkbox
              label="Auto grid size"
              checked={settings.gridSizeAuto}
              onChange={(e) => handleUpdate('gridSizeAuto', e.target.checked)}
            />
            {!settings.gridSizeAuto && (
              <Slider
                label="Grid Size"
                min={1}
                max={10}
                value={settings.gridSize}
                showValue
                onChange={(e) => handleUpdate('gridSize', Number(e.target.value))}
              />
            )}
          </div>
        </div>
      </section>

      {/* Overlays */}
      <section>
        <h2 className="text-base font-semibold text-white mb-4">Overlays</h2>
        <div className="flex flex-col gap-2">
          {(Object.keys(settings.overlay) as (keyof typeof settings.overlay)[]).map((key) => (
            <Tooltip key={key} content={OVERLAY_TOOLTIPS[key] ?? key} side="right">
              <Checkbox
                label={key.replace(/([A-Z])/g, ' $1').replace(/^show /, 'Show ').trim()}
                checked={settings.overlay[key]}
                onChange={(e) =>
                  handleUpdate('overlay', { ...settings.overlay, [key]: e.target.checked })
                }
              />
            </Tooltip>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <section>
        <h2 className="text-base font-semibold text-white mb-4">Tabs</h2>
        <div className="flex flex-col gap-2">
          <Tooltip content="Show the filter tabs (Watching, Completed, Downloaded…) in the library" side="right">
            <Checkbox
              label="Show category tabs"
              checked={settings.tabs.showCategoryTabs}
              onChange={(e) =>
                handleUpdate('tabs', { ...settings.tabs, showCategoryTabs: e.target.checked })
              }
            />
          </Tooltip>
        </div>
      </section>

      {/* ani-cli */}
      <section>
        <h2 className="text-base font-semibold text-white mb-4">ani-cli</h2>
        <div className="flex flex-col gap-4">
          <Select
            label="Quality Preference"
            options={qualityOptions}
            value={settings.aniCliQuality}
            onChange={(e) => handleUpdate('aniCliQuality', e.target.value as VideoQuality)}
          />
          <Checkbox
            label="Always use preferred quality"
            checked={settings.aniCliAlwaysUsePreferredQuality}
            onChange={(e) => handleUpdate('aniCliAlwaysUsePreferredQuality', e.target.checked)}
          />
        </div>
      </section>

      {/* Download */}
      <section>
        <h2 className="text-base font-semibold text-white mb-4">Download</h2>
        <Input
          label="Download Directory"
          value={settings.downloadDir}
          placeholder="/home/user/anime"
          onChange={(e) => handleUpdate('downloadDir', e.target.value)}
        />
      </section>

      {/* Services */}
      <section>
        <h2 className="text-base font-semibold text-white mb-4">Services</h2>
        <div className="flex flex-col gap-6">
          {/* AniList */}
          <div className="p-4 rounded-xl bg-kakera-primary-800 border border-kakera-primary-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">AniList</h3>
              </div>
              <div className={`px-2 py-0.5 rounded text-xs font-medium ${settings.services.anilist.enabled ? 'bg-green-500/20 text-green-300' : 'bg-kakera-primary-700 text-kakera-muted'}`}>
                {settings.services.anilist.enabled ? 'Connected' : 'Disconnected'}
              </div>
            </div>
            {settings.services.anilist.username && (
              <p className="text-sm text-kakera-primary-300 mb-3">
                Signed in as <span className="text-white font-medium">{settings.services.anilist.username}</span>
              </p>
            )}
            <p className="text-xs text-kakera-muted mb-3">
              Connect via OAuth — no token needed. You'll be redirected to AniList to authorize.
            </p>
            <div className="flex gap-2 flex-wrap">
              {!settings.services.anilist.enabled ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.open(ANILIST_OAUTH_URL, '_blank')}
                  aria-label="Connect AniList via OAuth"
                >
                  Connect with AniList
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(ANILIST_OAUTH_URL, '_blank')}
                    aria-label="Re-authorize AniList"
                  >
                    Re-authorize
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      handleUpdate('services', {
                        ...settings.services,
                        anilist: { enabled: false, token: null, username: null },
                      })
                    }
                    aria-label="Disconnect AniList"
                  >
                    Disconnect
                  </Button>
                </>
              )}
            </div>
            {/* Manual token fallback */}
            <details className="mt-3">
              <summary className="text-xs text-kakera-muted cursor-pointer hover:text-white transition-colors">
                Use API token instead
              </summary>
              <div className="mt-2">
                <Input
                  label="API Token"
                  type="password"
                  value={settings.services.anilist.token ?? ''}
                  placeholder="Paste your token here"
                  onChange={(e) =>
                    handleUpdate('services', {
                      ...settings.services,
                      anilist: { ...settings.services.anilist, token: e.target.value || null },
                    })
                  }
                />
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    handleUpdate('services', {
                      ...settings.services,
                      anilist: { ...settings.services.anilist, enabled: true },
                    })
                  }
                >
                  Connect
                </Button>
              </div>
            </details>
          </div>

          {/* MyAnimeList */}
          <div className="p-4 rounded-xl bg-kakera-primary-800 border border-kakera-primary-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">MyAnimeList</h3>
              <div className={`px-2 py-0.5 rounded text-xs font-medium ${settings.services.myanimelist.enabled ? 'bg-green-500/20 text-green-300' : 'bg-kakera-primary-700 text-kakera-muted'}`}>
                {settings.services.myanimelist.enabled ? 'Connected' : 'Disconnected'}
              </div>
            </div>
            {settings.services.myanimelist.username && (
              <p className="text-sm text-kakera-primary-300 mb-3">
                Signed in as <span className="text-white font-medium">{settings.services.myanimelist.username}</span>
              </p>
            )}
            <p className="text-xs text-kakera-muted mb-3">
              Connect via OAuth — no token needed. You'll be redirected to MyAnimeList to authorize.
            </p>
            <div className="flex gap-2 flex-wrap">
              {!settings.services.myanimelist.enabled ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.open(MAL_OAUTH_URL, '_blank')}
                  aria-label="Connect MyAnimeList via OAuth"
                >
                  Connect with MyAnimeList
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(MAL_OAUTH_URL, '_blank')}
                    aria-label="Re-authorize MyAnimeList"
                  >
                    Re-authorize
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      handleUpdate('services', {
                        ...settings.services,
                        myanimelist: { enabled: false, token: null, username: null },
                      })
                    }
                    aria-label="Disconnect MyAnimeList"
                  >
                    Disconnect
                  </Button>
                </>
              )}
            </div>
            {/* Manual token fallback */}
            <details className="mt-3">
              <summary className="text-xs text-kakera-muted cursor-pointer hover:text-white transition-colors">
                Use API token instead
              </summary>
              <div className="mt-2">
                <Input
                  label="API Token"
                  type="password"
                  value={settings.services.myanimelist.token ?? ''}
                  placeholder="Paste your token here"
                  onChange={(e) =>
                    handleUpdate('services', {
                      ...settings.services,
                      myanimelist: { ...settings.services.myanimelist, token: e.target.value || null },
                    })
                  }
                />
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    handleUpdate('services', {
                      ...settings.services,
                      myanimelist: { ...settings.services.myanimelist, enabled: true },
                    })
                  }
                >
                  Connect
                </Button>
              </div>
            </details>
          </div>
        </div>
      </section>
    </div>
  )
}
