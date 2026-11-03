import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const card = readFileSync(new URL('../src/features/damage/QuickSideCard.tsx', import.meta.url), 'utf8')
const speed = readFileSync(new URL('../src/features/damage/QuickSpeedPresentation.tsx', import.meta.url), 'utf8')
const conditions = readFileSync(new URL('../src/features/damage/QuickConditions.tsx', import.meta.url), 'utf8')
const panel = readFileSync(new URL('../src/features/damage/QuickDamageView.tsx', import.meta.url), 'utf8')
const quickProps = readFileSync(new URL('../src/features/damage/QuickDamagePanel.tsx', import.meta.url), 'utf8')
const single = readFileSync(new URL('../src/features/single/SingleEntryComparison.tsx', import.meta.url), 'utf8')
const selectors = single.slice(single.indexOf('entrySelectors={(opponentSearch, reset) =>'), single.indexOf('</div>} />', single.indexOf('entrySelectors={(opponentSearch, reset) =>')))

test('single pair has no saved-record editing detour', () => {
  assert.doesNotMatch(selectors, /href="#\/single\?tab=pick"|href="#\/party"/)
  assert.match(quickProps, /onSaveEntry\?:/)
  assert.match(panel, /className="quick-record-actions"/)
  assert.doesNotMatch(panel, /className="single-entry-commit"/)
  assert.match(panel, /speciesSearch\('defender', lt\('상대 엔트리 입력'\)\)/)
  assert.match(selectors, /selected-opponent-search/)
})
test('one Speed comparison, compact provenance and battle conditions are expanded by default', () => {
  assert.match(speed, /className="quick-speed-summary"/)
  assert.match(speed, /className="quick-speed-card"/)
  assert.doesNotMatch(panel, /className="quick-rolls"/)
  assert.match(conditions, /className="quick-condition-grid"/)
  assert.doesNotMatch(panel, /className="quick-source-badges"/)
  assert.match(card, /sourceStatus\('nature'\)/)
  assert.doesNotMatch(panel, /<details|conditionsOpen|speedOpen|detailHref/)
})
test('same card contains shared build, effort and 2x2 move inputs', () => {
  assert.match(card, /<MoveSlotsEditor label=\{lt\('기술 배치'\)\}/)
  assert.match(card, /\{statCard\(side, entry, row\)\}/)
  const sideRegion = card.slice(card.indexOf('const sideCard ='), card.indexOf('const statCard ='))
  assert.ok(sideRegion.indexOf('{statCard(side, entry, row)}') < sideRegion.indexOf('<MoveSlotsEditor label='))
  assert.doesNotMatch(panel, /className="quick-build-sides"/)
  assert.match(card, /<PokemonBuildFields/)
  assert.match(card, /<PokemonStatGrid/)
  assert.match(css, /\.move-slots-editor-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2/)
})
