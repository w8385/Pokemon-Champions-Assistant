import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const panel = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8').split('function QuickDamagePanel(')[1].split('function LanguageIcon(')[0]
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')

test('one comparison scale precedes both move cards, result, conditions, then inline builds in DOM order', () => {
  const view = panel.slice(panel.indexOf('return <section className={`panel wide quick-damage'))
  const order = ['{entrySelectors}', '{speedStrip}', 'className="quick-sides"', 'className="quick-result"', 'className="quick-conditions"', 'className="quick-build-sides"']
  let previous = -1
  for (const marker of order) { const position = view.indexOf(marker); assert.ok(position > previous, `${marker} must follow previous region`); previous = position }
  assert.match(panel, /<PokemonBuildFields/)
  assert.match(panel, /<PokemonStatGrid/)
  assert.match(panel, /className="registered-move-grid quick-registered-moves"/)
  assert.doesNotMatch(css, /\.quick-sides\s*\{\s*order:/)
})

test('Speed values and source uncertainty render once beside their real controls', () => {
  assert.equal((panel.match(/className="quick-speed-track"/g) ?? []).length, 1)
  assert.doesNotMatch(panel, /quick-speed-current|quick-speed-source|quick-assumptions|가정의 출처와 한계/)
  assert.match(panel, /sourceStatus\('nature'\)/)
  assert.match(panel, /sourceStatus\('attack'\)/)
  assert.match(panel, /sourceStatus\('spAttack'\)/)
  assert.match(panel, /\['defense', 'spDefense'\]/)
  assert.match(panel, /entry\.statNatureMultipliers\[key\]/)
  assert.match(panel, /quick-speed-assumptions/)
  assert.match(panel, /className="single-entry-commit"/)
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
    assert.match(panel, new RegExp(`${language}: \\{[^\\n]*saved: [^\\n]*shared: [^\\n]*condition: [^\\n]*battle:`))
  }
  assert.match(panel, /sourceLabels\.saved/)
  assert.match(panel, /sourceLabels\.shared/)
  assert.match(panel, /sourceLabels\.condition/)
  assert.match(panel, /sourceLabels\.battle/)
})
