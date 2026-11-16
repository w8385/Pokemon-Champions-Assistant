import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { natureAxes, natureIdForAxes } from '../src/domain/champions/natureProjection.ts'

const compact = readFileSync(new URL('../src/shared/display/CompactStatEditor.tsx', import.meta.url), 'utf8')

test('nature axes resolve to the canonical persisted NatureId', () => {
  assert.deepEqual(natureAxes('bold'), { up: 'defense', down: 'attack' })
  assert.equal(natureIdForAxes('defense', 'attack'), 'bold')
  assert.equal(natureIdForAxes('speed', 'spAttack'), 'jolly')
  assert.equal(natureIdForAxes(null, null), 'hardy')
  assert.equal(natureIdForAxes('defense', 'defense'), null)
  assert.equal(natureIdForAxes('defense', null), null)
})

test('compact stat tile offers only down/up and renders an impossible partner as a dash', () => {
  assert.match(compact, /className="nature-down"/)
  assert.match(compact, />↓ \.9<\/button>/)
  assert.match(compact, /className="nature-up"/)
  assert.match(compact, />↑ 1\.1<\/button>/)
  assert.match(compact, /className="nature-impossible"[^>]*>—<\/span>/)
  assert.match(compact, /onNature\(next\)/)
  assert.doesNotMatch(compact, /nature-neutral/)
})
