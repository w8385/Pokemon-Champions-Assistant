import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeRoute, routeGroups } from '../src/navigation.ts'

test('navigation exposes the exact party-first flat menu order, while doubles remain deep-link only', () => {
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

test('invalid deep-link tabs normalize to visible default content', () => {
  assert.deepEqual(normalizeRoute('#/sample-builder?sampleTab=nonsense'), { section: 'sample', tab: 'builder' })
  assert.deepEqual(normalizeRoute('#/double?tab=speed'), { section: 'double', tab: 'power' })
  assert.deepEqual(normalizeRoute('#/single?tab=nonsense'), { section: 'single', tab: 'party' })
  assert.deepEqual(normalizeRoute('#/sample-builder?sampleTab=rankers'), { section: 'sample', tab: 'library' })
  assert.deepEqual(normalizeRoute('#/sample-library/youtube%3Aabc'), { section: 'sample', tab: 'library' })
})
