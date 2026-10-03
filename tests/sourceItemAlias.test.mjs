import test from 'node:test'
import assert from 'node:assert/strict'
import { CHAMPIONS_ITEM_ALIASES, CHAMPIONS_ITEM_OPTIONS } from '../src/championsItems.ts'
import { catalog, groupCreatorSources } from '../src/creatorSampleLibrary.ts'
import { prepareCreatorParty } from '../src/creatorPartyImport.ts'
import { championsData, additionalFormSpecs } from '../src/effectiveRoster.ts'

const rows = [...championsData.rows, ...additionalFormSpecs]
test('raw screen spelling survives preparation and resolves through the supported item alias', () => {
  // Synthetic party based on the separate blog; the incidental video teammate is not cataloged.
  const blog = groupCreatorSources(catalog).find(s => s.sourceId === '224319761655')
  const rawItem = '자몽열매'
  const source = { ...blog, members: blog.members.map((entry, index) => index === 1
    ? { ...entry, build: { ...entry.build, item: rawItem }, partialBuild: { ...entry.partialBuild, item: rawItem } }
    : entry) }
  assert.equal(source.members[1].build.item, rawItem)
  const prepared = prepareCreatorParty(source, key => rows.find(r => r.key === key)?.abilities_ko
    ?? [source.members.find(member => member.pokemonKey === key).build.ability])
  assert.ok(prepared)
  const item = prepared.party[1].item
  assert.equal(item, rawItem, 'source spelling must not be silently rewritten')
  const canonical = CHAMPIONS_ITEM_OPTIONS.find(name => (CHAMPIONS_ITEM_ALIASES[name] ?? []).includes(item))
  assert.equal(canonical, 'オボンのみ')
  assert.ok(CHAMPIONS_ITEM_OPTIONS.includes(canonical))
})
