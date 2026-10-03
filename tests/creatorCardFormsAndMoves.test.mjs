import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')
const app = read('../src/App.tsx')
const card = read('../src/PokemonCardOverview.tsx')
const catalog = read('../src/creatorSampleLibrary.ts')
const moveMeta = JSON.parse(read('../src/championsLearnedMoveMeta.json'))

test('every transcribed Korean creator move resolves to canonical type, category, power and accuracy', () => {
  const moves = [...catalog.matchAll(/moves: \[([^\]]+)\]/g)].flatMap(([, list]) => [...list.matchAll(/'([^']+)'/g)].map(([, name]) => name))
  assert.ok(moves.length >= 12)
  for (const name of moves) {
    const meta = moveMeta[name]
    assert.ok(meta, `no canonical metadata for ${name}`)
    assert.ok(meta.type && meta.category && 'power' in meta && 'accuracy' in meta, `incomplete metadata: ${name}`)
  }
  assert.match(app, /resolveMoveMeta\(move, \[\], movePoolByKey\)/)
})

test('creator and party render the SAME registered move component and read-only creator cards show metadata', () => {
  assert.match(card, /export function RegisteredMoveSlot/)
  assert.match(card, /registered-move-slot-head/)
  assert.match(card, /getTypeBadgeSrc\(type\)/)
  assert.match(card, /meta\?\.category/)
  assert.match(card, /meta\?\.accuracy/)
  assert.ok((app.match(/<RegisteredMoveSlot/g) ?? []).length >= 3)
  assert.doesNotMatch(app, /build\.moves\.map\(move => <span key=\{move\}>\{move\}<\/span>\)/)
})

test('source-recorded stats are displayed only on the matching form, with other form calculated from its base row', () => {
  assert.match(card, /actualStatsForm\s*===\s*formKey/)
  assert.match(app, /megaKey \? megaBaseKey\(megaKey\)/)
  assert.match(app, /partyStatValue\(row, member, statKey\)/)
  assert.match(app, /createReadonlyCardStats\([^;]*formKey/s)
  assert.match(app, /setCreatorMegaSelection/)
})

test('pre-mega abilities use source choices or matching recorded ability, never the mega-only ability', () => {
  assert.match(catalog, /preMegaAbilities: \['자기과신', '괴력집게'\]/)
  assert.match(app, /preMegaAbilities/)
  assert.match(app, /recordedForm === formKey/)
  assert.match(app, /formKey === entry\.pokemonKey/)
  assert.match(app, /row\?\.abilities_ko\?\.length === 1/)
  assert.match(app, /preMegaAbilities\?\.length/)
  const roster = JSON.parse(read('../src/pokemon_champions_verified_data.json')).rows
  for (const [key, ability] of [['mega-floette', '페어리오라'], ['mega-starmie', '천하장사']]) {
    const row = roster.find(row => row.key === key)
    assert.deepEqual(row.abilities_ko, [ability])
  }
})
