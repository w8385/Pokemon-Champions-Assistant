import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dataSourcePolicy } from '../src/dataSources.ts'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
test('runtime move eligibility declares the pinned exact-form snapshot, not historical PokeAPI pools', () => {
  assert.equal(dataSourcePolicy.movePools.sourceOfTruth, 'src/dexGameLearnsets.json')
  assert.match(dataSourcePolicy.movePools.caveat, /2026-09-09/)
  assert.match(dataSourcePolicy.movePools.caveat, /미확정/)
  assert.doesNotMatch(app, /embeddedMovePoolForKey|loadEmbeddedMovePools|resolveFormAwareMovePool/)
})
