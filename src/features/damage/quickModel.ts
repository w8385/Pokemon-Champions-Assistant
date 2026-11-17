import { CHAMPIONS_EFFORT_PER_STAT_CAP, CHAMPIONS_EFFORT_CAP, knownNature, natureMultiplier } from '../../domain/champions/buildRules'
import { EffortValues } from '../../domain/samples/myPartyChampionsSamples'
import { EffortStatKey, DamageWeather, DamageTerrain, Row, type ConditionalPowerValue } from '../../app/types'
import { ComparisonSeed } from '../../domain/party/unifiedComparisonAdapter'
import { indexByKey } from '../../adapters/catalog/roster.ts'
import { quickItem, quickBattleStages, quickSpeedState, quickStatNature } from '../../domain/battle/quickDamageState'
import { quickHpFacts } from '../../domain/battle/quickBattleFacts'
export { quickHpFacts, quickPositiveStageTotal, quickStatused } from '../../domain/battle/quickBattleFacts'
import { megaStoneForKey } from '../../shared/display/itemPresentation.ts'
import { CHAMPIONS_ITEM_OPTIONS } from '../../domain/champions/championsItems'
import { NATURES } from '../../domain/champions/natures'
import { sanitizeEvs, applyChampionsEffort } from '../../domain/champions/effortProjection'
import { boostedStatForNature } from '../../shared/display/naturePresentation'
import { readDraft } from '../../adapters/persistence/comparisonDraftState'
import { effortMagicProjection, namedNatureMagicAvailable } from '../../domain/champions/effortMagic'
import { actualStat } from '../../domain/champions/statMechanics'

export type QuickBattle = ComparisonSeed['battle']

export type QuickSide = ComparisonSeed & { actual: Partial<Record<EffortStatKey, string>>; actualForm?: 'shield' | 'blade'; hitForm?: 'shield' | 'blade' }

export type QuickConditions = {
  weather: DamageWeather
  terrain: DamageTerrain
  critical: boolean
  typeChangeStab: boolean
  moveHits: Record<string, number>
  moveValues: Record<string, ConditionalPowerValue>
  gravity: boolean
}

export const quickBlankBattle = (): QuickBattle => ({ attackStage: 0, spAttackStage: 0, defenseStage: 0, spDefenseStage: 0, accuracyStage: 0, evasionStage: 0, burned: false, lowHp: false, poisoned: false, statused: false, fullHp: true, hpPercent: 100, movedAfterTarget: false, damagedByTarget: false, damagedThisTurn: false, statDroppedThisTurn: false, previousMoveFailed: false, allyUsedRound: false, randomDoublePower: false, faintedAllies: 0, timesHit: 0, stockpile: 1, reflect: false, lightScreen: false, auroraVeil: false, friendGuard: false })

export const quickBlank = (): QuickSide => ({ key: '', ability: '', item: '', nature: 'hardy', evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 }, actual: {}, moves: ['', '', '', ''], battle: quickBlankBattle(), speedStage: 0, speedNatureKnown: true, speedNatureMultiplier: 1, statNatureMultipliers: {}, speedScarfOverride: null, speedAbilityActive: false })

export const quickDefaultConditions = (): QuickConditions => ({ weather: 'none', terrain: 'none', critical: false, typeChangeStab: true, moveHits: {}, moveValues: {}, gravity: false })

export const quickMoveConditionKey = (side: 'attacker' | 'defender', slot: number, move: string) => `${side}:${Math.max(0, Math.min(3, Math.trunc(slot)))}:${move}`

export function swapQuickMoveConditionSides<T>(values: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key.startsWith('attacker:') ? `defender:${key.slice(9)}` : key.startsWith('defender:') ? `attacker:${key.slice(9)}` : key, value]))
}

const quickMoveConditionEntry = (key: string) => /^(attacker|defender):[0-3]:.{1,80}$/.test(key)

export function quickMoveHits(input: unknown): Record<string, number> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {}
  return Object.fromEntries(Object.entries(input).slice(0, 16).filter(([key, value]) => quickMoveConditionEntry(key) && Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 10).map(([key, value]) => [key, Number(value)]))
}

export function quickMoveValues(input: unknown): Record<string, ConditionalPowerValue> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {}
  const entries: [string, ConditionalPowerValue][] = []
  for (const [key, value] of Object.entries(input).slice(0, 16)) {
    if (!quickMoveConditionEntry(key)) continue
    if (typeof value === 'boolean') { entries.push([key, value]); continue }
    const numeric = Number(value)
    if (Number.isFinite(numeric)) entries.push([key, Math.max(0, Math.min(999, Math.trunc(numeric)))])
  }
  return Object.fromEntries(entries)
}

