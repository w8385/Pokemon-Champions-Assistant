// Static, single-type offensive targets and actual-form defensive matchups.
// The caller supplies the application's canonical chart and resolved move/ability data.
export const PARTY_TYPES = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'] as const
export type PartyType = typeof PARTY_TYPES[number]
export type AnalysisMove = { name: string; type: string | null; category?: string | null }
export type AnalysisMember = { key: string; name: string; sprite?: string; types: string[]; ability: string; moves: AnalysisMove[]; slot?: number }
export type AnalysisChart = Record<string, Partial<Record<string, number>>>

// Match the always-on type immunities implemented by resolveDamageModifiers.
export function alwaysOnAbilityImmunity(type: string, ability: string): boolean {
  if (type === 'ground') return ['levitate', 'eelevate', 'earth-eater', '부유'].includes(ability)
  if (type === 'water') return ['water-absorb', 'storm-drain', 'dry-skin'].includes(ability)
  if (type === 'fire') return ability === 'flash-fire'
  if (type === 'electric') return ['volt-absorb', 'lightning-rod', 'motor-drive'].includes(ability)
  if (type === 'grass') return ability === 'sap-sipper'
  return false
}

const CONDITIONAL_TYPE_MOVES = new Set(['웨더볼', 'weatherball', '테라버스트', 'terablast', '심판의뭉치', 'judgment', '멀티어택', 'multiattack', '자연의힘', 'naturepower', '잠재파워', 'hiddenpower', '기술타입변경', '플라잉프레스', 'flyingpress', '웨더볼', 'weather ball', '테크노버스터', 'technoblast', 'revelationdance'])
const normalizeMove = (value: string) => value.toLowerCase().replace(/[^0-9a-z가-힣]+/g, '')
const effectiveness = (type: string, defending: string[], chart: AnalysisChart) => defending.reduce((value, defense) => value * (chart[type]?.[defense] ?? 1), 1)

export function analyzePartyMatchups(members: AnalysisMember[], chart: AnalysisChart, options: { unknownKeys?: string[]; offensiveEffectiveness?: (moveType: string, targetType: string, attackerAbility: string) => number } = {}) {
  const warnings: string[] = (options.unknownKeys ?? []).map(key => key.includes('특성 원본:') ? `미확인 ${key}` : `미확인 포켓몬: ${key}`)
  const valid = members.filter(member => {
    const known = Boolean(member.key && member.types.length && member.types.every(type => PARTY_TYPES.includes(type as PartyType)))
    if (!known) warnings.push(`미확인 포켓몬/타입: ${member.key || '빈 슬롯'}`)
    return known
  }).slice(0, 6)
  const attackMoves = valid.map(member => ({ member, moves: member.moves.filter(move => {
    if (move.category === 'status') return false
    if (CONDITIONAL_TYPE_MOVES.has(normalizeMove(move.name))) {
      warnings.push(`조건부/특수 상성 제외: ${member.name} · ${move.name}`)
      return false
    }
    if (!move.type || !PARTY_TYPES.includes(move.type as PartyType) || !['physical', 'special'].includes(move.category ?? '')) {
      warnings.push(`기술 타입/분류 미확인: ${member.name} · ${move.name}`)
      return false
    }
    return true
  }) }))
  const offensiveMultiplier = (move: AnalysisMove, targetType: string, ability: string) => {
    // Freeze-Dry has a fixed Water exception, not an unresolved activation condition.
    // Other targets still use the application's existing type/ability resolver.
    const name = normalizeMove(move.name)
    if (targetType === 'water' && (name === '프리즈드라이' || name === 'freezedry')) return 2
    return options.offensiveEffectiveness?.(move.type!, targetType, ability) ?? effectiveness(move.type!, [targetType], chart)
  }
  const offense = PARTY_TYPES.map(type => {
    const hits = attackMoves.flatMap(({ member, moves }) => {
      const effective = moves.map(move => ({ name: move.name, multiplier: offensiveMultiplier(move, type, member.ability) })).filter(move => move.multiplier > 1)
      return effective.length ? [{ key: member.key, name: member.name, sprite: member.sprite, slot: member.slot, moves: effective }] : []
    })
    const immune = attackMoves.flatMap(({ member, moves }) => moves.filter(move => offensiveMultiplier(move, type, member.ability) === 0).map(move => ({ key: member.key, name: member.name, slot: member.slot, move: move.name })))
    return { type, hits, count: hits.length, immune }
  })
  const defense = PARTY_TYPES.map(type => {
    const entries = valid.map(member => {
      const base = effectiveness(type, member.types, chart)
      const abilityImmune = alwaysOnAbilityImmunity(type, member.ability) && base !== 0
      return { key: member.key, name: member.name, sprite: member.sprite, slot: member.slot, multiplier: abilityImmune ? 0 : base, abilityImmune }
    })
    return { type, members: entries, weakCount: entries.filter(x => x.multiplier > 1).length, resistCount: entries.filter(x => x.multiplier > 0 && x.multiplier < 1).length, immuneCount: entries.filter(x => x.multiplier === 0).length, neutralCount: entries.filter(x => x.multiplier === 1).length }
  })
  return { memberCount: valid.length, offense, defense, warnings, priority: defense.filter(x => x.weakCount >= 2).sort((a, b) => b.weakCount - a.weakCount || (a.resistCount + a.immuneCount) - (b.resistCount + b.immuneCount)).slice(0, 2) }
}
