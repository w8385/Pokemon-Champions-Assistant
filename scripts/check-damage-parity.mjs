import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const reportPath = path.join(root, 'reports', 'damageParityHarness.json')

const SCALE = 4096

function fixedMod(multiplier = 1) {
  return Math.round(multiplier * SCALE)
}

function applyFixedMod(value, mod) {
  return Math.floor((value * mod) / SCALE)
}

function pokeRound(num) {
  return num % 1 > 0.5 ? Math.ceil(num) : Math.floor(num)
}

function chainMods(mods, lowerBound = 410, upperBound = 131172) {
  let value = SCALE
  for (const mod of mods) {
    if (mod !== SCALE) value = (value * mod + 2048) >> 12
  }
  return Math.max(Math.min(value, upperBound), lowerBound)
}

function getBaseDamage(level, basePower, attack, defense) {
  return Math.floor(Math.floor(Math.floor(((2 * level) / 5 + 2) * basePower * attack / defense) / 50) + 2)
}

function getFinalDamageRoll(baseAmount, roll, effectiveness, isBurned, stabMod, finalMod) {
  let damageAmount = Math.floor((baseAmount * roll) / 100)
  if (stabMod !== SCALE) damageAmount = Math.floor((damageAmount * stabMod) / SCALE)
  damageAmount = Math.floor(pokeRound(damageAmount) * effectiveness)
  if (isBurned) damageAmount = Math.floor(damageAmount / 2)
  return Math.max(1, pokeRound((damageAmount * finalMod) / SCALE))
}

function legacyCalc(input) {
  const effectivePower = input.power * input.powerMultiplier
  const effectiveAttack = input.attack * input.attackMultiplier
  const effectiveDefense = input.defense * input.defenseMultiplier
  const levelFactor = Math.floor((2 * input.level) / 5) + 2
  const scaledAttack = Math.max(1, Math.floor(effectiveAttack))
  const scaledDefense = Math.max(1, Math.floor(effectiveDefense))
  const scaledPower = Math.max(1, Math.floor(effectivePower))
  const base = Math.floor(Math.floor((levelFactor * scaledPower * scaledAttack) / scaledDefense) / 50) + 2
  const critMultiplier = input.critical ? 1.5 : 1
  const commonModifier = input.stab * input.effectiveness * critMultiplier * input.finalMultiplier * (input.burned ? 0.5 : 1)
  return Array.from({ length: 16 }, (_, idx) => 85 + idx).map((roll) => Math.floor(base * commonModifier * (roll / 100)) * input.hits)
}

function parityCalc(input) {
  const power = Math.max(1, applyFixedMod(input.power, fixedMod(input.powerMultiplier)))
  const attack = Math.max(1, applyFixedMod(input.attack, fixedMod(input.attackMultiplier)))
  const defense = Math.max(1, applyFixedMod(input.defense, fixedMod(input.defenseMultiplier)))
  let base = getBaseDamage(input.level, power, attack, defense)
  if (input.critical) base = applyFixedMod(base, fixedMod(1.5))
  const finalMod = chainMods([fixedMod(input.finalMultiplier)])
  const stabMod = fixedMod(input.stab)
  return Array.from({ length: 16 }, (_, idx) => 85 + idx).map((roll) => getFinalDamageRoll(base, roll, input.effectiveness, input.burned, stabMod, finalMod) * input.hits)
}

