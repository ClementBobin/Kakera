import { useSettingsStore } from '@/stores/settingsStore'
import { useSaveSettings } from '@/hooks/useSettings'
import { applyTheme } from '@/lib/theme'
import { Button, Input, Select, Checkbox, Slider } from '@/components/ui'
import type { Theme, ThemePreset, DisplayMode, VideoQuality } from '@/types/settings'

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
                <button
                  key={t}
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
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-kakera-primary-300 mb-2">Theme Preset</p>
            <div className="flex gap-3" role="group" aria-label="Theme preset selection">
              {(['slate', 'wallbash'] as ThemePreset[]).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePresetChange(p)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium capitalize border transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kakera-accent
                    ${settings.themePreset === p
                      ? 'bg-kakera-accent text-white border-kakera-accent'
                      : 'bg-kakera-primary-800 text-kakera-primary-300 border-kakera-primary-600 hover:border-kakera-accent'
                    }`}
                  aria-pressed={settings.themePreset === p}
                >
                  {p === 'slate' ? '🪨 Slate' : '🔥 Wallbash'}
                </button>
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
            <Checkbox
              key={key}
              label={key.replace(/([A-Z])/g, ' $1').replace(/^show /, 'Show ').trim()}
              checked={settings.overlay[key]}
              onChange={(e) =>
                handleUpdate('overlay', { ...settings.overlay, [key]: e.target.checked })
              }
            />
          ))}
        </div>
      </section>

      {/* Tabs */}
      <section>
        <h2 className="text-base font-semibold text-white mb-4">Tabs</h2>
        <div className="flex flex-col gap-2">
          <Checkbox
            label="Show category tabs"
            checked={settings.tabs.showCategoryTabs}
            onChange={(e) =>
              handleUpdate('tabs', { ...settings.tabs, showCategoryTabs: e.target.checked })
            }
          />
          <Checkbox
            label="Show entry count"
            checked={settings.tabs.showEntryCount}
            onChange={(e) =>
              handleUpdate('tabs', { ...settings.tabs, showEntryCount: e.target.checked })
            }
          />
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
          {(['anilist', 'myanimelist'] as const).map((service) => (
            <div key={service} className="p-4 rounded-xl bg-kakera-primary-800 border border-kakera-primary-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white capitalize">
                  {service === 'myanimelist' ? 'MyAnimeList' : 'AniList'}
                </h3>
                <div className={`px-2 py-0.5 rounded text-xs font-medium ${settings.services[service].enabled ? 'bg-green-500/20 text-green-300' : 'bg-kakera-primary-700 text-kakera-muted'}`}>
                  {settings.services[service].enabled ? 'Connected' : 'Disconnected'}
                </div>
              </div>
              {settings.services[service].username && (
                <p className="text-sm text-kakera-primary-300 mb-3">
                  Signed in as {settings.services[service].username}
                </p>
              )}
              <Input
                label="API Token"
                type="password"
                value={settings.services[service].token ?? ''}
                placeholder="Paste your token here"
                onChange={(e) =>
                  handleUpdate('services', {
                    ...settings.services,
                    [service]: { ...settings.services[service], token: e.target.value || null },
                  })
                }
              />
              <div className="flex gap-2 mt-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    handleUpdate('services', {
                      ...settings.services,
                      [service]: { ...settings.services[service], enabled: true },
                    })
                  }
                  aria-label={`Connect ${service}`}
                >
                  Connect
                </Button>
                {settings.services[service].enabled && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      handleUpdate('services', {
                        ...settings.services,
                        [service]: { enabled: false, token: null, username: null },
                      })
                    }
                    aria-label={`Disconnect ${service}`}
                  >
                    Disconnect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
