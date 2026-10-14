import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const nav = source.slice(source.indexOf('<nav id="primary-navigation"'), source.indexOf('</nav>', source.indexOf('<nav id="primary-navigation"')))
test('all header destinations are direct native anchors without opening a group or toggle', () => {
  assert.match(nav, /href="#\/"/)
  assert.match(nav, /routeGroups\.flatMap\(group => \[\.\.\.group\.links\]\)\.map\(link => <a/)
  assert.doesNotMatch(nav, /<details|<summary|<button|header-route-links|onClick=|preventDefault/)
  assert.doesNotMatch(source, /header-route-toggle|mobileNavOpen|setMobileNavOpen/)
})

test('library destination has explicit English and Japanese translations', () => {
  assert.match(source, /'샘플 라이브러리': 'Sample Library'/)
  assert.match(source, /'샘플 라이브러리': 'サンプルライブラリ'/)
})
