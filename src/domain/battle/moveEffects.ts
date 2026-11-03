import type { MoveMeta, DamageWeather, DamageTerrain } from '../../app/types'
import { normalizeSearchText } from './moveKey.ts'
import { moveMatchesTaggedSet, SOUND_MOVE_NAMES } from './moveTags.ts'

export function resolveAbilityAdjustedMoveMeta(moveName: string, moveMeta: MoveMeta | null, attackerAbility: string, weather: DamageWeather = 'none') {
  if (!moveMeta) return moveMeta
  const isDamaging = moveMeta.category === 'physical' || moveMeta.category === 'special'
  if (!isDamaging) return moveMeta
  const effectiveWeather = attackerAbility === 'mega-sol' ? 'sun' : weather
  let adjusted = moveMeta
  if (normalizeSearchText(moveName) === normalizeSearchText('웨더볼') && effectiveWeather !== 'none') {
    const weatherType = effectiveWeather === 'sun' ? 'fire' : effectiveWeather === 'rain' ? 'water' : effectiveWeather === 'sand' ? 'rock' : 'ice'
    adjusted = { ...adjusted, type: weatherType, power: 100 }
  }
  if (adjusted.type === 'normal') {
    if (attackerAbility === 'aerilate') return { ...adjusted, type: 'flying' }
    if (attackerAbility === 'pixilate') return { ...adjusted, type: 'fairy' }
    if (attackerAbility === 'refrigerate') return { ...adjusted, type: 'ice' }
    if (attackerAbility === 'dragonize') return { ...adjusted, type: 'dragon' }
  }
  if (attackerAbility === 'liquid-voice' && moveMatchesTaggedSet(moveName, SOUND_MOVE_NAMES)) {
    return { ...adjusted, type: 'water' }
  }
  return adjusted
}

export function resolveAbilityAdjustedTypes(baseTypes: string[], ability: string, weather: DamageWeather, terrain: DamageTerrain) {
  if (ability === 'forecast') {
    if (weather === 'sun') return ['fire']
    if (weather === 'rain') return ['water']
    if (weather === 'snow') return ['ice']
  }
  if (ability === 'mimicry') {
    if (terrain === 'electric') return ['electric']
    if (terrain === 'grassy') return ['grass']
    if (terrain === 'psychic') return ['psychic']
    if (terrain === 'misty') return ['fairy']
  }
  return baseTypes
}

export function resolveStabMultiplier(attackerTypes: string[], moveType: string | null, ability: string, typeChangeStab = true) {
  if (!moveType) return 1
  const hasNativeStab = attackerTypes.includes(moveType)
  if ((ability === 'libero' || ability === 'protean' || ability === '변환자재') && typeChangeStab) return 1.5
  if (ability === 'adaptability' || ability === '적응력') return hasNativeStab ? 2 : 1
  return hasNativeStab ? 1.5 : 1
}

export function weatherFromAbility(ability: string): DamageWeather {
  if (ability === 'drought' || ability === '가뭄') return 'sun'
  if (ability === 'drizzle' || ability === '잔비') return 'rain'
  if (ability === 'sand-stream' || ability === '모래날림') return 'sand'
  if (ability === 'snow-warning' || ability === '싸라기눈') return 'snow'
  return 'none'
}

export function deriveAutoWeatherFromAbilities(...abilities: string[]) {
  for (const ability of abilities) {
    const resolved = weatherFromAbility(ability)
    if (resolved !== 'none') return resolved
  }
  return 'none' as DamageWeather
}

export function terrainFromAbility(ability: string): DamageTerrain {
  if (ability === 'electric-surge' || ability === '일렉트릭메이커') return 'electric'
  if (ability === 'grassy-surge' || ability === '그래스메이커') return 'grassy'
  if (ability === 'psychic-surge' || ability === '사이코메이커') return 'psychic'
  return 'none'
}

export function deriveAutoTerrainFromAbilities(...abilities: string[]) {
  for (const ability of abilities) {
    const resolved = terrainFromAbility(ability)
    if (resolved !== 'none') return resolved
  }
  return 'none' as DamageTerrain
}
