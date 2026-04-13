import { invoke } from '@tauri-apps/api/core'

export async function readJson<T>(path: string): Promise<T | null> {
  try {
    const content = await invoke<string>('read_json_file', { path })
    return JSON.parse(content) as T
  } catch {
    return null
  }
}

export async function writeJson<T>(path: string, data: T): Promise<void> {
  const content = JSON.stringify(data)
  try {
    await invoke<void>('write_json_file', { path, content })
  } catch (err) {
    throw new Error(`Failed to write file at "${path}": ${String(err)}`)
  }
}
