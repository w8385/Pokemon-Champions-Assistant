import { CHAMPIONS_EFFORT_PER_STAT_CAP, CHAMPIONS_EFFORT_CAP, knownNature, natureMultiplier } from '../../domain/champions/buildRules'
import { EffortValues } from '../../domain/samples/myPartyChampionsSamples'
import { EffortStatKey, DamageWeather, DamageTerrain, Row } from '../../app/types'
import { ComparisonSeed } from '../../domain/party/unifiedComparisonAdapter'
import { indexByKey } from '../../adapters/catalog/roster.ts'
import { quickItem, quickBattleStages, quickSpeedState, quickStatNature } from '../../domain/battle/quickDamageState'
import { megaStoneForKey } from '../../shared/display/itemPresentation.ts'
import { CHAMPIONS_ITEM_OPTIONS } from '../../domain/champions/championsItems'
import { NATURES } from '../../domain/champions/natures'
import { STAT_PRESENTATION as EFFORT_STAT_OPTIONS } from '../../shared/display/statPresentation'
import { sanitizeEvs, applyChampionsEffort } from '../../domain/champions/effortProjection'
import { boostedStatForNature } from '../../shared/display/naturePresentation'
import { readDraft } from '../../adapters/persistence/comparisonDraftState'
import { namedNatureMagicAvailable, magicEffortCandidate, magicEffortMarkers } from '../../domain/champions/effortMagic'
import { actualStat } from '../../domain/champions/statMechanics'

export type QuickBattle = ComparisonSeed['battle']

export type QuickSide = ComparisonSeed & { actual: Partial<Record<EffortStatKey, string>> }

export type QuickConditions = { weather: DamageWeather; terrain: DamageTerrain; critical: boolean; typeChangeStab: boolean; hits: number }

export const quickBlankBattle = (): QuickBattle => ({ attackStage: 0, spAttackStage: 0, defenseStage: 0, spDefenseStage: 0, burned: false, lowHp: false, poisoned: false, fullHp: false, reflect: false, lightScreen: false, auroraVeil: false, friendGuard: false })

export const quickBlank = (): QuickSide => ({ key: '', ability: '', item: '', nature: 'hardy', evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 }, actual: {}, moves: ['', '', '', ''], battle: quickBlankBattle(), speedStage: 0, speedNatureKnown: true, speedNatureMultiplier: 1, statNatureMultipliers: {}, speedScarfOverride: null, speedAbilityActive: false })

export const quickDefaultConditions = (): QuickConditions => ({ weather: 'none', terrain: 'none', critical: false, typeChangeStab: true, hits: 2 })

export function quickSide(input: unknown, legacy: Record<string, unknown> = {}, originalAttacker = false): QuickSide {
  const value = input && typeof input === 'object' && !Array.isArray(input) ? input as Partial<QuickSide> : {}
  const key = typeof value.key === 'string' && indexByKey.has(value.key) ? value.key : ''
  const item = quickItem(value.item, megaStoneForKey(key), CHAMPIONS_ITEM_OPTIONS)
  const own = value.battle && typeof value.battle === 'object' && !Array.isArray(value.battle) ? value.battle : null
  const source = own ?? { attackStage: originalAttacker ? legacy.attackStage : 0, defenseStage: originalAttacker ? 0 : legacy.defenseStage, burned: originalAttacker ? legacy.burned : false, lowHp: originalAttacker ? legacy.lowHp : false, poisoned: originalAttacker ? false : legacy.targetPoisoned, fullHp: originalAttacker ? false : legacy.defenderFullHp, reflect: originalAttacker ? false : legacy.reflect, lightScreen: originalAttacker ? false : legacy.lightScreen, auroraVeil: originalAttacker ? false : legacy.auroraVeil, friendGuard: originalAttacker ? false : legacy.friendGuard }
  const battle = { ...quickBattleStages(source as Partial<QuickBattle>, legacy, originalAttacker), ...Object.fromEntries((['burned','lowHp','poisoned','fullHp','reflect','lightScreen','auroraVeil','friendGuard'] as const).map(flag => [flag, source[flag] === true])) } as QuickBattle
  return { key, item, nature: NATURES.some(n => n.id === value.nature) ? value.nature! : 'hardy', ability: typeof value.ability === 'string' ? value.ability : '', evs: sanitizeEvs(value.evs), actual: value.actual && typeof value.actual === 'object' ? Object.fromEntries(EFFORT_STAT_OPTIONS.filter(stat => typeof value.actual?.[stat.key] === 'string').map(stat => [stat.key, value.actual![stat.key]])) : {}, moves: Array.isArray(value.moves) ? value.moves.slice(0, 4).map(move => typeof move === 'string' ? move : '') : ['', '', '', ''], battle, ...quickSpeedState(value), speedScarfOverride: typeof value.speedScarfOverride === 'boolean' ? value.speedScarfOverride : null, speedAbilityActive: value.speedAbilityActive === true }
}

export function restoredComparisonSide(seed: ComparisonSeed, side: 'attacker' | 'defender', slot: number) {
  const saved = readDraft(localStorage, side, slot, seed)
  if (!saved) return { side: seed as QuickSide, dirty: new Set<string>() }
  if (side === 'attacker' && saved.dirty.has('key')) return { side: seed as QuickSide, dirty: new Set<string>() }
  const next = saved.side
  if (next.key && !indexByKey.has(next.key)) return { side: seed as QuickSide, dirty: new Set<string>() }
  // A historical draft's invalid ability remains visible and repairable; calculation is gated below.
  if (!knownNature(next.nature)) return { side: seed as QuickSide, dirty: new Set<string>() }
  // A restored item is evidence, not an edit request. Invalid drafts remain repairable.
  const speciesChanged = saved.dirty.has('key') && next.key !== seed.key
  return { dirty: saved.dirty, side: { ...next, actual: {}, battle: quickBlankBattle(), speedStage: speciesChanged ? 0 : seed.speedStage,
    speedNatureKnown: saved.dirty.has('nature') || speciesChanged ? true : seed.speedNatureKnown,
    speedNatureMultiplier: speciesChanged ? 1 : seed.speedNatureMultiplier,
    statNatureMultipliers: saved.dirty.has('nature') || speciesChanged ? {} : seed.statNatureMultipliers,
    speedScarfOverride: speciesChanged ? null : seed.speedScarfOverride,
    speedAbilityActive: false, knownOffense: speciesChanged ? { attack: false, spAttack: false } : seed.knownOffense } as QuickSide }
}

export function quickMagicProjection(side: QuickSide, row: Row) {
  const boosted = boostedStatForNature(side.nature)
  const magic = boosted && namedNatureMagicAvailable(boosted, side) ? boosted : null
  const actualAt = (stat: EffortStatKey, effort: number) => actualStat(row[stat], effort, stat === 'hp' ? 1 : natureMultiplier(side.nature, stat), stat === 'hp')
  return {
    candidate: magic ? magicEffortCandidate(magic, side.evs, effort => actualAt(magic, effort)) : null,
    points: (stat: EffortStatKey) => magic ? magicEffortMarkers(magic, stat, effort => actualAt(stat, effort)) : [],
  }
}

export function quickStat(side: QuickSide, row: Row, key: EffortStatKey) {
  const override = side.actual[key]
  if (override !== undefined) return /^\d+$/.test(override) && Number(override) >= 1 && Number(override) <= 999 ? Number(override) : null
  return actualStat(row[key], side.evs[key], quickStatNature(side, key, key === 'hp' ? 1 : natureMultiplier(side.nature, key)), key === 'hp')
}
