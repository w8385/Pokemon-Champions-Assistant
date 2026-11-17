import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const translations = readFileSync(new URL('../src/shared/display/translation.ts', import.meta.url), 'utf8')
const favicon = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8')

test('live title and sharing surfaces use the practical calculator brand', () => {
  assert.match(index, /<title>포켓몬 챔피언스 실전 계산기<\/title>/)
  assert.match(index, /property="og:title" content="포켓몬 챔피언스 실전 계산기"/)
  assert.match(index, /name="twitter:title" content="포켓몬 챔피언스 실전 계산기"/)
  assert.match(index, /property="og:image:alt" content="포켓몬 챔피언스 실전 계산기 대표 이미지"/)
  assert.match(app, /const siteTitle = lt\('포켓몬 챔피언스 실전 계산기'\)/)
  assert.match(app, /const siteImageAlt = lt\('포켓몬 챔피언스 실전 계산기 대표 이미지'\)/)
  assert.match(favicon, /<title>포켓몬 챔피언스 실전 계산기<\/title>/)
})

test('localized live brand has no legacy battle-assistant title', () => {
  assert.match(translations, /'포켓몬 챔피언스 실전 계산기': 'Pokémon Champions Battle Calculator'/)
  assert.match(translations, /'포켓몬 챔피언스 실전 계산기': 'ポケモンチャンピオンズ 実戦計算ツール'/)
  for (const source of [app, index, translations, favicon]) assert.doesNotMatch(source, /포켓몬 챔피언스 배틀 도우미/)
})
