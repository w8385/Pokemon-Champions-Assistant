import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const translations = readFileSync(new URL('../src/shared/display/translation.ts', import.meta.url), 'utf8')
const favicon = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8')
const ogImage = readFileSync(new URL('../public/og-image.png', import.meta.url))

function pngChunkTypes(buffer) {
  const types = []
  for (let offset = 8; offset + 12 <= buffer.length;) {
    const length = buffer.readUInt32BE(offset)
    types.push(buffer.toString('ascii', offset + 4, offset + 8))
    offset += 12 + length
  }
  return types
}

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

test('sharing preview is a broadly compatible static 1536 by 1024 PNG', () => {
  assert.equal(ogImage.toString('hex', 0, 8), '89504e470d0a1a0a')
  assert.equal(ogImage.readUInt32BE(16), 1536)
  assert.equal(ogImage.readUInt32BE(20), 1024)
  const chunks = pngChunkTypes(ogImage)
  assert.equal(chunks[0], 'IHDR')
  assert.equal(chunks.at(-1), 'IEND')
  assert.ok(chunks.includes('IDAT'))
  for (const incompatible of ['acTL', 'fcTL', 'fdAT', 'caBX', 'jumb']) assert.ok(!chunks.includes(incompatible), incompatible)
})