const cases = [
  { name: 'neutral-stab', level: 50, power: 90, attack: 172, defense: 120, attackMultiplier: 1, defenseMultiplier: 1, powerMultiplier: 1, finalMultiplier: 1, stab: 1.5, effectiveness: 1, burned: false, critical: false, hits: 1 },
  { name: 'super-effective', level: 50, power: 90, attack: 187, defense: 135, attackMultiplier: 1, defenseMultiplier: 1, powerMultiplier: 1, finalMultiplier: 1, stab: 1.5, effectiveness: 2, burned: false, critical: false, hits: 1 },
  { name: 'burned-physical', level: 50, power: 80, attack: 178, defense: 172, attackMultiplier: 1, defenseMultiplier: 1, powerMultiplier: 1, finalMultiplier: 1, stab: 1.5, effectiveness: 1, burned: true, critical: false, hits: 1 },
  { name: 'sun-boosted-fire', level: 50, power: 110, attack: 194, defense: 137, attackMultiplier: 1, defenseMultiplier: 1, powerMultiplier: 1, finalMultiplier: 1.5, stab: 1.5, effectiveness: 1, burned: false, critical: false, hits: 1 },
  { name: 'terrain-boosted-electric', level: 50, power: 90, attack: 205, defense: 125, attackMultiplier: 1, defenseMultiplier: 1, powerMultiplier: 1, finalMultiplier: 1.3, stab: 1.5, effectiveness: 1, burned: false, critical: false, hits: 1 },
  { name: 'screened-hit', level: 50, power: 100, attack: 189, defense: 156, attackMultiplier: 1, defenseMultiplier: 1, powerMultiplier: 1, finalMultiplier: 0.5, stab: 1.5, effectiveness: 1, burned: false, critical: false, hits: 1 },
  { name: 'technician-item-stack', level: 50, power: 60, attack: 161, defense: 118, attackMultiplier: 1, defenseMultiplier: 1, powerMultiplier: 1.5, finalMultiplier: 1.2, stab: 1.5, effectiveness: 1, burned: false, critical: false, hits: 1 },
  { name: 'always-crit', level: 50, power: 70, attack: 182, defense: 128, attackMultiplier: 1, defenseMultiplier: 1, powerMultiplier: 1, finalMultiplier: 1, stab: 1.5, effectiveness: 1, burned: false, critical: true, hits: 1 },
  { name: 'multi-hit', level: 50, power: 50, attack: 177, defense: 110, attackMultiplier: 1, defenseMultiplier: 1, powerMultiplier: 1, finalMultiplier: 1, stab: 1.5, effectiveness: 1, burned: false, critical: false, hits: 2 },
]

function summarizeDiff(reference, candidate) {
  const deltas = reference.map((value, idx) => candidate[idx] - value)
  const abs = deltas.map((value) => Math.abs(value))
  return {
    maxAbsDiff: Math.max(...abs),
    meanAbsDiff: Number((abs.reduce((sum, value) => sum + value, 0) / abs.length).toFixed(3)),
    rollDiffs: deltas,
  }
}

const results = cases.map((entry) => {
  const reference = parityCalc(entry)
  const legacy = legacyCalc(entry)
  const current = parityCalc(entry)
  return {
    case: entry.name,
    input: entry,
    reference,
    legacy,
    current,
    legacyDiff: summarizeDiff(reference, legacy),
    currentDiff: summarizeDiff(reference, current),
  }
})

const report = {
  generatedAt: new Date().toISOString(),
  source: 'Showdown-style fixed-point parity harness for supported local modifiers',
  totals: {
    cases: results.length,
    legacyMaxAbsDiff: Math.max(...results.map((entry) => entry.legacyDiff.maxAbsDiff)),
    currentMaxAbsDiff: Math.max(...results.map((entry) => entry.currentDiff.maxAbsDiff)),
    legacyMeanAbsDiff: Number((results.reduce((sum, entry) => sum + entry.legacyDiff.meanAbsDiff, 0) / results.length).toFixed(3)),
    currentMeanAbsDiff: Number((results.reduce((sum, entry) => sum + entry.currentDiff.meanAbsDiff, 0) / results.length).toFixed(3)),
  },
  results,
}

await fs.mkdir(path.dirname(reportPath), { recursive: true })
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(`wrote ${path.relative(root, reportPath)}`)
console.log(`legacy max abs diff: ${report.totals.legacyMaxAbsDiff}`)
console.log(`current max abs diff: ${report.totals.currentMaxAbsDiff}`)
console.log(`legacy mean abs diff: ${report.totals.legacyMeanAbsDiff}`)
console.log(`current mean abs diff: ${report.totals.currentMeanAbsDiff}`)
