import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const nav = readFileSync(new URL('../src/navigation.ts', import.meta.url), 'utf8')
const card = readFileSync(new URL('../src/PokemonCardOverview.tsx', import.meta.url), 'utf8')

test('library list links canonical source IDs to a separate detail route, without full cards', () => {
  const list = app.split('<div className="creator-library-list">')[1]?.split('{!visibleSources.length')[0]
  assert.ok(list)
  assert.match(list, /source\.id/)
  assert.match(list, /source\.members\.map/)
  assert.match(list, /source\.title/)
  assert.doesNotMatch(list, /creatorCard|ReadonlyPokemonCard|검증 완료|실수치|기술 구성/)
  assert.match(app, /\/sample-library\/\$\{encodeURIComponent\(source\.id\)\}/)
})
test('detail resolves source ID from full catalog independent of list filters and has back route', () => {
  assert.match(app, /librarySourceId \? .*\.find\(source => source\.id === librarySourceId\)/)
  assert.match(app, /href="#\/sample-builder\?sampleTab=library"/)
  assert.match(app, /creatorCard\(member\)/)
  assert.match(app, /entry\.provenance/)
  assert.match(app, /librarySource\.completeMemberCount === librarySource\.partySize/)
})
test('rankers legacy route redirects to unified library without ranker menu entry', () => {
  assert.match(nav, /value === 'rankers' \? 'library'/)
  assert.doesNotMatch(nav, /href: '#\/sample-builder\?sampleTab=rankers'/)
  assert.doesNotMatch(app, /setSampleWorkbenchTab\('rankers'\)/)
})
test('unknown nature or effort displays species/form base stats, not calculated actual stats or fake EV', () => {
  assert.match(app, /row\?\.\[stat\.key\]/)
  assert.match(app, /lt\('종족값'\)/)
  assert.match(card, /showEffort/)
  assert.match(app, /showEffort=\{Boolean\(build\?\.evs\)\}/)
})
test('every confirmed member can appear in individual index without changing party source taxonomy', () => {
  assert.match(app, /libraryContentKind === 'pokemon' \? individualCreatorSources\(catalog\) : groupCreatorSources\(catalog\)/)
  assert.match(app, /\[\.\.\.groupCreatorSources\(catalog\), \.\.\.individualCreatorSources\(catalog\)\]\.find/)
  assert.match(app, /relatedCreatorParties\[librarySource\.sourceId\]/)
  assert.match(app, /영상에 나온 사용 파티/)
})
