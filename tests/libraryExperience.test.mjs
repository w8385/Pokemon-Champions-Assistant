import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const detail = app.split('className="creator-library-detail"')[1]?.split(' : <p role="status">')[0] ?? ''
const list = app.split('className="creator-library-list"')[1]?.split('{sampleWorkbenchTab ===')[0] ?? ''

test('library search uses the shared multilingual species matcher for member identities', () => {
  assert.match(app, /searchPokemon\(rows, libraryQuery/)
  assert.match(app, /matchingLibraryPokemonKeys\.has\(member\.pokemonKey\)/)
  assert.match(list, /visibleSources\.length/)
})
test('member actions and field evidence stay beside their shared card, not after the lineup', () => {
  assert.match(detail, /librarySource\.members\.map\(entry => <div[^>]+creator-library-member-card[^>]*>\s*\{creatorCard\(entry\)\}/)
  assert.match(detail, /Object\.entries\(entry\.provenance\.fields\)/)
  assert.match(detail, /canImportCreatorSample\(entry\)/)
  assert.match(detail, /if \(!resolvedAbility\) return\s+restoringLibraryRoute\.current = null\s+setSampleForge/)
  assert.doesNotMatch(detail, /<p>\{entry\.provenance\.evidence\}<\/p>/)
  assert.ok(detail.indexOf("lt('샘플 편집기에 가져오기')") < detail.indexOf('entry.provenance.publishedAt'))
  assert.match(detail, /creator-library-evidence-links/)
  assert.match(detail, /className="creator-library-trust-note"/)
  assert.match(app, /구성 확인은 빌드 정보 기준이며, 순위·성적의 공식 검증이 아닙니다\./)
  assert.doesNotMatch(detail, /<details[^>]+creator-library-provenance/)
  assert.doesNotMatch(detail, /creator-library-member-actions/)
})
test('companion party is a compact separate section and own links are not public results', () => {
  assert.match(detail, /<section className="creator-library-companion-party"/)
  assert.match(detail, /relatedCreatorParties\[librarySource\.sourceId\]\.members\.map/)
  assert.doesNotMatch(detail, /<details[^>]+creator-library-companion-party/)
  assert.match(app, /<section className="creator-library-personal"/)
  assert.match(app, /<h3>\{lt\('내 출처 링크'\)\}<\/h3>/)
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
  assert.match(css, /@media \(max-width: 600px\)\s*\{\s*\.creator-library-detail \.registered-move-grid\s*\{ grid-template-columns: minmax\(0, 1fr\)/)
})
