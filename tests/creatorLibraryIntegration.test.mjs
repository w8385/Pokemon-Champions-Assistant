import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

test('library has navigable sample tab and route without replacing builder', () => {
  assert.match(app, /sampleTabParam === 'library'/)
  assert.match(app, /\['library', lt\('샘플 라이브러리'\)\]/)
  assert.match(app, /sampleWorkbenchTab === 'builder'/)
})
test('link entry is explicitly partial and import is gated', () => {
  assert.match(app, /createLinkDraft\(linkDraftInput/)
  assert.match(app, /canImportCreatorSample\(entry\)/)
  assert.match(app, /setSampleForge\(.*entry\.build/s)
})
test('ranker legacy links normalize but no ranker menu remains', () => {
  assert.match(app, /sampleTabParam === 'rankers'/)
  assert.doesNotMatch(app, /\['rankers', lt\('랭커 샘플'\)\]/)
  assert.match(app, /routeGroups\.map\(group =>/)
  assert.match(app, /href=\{link\.href\}/)
})
test('sample cards show verified partial fields and separate source-only leads', () => {
  assert.match(app, /stats=\{stats\}/)
  assert.match(app, /build\?\.moves\s*\?\s*<div className="move-card inline-move-card creator-library-moves"/)
  assert.match(app, /catalog\.filter\(entry => !entry\.partialBuild && entry\.contentKind === 'unknown'\)/)
  assert.match(app, /pendingCreatorLeads\.length > 0/)
  assert.match(app, /노력 포인트 일부 또는 성격이 미확인되어 실수치를 계산하지 않습니다\./)
  assert.match(app, /형식 미확인: 원본에 싱글\/더블 표기 없음/)
})

test('creator cards prefer recorded actual stats while retaining effort and moves independently of roster support', () => {
  assert.match(app, /createReadonlyCardStats\(EFFORT_STAT_OPTIONS/)
  assert.match(app, /statsLabel=\{/)
  assert.match(app, /build\?\.moves\s*\?\s*<div className="move-card inline-move-card creator-library-moves"/)
})

test('library separates compact source rows from full detail cards and provenance', () => {
  assert.match(app, /lt\('파티 소개'\)/)
  assert.match(app, /lt\('개별 포켓몬 샘플'\)/)
  assert.match(app, /setLibraryContentKind\('party'\)/)
  assert.match(app, /setLibraryContentKind\('pokemon'\)/)
  assert.match(app, /filterCreatorSources\(/)
  assert.match(app, /librarySource\.members\.map\(entry/)
  assert.match(app, /librarySource\.confirmedMemberCount/)
  assert.match(app, /lt\('전체 파티 구성 미확인'\)/)
  assert.match(app, /className="creator-library-lineup"/)
  assert.match(app, /<ReadonlyPokemonCard/)
  assert.match(app, /PokemonCardHeading/)
  assert.match(app, /PokemonStatGrid/)
  assert.match(app, /<details[^>]*className="creator-library-provenance"/)
  assert.match(app, /<summary/)
  assert.match(app, /aria-label=\{lt\('파티 소개'\)\}/)
})
