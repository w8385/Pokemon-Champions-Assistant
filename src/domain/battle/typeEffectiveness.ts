
export const typeChart: Record<string, Partial<Record<string, number>>> = {
  Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5, Ice: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying: { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Fairy: { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 },
}

export const normalizedTypeChart: Record<string, Partial<Record<string, number>>> = Object.fromEntries(
  Object.entries(typeChart).map(([attackType, targets]) => [
    attackType.toLowerCase(),
    Object.fromEntries(Object.entries(targets).map(([defendType, value]) => [defendType.toLowerCase(), value])),
  ]),
)

export function typeEffectiveness(attackType: string, defendTypes: string[]) {
  const attackKey = attackType.toLowerCase()
  return defendTypes.reduce((acc, defendType) => acc * (normalizedTypeChart[attackKey]?.[defendType.toLowerCase()] ?? 1), 1)
}

export function effectiveDefenderAbility(attackerAbility: string, defenderAbility: string): string {
  if (attackerAbility !== 'mold-breaker') return defenderAbility
  const ignored = new Set([
    'aura-guard', 'battle-armor', 'disguise', 'dry-skin', 'earth-eater', 'eelevate',
    'filter', 'flash-fire', 'fluffy', 'fur-coat', 'grass-pelt', 'heatproof',
    'levitate', 'lightning-rod', 'marvel-scale', 'motor-drive', 'multiscale',
    'punk-rock', 'purifying-salt', 'sap-sipper', 'shell-armor', 'solid-rock',
    'soundproof', 'storm-drain', 'thick-fat', 'unaware', 'volt-absorb',
    'water-absorb', '부유', '탈',
  ])
  return ignored.has(defenderAbility) ? '' : defenderAbility
}

export function abilityAdjustedTypeEffectiveness(attackType: string, defendTypes: string[], defenderAbility: string, attackerAbility = '') {
  const attackKey = attackType.toLowerCase()
  const effectiveAbility = effectiveDefenderAbility(attackerAbility, defenderAbility)
  const attackerAbilityKey = attackerAbility.toLowerCase()
  const hasScrappy = attackerAbilityKey === 'scrappy' || attackerAbility === '배짱'
  const normalizedDefendTypes = hasScrappy && (attackKey === 'normal' || attackKey === 'fighting')
    ? defendTypes.filter((defendType) => defendType.toLowerCase() !== 'ghost')
    : defendTypes
  const baseEffectiveness = typeEffectiveness(attackType, normalizedDefendTypes)
  if (attackKey === 'ground' && (effectiveAbility === 'levitate' || effectiveAbility === '부유')) return 0
  return baseEffectiveness
}
