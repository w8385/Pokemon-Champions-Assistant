import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { routeGroups } from '../src/navigation.ts'
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const speed = readFileSync(new URL('../src/SpeedLinePanel.tsx', import.meta.url), 'utf8')

test('dex builder action names builder tab explicitly and slot replacement is confirmed', () => {
  const actions = app.slice(app.indexOf("{lt('빠른 이동')}"), app.indexOf('{dexSelectedMove ? <div className="dex-detail-card">'))
  assert.match(actions, /setSampleWorkbenchTab\('builder'\)/)
  assert.match(actions, /selectedDexPartySlot/)
  assert.match(actions, /confirmPartySlotReplacement/)
  assert.doesNotMatch(actions, /idx === 0 \? \{ \.\.\.member, key/)
})

test('sample save and apply have distinct labels and replacement confirmation', () => {
  assert.match(app, /onClick=\{saveCurrentSample\}>\{lt\('샘플 저장'\)\}/)
  assert.match(app, /confirmPartySlotReplacement\(sampleForge, slotIdx/)
  assert.match(app, /confirmPartySlotReplacement\(entry.member, selectedMy/)
})

test('header one row and seven home native destinations', () => {
  const home = app.slice(app.indexOf('home-route-panel'), app.indexOf('home-footer-text-block'))
  assert.match(home, /routeGroups\.map\(group => <section/)
  assert.match(home, /group\.links\.map\(link => <a key=\{link\.href\}/)
  assert.equal(routeGroups.flatMap(group => group.links).length, 7)
  assert.doesNotMatch(home, /<button type="button" className="home-route-card/)
  assert.match(css, /\.header-title-stack\s*\{[^}]*display:\s*flex/)
  assert.match(css, /\.app-shell main a:visited/)
})

test('dex has one editable search with category-scoped results and IME guard', () => {
  const dex = app.slice(app.indexOf("{mainSection === 'dex' ? <>"), app.indexOf("{dexSelectedMove ? <div className=\"dex-detail-card\">"))
  assert.equal((dex.match(/className="dex-search-autocomplete/g) ?? []).length, 1)
  assert.match(dex, /dexUnifiedSearchComposing/)
  assert.match(dex, /document\.querySelector<HTMLAnchorElement>\('\.dex-browse-card'\)\?\.click\(\)/)
  assert.match(app, /route\.dexSearch/)
})

test('speed secondary filters are direct controls after reference stats and before rows', () => {
  const ref = speed.indexOf('className="speed-line-reference-stat"')
  const filters = speed.indexOf('className="speed-line-controls speed-line-secondary-filters"')
  const list = speed.indexOf('className="speed-line-list"')
  assert.ok(ref > 0 && filters > ref && list > filters)
  assert.match(speed.slice(filters - 6, filters), /<div /)
})
