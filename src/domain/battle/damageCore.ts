import type { CalcMode, MoveMeta } from '../../app/types'

export type DamageCalcModifiers = {
  attackMultiplier?: number
  defenseMultiplier?: number
  powerMultiplier?: number
  fixedBpMods?: number[]
  finalMultiplier?: number
  fixedFinalMods?: number[]
  spreadMod?: number
  weatherMod?: number
  incomingScreenName?: string | null
  critical?: boolean
  burned?: boolean
  ignoreFirstHitDamage?: boolean
}
export type BattleStatBlock = {
  hp: number
  attack: number
  defense: number
  spAttack: number
  spDefense: number
}

export const DAMAGE_MOD_SCALE = 4096

function pokeRound(num: number) {
  return num % 1 > 0.5 ? Math.ceil(num) : Math.floor(num)
}

export function chainMods(mods: number[], lowerBound = 410, upperBound = 131172) {
  let value = DAMAGE_MOD_SCALE
  for (const mod of mods) {
    if (mod !== DAMAGE_MOD_SCALE) value = (value * mod + 2048) >> 12
  }
  return Math.max(Math.min(value, upperBound), lowerBound)
}

function fixedMod(multiplier = 1) {
  return Math.round(multiplier * DAMAGE_MOD_SCALE)
}

function applyFixedMod(value: number, mod: number) {
  return Math.floor((value * mod) / DAMAGE_MOD_SCALE)
}

export function engineMovePower(power: number, multiplier = 1, fixedBpMods: number[] = []) {
  if (fixedBpMods.length) return Math.max(1, pokeRound(Math.floor(power) * chainMods([fixedMod(multiplier), ...fixedBpMods], 41, 2097152) / DAMAGE_MOD_SCALE))
  return Math.max(1, applyFixedMod(Math.floor(power), fixedMod(multiplier)))
}

function getBaseDamage(level: number, basePower: number, attack: number, defense: number) {
  return Math.floor(Math.floor(Math.floor(((2 * level) / 5 + 2) * basePower * attack / defense) / 50) + 2)
}

function getFinalDamageRoll(baseAmount: number, roll: number, effectiveness: number, isBurned: boolean, stabMod: number, finalMod: number) {
  if (effectiveness <= 0) return 0
  let damageAmount = Math.floor((baseAmount * roll) / 100)
  if (stabMod !== DAMAGE_MOD_SCALE) damageAmount = Math.floor((damageAmount * stabMod) / DAMAGE_MOD_SCALE)
  damageAmount = Math.floor(pokeRound(damageAmount) * effectiveness)
  if (damageAmount <= 0) return 0
  if (isBurned) damageAmount = Math.floor(damageAmount / 2)
  const finalDamage = pokeRound((damageAmount * finalMod) / DAMAGE_MOD_SCALE)
  return finalDamage <= 0 ? 0 : Math.max(1, finalDamage)
}

export function calcDamage(attacker: BattleStatBlock, defender: BattleStatBlock, movePower: number, mode: CalcMode, stab = 1.5, effectiveness = 1, moveMeta?: MoveMeta | null, modifiers?: DamageCalcModifiers) {
  const resolvedMode = moveMeta?.category === 'physical' || moveMeta?.category === 'special' ? moveMeta.category : mode
  const resolvedPower = typeof moveMeta?.power === 'number' ? moveMeta.power : movePower
  if (!resolvedPower) return null
  let attackStat = resolvedMode === 'physical' ? attacker.attack : attacker.spAttack
  let defenseStat = resolvedMode === 'physical' ? defender.defense : defender.spDefense
  if (moveMeta?.usesDefenseAsAttack) attackStat = attacker.defense
  if (moveMeta?.targetsDefenseStat === 'defense') defenseStat = defender.defense
  if (moveMeta?.targetsDefenseStat === 'spDefense') defenseStat = defender.spDefense
  const attackMod = fixedMod(modifiers?.attackMultiplier ?? 1)
  const defenseMod = fixedMod(modifiers?.defenseMultiplier ?? 1)
  const level = 50
  const scaledAttack = Math.max(1, applyFixedMod(Math.floor(attackStat), attackMod))
  const scaledDefense = Math.max(1, applyFixedMod(Math.floor(defenseStat), defenseMod))
  const hitPowers = moveMeta?.hitPowers?.length ? moveMeta.hitPowers : Array.from({ length: Math.max(1, moveMeta?.hits ?? 1) }, () => resolvedPower)
  const finalMod = chainMods([fixedMod(modifiers?.finalMultiplier ?? 1), ...(modifiers?.fixedFinalMods ?? [])], 41, 131072)
  const stabMod = fixedMod(stab)
  const rolls = Array.from({ length: 16 }, (_, idx) => 85 + idx).map((random) => hitPowers.reduce((sum, power, hitIdx) => {
    if (modifiers?.ignoreFirstHitDamage && hitIdx === 0) return sum
    const scaledPower = engineMovePower(power, modifiers?.powerMultiplier ?? 1, modifiers?.fixedBpMods)
    let base = getBaseDamage(level, scaledPower, scaledAttack, scaledDefense)
    if (modifiers?.spreadMod) base = pokeRound(base * modifiers.spreadMod / DAMAGE_MOD_SCALE)
    if (modifiers?.weatherMod) base = pokeRound(base * modifiers.weatherMod / DAMAGE_MOD_SCALE)
    if (modifiers?.critical) base = applyFixedMod(base, fixedMod(1.5))
    return sum + getFinalDamageRoll(base, random, effectiveness, Boolean(modifiers?.burned), stabMod, finalMod)
  }, 0))
  const min = rolls[0]
  const max = rolls[rolls.length - 1]
  return {
    min,
    max,
    rolls,
    minPct: ((min / defender.hp) * 100).toFixed(1),
    maxPct: ((max / defender.hp) * 100).toFixed(1),
  }
}
