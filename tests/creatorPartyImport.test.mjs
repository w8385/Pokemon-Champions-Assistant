import test from 'node:test'
import assert from 'node:assert/strict'
import { catalog, groupCreatorSources } from '../src/creatorSampleLibrary.ts'
import { prepareCreatorParty } from '../src/creatorPartyImport.ts'

const source = groupCreatorSources(catalog).find(s => s.sourceId === '224319761655')
const abilities = { 'mega-scizor': ['테크니션'], ceruledge: ['깨어진갑옷'], garchomp: ['까칠한피부'], 'mega-floette': ['페어리오라'], 'rotom-wash': ['부유'], 'mega-starmie': ['천하장사'] }
const roster = (key) => abilities[key] ?? null

test('prepares six independent source builds and their four moves without changing the source', () => {
  const prepared = prepareCreatorParty(source, roster)
  assert.equal(prepared.party.length, 6)
  assert.deepEqual(prepared.party.map(m => m.key), source.members.map(m => m.pokemonKey))
  assert.deepEqual(prepared.lockedMovesBySlot, source.members.map(m => m.build.moves))
  assert.deepEqual(prepared.party.map(m => m.config.nature), source.members.map(m => m.build.nature))
  assert.deepEqual(prepared.party.map(m => m.evs), source.members.map(m => m.build.evs))
  assert.deepEqual(prepared.party.map(m => m.item), source.members.map(m => m.build.item))
  assert.equal(prepared.party[3].ability, '페어리오라')
  assert.equal(prepared.party[5].ability, '천하장사')
  assert.equal(source.members[3].build.ability, '플라워베일')
  assert.ok(prepared.party.every(m => !m.picked))
})

test('rejects partial, duplicate, unsupported and invalid builds atomically', () => {
  for (const altered of [
    { ...source, members: source.members.slice(0, 5) },
    { ...source, members: [...source.members.slice(0, 5), source.members[0]] },
    { ...source, members: source.members.map((m,i) => i ? m : {...m, status:'partial'}) },
    { ...source, members: source.members.map((m,i) => i ? m : {...m, pokemonKey:'unsupported'}) },
    { ...source, members: source.members.map((m,i) => i ? m : {...m, build:{...m.build, moves:['a']}}) },
  ]) assert.equal(prepareCreatorParty(altered, roster), null)
  assert.equal(prepareCreatorParty(source, () => null), null)
})
