import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { catalog, canImportCreatorSample, groupCreatorSources, filterCreatorSources } from '../src/creatorSampleLibrary.ts'
import { prepareCreatorParty } from '../src/creatorPartyImport.ts'
import { championsData, supportedSpeciesKeys } from '../src/effectiveRoster.ts'

const baseline = JSON.parse(readFileSync(new URL('./fixtures/catalogBeforeM6.json', import.meta.url)))
const statKeys = ['hp','attack','defense','spAttack','spDefense','speed']
const ids = ['blog-eFF4DcKeQM1cwSf-20261010-081058','blog-ebapoke-20261008-223301','blog-pkmn-ys1224-20261008-180309']
const groups = ids.map(id => groupCreatorSources(catalog).find(s => s.sourceId === id))
const originalCatalog = catalog.filter(entry => !entry.id.startsWith('blog-m6-'))
const abilities = key => championsData.rows.find(row => row.key === key)?.abilities_ko ?? null

test('append exactly three M-6 original documents with six source-ordered members each', () => {
  assert.equal(originalCatalog.length, baseline.entries.length + 18)
  assert.equal(new Set(catalog.map(e => e.id)).size, catalog.length)
  assert.equal(groupCreatorSources(originalCatalog).length, baseline.sourceCount + 3)
  assert.deepEqual(groups.map(g => g?.members.length), [6,6,6])
  assert.ok(groups.every(g => g.contentKind === 'party' && g.partySize === 6 && g.language === 'ja' && g.format === 'singles' && g.platform === 'blog'))
  assert.deepEqual(groups[0].members.map(m => m.pokemonKey), ['mega-lucario-z','hippowdon','mega-dragonite','aegislash','basculegion','mimikyu'])
  assert.deepEqual(groups[1].members.map(m => m.pokemonKey), ['mega-gengar','bellibolt','umbreon','mega-salamence','archaludon','primarina'])
  assert.deepEqual(groups[2].members.map(m => m.pokemonKey), ['mega-lucario-z','mega-absol-z','garchomp','gyarados','ninetales-alolan','glimmora'])
  assert.deepEqual(filterCreatorSources(groupCreatorSources(originalCatalog), {language:'ja', format:'singles', contentKind:'party', query:'시즌 M-6'}).map(g => g.sourceId), ids)
})

test('all old records remain byte-equivalent as JSON objects', () => {
  for (const {id, sha256} of baseline.entries) {
    const entry = catalog.find(e => e.id === id)
    assert.ok(entry, id)
    assert.equal(createHash('sha256').update(JSON.stringify(entry)).digest('hex'), sha256, id)
  }
})

test('published original claims and member fields have precise primary evidence, without independent-rank wording', () => {
  for (const [index, group] of groups.entries()) {
    assert.match(group.members[0].rank, new RegExp(`작성자 공개 최종${[2,41,71][index]}위`))
    assert.equal(group.members[0].provenance.publishedAt != null, true)
    for (const member of group.members) {
      assert.equal(supportedSpeciesKeys.has(member.pokemonKey), true, member.id)
      assert.equal(member.provenance.canonicalUrl, group.canonicalUrl)
      assert.equal(member.provenance.collectedAt, '2026-10-18')
      assert.deepEqual(member.partialBuild.moves.length, 4)
      assert.ok(member.partialBuild.item && member.partialBuild.ability && member.partialBuild.nature)
      for (const field of ['creator','title','pokemonKey','format','rank','partialBuild.item','partialBuild.ability','partialBuild.nature','partialBuild.moves','partialBuild.evsKnown']) {
        const evidence = member.provenance.fields[field]
        assert.ok(evidence?.sourceUrl.startsWith('https://') && evidence?.location && evidence?.checkedAt, `${member.id}: ${field}`)
      }
      const row = championsData.rows.find(r => r.key === member.pokemonKey)
      if (member.pokemonKey !== 'ninetales-alolan') assert.ok(row.abilities_ko.includes(member.partialBuild.ability), member.id)
    }
  }
})

