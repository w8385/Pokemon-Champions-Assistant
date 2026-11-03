import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const owner_3 = readFileSync(new URL('../src/features/damage/quickModel.ts', import.meta.url), 'utf8')

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const panel = readFileSync(new URL('../src/features/damage/QuickDamageView.tsx', import.meta.url), 'utf8')
const card = readFileSync(new URL('../src/features/damage/QuickSideCard.tsx', import.meta.url), 'utf8')
const controls = readFileSync(new URL('../src/features/damage/QuickConditions.tsx', import.meta.url), 'utf8')
const hook = readFileSync(new URL('../src/features/damage/useQuickDamageState.ts', import.meta.url), 'utf8')
const calculator = readFileSync(new URL('../src/features/damage/calculateQuickDamage.ts', import.meta.url), 'utf8')

test('Single exposes party slot identity, not an inner own-species search; Quick retains both free searches', () => {
  assert.match(card, /comparisonMode \? null : searchField/)
  assert.match(hook, /if \(comparisonMode && side === 'attacker'\) return/)
  assert.match(app, /const row = indexByKey\.get\(member\.key\); return <button/)
  assert.doesNotMatch(app, /singleDraftIdentity\.attacker \|\| member\.key/)
  assert.match(owner_3, /side === 'attacker' && saved\.dirty\.has\('key'\)/)
})

test('Quick selected attacker moves keyboard focus to the existing defender search', () => {
  assert.match(hook, /if \(!comparisonMode && side === 'attacker'\) [^\n]*?quick-defender[^\n]*?focus\(\)/)
  assert.match(hook, /if \(key === \(side === 'attacker' \? attacker\.key : defender\.key\)\) \{[^\n]*quick-defender[^\n]*return \}/)
  assert.match(panel, /onSelect=\{key => selectSide\(side, key\)\}/)
})

test('Single has explicit opponent reset and commits species to registered slots', () => {
  assert.match(app, /onOpponentSpecies=\{registerSingleOpponentSpecies\}/)
  assert.match(panel, /onResetOpponents\?\.\(defenderSearch\)[^\n]*?title=\{lt\('상대 엔트리·비교 초안 초기화'\)\}><UiIcon name="trash"[^>]*\/>\{lt\('상대 초기화'\)\}/)
  assert.match(hook, /onOpponentSpecies\?\.\(key\)/)
  assert.match(hook, /opponentResetRevision/)
})

test('one-on-one damage hides ally-only Friend Guard and ignores stale persisted flag', () => {
  assert.doesNotMatch(controls, /\['friendGuard','프렌드가드'\]/)
  assert.match(calculator, /friendGuard: false, critical: conditions\.critical/)
})

test('full-health labels use precise HP 100% wording without renaming battle state', () => {
  assert.doesNotMatch(app, /HP 만땅/)
  assert.match(controls, /\['fullHp','HP 100%'\]/)
  assert.match(controls, /fullHp/)
})
