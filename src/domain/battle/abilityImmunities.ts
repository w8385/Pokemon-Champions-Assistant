// Match the always-on type immunities implemented by resolveDamageModifiers.
export function alwaysOnAbilityImmunity(type: string, ability: string): boolean {
  if (type === 'ground') return ['levitate', 'eelevate', 'earth-eater', '부유'].includes(ability)
  if (type === 'water') return ['water-absorb', 'storm-drain', 'dry-skin'].includes(ability)
  if (type === 'fire') return ability === 'flash-fire'
  if (type === 'electric') return ['volt-absorb', 'lightning-rod', 'motor-drive'].includes(ability)
  if (type === 'grass') return ability === 'sap-sipper'
  return false
}
