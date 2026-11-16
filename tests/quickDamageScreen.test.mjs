import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const screen = readFileSync(new URL('../src/features/damage/QuickDamageView.tsx', import.meta.url), 'utf8')
const card = readFileSync(new URL('../src/features/damage/QuickSideCard.tsx', import.meta.url), 'utf8')
const statEditor = readFileSync(new URL('../src/features/damage/QuickStatEditor.tsx', import.meta.url), 'utf8')
const compactEditor = readFileSync(new URL('../src/shared/display/CompactStatEditor.tsx', import.meta.url), 'utf8')
const calculator = readFileSync(new URL('../src/features/damage/calculateQuickDamage.ts', import.meta.url), 'utf8')
const io = readFileSync(new URL('../src/adapters/persistence/quickDamage.ts', import.meta.url), 'utf8')
const hook = readFileSync(new URL('../src/features/damage/useQuickDamageState.ts', import.meta.url), 'utf8')
const result = readFileSync(new URL('../src/features/damage/QuickDamageResult.tsx', import.meta.url), 'utf8')
const translations = readFileSync(new URL('../src/shared/display/translation.ts', import.meta.url), 'utf8')

test('standalone damage reuses real picker and engine without changing party entries', () => {
  assert.match(screen, /<PokemonSearchField id=\{`quick-\$\{side\}`\}/)
  assert.match(calculator, /calcDamage\(foulPlay \? \{ \.\.\.sourceStats, attack: targetStats\.attack \} : sourceStats, targetStats/)
  assert.match(io, /resolvePort\(source\)\.setItem\(QUICK_KEY/)
  assert.match(hook, /writeQuickStandalone\(\(\) => window\.localStorage/ )
  assert.doesNotMatch(screen, /setParty\(|setOpponents\(|updatePartyMember\(/)
})

test('both swapped cards keep every damage-relevant stat visible and repairable', () => {
  assert.match(card, /<QuickStatEditor[^]*stats=\{EFFORT_STAT_OPTIONS\.map/)
  assert.match(statEditor, /<CompactStatEditor/)
  assert.match(compactEditor, /<PokemonStatGrid stats=\{stats\} showEffort/)
  assert.match(compactEditor, /renderTune=\{\(\) => tuneContent\}/)
  assert.match(statEditor, /delete actual\[key\]/)
})

test('multihit summed rolls cannot be presented as exact KO probability', () => {
  assert.match(result, /result\.hits > 1 \? <p>\{lt\('연속기는 기절 확률 계산 제외'\)\}<\/p> : null/)
  for (const label of ['KO probability is not calculated for multihit moves', '連続技のひんし確率は計算対象外']) assert.ok(translations.includes(label))
})
