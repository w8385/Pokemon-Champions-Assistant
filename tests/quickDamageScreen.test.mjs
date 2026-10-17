import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const screen = app.slice(app.indexOf('function QuickDamagePanel('), app.indexOf('function LanguageIcon('))

test('standalone damage reuses real picker and engine without changing party entries', () => {
  assert.match(screen, /<PokemonSearchField id=\{`quick-\$\{side\}`\}/)
  assert.match(screen, /calcDamage\(foulPlay \? \{ \.\.\.sourceStats, attack: targetStats\.attack \} : sourceStats, targetStats/)
  assert.match(screen, /localStorage\.setItem\(QUICK_KEY/)
  assert.doesNotMatch(screen, /setParty\(|setOpponents\(|updatePartyMember\(/)
})

test('both swapped cards keep every damage-relevant stat visible and repairable', () => {
  assert.match(screen, /<PokemonStatGrid showEffort stats=\{EFFORT_STAT_OPTIONS\.map/)
  assert.match(screen, /<EffortTuningModal[^]*override=\{entry\.actual\}/)
  assert.match(screen, /delete actual\[key\]/)
})

test('multihit summed rolls cannot be presented as exact KO probability', () => {
  assert.match(screen, /result\.hits > 1 \? lt\('연속기는 기절 확률 계산 제외'\) :/)
  for (const label of ['KO probability is not calculated for multihit moves', '連続技のひんし確率は計算対象外']) assert.ok(app.includes(label))
})
