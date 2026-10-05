import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
test('sample speed uses the input-owning shared picker and App delegates species search and scarf modifier', () => {
  assert.match(app, /<PokemonSearchField[^>]*id="sample-speed-add"/)
  assert.match(app, /searchPokemon\(rows, query/)
  assert.match(app, /applyChoiceScarf\(value\)/)
})
test('speed-line view uses one controlled state with URL parser/writer and no storage', () => {
  assert.match(app, /parseSpeedLineState\(routeUrl.searchParams\)/)
  assert.match(app, /writeSpeedLineState\(params, viewState.speedLineState\)/)
  assert.match(app, /<SpeedLinePanel[^>]*state=\{speedLineState\}/)
  assert.match(app, /setSpeedLineState\(route.speedLineState\)/)
  assert.doesNotMatch(app, /setSpeedLineEffort|setSpeedLineQuery|setSpeedLineNature|setSpeedLineForms/)
})

test('large scenario lists defer offscreen layout without removing rows from the DOM', () => {
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
  assert.match(css, /\.speed-line-row\[data-variant\]\s*\{[^}]*content-visibility:\s*auto/)
  assert.match(css, /\.speed-line-row\[data-variant\]\s*\{[^}]*contain-intrinsic-size:\s*auto/)
})

test('mobile comparison rows keep actual speed and reference difference visible without a wide scroll-only table', () => {
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
  const mobile = css.slice(css.indexOf('@media (max-width: 680px)', css.indexOf('.speed-line-assumptions')))
  assert.doesNotMatch(mobile.split('@media')[0], /min-width:\s*540px/)
  assert.match(mobile, /grid-template-areas:\s*"rank species actual"\s*"rank base comparison"/)
  assert.match(css, /\.pokemon-search-field input\s*\{[^}]*width:\s*100%/)
  assert.match(css, /\.speed-line-investment\s*\{[^}]*padding:/)
})
