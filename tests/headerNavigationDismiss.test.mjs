import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
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

test('header keeps an accessible name and working utilities without a duplicated visible page title or description', () => {
  const header = source.slice(source.indexOf('<header>'), source.indexOf('</header>'))
  assert.match(header, /<h1 className="visually-hidden">\{lt\('포켓몬 챔피언스 배틀 도우미'\)\}<\/h1>/)
  assert.doesNotMatch(header, /menuLabelForSection\(|파티·선출·스피드·대미지/)
  assert.match(header, /setLanguageMenuOpen\(\(prev\) => !prev\)/)
  assert.match(header, /setSettingsMenuOpen\(\(prev\) => !prev\)/)
  assert.match(header, /exportState\(\)/)
  assert.match(header, /fileInputRef\.current\?\.click\(\)/)
})

test('home preserves provenance and project links in a native disclosure', () => {
  const footer = source.slice(source.indexOf('<details className="home-footer-text-block'), source.indexOf("mainSection !== 'home'", source.indexOf('<details className="home-footer-text-block')))
  assert.match(footer, /<details[^>]*>\s*<summary>\{lt\('프로젝트 정보'\)\}<\/summary>/)
  assert.match(footer, /github\.com\/w8385\/Pokemon-Champions-Assistant/)
  assert.match(footer, /참고 데이터베이스/)
  assert.match(footer, /비공식 팬메이드/)
})

test('closed project details hide styled child links instead of overriding disclosure', () => {
  assert.match(styles, /\.home-footer-text-block\s*\{[^}]*display: block;/)
  assert.doesNotMatch(styles, /\.home-footer-text-block\s*\{[^}]*display: grid;/)
  assert.match(styles, /\.home-footer-text-block:not\(\[open\]\) > :not\(summary\)\s*\{\s*display: none;/)
})

test('project disclosure label is localized like the existing project links', () => {
  assert.match(source, /'프로젝트 정보': 'Project Information'/)
  assert.match(source, /'프로젝트 정보': 'プロジェクト情報'/)
})

test('single matchup does not announce a removed selection-estimate flow', () => {
  const start = source.indexOf("mainSection === 'single' && activeTab === 'party' ? <div")
  const matchup = source.slice(start, source.indexOf("mainSection === 'party' ||", start))
  assert.doesNotMatch(matchup, /선출 추정 없이/)
  assert.match(matchup, /comparisonMode comparisonSlots=\{\[selectedMy, selectedOpp\]\} entrySelectors=/)
  assert.doesNotMatch(matchup, /<h2>/, 'the entry selectors do not add a second workspace title')
  const shared = source.slice(source.indexOf('function QuickDamagePanel('), source.indexOf('function LanguageIcon('))
  assert.match(shared, /<h2>\{lt\(comparisonMode \? '대면비교' : '간단 대미지'\)\}<\/h2>/)
})
