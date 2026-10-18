import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

test('research lab mounts actual builder, speed and damage tools together without sample subnavigation', () => {
  const lab = app.slice(app.indexOf("mainSection === 'sample' ? <>"), app.indexOf('</> : <>', app.indexOf("mainSection === 'sample' ? <>")))
  assert.match(lab, /id="sample-builder-card"/)
  assert.match(lab, /id="sample-speed-section"/)
  assert.match(lab, /id="sample-damage-section"/)
  assert.match(lab, /sampleSpeedCalcs\.map/)
  assert.match(lab, /sampleDamageCalcs\.map/)
  assert.match(lab, /sample-builder-save-row/)
  assert.match(lab, /savedSamples\.map/)
  assert.doesNotMatch(app, /sample-workbench-tab-\$\{value\}/)
  assert.match(app, /sampleTuningModalOpen && mainSection === 'sample' && sampleWorkbenchTab !== 'library'/)
  assert.match(app, /document\.getElementById\('sample-moves-card'\)/)
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
