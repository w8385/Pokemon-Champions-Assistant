import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const panel = app.slice(app.indexOf('function QuickDamagePanel('), app.indexOf('\nfunction LanguageIcon()', app.indexOf('function QuickDamagePanel(')))
const selectors = app.slice(app.indexOf('entrySelectors={opponentSearch =>'), app.indexOf('</div>} />', app.indexOf('entrySelectors={opponentSearch =>')))

test('single pair has no saved-record editing detour', () => {
  assert.doesNotMatch(selectors, /href="#\/single\?tab=pick"|href="#\/party"/)
  assert.match(panel, /onSaveEntry\?:/)
  assert.match(panel, /className="quick-record-actions"/)
  assert.doesNotMatch(panel, /className="single-entry-commit"/)
  assert.match(panel, /speciesSearch\('defender', lt\('상대 엔트리 입력'\)\)/)
  assert.match(selectors, /selected-opponent-search/)
})
test('one Speed comparison, compact provenance and battle conditions are expanded by default', () => {
  assert.match(panel, /className="quick-speed-summary"/)
  assert.match(panel, /className="quick-speed-card"/)
  assert.match(panel, /className="quick-rolls"/)
  assert.match(panel, /className="quick-condition-grid"/)
  assert.match(panel, /className="quick-source-badges"/)
  assert.doesNotMatch(panel, /<details|conditionsOpen|speedOpen|detailHref/)
})
test('same card contains shared build, effort and 2x2 move inputs', () => {
  assert.match(panel, /className="registered-move-grid quick-registered-moves"/)
  assert.match(panel, /\{statCard\(side, entry, row\)\}/)
  const card = panel.slice(panel.indexOf('const sideCard ='), panel.indexOf('const statCard ='))
  assert.ok(card.indexOf('{statCard(side, entry, row)}') < card.indexOf('className="registered-move-grid quick-registered-moves"'))
  assert.doesNotMatch(panel, /className="quick-build-sides"/)
  assert.match(panel, /<PokemonBuildFields/)
  assert.match(panel, /<PokemonStatGrid/)
  assert.match(css, /\.quick-registered-moves\s*\{[^}]*grid-template-columns:\s*repeat\(2/)
})
