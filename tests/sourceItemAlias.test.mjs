import test from 'node:test'
import assert from 'node:assert/strict'
import { CHAMPIONS_ITEM_ALIASES, CHAMPIONS_ITEM_OPTIONS } from '../src/championsItems.ts'
import { catalog, groupCreatorSources } from '../src/creatorSampleLibrary.ts'
import { prepareCreatorParty } from '../src/creatorPartyImport.ts'
import { championsData, additionalFormSpecs } from '../src/effectiveRoster.ts'

const rows = [...championsData.rows, ...additionalFormSpecs]
test('original-screen item token survives provenance and resolves to a supported item alias', () => {
  const source = groupCreatorSources(catalog).find(s => s.sourceId === 'Ix8nrNnmTUk')
  assert.ok(source)
  const entry = source.members.find(m => m.pokemonKey === 'archaludon')
  assert.equal(entry.build.item, '자몽열매')
  const prepared = prepareCreatorParty(source, key => rows.find(r => r.key === key)?.abilities_ko ?? null)
  assert.ok(prepared)
  const item = prepared.party.find(m => m.key === 'archaludon').item
  assert.equal(item, '자몽열매', 'source spelling must not be silently rewritten')
  const canonical = CHAMPIONS_ITEM_OPTIONS.find(name => (CHAMPIONS_ITEM_ALIASES[name] ?? []).includes(item))
  assert.equal(canonical, 'オボンのみ')
  assert.ok(CHAMPIONS_ITEM_OPTIONS.includes(canonical))
})
