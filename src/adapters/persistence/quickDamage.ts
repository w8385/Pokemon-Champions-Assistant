import { readQuickSaved } from '../../domain/battle/quickDamageState'
export const QUICK_KEY = 'pokemon-champions-quick-damage:v1'

// getItem/setItem exceptions intentionally propagate; readQuickSaved alone catches malformed JSON.
export function readQuickStandalone(storage: Pick<Storage, 'getItem'>) {
  return readQuickSaved(storage.getItem(QUICK_KEY))
}

export function writeQuickStandalone(storage: Pick<Storage, 'setItem'>, snapshot: {
  attacker: unknown; defender: unknown; conditions: unknown;
  manualFields: { weather: boolean; terrain: boolean }
}) {
  storage.setItem(QUICK_KEY, JSON.stringify(snapshot))
}
