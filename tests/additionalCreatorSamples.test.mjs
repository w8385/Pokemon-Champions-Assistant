import test from 'node:test'
import assert from 'node:assert/strict'
import { catalog, groupCreatorSources, individualCreatorSources, canImportCreatorSample, relatedCreatorParties } from '../src/creatorSampleLibrary.ts'
import { prepareCreatorParty } from '../src/creatorPartyImport.ts'
import { championsData } from '../src/effectiveRoster.ts'

const byId = id => catalog.filter(entry => entry.provenance.sourceId === id)

test('new sources preserve presentation taxonomy, slot order and explicit party size', () => {
  const sources = groupCreatorSources(catalog)
  const mono = sources.find(source => source.sourceId === 'ZWp7MKpjp1M')
  const chemie = sources.find(source => source.sourceId === 'y2c5sLKYr7s')
  const noon = sources.find(source => source.sourceId === '224428783481')
  assert.equal(sources.length, 7)
  assert.deepEqual([mono.contentKind, chemie.contentKind, noon.contentKind], ['pokemon','party','pokemon'])
  assert.deepEqual([mono.partySize, chemie.partySize, noon.partySize], [null,6,null])
  assert.deepEqual(mono.members.map(m => m.pokemonKey), ['mega-lucario-z'])
  assert.deepEqual(chemie.members.map(m => m.pokemonKey), ['primarina','mega-kangaskhan','mimikyu','mega-charizard-x','archaludon','mega-mawile'])
  assert.deepEqual([mono.completeMemberCount,chemie.completeMemberCount,noon.completeMemberCount],[0,0,0])
  assert.equal(chemie.confirmedMemberCount,6)
  assert.equal(byId('ZWp7MKpjp1M').length,6)
  assert.equal(byId('224428783481').length,1)
  assert.equal(individualCreatorSources(catalog).length,32)
  assert.equal(new Set(individualCreatorSources(catalog).map(s => s.id)).size,32)
  assert.deepEqual(individualCreatorSources(catalog).map(s => s.members[0].id).sort(), catalog.map(e => e.id).sort())
  assert.equal(relatedCreatorParties.ZWp7MKpjp1M?.partySize,6)
  assert.equal(relatedCreatorParties.ZWp7MKpjp1M?.completeMemberCount,0)
})

test('sparse source builds have field evidence, no synthesized effort or actual stats, and cannot import', () => {
  const extra = [...byId('ZWp7MKpjp1M'),...byId('y2c5sLKYr7s'),...byId('224428783481')]
  const supported = new Set(championsData.rows.map(row => row.key))
  assert.equal(extra.length,13)
  for (const entry of extra) {
    assert.ok(supported.has(entry.pokemonKey),entry.pokemonKey)
    assert.equal(entry.format,null)
    assert.equal(entry.build,null)
    assert.equal(entry.status,'partial')
    assert.equal(entry.rank,null)
    if (entry.provenance.sourceId !== 'ZWp7MKpjp1M') assert.equal(entry.partialBuild.actualStats ?? null,null)
    else assert.ok(entry.partialBuild.actualStats && entry.partialBuild.actualStatsForm)
    assert.equal(canImportCreatorSample(entry),false)
    assert.ok(entry.provenance.fields.pokemonKey)
    for (const field of Object.keys(entry.partialBuild)) {
      assert.ok(entry.provenance.fields[`partialBuild.${field}`],`${entry.id} ${field}`)
      assert.match(entry.provenance.fields[`partialBuild.${field}`].sourceUrl,/^https:\/\//)
      assert.doesNotMatch(entry.provenance.fields[`partialBuild.${field}`].sourceUrl,/scratch/)
    }
  }
  const chemie = byId('y2c5sLKYr7s')
  assert.ok(chemie.filter(e => Object.keys(e.partialBuild).length === 0).length === 5)
  assert.ok(chemie.every(e => !('evs' in e.partialBuild) && !('nature' in e.partialBuild)))
  const k = chemie[1]
  assert.deepEqual([k.partialBuild.item,k.partialBuild.ability,k.partialBuild.moves],['캥카나이트','부자유친',['이판사판태클','지진','냉동펀치','불꽃펀치']])
  assert.equal(k.provenance.fields['partialBuild.evs'],undefined)
  assert.equal(k.provenance.fields['partialBuild.nature'],undefined)
  const noon = byId('224428783481')[0]
  assert.deepEqual(noon.partialBuild.evsKnown,{ hp:2,spAttack:32,speed:32 })
  assert.equal(noon.partialBuild.evs,undefined)
  assert.deepEqual(noon.partialBuild.moves,['화염방사','에어슬래시','솔라빔','오버히트'])
  assert.equal(noon.partialBuild.nature,'timid')
  assert.equal(noon.partialBuild.ability,'가뭄')
  assert.equal(noon.partialBuild.preMegaAbilities[0],'맹화')
  assert.match(noon.provenance.fields['partialBuild.moves'].sourceUrl,/mblogthumb-phinf/)
  const lucario = byId('ZWp7MKpjp1M').find(e => e.featuredSample)
  assert.equal(lucario.pokemonKey,'mega-lucario-z')
  assert.equal(lucario.partialBuild.ability,undefined)
  assert.deepEqual(lucario.partialBuild.preMegaAbilities,['정신력'])
  assert.equal(lucario.partialBuild.actualStatsForm,'lucario')
  assert.deepEqual(lucario.partialBuild.moves,['파동탄','철제광선','악의파동','나쁜음모'])
  assert.deepEqual(lucario.partialBuild.evs,{hp:2,attack:0,defense:0,spAttack:32,spDefense:0,speed:32})
  assert.equal(championsData.rows.find(r => r.key === 'mega-lucario-z').abilities_ko[0],'파동의방호')
  assert.equal(prepareCreatorParty(groupCreatorSources(catalog).find(s => s.sourceId === 'y2c5sLKYr7s'),key => championsData.rows.find(r => r.key === key)?.abilities_ko ?? null),null)
})
