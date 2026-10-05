import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultSpeedLineState, parseSpeedLineState, writeSpeedLineState } from '../src/speedLineState.ts'

test('missing speed-line fields use defaults, independent of legacy my and opp slot indices', () => {
  const { state, warnings } = parseSpeedLineState(new URLSearchParams('my=0&opp=1&other=x'))
  assert.deepEqual(state, { referenceKey: null, referenceEffort: 32, referenceNature: 'boost', listEffort: 32, listNature: 'boost', query: '', forms: 'all', comparison: 'all', sort: 'desc', rangeMode: 'all', gap: 10 })
  assert.deepEqual(state, defaultSpeedLineState)
  assert.deepEqual(warnings, [])
})

test('explicit versioned URL round-trips all independent settings without touching my or opp and other keys', () => {
  const params = new URLSearchParams('my=0&opp=1&other=keep&ref=old&ref=duplicate')
  const state = { referenceKey: 'mega-a', referenceEffort: 0, referenceNature: 'lower', listEffort: 31, listNature: 'neutral', query: '메가', forms: 'mega', comparison: 'slower', sort: 'asc', rangeMode: 'around', gap: 7 }
  writeSpeedLineState(params, state)
  assert.equal(params.get('my'), '0')
  assert.equal(params.get('opp'), '1')
  assert.equal(params.get('other'), 'keep')
  assert.deepEqual([...params.getAll('ref')], ['mega-a'])
  assert.equal(params.get('slv'), '1')
  assert.deepEqual(parseSpeedLineState(params), { state, warnings: [] })
  state.referenceKey = null
  writeSpeedLineState(params, state)
  assert.deepEqual(parseSpeedLineState(params).state, state)
  assert.equal(params.get('ref'), null)
})

test('bad numeric strings never coerce and invalid enum values default with warnings', () => {
  const params = new URLSearchParams('slv=1&ref=unknown-key&refEp=Infinity&listEp=1.5&gap=-1&refNature=weird&listNature=lower&forms=nope&cmp=faster&sort=up&range=around')
  const { state, warnings } = parseSpeedLineState(params)
  assert.equal(state.referenceKey, 'unknown-key')
  assert.equal(state.referenceEffort, 32)
  assert.equal(state.listEffort, 32)
  assert.equal(state.gap, 10)
  assert.equal(state.referenceNature, 'boost')
  assert.equal(state.listNature, 'lower')
  assert.equal(state.forms, 'all')
  assert.equal(state.comparison, 'faster')
  assert.equal(state.sort, 'desc')
  assert.equal(state.rangeMode, 'around')
  assert.deepEqual(warnings, ['refEp', 'refNature', 'listEp', 'forms', 'sort', 'gap'])
  for (const bad of ['NaN', '1e1', ' 2', '2 ', '0x10', '33', '-1', '1.0', '']) {
    const parsed = parseSpeedLineState(new URLSearchParams(`slv=1&refEp=${encodeURIComponent(bad)}`))
    assert.equal(parsed.state.referenceEffort, 32, bad)
    assert.ok(parsed.warnings.includes('refEp'), bad)
  }
})

test('missing fields on versioned URL still default; invalid version ignores speed-line fields', () => {
  assert.deepEqual(parseSpeedLineState(new URLSearchParams('slv=1&listEp=0')).state, { ...defaultSpeedLineState, listEffort: 0 })
  const invalid = parseSpeedLineState(new URLSearchParams('slv=2&ref=a&listEp=0&my=0&opp=1'))
  assert.deepEqual(invalid.state, defaultSpeedLineState)
  assert.deepEqual(invalid.warnings, ['slv'])
})
