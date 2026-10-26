import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

test('research lab exposes exclusive build, speed and damage panels with saved actions owned by build', () => {
  const lab = app.slice(app.indexOf("mainSection === 'sample' ? <>"), app.indexOf('</> : <>', app.indexOf("mainSection === 'sample' ? <>")))
  assert.match(lab, /role="tablist"[^>]*aria-label=\{lt\('샘플 연구소'\)\}/)
  for (const tab of ['builder', 'speed', 'damage']) assert.match(lab, new RegExp(`value: '${tab}'`))
  assert.match(lab, /<a key=\{value\}[^>]+href=\{`#\/sample-builder\?sampleTab=\$\{value\}`\}/)
  assert.doesNotMatch(lab, /onClick=\{\(\) => setSampleWorkbenchTab\(value\)\}/)
  assert.match(lab, /sample-workbench-tab-\$\{value\}/)
  assert.match(lab, /sampleWorkbenchTab === 'builder' \? <section id="sample-builder-section"/)
  assert.match(lab, /sampleWorkbenchTab === 'speed' \? <section id="sample-speed-section"/)
  assert.match(lab, /sampleWorkbenchTab === 'damage' \? <section id="sample-damage-section"/)
  assert.match(lab, /sampleWorkbenchTab === 'builder' \? <section id="sample-saved-card"/)
  assert.match(app, /sampleTuningModalOpen && mainSection === 'sample' && sampleWorkbenchTab !== 'library'/)
})
test('library has independent draft language and restores four validated URL filters', () => {
  assert.match(app, /createLinkDraft\(linkDraftInput, draftLanguage, draftFormat\)/)
  assert.match(app, /value=\{draftLanguage\}/)
  assert.match(app, /<option value="all">\{lt\('전체'\)\}<\/option><option value="ko">KR<\/option>/)
  assert.match(app, /href=\{libraryDetailHref\(source\.id, libraryContext\)\}/)
  assert.match(app, /href=\{libraryListHref\(libraryContext\)\}/)
  assert.match(app, /librarySourceId \? .*\.find\(source => source\.id === librarySourceId\)/)
  assert.match(app, /window\.addEventListener\('popstate', restoreRoute\)/)
  assert.match(app, /restoringLibraryRoute\.current/)
})
