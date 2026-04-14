import { invoke } from '@tauri-apps/api/core'
import { path } from '@tauri-apps/api'
import type { AnimeEntry } from '@/types/anime'
import type { AppSettings } from '@/types/settings'
import type { CustomCollection } from '@/types/collection'

export interface PersistedState {
  library: AnimeEntry[]
  collections: CustomCollection[]
  lastSyncedAt: string | null
  schemaVersion: number
}

const SCHEMA_VERSION = 1

async function getLibraryPath(): Promise<string> {
  const appDataDir = await path.appDataDir()
  return `${appDataDir}/library.json`
}

async function getSettingsPath(): Promise<string> {
  const appDataDir = await path.appDataDir()
  return `${appDataDir}/settings.json`
}

export async function loadPersistedState(): Promise<PersistedState | null> {
  try {
    const filePath = await getLibraryPath()
    const raw = await invoke<string>('read_json_file', { path: filePath })
    const parsed = JSON.parse(raw) as PersistedState
    // Basic schema migration hook
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      return migrateState(parsed)
    }
    return parsed
  } catch {
    return null
  }
}

export async function savePersistedState(state: PersistedState): Promise<void> {
  const filePath = await getLibraryPath()
  await invoke<void>('write_json_file', {
    path: filePath,
    content: JSON.stringify({ ...state, schemaVersion: SCHEMA_VERSION }),
  })
}

export async function loadSettings(): Promise<Partial<AppSettings> | null> {
  try {
    const filePath = await getSettingsPath()
    const raw = await invoke<string>('read_json_file', { path: filePath })
    return JSON.parse(raw) as Partial<AppSettings>
  } catch {
    return null
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const filePath = await getSettingsPath()
  await invoke<void>('write_json_file', {
    path: filePath,
    content: JSON.stringify(settings),
  })
}

function migrateState(old: Partial<PersistedState>): PersistedState {
  return {
    library: old.library ?? [],
    collections: old.collections ?? [],
    lastSyncedAt: old.lastSyncedAt ?? null,
    schemaVersion: SCHEMA_VERSION,
  }
}