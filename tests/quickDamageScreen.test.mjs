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
const translations = readFileSync(new URL('../src/shared/display/translation.ts', import.meta.url), 'utf8')

test('standalone damage reuses real picker and engine without changing party entries', () => {
  assert.match(screen, /<PokemonSearchField id=\{`quick-\$\{side\}`\}/)
  assert.match(calculator, /const appliedSourceStats = foulPlay \? \{ \.\.\.sourceStats, attack: targetStats\.attack \} : sourceStats/)
  assert.match(calculator, /calcDamage\(appliedSourceStats, targetStats/)
  assert.match(io, /resolvePort\(source\)\.setItem\(QUICK_KEY/)
  assert.match(hook, /writeQuickStandalone\(\(\) => window\.localStorage/ )
  assert.doesNotMatch(screen, /setParty\(|setOpponents\(|updatePartyMember\(/)
})

test('both swapped cards keep every damage-relevant stat visible and repairable', () => {
  assert.match(card, /const stats = projectedRow \? EFFORT_STAT_OPTIONS\.map/)
  assert.match(card, /<QuickStatEditor[^]*stats=\{stats\}/)
  assert.match(statEditor, /<CompactStatEditor/)
  assert.match(compactEditor, /<PokemonStatGrid stats=\{stats\} showEffort/)
  assert.match(compactEditor, /renderPreview=\{renderPreview\}/)
  assert.doesNotMatch(compactEditor, /renderTune=|tuneContent/)
  assert.match(statEditor, /delete actual\[key\]/)
  assert.match(card, /label: lt\(stat\.label\), theme: statThemeClass\(stat\.key\), value:/)
  assert.doesNotMatch(card, /quick-stat-evidence|description: evidence|\uBBF8\uD655\uC778 \u00B7 \uACC4\uC0B0\uAC12 0/)
  assert.doesNotMatch(card, /sourceLabels\.modifier/)
})

test('move previews use the shared verdict guard instead of presenting exact multihit KO probability', () => {
  assert.match(card, /const previewVerdict = quickKoVerdict\(preview\)/)
  assert.match(card, /<DamageRangeMeter damage=\{preview\.damage\}[^>]*compact/)
  assert.doesNotMatch(card, /quick-ko-chance|damage\.rolls\.filter/)
})

test('Quick distinguishes unsupported damage moves from status moves and resolves Facade', () => {
  assert.match(card, /meta\?\.category === 'status' \? lt\('변화기'\) : lt\('계산 미지원'\)/)
  assert.match(calculator, /name === '객기' \? quickStatused\(source\)/)
  assert.match(calculator, /applyConditionalMovePower\(name, base, conditionalValue\)/)
  assert.ok(translations.includes('This move is unsupported under the current conditions.'))
})

test('move-only conditions and hit counts live inside their move tile, not the common condition panel', () => {
  const conditions = readFileSync(new URL('../src/features/damage/QuickConditions.tsx', import.meta.url), 'utf8')
  assert.match(card, /className="quick-move-local-condition"/)
  assert.match(card, /quickMoveConditionKey\(side, index, name\)/)
  assert.match(card, /name === '탁쳐서떨구기'/)
  assert.match(card, /multiHitOptions\(name\)/)
  assert.doesNotMatch(conditions, /lt\('타수'\)/)
})
