import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/features/single/matchupWorkspace.css', import.meta.url), 'utf8')
const translations = readFileSync(new URL('../src/shared/display/translation.ts', import.meta.url), 'utf8')
const view = readFileSync(new URL('../src/features/damage/QuickDamageView.tsx', import.meta.url), 'utf8')
const panel = readFileSync(new URL('../src/features/damage/QuickSideCard.tsx', import.meta.url), 'utf8')
const selectors = app.slice(app.indexOf('entrySelectors={(opponentSearch, reset) =>'), app.indexOf('</div>} />', app.indexOf('entrySelectors={(opponentSearch, reset) =>')))

test('one shared top toolbar owns existing opponent search and scoped reset before paired selectors', () => {
  assert.match(view, /entrySelectors\?\.\(speciesSearch\('defender', lt\('상대 엔트리 입력'\)\),/)
  assert.match(selectors, /className="single-entry-toolbar"[^]*?className="selected-opponent-search">\{opponentSearch\}<\/div>[^]*?\{reset\}[^]*?className="unified-pair-pickers"/)
  assert.equal((selectors.match(/\{opponentSearch\}/g) ?? []).length, 1)
  assert.doesNotMatch(selectors.slice(selectors.indexOf('className="unified-pair-pickers"')), /\{reset\}|\{opponentSearch\}/)
  assert.match(selectors, /<strong>\{lt\('내 파티'\)\}<\/strong>/)
  assert.match(selectors, /<strong>\{lt\('상대 엔트리'\)\}<\/strong>/)
  assert.match(css, /\.quick-damage \.single-entry-toolbar\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) auto/)
  assert.match(css, /@media \(max-width: 600px\)[^]*?\.quick-damage \.single-entry-toolbar\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/)
})

test('short visible reset keeps full destructive scope in accessible title and existing handler', () => {
  assert.match(view, /onResetOpponents\?\.\(defenderSearch\)/)
  assert.match(view, /title=\{lt\('상대 엔트리·비교 초안 초기화'\)\}[^>]*><UiIcon name="trash"[^>]*\/>\{lt\('상대 초기화'\)\}/)
  for (const label of ["'상대 초기화': 'Reset opponent'", "'상대 초기화': '相手を初期化'"]) assert.ok(translations.includes(label), label)
  assert.match(css, /\.single-entry-toolbar \.action-button\s*\{[^}]*min-height:\s*44px/)
  assert.match(css, /\.single-entry-toolbar input\s*\{[^}]*min-height:\s*40px/)
})

test('remove only repeated source-assumption badge strip while retaining field status and editors', () => {
  assert.doesNotMatch(panel, /className="quick-source-badges"/)
  assert.doesNotMatch(css, /\.quick-source-badges/)
  assert.match(panel, /<PokemonBuildFields/)
  assert.match(panel, /<PokemonStatGrid showEffort/)
  assert.match(panel, /sourceStatus\('nature'\)/)
  assert.match(panel, /sourceStatus\('nature'\) === sourceLabels\.natureUnknown \? sourceLabels\.natureUnknown/)
  assert.match(panel, /stat\.key === 'attack' \|\| stat\.key === 'spAttack'/)
  assert.match(panel, /sourceStatus\(stat\.key\)/)
  assert.match(panel, /entry\.statNatureMultipliers\[stat\.key\]/)
  assert.match(panel, /onTune=\{\(\) =>/)
  assert.match(panel, /className="quick-source-badge" role="status">\{learnsetStatusText/)
})
