import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/features/single/matchupWorkspace.css', import.meta.url), 'utf8')
const translations = readFileSync(new URL('../src/shared/display/translation.ts', import.meta.url), 'utf8')
const view = readFileSync(new URL('../src/features/damage/QuickDamageView.tsx', import.meta.url), 'utf8')
const panel = readFileSync(new URL('../src/features/damage/QuickSideCard.tsx', import.meta.url), 'utf8')
const single = readFileSync(new URL('../src/features/single/SingleEntryComparison.tsx', import.meta.url), 'utf8')
const selectors = single.slice(single.indexOf('entrySelectors={(opponentSearch, reset) =>'), single.indexOf('</div>} />', single.indexOf('entrySelectors={(opponentSearch, reset) =>')))

test('one shared top card splits party and opponent entry into equal internal panes', () => {
  assert.match(view, /entrySelectors\?\.\(speciesSearch\('defender', lt\('상대 엔트리 입력'\)\),/)
  assert.match(selectors, /className="unified-pair-pickers"[^]*?className="single-entry-picker-pane single-entry-picker-pane-party"[^]*?<strong>\{lt\('내 파티'\)\}<\/strong>[^]*?className="unified-pair-buttons"[^]*?className="single-entry-picker-pane single-entry-picker-pane-opponent"[^]*?className="single-picker-head single-opponent-picker-head"[^]*?<strong>\{lt\('상대 엔트리'\)\}<\/strong>[^]*?className="single-entry-toolbar"[^]*?className="selected-opponent-search">\{opponentSearch\}<\/div>\{reset\}[^]*?className="unified-pair-buttons"/)
  assert.equal((selectors.match(/\{opponentSearch\}/g) ?? []).length, 1)
  assert.equal((selectors.match(/\{reset\}/g) ?? []).length, 1)
  assert.doesNotMatch(selectors.slice(0, selectors.indexOf('single-entry-picker-pane-opponent')), /\{reset\}|\{opponentSearch\}/)
  assert.match(css, /\.single-workspace \.single-entry-toolbar\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) auto/)
  assert.match(css, /\.single-workspace \.single-opponent-picker-head\s*\{[^}]*grid-template-columns:\s*max-content minmax\(0, 1fr\)/)
  assert.match(css, /\.single-workspace \.single-entry-picker-pane-opponent\s*\{[^}]*padding-inline-start:\s*5px[^}]*border-inline-start:/)
  assert.match(css, /@media \(max-width: 760px\)[^]*?\.single-workspace \.unified-pair-pickers\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/)
  assert.match(css, /@media \(max-width: 760px\)[^]*?\.single-workspace \.single-entry-picker-pane-opponent\s*\{[^}]*border-block-start:[^}]*border-inline-start:\s*0/)
})

test('short visible reset keeps full destructive scope in accessible title and existing handler', () => {
  assert.match(view, /onResetOpponents\?\.\(defenderSearch\)/)
  assert.match(view, /title=\{lt\('상대 엔트리·비교 초안 초기화'\)\}[^>]*><UiIcon name="trash"[^>]*\/>\{lt\('상대 초기화'\)\}/)
  for (const label of ["'상대 초기화': 'Reset opponent'", "'상대 초기화': '相手を初期化'"]) assert.ok(translations.includes(label), label)
  assert.match(css, /\.single-entry-toolbar \.action-button\s*\{[^}]*min-height:\s*44px/)
  assert.match(css, /\.single-entry-toolbar input\s*\{[^}]*min-height:\s*44px/)
})

test('remove only repeated source-assumption badge strip while retaining field status and editors', () => {
  assert.doesNotMatch(panel, /className="quick-source-badges"/)
  assert.doesNotMatch(css, /\.quick-source-badges/)
  assert.match(panel, /<PokemonBuildFields/)
  assert.match(panel, /<QuickStatEditor/)
  assert.match(panel, /natureSourceStatus\(\)/)
  assert.match(panel, /natureSourceStatus\(\) === sourceLabels\.natureUnknown \? sourceLabels\.natureUnknown/)
  assert.doesNotMatch(panel, /quick-stat-evidence|sourceStatus\(stat\.key\)|opponentSource\?\.knownOffense/)
  assert.match(panel, /theme: statThemeClass\(stat\.key\), value: quickStat/)
  assert.match(panel, /showPresets=\{!comparisonMode \|\| side === 'defender'\}/)
  assert.match(panel, /className="quick-source-badge" role="status">\{learnsetStatusText/)
})