export function quickSide(input: unknown, legacy: Record<string, unknown> = {}, originalAttacker = false): QuickSide {
  const value = input && typeof input === 'object' && !Array.isArray(input) ? input as Partial<QuickSide> : {}
  const key = typeof value.key === 'string' && indexByKey.has(value.key) ? value.key : ''
  const item = quickItem(value.item, megaStoneForKey(key), CHAMPIONS_ITEM_OPTIONS)
  const own = value.battle && typeof value.battle === 'object' && !Array.isArray(value.battle) ? value.battle : null
  const source = (own ?? { attackStage: originalAttacker ? legacy.attackStage : 0, defenseStage: originalAttacker ? 0 : legacy.defenseStage, accuracyStage: 0, evasionStage: 0, burned: originalAttacker ? legacy.burned : false, lowHp: originalAttacker ? legacy.lowHp : false, poisoned: originalAttacker ? false : legacy.targetPoisoned, statused: false, fullHp: originalAttacker ? false : legacy.defenderFullHp, movedAfterTarget: false, damagedByTarget: false, damagedThisTurn: false, statDroppedThisTurn: false, previousMoveFailed: false, allyUsedRound: false, randomDoublePower: false, faintedAllies: 0, timesHit: 0, stockpile: 1, reflect: originalAttacker ? false : legacy.reflect, lightScreen: originalAttacker ? false : legacy.lightScreen, auroraVeil: originalAttacker ? false : legacy.auroraVeil, friendGuard: originalAttacker ? false : legacy.friendGuard }) as Partial<QuickBattle>
  const hpFacts = quickHpFacts(typeof source.hpPercent === 'number' && Number.isFinite(source.hpPercent) ? source.hpPercent : source.fullHp === true ? 100 : source.lowHp === true ? 33 : 99)
  const battle = {
    ...quickBattleStages(source as Partial<QuickBattle>, legacy, originalAttacker),
    accuracyStage: typeof source.accuracyStage === 'number' && Number.isFinite(source.accuracyStage) ? Math.max(-6, Math.min(6, Math.trunc(source.accuracyStage))) : 0,
    evasionStage: typeof source.evasionStage === 'number' && Number.isFinite(source.evasionStage) ? Math.max(-6, Math.min(6, Math.trunc(source.evasionStage))) : 0,
    ...Object.fromEntries((['burned','poisoned','statused','movedAfterTarget','damagedByTarget','damagedThisTurn','statDroppedThisTurn','previousMoveFailed','allyUsedRound','randomDoublePower','reflect','lightScreen','auroraVeil','friendGuard'] as const).map(flag => [flag, source[flag] === true])),
    ...hpFacts,
    faintedAllies: typeof source.faintedAllies === 'number' && Number.isFinite(source.faintedAllies) ? Math.max(0, Math.min(5, Math.trunc(source.faintedAllies))) : 0,
    timesHit: typeof source.timesHit === 'number' && Number.isFinite(source.timesHit) ? Math.max(0, Math.min(6, Math.trunc(source.timesHit))) : 0,
    stockpile: typeof source.stockpile === 'number' && Number.isFinite(source.stockpile) ? Math.max(1, Math.min(3, Math.trunc(source.stockpile))) : 1,
  } as QuickBattle
  return { key, item, nature: NATURES.some(n => n.id === value.nature) ? value.nature! : 'hardy', ability: typeof value.ability === 'string' ? value.ability : '', evs: sanitizeEvs(value.evs), actual: {}, actualForm: value.actualForm === 'blade' ? 'blade' : 'shield', hitForm: value.hitForm === 'blade' ? 'blade' : 'shield', moves: Array.isArray(value.moves) ? value.moves.slice(0, 4).map(move => typeof move === 'string' ? move : '') : ['', '', '', ''], battle, ...quickSpeedState(value), speedScarfOverride: null, speedAbilityActive: value.speedAbilityActive === true }
}

export function restoredComparisonSide(seed: ComparisonSeed, side: 'attacker' | 'defender', slot: number) {
  const saved = readDraft(() => window.localStorage, side, slot, seed)
  const seedSide = { ...seed } as QuickSide
  if (!saved) return { side: seedSide, dirty: new Set<string>() }
  if (side === 'attacker' && saved.dirty.has('key')) return { side: seedSide, dirty: new Set<string>() }
  const next = saved.side
  if (next.key && !indexByKey.has(next.key)) return { side: seedSide, dirty: new Set<string>() }
  // A historical draft's invalid ability remains visible and repairable; calculation is gated below.
  if (!knownNature(next.nature)) return { side: seedSide, dirty: new Set<string>() }
  // A restored item is evidence, not an edit request. Invalid drafts remain repairable.
  const speciesChanged = saved.dirty.has('key') && next.key !== seed.key
  return { dirty: saved.dirty, side: { ...next, actual: {}, battle: quickBlankBattle(), speedStage: speciesChanged ? 0 : seed.speedStage,
    speedNatureKnown: saved.dirty.has('nature') || speciesChanged ? true : seed.speedNatureKnown,
    speedNatureMultiplier: speciesChanged ? 1 : seed.speedNatureMultiplier,
    statNatureMultipliers: saved.dirty.has('nature') || speciesChanged ? {} : seed.statNatureMultipliers,
    speedScarfOverride: null,
    speedAbilityActive: false, knownOffense: speciesChanged ? { attack: false, spAttack: false } : seed.knownOffense } as QuickSide }
}

export function quickMagicProjection(side: QuickSide, row: Row) {
  const boosted = boostedStatForNature(side.nature)
  return effortMagicProjection(row, side.evs, side.nature, Boolean(boosted && namedNatureMagicAvailable(boosted, side)))
}

export function quickStat(side: QuickSide, row: Row, key: EffortStatKey) {
  const override = side.actual[key]
  if (override !== undefined) return /^\d+$/.test(override) && Number(override) >= 1 && Number(override) <= 999 ? Number(override) : null
  return actualStat(row[key], side.evs[key], quickStatNature(side, key, key === 'hp' ? 1 : natureMultiplier(side.nature, key)), key === 'hp')
}
