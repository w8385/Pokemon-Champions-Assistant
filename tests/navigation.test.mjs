import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeRoute, routeGroups } from '../src/navigation.ts'

test('navigation enumerates seven destinations without a ranker entry', () => {
  assert.deepEqual(routeGroups.flatMap(g => g.links.map(l => l.href)), [
    '#/single?tab=party', '#/double?tab=party', '#/sample-builder?sampleTab=builder',
    '#/sample-builder?sampleTab=library', '#/damage', '#/speed-line', '#/dex',
  ])
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
