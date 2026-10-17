import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const quick = app.slice(app.indexOf('function QuickDamagePanel('), app.indexOf('function LanguageIcon('))
const single = app.slice(app.indexOf("mainSection === 'single' && activeTab === 'party' ? <div"), app.indexOf("(mainSection === 'party'", app.indexOf("mainSection === 'single' && activeTab === 'party' ? <div")))

test('entry selectors render inside the actual comparison panel and disable independent identity search/swap', () => {
  assert.match(quick, /entrySelectors\?: React\.ReactNode/)
  assert.match(quick, /\{entrySelectors\}/)
  assert.match(quick, /!comparisonMode && <PokemonSearchField/)
  assert.match(quick, /!comparisonMode \? <button type="button" className="action-button"[^]*?공수 교체/)
  assert.doesNotMatch(single, /<section className="panel wide"><h2>/)
  assert.match(single, /entrySelectors=\{/)
})

test('current assumptions are visible, localized and never imply a saved edit', () => {
  assert.match(quick, /<div className="quick-assumptions"/)
  assert.match(quick, /<strong>\{assumptionSummary\[language\]\}<\/strong>/)
  const speedSummary = quick.slice(quick.indexOf('const speedStrip ='), quick.indexOf('const sideBattleControls ='))
  assert.doesNotMatch(speedSummary, /속도 관계는 선공·승리 확정/)
  assert.match(quick, /상대 성격 전체·공격 노력은 미확인/)
  assert.match(quick, /속도 관계는 선공·승리 확정/)
})

test('single speed shares one scale and each card holds its own speed details; roll details are secondary', () => {
  assert.match(quick, /quick-speed-summary/)
  assert.match(quick, /quick-speed-card/)
  assert.match(quick, /className="quick-speed-details"><button[^]*?aria-expanded=\{speedOpen === side\}/)
  assert.match(quick, /<div className="quick-result" aria-live="polite"/)
  assert.match(quick, /<details><summary>\{lt\('16개 난수 피해'\)\}/)
  assert.match(css, /\.single-workspace/)
})
