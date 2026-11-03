import type { PersistedState } from '../../app/types'

export const STORAGE_KEY = 'pokemon-champions-assistant-demo:v1'

export function loadPersistedState(): { value: PersistedState | null; error: boolean } {
  if (typeof window === 'undefined') return { value: null, error: false }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { value: null, error: false }
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid persisted state')
    return { value: parsed as PersistedState, error: false }
  } catch {
    return { value: null, error: true }
  }
}

export function persistWorkspace(storage: Pick<Storage, 'setItem'> | (() => Pick<Storage, 'setItem'>), key: string, payload: object): boolean {
  try { (typeof storage === 'function' ? storage() : storage).setItem(key,JSON.stringify(payload)); return true } catch { return false }
}
