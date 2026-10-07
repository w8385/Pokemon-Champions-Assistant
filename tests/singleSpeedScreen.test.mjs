import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { getSpeedAbility } from '../src/speedAbilities.ts'

test('actual opponent ability label resolver uses canonical labels in all languages', () => {
  const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const definition = source.match(/function speedAbilityCandidate\(row: Row, language: SiteLanguage\) \{[\s\S]*?\n\}/)?.[0]
  assert.ok(definition)
  const resolver = runInNewContext(definition.replace('(row: Row, language: SiteLanguage)', '(row, language)').replace(/ as typeof DOUBLE_SPEED_ABILITY_SLUGS\[number\]/g, '') + '\nspeedAbilityCandidate', {
    DOUBLE_SPEED_ABILITY_SLUGS: ['swift-swim', 'chlorophyll', 'sand-rush', 'slush-rush', 'surge-surfer', 'unburden'],
    titleCaseSlug: slug => slug.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join(' '),
    getSpeedAbility,
  })
  for (const slug of ['swift-swim', 'chlorophyll', 'sand-rush', 'slush-rush', 'surge-surfer', 'unburden']) {
    const descriptor = getSpeedAbility(slug)
    const row = { abilities: [slug], abilities_ko: [descriptor.labelKo] }
    for (const [language, expected] of [['ko', descriptor.labelKo], ['en', descriptor.labelEn], ['ja', descriptor.labelJa]]) {
      assert.equal(resolver(row, language).label, expected, `${slug}/${language}`)
    }
  }
})
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const speedScreen = app.slice(app.indexOf("(mainSection === 'single' && activeTab === 'speed') ? <section"), app.indexOf("(mainSection === 'single' && activeTab === 'power') ? <section"))
test('single speed screen owns independent assumption controls and derives its verdict and graph from them', () => {
  assert.match(app, /compareSingleSpeed\(/)
  assert.match(speedScreen, /aria-label=\{lt\('상대 성격 가정'\)\}/)
  assert.match(speedScreen, /aria-label=\{lt\('상대 도구 가정'\)\}/)
  assert.match(speedScreen, /singleSpeedComparison\.verdict/)
  assert.match(speedScreen, /singleSpeedComparison\.passEffort/)
  assert.match(speedScreen, /현재 투자로 이미 추월'\)} · \$\{lt\('엄격히 추월할 최소 스피드 노력/)
  assert.match(speedScreen, /singleSpeedComparison\.targetSpeed/)
  assert.match(speedScreen, /<details className="speed-plane-details"/)
  assert.doesNotMatch(speedScreen, /opponentSpeedBands\.map/)
  assert.doesNotMatch(speedScreen, /setOpponents\(|setParty\(/)
})

test('screen assumptions reset on every target identity and route exit', () => {
  assert.match(app, /singleSpeedIdentity = `\$\{selectedOpp\}:\$\{oppMember\.key\}:\$\{oppRow\?\.key/)
  assert.match(app, /setSingleSpeedAssumption\(null\)/)
  assert.match(app, /mainSection === 'single' && activeTab === 'speed'/)
})

test('conditional opponent ability control explicitly feeds selected verdict and graph', () => {
  assert.match(speedScreen, /aria-label=\{lt\('상대 특성 발동 가정'\)\}/)
  assert.match(app, /speedAbilityCandidate\(oppRow, siteLanguage\)/)
  assert.match(app, /active: singleSpeedAbilityActive/)
  assert.match(speedScreen, /singleSpeedComparison\.targetSpeed/)
  assert.doesNotMatch(speedScreen, /mySpeedAbilityLine\.speed/)
})

test('every single speed screen string has English and Japanese parity', () => {
  const maps = app.slice(app.indexOf('const UI_TRANSLATIONS:'), app.indexOf('\nfunction translateText('))
  const en = maps.slice(maps.indexOf('  en: {'), maps.indexOf('  ja: {'))
  const ja = maps.slice(maps.indexOf('  ja: {'))
  const labels = [...speedScreen.matchAll(/lt\('([^']+)'\)/g)].map(match => match[1])
  for (const label of new Set(labels)) {
    assert.ok(en.includes(`'${label}':`), `EN missing: ${label}`)
    assert.ok(ja.includes(`'${label}':`), `JA missing: ${label}`)
  }
})
