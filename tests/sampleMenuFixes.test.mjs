import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { appTranslate } from './appTranslations.mjs'
import { searchPokemon } from '../src/pokemonSearch.ts'
import * as speciesModule from '../src/pokemonSearch.ts'
const prioritizeExactSpecies = (...args) => speciesModule.prioritizeExactSpecies(...args)

const rows = [
  { key: 'mega-garchomp', name_ko: '메가한카리아스', name_en: 'Mega Garchomp', name_ja: 'メガガブリアス', speed: 92 },
  { key: 'garchomp', name_ko: '한카리아스', name_en: 'Garchomp', name_ja: 'ガブリアス', speed: 102 },
  { key: 'mega-garchomp-z', name_ko: '메가한카리아스Z', name_en: 'Mega Garchomp Z', name_ja: 'メガガブリアスZ', speed: 92 },
]

test('builder exact Korean name and slug select base ahead of Mega alias', () => {
  for (const query of ['한카리아스', 'garchomp']) {
    const ordered = prioritizeExactSpecies(searchPokemon(rows, query, { includeMega: true }), query)
    assert.equal(ordered[0].key, 'garchomp')
    assert.ok(ordered.some(row => row.key === 'mega-garchomp'))
  }
})
test('builder exact Mega query selects Mega while partial options preserve keyboard order', () => {
  assert.equal(prioritizeExactSpecies(searchPokemon(rows, '메가한카리아스'), '메가한카리아스')[0].key, 'mega-garchomp')
  const partial = prioritizeExactSpecies(searchPokemon(rows, '한카'), '한카')
  assert.deepEqual(partial.map(row => row.key), searchPokemon(rows, '한카').map(row => row.key))
})
test('detail route uses normalized tab before persisted fallback', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  assert.match(app, /sampleWorkbenchTab: (?:normalizedRoute\.section|resolvedMainSection) === 'sample' \? normalizedRoute\.tab as SampleWorkbenchTab/)
  assert.match(app, /librarySourceId, libraryLanguage: libraryContext\.language/)
  assert.match(app, /dexSearchMode, dexSearch, dexUnifiedSearch, dexSelectedValue/)
})
test('detail strings exist in both language dictionaries and source data remains untouched', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const translate = appTranslate()
  for (const language of ['en', 'ja']) {
    for (const key of ['목록으로', '계산 실수치 · 원본 실수치 미기록']) assert.notEqual(translate(language, key), key, `${language}: ${key}`)
  }
  assert.match(app, /ability=\{localizedAbility\}/)
  assert.match(app, /slot: siteLanguage === 'ja'/)
})
