import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeRoute, routeGroups } from '../src/navigation.ts'
import { readFileSync } from 'node:fs'

test('navigation exposes the exact party-first flat menu order, while doubles remain deep-link only', () => {
  assert.deepEqual(['홈', ...routeGroups.flatMap(g => g.links.map(l => l.label))], ['홈', '내 파티', '대면', '계산기', '스피드라인', '샘플 라이브러리', '샘플 연구소', '도감'])
  assert.deepEqual(routeGroups.flatMap(g => g.links.map(l => l.href)), [
    '#/party', '#/single?tab=party', '#/damage', '#/speed-line',
    '#/sample-builder?sampleTab=library', '#/sample-builder?sampleTab=builder', '#/dex',
  ])
})

test('party is its own route while old double links remain loadable', () => {
  assert.deepEqual(normalizeRoute('#/party'), { section: 'party', tab: '' })
  assert.deepEqual(normalizeRoute('#/double?tab=party'), { section: 'double', tab: 'party' })
})

test('quick damage deep link resolves independently', () => {
  assert.deepEqual(normalizeRoute('#/damage'), { section: 'quickDamage', tab: '' })
})
test('speed line heading and list label match the direct menu destination', () => {
  const panel = readFileSync(new URL('../src/SpeedLinePanel.tsx', import.meta.url), 'utf8')
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  assert.match(app, /<PageHeading title=\{lt\(mainSection === 'home'[^]*?mainSection === 'speedLine' \? '스피드라인'/)
  assert.doesNotMatch(panel, /<h2>\{translate\('스피드라인'\)\}<\/h2>/)
  assert.match(panel, /role="table" aria-label=\{translate\('스피드라인'\)\}/)
})

test('invalid deep-link tabs normalize to visible default content', () => {
  assert.deepEqual(normalizeRoute('#/sample-builder?sampleTab=nonsense'), { section: 'sample', tab: 'builder' })
  assert.deepEqual(normalizeRoute('#/double?tab=speed'), { section: 'double', tab: 'power' })
  assert.deepEqual(normalizeRoute('#/single?tab=nonsense'), { section: 'single', tab: 'party' })
  assert.deepEqual(normalizeRoute('#/sample-builder?sampleTab=rankers'), { section: 'sample', tab: 'library' })
  assert.deepEqual(normalizeRoute('#/sample-library/youtube%3Aabc'), { section: 'sample', tab: 'library' })
})
