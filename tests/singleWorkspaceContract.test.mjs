import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const card = readFileSync(new URL('../src/features/damage/QuickSideCard.tsx', import.meta.url), 'utf8')
const speed = readFileSync(new URL('../src/features/damage/QuickSpeedPresentation.tsx', import.meta.url), 'utf8')
const conditions = readFileSync(new URL('../src/features/damage/QuickConditions.tsx', import.meta.url), 'utf8')
const quick = readFileSync(new URL('../src/features/damage/QuickDamageView.tsx', import.meta.url), 'utf8')
const result = readFileSync(new URL('../src/features/damage/QuickDamageResult.tsx', import.meta.url), 'utf8')
const quickProps = readFileSync(new URL('../src/features/damage/QuickDamagePanel.tsx', import.meta.url), 'utf8')
const single = readFileSync(new URL('../src/features/single/SingleEntryComparison.tsx', import.meta.url), 'utf8')
assert.match(app, /mainSection === 'single' \? <SingleEntryComparison/)

test('entry selectors render inside the actual comparison panel and disable independent identity search/swap', () => {
  assert.match(quickProps, /entrySelectors\?: \(opponentSearch: React\.ReactNode, reset: React\.ReactNode\) => React\.ReactNode/)
  assert.match(quick, /entrySelectors\?\.\(speciesSearch\('defender'/)
  assert.match(quick, /<PokemonSearchField id={`quick-\${side}`}/)
  assert.match(quick, /!comparisonMode \? <div className="quick-heading-actions"><button type="button" className="action-button"[^]*?포켓몬 1·2 바꾸기/)
  assert.doesNotMatch(single, /<section className="panel wide"><h2>/)
  assert.match(single, /entrySelectors=\{/)
})

test('unknown sources are localized beside build values and temporary battle controls remain visible', () => {
  assert.doesNotMatch(quick, /className="quick-source-badges"/)
  assert.match(card, /sourceLabels = \{/)
  const speedSummary = quick.slice(quick.indexOf('const speedStrip ='), quick.indexOf('const sideBattleControls ='))
  assert.doesNotMatch(speedSummary, /quick-speed-current|quick-speed-source/)
  assert.match(card, /natureSourceStatus\(\)/)
  assert.doesNotMatch(card, /quick-stat-evidence|sourceStatus\(stat\.key\)|opponentSource\?\.knownOffense/)
  assert.match(card, /sourceLabels\.natureUnknown/)
  assert.match(conditions, /계산 조건 · 이 대면만/)
})

test('single speed shares one scale and build cards hold speed controls; selected damage omits raw rolls', () => {
  assert.match(speed, /className="quick-speed-comparison-card"/)
  assert.match(speed, /className="quick-speed-lanes"/)
  assert.match(speed, /className=\{`quick-speed-lane quick-speed-lane-\$\{side\}`\}/)
  assert.doesNotMatch(speed, /quick-speed-summary|quick-speed-card|quick-speed-assumptions|speedScarfOverride|quick-speed-base-badge/)
  assert.match(card, /base: stat\.key === 'speed' \? projectedRow\.speed : undefined/)
  assert.match(result, /<div className=\{`quick-result\$\{selectedVerdict[^]*?aria-live="polite"/)
  assert.doesNotMatch(quick, /className="quick-rolls"/)
  assert.match(css, /\.single-workspace/)
})
