import { readQuickSaved } from '../../domain/battle/quickDamageState'
export const QUICK_KEY = 'pokemon-champions-quick-damage:v1'

type PortSource<T> = T | (() => T)
const resolvePort = <T,>(source: PortSource<T>): T =>
  typeof source === 'function' ? (source as () => T)() : source

export type QuickStandaloneReadResult = {
  value: Record<string, unknown>
  error: boolean
}

export function readQuickStandalone(source: PortSource<Pick<Storage, 'getItem'>>): QuickStandaloneReadResult {
  try {
    return { value: readQuickSaved(resolvePort(source).getItem(QUICK_KEY)), error: false }
  } catch {
    return { value: {}, error: true }
  }
}

export function writeQuickStandalone(source: PortSource<Pick<Storage, 'setItem'>>, snapshot: {
  attacker: unknown; defender: unknown; conditions: unknown;
  manualFields: { weather: boolean; terrain: boolean }
}): boolean {
  try {
    resolvePort(source).setItem(QUICK_KEY, JSON.stringify(snapshot))
    return true
  } catch {
    return false
  }
}
