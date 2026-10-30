import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const quick = app.slice(app.indexOf('function QuickDamagePanel('), app.indexOf('function LanguageIcon('))
const single = app.slice(app.indexOf("mainSection === 'single' ? <div"), app.indexOf("(mainSection === 'party'", app.indexOf("mainSection === 'single' ? <div")))

test('entry selectors render inside the actual comparison panel and disable independent identity search/swap', () => {
  assert.match(quick, /entrySelectors\?: \(opponentSearch: React\.ReactNode, reset: React\.ReactNode\) => React\.ReactNode/)
  assert.match(quick, /entrySelectors\?\.\(speciesSearch\('defender'/)
  assert.match(quick, /<PokemonSearchField id={`quick-\${side}`}/)
  assert.match(quick, /!comparisonMode \? <button type="button" className="action-button"[^]*?공격측·방어측 바꾸기/)
  assert.doesNotMatch(single, /<section className="panel wide"><h2>/)
  assert.match(single, /entrySelectors=\{/)
})

test('unknown sources are localized beside build values and temporary battle controls remain visible', () => {
  assert.doesNotMatch(quick, /className="quick-source-badges"/)
  assert.match(quick, /sourceLabels = \{/)
  const speedSummary = quick.slice(quick.indexOf('const speedStrip ='), quick.indexOf('const sideBattleControls ='))
  assert.doesNotMatch(speedSummary, /quick-speed-current|quick-speed-source/)
  assert.match(quick, /sourceStatus\('nature'\)/)
  assert.match(quick, /stat\.key === 'attack' \|\| stat\.key === 'spAttack'/)
  assert.match(quick, /sourceStatus\(stat\.key\)/)
  assert.match(quick, /opponentSource\?\.knownOffense/)
  assert.match(quick, /sourceLabels\.natureUnknown/)
  assert.match(quick, /계산 조건 · 이 대면만/)
})

test('single speed shares one scale and build cards hold speed controls; rolls remain visible', () => {
  assert.match(quick, /quick-speed-summary/)
  assert.match(quick, /quick-speed-card/)
  assert.match(quick, /className="quick-speed-assumptions"/)
  assert.match(quick, /<div className=\{`quick-result\$\{selectedVerdict[^]*?aria-live="polite"/)
  assert.match(quick, /className="quick-rolls"/)
  assert.match(css, /\.single-workspace/)
})
