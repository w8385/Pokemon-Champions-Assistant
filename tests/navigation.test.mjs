import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeRoute, routeGroups } from '../src/navigation.ts'

test('compact navigation exposes the unified library without a ranker entry', () => {
  assert.deepEqual(routeGroups.map(g => g.label), ['배틀 준비', '샘플', '도구/자료'])
  assert.deepEqual(routeGroups.flatMap(g => g.links.map(l => l.href)), [
    '#/single?tab=party', '#/double?tab=party', '#/sample-builder?sampleTab=builder',
    '#/sample-builder?sampleTab=library', '#/speed-line', '#/dex',
  ])
})

test('invalid deep-link tabs normalize to visible default content', () => {
  assert.deepEqual(normalizeRoute('#/sample-builder?sampleTab=nonsense'), { section: 'sample', tab: 'builder' })
  assert.deepEqual(normalizeRoute('#/double?tab=speed'), { section: 'double', tab: 'power' })
  assert.deepEqual(normalizeRoute('#/single?tab=nonsense'), { section: 'single', tab: 'party' })
  assert.deepEqual(normalizeRoute('#/sample-builder?sampleTab=rankers'), { section: 'sample', tab: 'library' })
  assert.deepEqual(normalizeRoute('#/sample-library/youtube%3Aabc'), { section: 'sample', tab: 'library' })
})
