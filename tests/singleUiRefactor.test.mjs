import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const panel = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8').split('function QuickDamagePanel(')[1].split('function LanguageIcon(')[0]
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')

test('one Speed/damage result precedes the real inline editing cards and battle conditions', () => {
  const view = panel.slice(panel.indexOf('return <section className={`panel wide quick-damage'))
  const order = ['{entrySelectors?.(', 'className="quick-comparison-results"', '{speedStrip}', 'quick-result${selectedVerdict', 'className="quick-sides"', 'className="quick-conditions"']
  let previous = -1
  for (const marker of order) { const position = view.indexOf(marker); assert.ok(position > previous, `${marker} must follow previous region`); previous = position }
  assert.equal((view.match(/className="quick-sides"/g) ?? []).length, 1)
  assert.equal((view.match(/className="quick-comparison-results"/g) ?? []).length, 1)
  assert.equal((view.match(/\{speedStrip\}/g) ?? []).length, 1)
  assert.equal((view.match(/quick-result\$\{selectedVerdict/g) ?? []).length, 1)
  assert.match(view, /\{sideCard\('attacker', attacker, attackingRow, setAttacker\)\}\{sideCard\('defender', defender, defendingRow, setDefender\)\}/)
  assert.match(panel, /<PokemonBuildFields/)
  assert.match(panel, /<PokemonStatGrid/)
  assert.match(panel, /className="registered-move-grid quick-registered-moves"/)
  assert.doesNotMatch(css, /\.quick-sides\s*\{\s*order:/)
})

test('Speed values and source uncertainty render once beside their real controls', () => {
  assert.equal((panel.match(/className="quick-speed-track"/g) ?? []).length, 1)
  assert.doesNotMatch(panel, /quick-speed-current|quick-speed-source|quick-assumptions|가정의 출처와 한계/)
  assert.match(panel, /sourceStatus\('nature'\)/)
  assert.match(panel, /stat\.key === 'attack' \|\| stat\.key === 'spAttack'/)
  assert.match(panel, /sourceStatus\(stat\.key\)/)
  assert.match(panel, /entry\.statNatureMultipliers\[stat\.key\]/)
  assert.match(panel, /quick-speed-assumptions/)
  assert.match(panel, /className="quick-record-actions"/)
  assert.doesNotMatch(panel, /single-entry-commit/)
  assert.match(panel, /sharedMoveSpecies\?\./)
})

test('common speed tracks use equal label and numeric lanes rather than intrinsic label widths', () => {
  const row = css.match(/\.quick-speed-overview-bars > div \{([^}]+)\}/)[1]
  assert.match(row, /display:\s*grid/)
  assert.match(row, /grid-template-columns:[^;]+5ch/)
  assert.match(css, /\.quick-speed-overview-bars > div > span \{[^}]*overflow-wrap:\s*anywhere/)
})

test('new concise state and condition labels have explicit English and Japanese text', () => {
  for (const language of ['ko', 'en', 'ja']) {
    assert.match(panel, new RegExp(`${language}: \\{[^\\n]*shared: [^\\n]*condition: [^\\n]*battle:`))
  }
  assert.doesNotMatch(panel, /sourceLabels\.saved/)
  assert.match(panel, /sourceLabels\.shared/)
  assert.match(panel, /sourceLabels\.condition/)
  assert.match(panel, /sourceLabels\.battle/)
  assert.match(panel, /draft: '비교 초안'/)
  assert.match(panel, /draft: 'Comparison draft'/)
  assert.match(panel, /draft: '比較下書き'/)
})
