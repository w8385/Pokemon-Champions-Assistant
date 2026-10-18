import test from 'node:test'
import assert from 'node:assert/strict'
import { registerOpponentSpecies, hasOpponentEntryData } from '../src/singleOpponentRegistration.ts'

const blank = () => ({ key: '', ability: '', item: '', revealedMoves: ['', '', '', ''], attackEv: null })
const slots = () => Array.from({ length: 6 }, blank)

test('commit stores the selected species and advances cyclically to the next empty slot', () => {
  const input = slots(); input[2].key = 'existing'; input[5].key = 'last'
  const result = registerOpponentSpecies(input, 5, 'new', blank)
  assert.equal(result.slots[5].key, 'new')
  assert.equal(result.nextIndex, 0)
  assert.equal(input[5].key, 'last')
  assert.equal(registerOpponentSpecies(result.slots, 0, 'also', blank).nextIndex, 1)
})

test('all slots full leaves selection in place and never overwrites another slot', () => {
  const input = slots().map((slot, i) => ({ ...slot, key: `species-${i}` }))
  const result = registerOpponentSpecies(input, 3, 'replacement', blank)
  assert.equal(result.nextIndex, 3)
  assert.equal(result.slots[3].key, 'replacement')
  assert.equal(result.slots[4].key, 'species-4')
})

test('replacing species clears its old build; same species keeps known fields and duplicate keys are independent', () => {
  const input = slots(); input[0] = { ...blank(), key: 'old', ability: 'known', revealedMoves: ['known', '', '', ''], attackEv: 12 }
  input[1] = { ...input[0] }
  const changed = registerOpponentSpecies(input, 0, 'new', blank)
  assert.equal(changed.slots[0].ability, '')
  assert.deepEqual(changed.slots[0].revealedMoves, ['', '', '', ''])
  assert.equal(changed.slots[0].attackEv, null)
  assert.equal(changed.slots[1].ability, 'known')
  assert.equal(registerOpponentSpecies(input, 0, 'old', blank).slots[0].ability, 'known')
})

test('reset confirmation considers saved slots, any draft, and uncommitted search input', () => {
  assert.equal(hasOpponentEntryData(slots(), false, '', blank), false)
  assert.equal(hasOpponentEntryData(slots(), true, '', blank), true)
  assert.equal(hasOpponentEntryData(slots(), false, 'typing', blank), true)
  assert.equal(hasOpponentEntryData([{ ...blank(), item: 'known' }, ...slots().slice(1)], false, '', blank), true)
})
