import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const panel = app.slice(app.indexOf('function QuickDamagePanel('), app.indexOf('function LanguageIcon('))

test('Single exposes party slot identity, not an inner own-species search; Quick retains both free searches', () => {
  assert.match(panel, /comparisonMode \? null : speciesSearch\(side,/)
  assert.match(panel, /if \(comparisonMode && side === 'attacker'\) return/)
  assert.match(app, /const row = indexByKey\.get\(member\.key\); return <button/)
  assert.doesNotMatch(app, /singleDraftIdentity\.attacker \|\| member\.key/)
  assert.match(app, /side === 'attacker' && saved\.dirty\.has\('key'\)/)
})

test('Quick selected attacker moves keyboard focus to the existing defender search', () => {
  assert.match(panel, /if \(!comparisonMode && side === 'attacker'\) [^\n]*?quick-defender[^\n]*?focus\(\)/)
  assert.match(panel, /if \(key === \(side === 'attacker' \? attacker\.key : defender\.key\)\) \{[^\n]*quick-defender[^\n]*return \}/)
  assert.match(panel, /onSelect=\{key => selectSide\(side, key\)\}/)
})

test('Single has explicit opponent reset and commits species to registered slots', () => {
  assert.match(app, /onOpponentSpecies=\{registerSingleOpponentSpecies\}/)
  assert.match(panel, /onResetOpponents\?\.\(defenderSearch\)[^\n]*?title=\{lt\('상대 엔트리·비교 초안 초기화'\)\}>\{lt\('상대 초기화'\)\}/)
  assert.match(panel, /onOpponentSpecies\?\.\(key\)/)
  assert.match(panel, /opponentResetRevision/)
})

test('one-on-one damage hides ally-only Friend Guard and ignores stale persisted flag', () => {
  assert.doesNotMatch(panel.slice(panel.indexOf('const sideBattleControls'), panel.indexOf('return <section className={`panel wide quick-damage')), /\['friendGuard','프렌드가드'\]/)
  assert.match(panel, /friendGuard: false, critical: conditions\.critical/)
})

test('full-health labels use precise HP 100% wording without renaming battle state', () => {
  assert.doesNotMatch(app, /HP 만땅/)
  assert.match(panel, /\['fullHp','HP 100%'\]/)
  assert.match(panel, /fullHp/)
})
