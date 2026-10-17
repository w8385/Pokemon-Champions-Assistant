import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const panel = app.slice(app.indexOf('function QuickDamagePanel('), app.indexOf('\nfunction LanguageIcon()', app.indexOf('function QuickDamagePanel(')))
const selectors = app.slice(app.indexOf('entrySelectors={<div className="single-entry-selectors">'), app.indexOf('</div>} />', app.indexOf('entrySelectors={<div className="single-entry-selectors">')))

test('comparison entry links sit with their respective saved-slot selectors, not a detached four-link row', () => {
  assert.doesNotMatch(selectors, /<div className="inline-controls"><a href="#\/party">/)
  assert.match(selectors, /href="#\/party"[^>]*className="action-button"/)
  assert.match(selectors, /href="#\/single\?tab=pick"[^>]*className="action-button"/)
})

test('speed and damage deep links belong to their contextual result areas', () => {
  assert.match(panel, /quick-speed-summary[\s\S]*?href=\{detailHref\('speed'\)\}/)
  assert.match(panel, /quick-result[\s\S]*?href=\{detailHref\('power'\)\}/)
  assert.match(panel, /tab=\$\{tab\}&my=\$\{comparisonSlots\?\.\[0\]\s*\?\?\s*0\}&opp=\$\{comparisonSlots\?\.\[1\]\s*\?\?\s*0\}/)
})

test('both sides render registered moves before the secondary stat grid', () => {
  const rendered = panel.slice(panel.indexOf('return <section className={`panel wide quick-damage'))
  assert.ok(rendered.indexOf('className="quick-sides"') < rendered.indexOf('className="quick-stat-sides"'), 'both move grids must precede both stat grids in DOM/focus order')
  assert.match(css, /\.quick-stat-sides\s*\{[^}]*order:\s*5/)
})

test('applied speed assumptions and invalid reasons stay outside the source disclosure', () => {
  const speed = panel.slice(panel.indexOf('const speedStrip ='), panel.indexOf('const sideBattleControls ='))
  assert.match(speed, /className="quick-speed-current"/)
  assert.ok(speed.indexOf('className="quick-speed-current"') < speed.indexOf('<details className="quick-speed-source"'))
  assert.match(speed, /speedStage/)
  assert.match(speed, /speedNatureMultiplier/)
  assert.match(speed, /reason[\s\S]*?role="alert"/)
})

test('selected result and current damage conditions are visible near the move tiles', () => {
  assert.doesNotMatch(panel, /<details className="quick-result"/)
  assert.match(panel, /className="quick-result"[^>]*aria-live=/)
  assert.match(panel, /className="quick-condition-summary"/)
  assert.match(panel, /aria-expanded=\{conditionsOpen\}/)
  const rendered = panel.slice(panel.indexOf('return <section className={`panel wide quick-damage'))
  assert.ok(rendered.indexOf('className="quick-result"') < rendered.indexOf('className="quick-condition-grid"'))
  assert.ok(rendered.indexOf('className="quick-condition-grid"') < rendered.indexOf('className="quick-sides"'))
})
