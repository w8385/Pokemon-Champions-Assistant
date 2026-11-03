import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const card = readFileSync(new URL('../src/features/damage/QuickSideCard.tsx', import.meta.url), 'utf8')
const speed = readFileSync(new URL('../src/features/damage/QuickSpeedPresentation.tsx', import.meta.url), 'utf8')
const conditions = readFileSync(new URL('../src/features/damage/QuickConditions.tsx', import.meta.url), 'utf8')
const panel = readFileSync(new URL('../src/features/damage/QuickDamageView.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')

test('one Speed/damage result precedes the real inline editing cards and battle conditions', () => {
  const view = panel.slice(panel.indexOf('return <section className={`panel wide quick-damage'))
  const order = ['{entrySelectors?.(', 'className="quick-comparison-results"', '<QuickSpeedPresentation', '<QuickDamageResult', 'className="quick-sides"', '<QuickConditionsView']
  let previous = -1
  for (const marker of order) { const position = view.indexOf(marker); assert.ok(position > previous, `${marker} must follow previous region`); previous = position }
  assert.equal((view.match(/className="quick-sides"/g) ?? []).length, 1)
  assert.equal((view.match(/className="quick-comparison-results"/g) ?? []).length, 1)
  assert.equal((view.match(/<QuickSpeedPresentation/g) ?? []).length, 1)
  assert.equal((view.match(/<QuickDamageResult/g) ?? []).length, 1)
  assert.match(view, /<QuickSideCard key=\{side\}/)
  assert.match(card, /<PokemonBuildFields/)
  assert.match(card, /<PokemonStatGrid/)
  assert.match(card, /<MoveSlotsEditor label=\{lt\('기술 배치'\)\}/)
  assert.doesNotMatch(css, /\.quick-sides\s*\{\s*order:/)
})

test('Speed values and source uncertainty render once beside their real controls', () => {
  assert.equal((speed.match(/className="quick-speed-track"/g) ?? []).length, 1)
  assert.doesNotMatch(panel, /quick-speed-current|quick-speed-source|quick-assumptions|가정의 출처와 한계/)
  assert.match(card, /sourceStatus\('nature'\)/)
  assert.match(card, /stat\.key === 'attack' \|\| stat\.key === 'spAttack'/)
  assert.match(card, /sourceStatus\(stat\.key\)/)
  assert.match(card, /entry\.statNatureMultipliers\[stat\.key\]/)
  assert.match(speed, /quick-speed-assumptions/)
  assert.match(panel, /className="quick-record-actions"/)
  assert.doesNotMatch(panel, /single-entry-commit/)
  assert.match(card, /sharedMoveSpecies\?\./)
})

test('common speed tracks use equal label and numeric lanes rather than intrinsic label widths', () => {
  const row = css.match(/\.quick-speed-overview-bars > div \{([^}]+)\}/)[1]
  assert.match(row, /display:\s*grid/)
  assert.match(row, /grid-template-columns:[^;]+5ch/)
  assert.match(css, /\.quick-speed-overview-bars > div > span \{[^}]*overflow-wrap:\s*anywhere/)
})

test('new concise state and condition labels have explicit English and Japanese text', () => {
  for (const language of ['ko', 'en', 'ja']) {
    assert.match(card, new RegExp(`${language}: \\{[^\\n]*shared: [^\\n]*condition: [^\\n]*battle:`))
  }
  assert.doesNotMatch(panel, /sourceLabels\.saved/)
  assert.match(card, /sourceLabels\.shared/)
  assert.match(conditions, /sourceLabels\.condition/)
  assert.match(conditions, /sourceLabels\.battle/)
  assert.match(card, /draft: '비교 초안'/)
  assert.match(card, /draft: 'Comparison draft'/)
  assert.match(card, /draft: '比較下書き'/)
})
