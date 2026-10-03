import type { ImportExportPayload } from './app/types'
import { supportedSpeciesKeys } from './effectiveRoster.ts'

const record = (input: unknown): input is Record<string, unknown> =>
  input !== null && typeof input === 'object' && !Array.isArray(input)
const string = (input: unknown) => typeof input === 'string'
const nonBlank = (input: unknown) => string(input) && input.trim().length > 0
// An empty key represents a deliberately unfilled roster slot.
const speciesKey = (input: unknown) => string(input) && (input === '' || supportedSpeciesKeys.has(input))
const boolean = (input: unknown) => typeof input === 'boolean'
const number = (input: unknown) => typeof input === 'number' && Number.isFinite(input)
const strings = (input: unknown) => Array.isArray(input) && input.every(string)
const optionalFields = (input: Record<string, unknown>, fields: Record<string, (value: unknown) => boolean>) =>
  Object.entries(fields).every(([key, check]) => input[key] === undefined || check(input[key]))
const requiredFields = (input: Record<string, unknown>, fields: Record<string, (value: unknown) => boolean>) =>
  Object.entries(fields).every(([key, check]) => check(input[key]))
const numericFields = (keys: string[]) => Object.fromEntries(keys.map(key => [key, number]))
const textFields = (keys: string[]) => Object.fromEntries(keys.map(key => [key, string]))
const boolFields = (keys: string[]) => Object.fromEntries(keys.map(key => [key, boolean]))
const member = (input: unknown): boolean => record(input) && speciesKey(input.key) && optionalFields(input, {
  ...textFields(['item', 'ability']), picked: boolean,
  config: value => record(value) && optionalFields(value, { nature: string, scarf: boolean, speedStage: number }),
  evs: value => record(value) && optionalFields(value, numericFields(['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'])),
  tuning: value => record(value) && optionalFields(value, numericFields(['magicNumber', 'maxValue'])),
})
const completeMember = (input: unknown): boolean => member(input) && record(input) && requiredFields(input, {
  key: speciesKey, item: string, ability: string, picked: boolean,
  config: value => record(value) && requiredFields(value, { nature: string, scarf: boolean, speedStage: number }),
  evs: value => record(value) && requiredFields(value, numericFields(['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'])),
  tuning: value => record(value) && requiredFields(value, numericFields(['magicNumber', 'maxValue'])),
})
const opponent = (input: unknown): boolean => record(input) && speciesKey(input.key) && optionalFields(input, {
  ...textFields(['item', 'ability', 'notes', 'moveName']), revealedMoves: strings,
  ...boolFields(['natureBoost', 'scarf', 'picked']),
  ...numericFields(['speedStage', 'hpEv', 'defenseEv', 'spDefenseEv', 'speedEv', 'defenseNature', 'spDefenseNature']),
})
const roster = (input: unknown, check: (value: unknown) => boolean): input is Record<string, unknown>[] =>
  Array.isArray(input) && input.every(check) && input.filter(entry => entry.picked === true).length <= 3
const entries = (input: unknown, check: (value: unknown) => boolean) => Array.isArray(input) && input.every(check)
const savedSample = (input: unknown): boolean => record(input) && completeMember(input.member) &&
  record(input.member) && input.member.key !== '' && requiredFields(input, {
  id: nonBlank, label: nonBlank, lockedMoves: strings,
})
const savedPreset = (input: unknown): boolean => record(input) && roster(input.party, completeMember) &&
  input.party.length > 0 && input.party.some(entry => entry.key !== '') && requiredFields(input, {
  id: nonBlank, label: nonBlank, lockedMovesBySlot: value => entries(value, strings),
})
const linkDraft = (input: unknown): boolean => record(input) && optionalFields(input, {
  ...textFields(['sourceUrl', 'contentKind', 'platform', 'language', 'format', 'status']),
  creator: value => value === null || string(value), rank: value => value === null || string(value),
})
const stringMap = (input: unknown) => record(input) && Object.values(input).every(strings)
const powerMap = (input: unknown) => record(input) && Object.values(input).every(value => boolean(value) || number(value))

/** Reject incompatible backups before React setters can mutate the workspace. */
export function validateBackup(value: unknown): ImportExportPayload {
  if (!record(value) || value.version !== 1 || !roster(value.party, member) || !roster(value.opponents, opponent)) {
    throw new Error('Invalid backup version or roster shape')
  }
  const fields: Record<string, (input: unknown) => boolean> = {
    ...numericFields(['selectedMy', 'selectedOpp', 'calcAttackStage', 'calcDefenseStage', 'calcHitCount', 'calcFaintedAllies', 'calcOpponentHpEv', 'calcOpponentDefenseEv', 'calcOpponentSpDefenseEv', 'calcOpponentAttackEv', 'calcOpponentSpAttackEv', 'calcOpponentAttackNature', 'calcOpponentSpAttackNature', 'calcOpponentDefenseNature', 'calcOpponentSpDefenseNature']),
    ...boolFields(['calcSwapSides', 'calcBurned', 'calcCritical', 'calcAttackerLowHp', 'calcTargetPoisoned', 'calcDefenderFullHp', 'calcDefenderDisguise', 'calcMovedAfterTarget', 'calcParentalBond', 'calcDefenderStatused', 'calcElectromorphosisCharged', 'calcReflect', 'calcLightScreen', 'calcAuroraVeil', 'calcFriendGuard', 'calcTypeChangeStab']),
    ...textFields(['calcWeather', 'calcTerrain', 'calcRivalryMode', 'calcOpponentBulkPreset', 'calcOpponentOffensePreset', 'battleNote']),
    sampleForge: member,
    savedSamples: input => entries(input, savedSample),
    savedPartyPresets: input => entries(input, savedPreset),
    creatorLinkDrafts: input => entries(input, linkDraft),
    sampleSpeedTargets: input => entries(input, opponent),
    sampleDamageTargets: input => entries(input, opponent),
    sampleLockedMoves: strings,
    confirmedMovesByKey: stringMap,
    calcConditionalPowerValues: powerMap,
    mainSection: input => ['home', 'single', 'double', 'sample', 'dex', 'speedLine'].includes(input as string),
    activeTab: input => ['party', 'pick', 'speed', 'power'].includes(input as string),
    sampleWorkbenchTab: input => ['builder', 'speed', 'damage', 'library', 'rankers'].includes(input as string),
  }
  for (const [key, check] of Object.entries(fields)) {
    if (value[key] !== undefined && !check(value[key])) throw new Error(`Invalid backup ${key} shape`)
  }
  return value as ImportExportPayload
}