test('rank 2 keeps source x investments absent; only Mega Dragonite has all six explicit efforts', () => {
  const [lucario, hippo, dragonite, aegis, bascu, mimi] = groups[0].members
  assert.equal(lucario.partialBuild.evsKnown.attack, undefined)
  assert.equal(lucario.partialBuild.evsKnown.spAttack, 32)
  assert.deepEqual(dragonite.partialBuild.evsKnown, {hp:9,attack:0,defense:0,spAttack:25,spDefense:0,speed:32})
  assert.equal(canImportCreatorSample(dragonite), true)
  for (const member of [lucario,hippo,aegis,bascu,mimi]) {
    assert.equal(member.partialBuild.evsKnown[member === lucario ? 'attack':'spAttack'], undefined)
    assert.equal(member.build, null)
    assert.equal(canImportCreatorSample(member), false)
  }
  assert.equal(groups[0].completeMemberCount, 1)
  assert.equal(prepareCreatorParty(groups[0], abilities), null)
  assert.equal(lucario.partialBuild.actualStatsForm, 'mega-lucario-z')
  assert.equal(dragonite.partialBuild.actualStatsForm, 'mega-dragonite')
  assert.equal(dragonite.partialBuild.actualStats.spAttack, 209)
})

test('source-mechanics conflict stays explicit and Shield stats never use Blade values', () => {
  const [, hippo, , aegis] = groups[0].members
  assert.equal(hippo.partialBuild.actualStats.spDefense, 107)
  assert.match(hippo.provenance.evidence, /107.*109.*불일치/)
  assert.equal(canImportCreatorSample(hippo), false)
  assert.equal(aegis.partialBuild.actualStatsForm, 'aegislash')
  assert.deepEqual(aegis.partialBuild.actualStats, {hp:137,attack:112,defense:160,spDefense:160,speed:112})
  assert.equal(aegis.partialBuild.actualStats.spAttack, undefined)
  assert.match(aegis.provenance.evidence, /실드폼\(aegislash\)/)
  assert.doesNotMatch(aegis.provenance.evidence, /실수치 aegislash-blade 폼에만 적용/)
  assert.match(aegis.provenance.fields['partialBuild.actualStats'].location, /137\(2\)-112\(32\)-160\(0\)-x-160\(0\)-112\(32\)/)
})

test('rank 41 has six complete evidenced builds and existing whole-party import preserves slots, effort and source moves', () => {
  const source = groups[1]
  assert.deepEqual(source.members.map(m => Object.keys(m.partialBuild.evsKnown).length), [6,6,6,6,6,6])
  assert.equal(source.completeMemberCount, 6)
  const prepared = prepareCreatorParty(source, abilities)
  assert.ok(prepared)
  assert.deepEqual(prepared.party.map(p => p.key), source.members.map(m => m.pokemonKey))
  assert.deepEqual(prepared.party.map(p => p.evs), source.members.map(m => m.build.evs))
  assert.deepEqual(prepared.lockedMovesBySlot, source.members.map(m => m.build.moves))
  assert.deepEqual(source.members[1].partialBuild.moves[3], '물붓기')
  assert.deepEqual(source.members[2].partialBuild.moves[1], '희망사항')
  assert.deepEqual(source.members.map(m => m.partialBuild.actualStatsForm), source.members.map(m => m.pokemonKey))
})

test('rank 71 keeps unprinted investment absent and Snow Warning source ability visible yet blocked', () => {
  const source = groups[2]
  assert.equal(source.completeMemberCount, 0)
  assert.equal(prepareCreatorParty(source, abilities), null)
  for (const m of source.members) {
    assert.equal(m.build, null)
    assert.equal(m.partialBuild.evs, undefined)
    assert.ok(Object.keys(m.partialBuild.evsKnown).length < 6)
    assert.equal(canImportCreatorSample(m), false)
  }
  const ninetales = source.members[4]
  assert.equal(ninetales.pokemonKey, 'ninetales-alolan')
  assert.equal(ninetales.partialBuild.ability, '눈퍼뜨리기')
  assert.ok(!abilities('ninetales-alolan').includes(ninetales.partialBuild.ability))
  assert.equal(ninetales.partialBuild.actualStats.attack, undefined)
  assert.equal(ninetales.partialBuild.actualStats.spAttack, 101)
  assert.equal(ninetales.partialBuild.evsKnown.attack, undefined)
})
