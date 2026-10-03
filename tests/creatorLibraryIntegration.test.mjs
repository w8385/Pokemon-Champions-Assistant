import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

test('library has navigable sample tab and route without replacing builder', () => {
  assert.match(app, /sampleTabParam === 'library'/)
  assert.match(app, /\['library', lt\('크리에이터 샘플 라이브러리'\)\]/)
  assert.match(app, /sampleWorkbenchTab === 'builder'/)
})
test('link entry is explicitly partial and import is gated', () => {
  assert.match(app, /createLinkDraft\(linkDraftInput/)
  assert.match(app, /canImportCreatorSample\(entry\)/)
  assert.match(app, /setSampleForge\(.*entry\.build/s)
})
test('ranker samples have a distinct menu and direct route', () => {
  assert.match(app, /sampleTabParam === 'rankers'/)
  assert.match(app, /\['rankers', lt\('랭커 샘플'\)\]/)
  assert.match(app, /header-primary-tab[^\n]*setSampleWorkbenchTab\('rankers'\)/)
})
test('sample cards show verified partial fields and separate source-only leads', () => {
  assert.match(app, /entry\.partialBuild\?\.moves/)
  assert.match(app, /entry\.partialBuild\.evs/)
  assert.match(app, /catalog\.filter\(\(entry\) => !entry\.partialBuild\)/)
  assert.match(app, /형식 미확인: 원본에 싱글\/더블 표기 없음/)
})
