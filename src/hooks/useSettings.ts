import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'
import { useSettingsStore } from '@/stores/settingsStore'
import { isMockMode, MOCK_SETTINGS } from '@/mocks'
import type { AppSettings } from '@/types/settings'

export function useSettingsQuery() {
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      if (isMockMode) {
        updateSettings(MOCK_SETTINGS)
        return MOCK_SETTINGS
      }
      try {
        const json = await invoke<string>('get_settings')
        const parsed = JSON.parse(json) as Partial<AppSettings>
        updateSettings(parsed)
        return parsed
      } catch {
        return {} as Partial<AppSettings>
      }
    },
  })
}

export function useSaveSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: AppSettings) => {
      if (isMockMode) return
      await invoke<void>('save_settings', { content: JSON.stringify(settings) })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}
