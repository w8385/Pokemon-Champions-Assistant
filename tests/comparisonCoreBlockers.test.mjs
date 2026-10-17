import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { writeDraft, forgetDraft, readDraft } from '../src/comparisonDraftState.ts'
import { pairTarget, resetPairAssumptions } from '../src/comparisonPairState.ts'

const build = (key, ability = '') => ({ key, ability, item: '', nature: 'hardy', evs: { hp: 0, attack: 12, defense: 0, spAttack: 0, spDefense: 0, speed: 11 }, moves: ['move', '', '', ''], battle: { burned: false, attackStage: 0 }, actual: {}, speedStage: 0, speedNatureKnown: false, speedNatureMultiplier: 0.9, statNatureMultipliers: { defense: 1.1 }, speedScarfOverride: null, speedAbilityActive: false, knownOffense: { attack: false, spAttack: false } })
const assumed = (entry) => ({ ...entry, battle: { burned: true, attackStage: 6 }, actual: { speed: '999' }, speedStage: 6, speedNatureKnown: false, speedNatureMultiplier: 1.1, statNatureMultipliers: { defense: 0.9 }, speedScarfOverride: true, speedAbilityActive: true })

test('target identity distinguishes species/form and slot, not seed build edits; A→B→A resets again', () => {
  const a = build('a'), b = build('mega-a')
  assert.notEqual(pairTarget(0, a), pairTarget(0, b))
  assert.notEqual(pairTarget(0, a), pairTarget(1, a))
  assert.equal(pairTarget(0, a), pairTarget(0, { ...a, evs: { ...a.evs, speed: 22 } }))
  let previous = pairTarget(0, a)
  for (const next of [b, a]) {
    const target = pairTarget(0, next)
    assert.notEqual(target, previous)
    previous = target
  }
})

test('either target change resets both temporary sides without discarding opposite dirty build or seed knownness', () => {
  const ownSeed = build('a'), oppositeSeed = build('b')
  const dirtyOpposite = assumed({ ...oppositeSeed, ability: 'edited', evs: { ...oppositeSeed.evs, defense: 22 }, moves: ['edited move', '', '', ''] })
  const cleaned = resetPairAssumptions(dirtyOpposite, oppositeSeed, new Set(['ability', 'defense', 'moves']))
  assert.equal(cleaned.ability, 'edited')
  assert.equal(cleaned.evs.defense, 22)
  assert.equal(cleaned.moves[0], 'edited move')
  assert.deepEqual(cleaned.battle, oppositeSeed.battle)
  assert.deepEqual(cleaned.actual, {})
  assert.equal(cleaned.speedStage, 0)
  assert.equal(cleaned.speedNatureKnown, false)
  assert.equal(cleaned.speedNatureMultiplier, 0.9)
  assert.deepEqual(cleaned.statNatureMultipliers, { defense: 1.1 })
  assert.equal(cleaned.speedScarfOverride, null)
  assert.equal(cleaned.speedAbilityActive, false)
  assert.deepEqual(cleaned.knownOffense, oppositeSeed.knownOffense)
  const ownCleaned = resetPairAssumptions(assumed(ownSeed), ownSeed, new Set())
  assert.equal(ownCleaned.battle.burned, false)
})

test('dirty nature follows edited build while pair assumptions clear', () => {
  const seed = build('a')
  const cleaned = resetPairAssumptions(assumed({ ...seed, nature: 'jolly' }), seed, new Set(['nature']))
  assert.equal(cleaned.nature, 'jolly')
  assert.equal(cleaned.speedNatureKnown, true)
  assert.deepEqual(cleaned.statNatureMultipliers, {})
})

test('saved seed build updates keep pair target and opposite draft; changed target resets both', () => {
  const own = build('a'), opponent = build('b')
  const dirtyOther = assumed({ ...opponent, ability: 'edited' })
  const original = [pairTarget(0, own), pairTarget(1, dirtyOther)]
  const savedSeed = { ...own, evs: { ...own.evs, speed: 22 } }
  assert.deepEqual([pairTarget(0, savedSeed), pairTarget(1, dirtyOther)], original)
  assert.equal(dirtyOther.battle.burned, true)
  const newPair = [pairTarget(0, { key: 'mega-a' }), pairTarget(1, dirtyOther)]
  assert.notDeepEqual(newPair, original)
  const ownAfter = resetPairAssumptions(assumed(savedSeed), savedSeed, new Set())
  const otherAfter = resetPairAssumptions(dirtyOther, opponent, new Set(['ability']))
  assert.equal(ownAfter.battle.burned, false)
  assert.equal(otherAfter.battle.burned, false)
  assert.equal(otherAfter.ability, 'edited')
})

test('paired editor consumes target reconciliation and failed-write status', () => {
  const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const quick = source.slice(source.indexOf('function QuickDamagePanel('), source.indexOf('function LanguageIcon('))
  assert.match(quick, /previousTargets\.current\[index\]/)
  assert.match(quick, /if \(pairChanged\) \{[^]*?setModalSide\(null\)[^]*?resetPairAssumptions\(prev, initialSides\[0\], dirty\.attacker\)[^]*?resetPairAssumptions\(prev, initialSides\[1\], dirty\.defender\)/)
  assert.match(quick, /const next = pairChanged \? resetPairAssumptions\(restored\.side/)
  assert.match(quick, /setDraftStorageFailed\(!\(ownKept && otherKept\)\)/)
  assert.match(quick, /draftStorageFailed \? language === 'en' \? 'Comparison draft · automatic storage failed/)
  assert.match(quick, /if \(!forgetDraft\(localStorage, side, slot\)\) setDraftStorageFailed\(true\)/)
})

test('draft quota/security failures return false, do not throw, and preserve live build', () => {
  const seed = build('a'), draft = { ...seed, nature: 'jolly' }
  const broken = { getItem: () => null, setItem: () => { throw new DOMException('quota', 'QuotaExceededError') }, removeItem: () => { throw new DOMException('blocked', 'SecurityError') } }
  assert.equal(writeDraft(broken, 'attacker', 0, seed, draft, new Set(['nature'])), false)
  assert.equal(writeDraft(broken, 'attacker', 0, seed, draft, new Set()), false)
  assert.equal(forgetDraft(broken, 'attacker', 0), false)
  assert.equal(draft.nature, 'jolly')
  assert.equal(readDraft(broken, 'attacker', 0, seed), null)
})

test('successful empty removal and forget report success without touching another draft', () => {
  const data = new Map()
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) }
  const seed = build('a')
  assert.equal(writeDraft(storage, 'attacker', 0, seed, { ...seed, nature: 'jolly' }, new Set(['nature'])), true)
  assert.equal(writeDraft(storage, 'defender', 0, seed, { ...seed, ability: 'edit' }, new Set(['ability'])), true)
  assert.equal(writeDraft(storage, 'attacker', 0, seed, seed, new Set()), true)
  assert.equal(readDraft(storage, 'attacker', 0, seed), null)
  assert.equal(forgetDraft(storage, 'defender', 0), true)
  assert.equal(readDraft(storage, 'defender', 0, seed), null)
})
