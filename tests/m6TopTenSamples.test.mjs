import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import baseline from './fixtures/catalogBeforeM6TopTen.json' with { type: 'json' }
import { catalog, groupCreatorSources, filterCreatorSources, canImportCreatorSample } from '../src/creatorSampleLibrary.ts'
import { m6TopTenSamples } from '../src/m6TopTenSamples.ts'
import { supportedSpeciesKeys } from '../src/effectiveRoster.ts'

const ranks = [1, 3, 4, 5, 6, 7, 9]
const newIds = new Set(m6TopTenSamples.map(entry => entry.id))
const old = catalog.filter(entry => !newIds.has(entry.id))
const sha = entry => createHash('sha256').update(JSON.stringify(entry)).digest('hex')

test('seven primary whole-party sources add exactly 42 distinct members to immutable original 50', () => {
  assert.equal(catalog.length, 92)
  assert.equal(m6TopTenSamples.length, 42)
  assert.equal(newIds.size, 42)
  assert.equal(groupCreatorSources(catalog).length, 17)
  assert.deepEqual(old.map(entry => ({ id: entry.id, sha256: sha(entry) })), baseline.entries)
  assert.equal(old.length, baseline.catalogCount)
  assert.equal(groupCreatorSources(old).length, baseline.sourceCount)
  assert.deepEqual([...new Set(m6TopTenSamples.map(entry => Number(entry.rank.match(/최종(\d+)위/)[1])))].sort((a,b) => a-b), ranks)
  for (const rank of ranks) {
    const members = m6TopTenSamples.filter(entry => entry.rank.includes(`최종${rank}위`))
    assert.equal(members.length, 6)
    assert.equal(new Set(members.map(entry => entry.provenance.canonicalUrl)).size, 1)
    assert.ok(members.every(entry => entry.contentKind === 'party' && entry.partySize === 6 && entry.language === 'ja' && entry.format === 'singles' && entry.platform === 'blog'))
  }
  assert.equal(m6TopTenSamples.some(e => /최종(?:2|8|10)위/.test(e.rank)), false)
})

test('new records expose four source moves, only printed investments, and field-specific evidence', () => {
  for (const entry of m6TopTenSamples) {
    assert.ok(supportedSpeciesKeys.has(entry.pokemonKey), entry.id)
    assert.equal(entry.partialBuild.moves.length, 4, entry.id)
    assert.ok(entry.partialBuild.moves.every(Boolean), entry.id)
    assert.ok(Object.keys(entry.partialBuild.evsKnown).length > 0, entry.id)
    assert.equal(Object.values(entry.partialBuild.evsKnown).includes(null), false, entry.id)
    assert.ok(supportedSpeciesKeys.has(entry.partialBuild.actualStatsForm), entry.id)
    assert.ok(entry.provenance.canonicalUrl.startsWith('https://'), entry.id)
    for (const key of ['creator','title','pokemonKey','rank','format', ...Object.keys(entry.partialBuild).map(key => `partialBuild.${key}`)]) {
      const evidence = entry.provenance.fields[key]
      assert.ok(evidence?.sourceUrl.startsWith('https://') && evidence?.location && evidence?.checkedAt, `${entry.id}:${key}`)
    }
    if (entry.status === 'partial') {
      assert.equal(entry.build, null, entry.id)
      assert.equal(canImportCreatorSample(entry), false, entry.id)
    } else {
      assert.ok(entry.build && canImportCreatorSample(entry), entry.id)
      assert.equal(Object.keys(entry.partialBuild.evsKnown).length, 6, entry.id)
    }
  }
  assert.equal(filterCreatorSources(groupCreatorSources(catalog), { language:'ja', format:'singles', contentKind:'party', query:'시즌 M-6 싱글' }).filter(s => ranks.some(rank => s.members[0].rank.includes(`최종${rank}위`))).length, 7)
})

test('source distinctions: author claim, true Heat Rotom form, physical Mega Lucario and final-day Floette', () => {
  const byRank = rank => m6TopTenSamples.filter(entry => entry.rank.includes(`최종${rank}위`))
  assert.equal(byRank(5).find(e => e.pokemonKey === 'rotom-heat').partialBuild.actualStatsForm, 'rotom-heat')
  assert.equal(byRank(5).every(e => e.status === 'partial' && e.build === null && !('nature' in e.partialBuild) && !('ability' in e.partialBuild)), true)
  assert.equal(byRank(5)[0].rank, '작성자 제목 주장 최종5위')
  assert.match(byRank(5)[0].provenance.fields.rank.location, /제목|見出し/)
  assert.equal(byRank(6)[1].pokemonKey, 'mega-lucario') // party-screen order
  assert.match(byRank(6)[1].provenance.evidence, /ルカリオX/)
  assert.match(byRank(6)[0].provenance.evidence, /Dr\.Latancy/)
  const floette = byRank(7).find(e => e.pokemonKey === 'mega-floette')
  assert.deepEqual(floette.partialBuild.moves.slice(2), ['애교부리기','광합성'])
  assert.match(floette.provenance.evidence, /あまえる \/ こうごうせい/)
  assert.equal(byRank(9).find(e => e.pokemonKey === 'gyarados').partialBuild.actualStatsForm, 'gyarados')
  assert.deepEqual(byRank(9).find(e => e.pokemonKey === 'gyarados').partialBuild.actualStats,
    { hp:179, attack:187, defense:99, spAttack:72, spDefense:120, speed:133 })
  assert.equal(byRank(9).find(e => e.pokemonKey === 'gyarados').partialBuild.ability, '위협')
  assert.deepEqual(byRank(4).map(e => e.partialBuild.evsKnown), [
    [32,0,12,0,22,0], [1,0,0,32,1,32], [12,31,22,0,1,0],
    [1,32,3,0,0,30], [32,0,4,5,25,0], [22,0,19,21,0,4],
  ].map(([hp,attack,defense,spAttack,spDefense,speed]) => ({ hp,attack,defense,spAttack,spDefense,speed })))
  assert.deepEqual(byRank(4).map(e => e.partialBuild.ability ?? null), ['모래날림',null,'적응력','변환자재','지구력',null])
  assert.deepEqual(byRank(4)[1].partialBuild.preMegaAbilities, ['정신력'])
  assert.deepEqual(byRank(4)[5].partialBuild.preMegaAbilities, ['맹화'])
  for (const e of byRank(4)) {
    assert.match(e.provenance.fields['partialBuild.evsKnown'].sourceUrl, /20261008211047\.png/)
    assert.doesNotMatch(e.provenance.evidence, /표기 없는 노력 포인트\/특성/)
  }
  assert.equal(byRank(1)[0].partialBuild.evsKnown.attack, 0)
  assert.equal('attack' in byRank(9)[0].partialBuild.evsKnown, false)
})

test('metadata-backed Japanese moves and abilities become localized without losing raw source evidence', () => {
  const charY = m6TopTenSamples.find(e => e.rank.includes('최종1위') && e.pokemonKey === 'mega-charizard-y')
  assert.equal(charY.partialBuild.moves[0], '웨더볼')
  assert.equal(charY.partialBuild.ability, '가뭄')
  assert.match(charY.provenance.evidence, /ウェザーボール/)
  assert.equal(m6TopTenSamples.find(e => e.rank.includes('최종1위') && e.pokemonKey === 'hippowdon').partialBuild.moves[0], '방어')
})

test('fully evidenced non-Mega rows with canonical resolver matches become importable while unknowns stay gated', () => {
  const expected = m6TopTenSamples.filter(e => /최종(?:1|3|4)위/.test(e.rank) && !(e.rank.includes('최종4위') && ['mega-lucario-z','mega-charizard-y'].includes(e.pokemonKey))).map(e => `${Number(e.rank.match(/최종(\d+)위/)[1])}:${e.pokemonKey}`)
  const completed = m6TopTenSamples.filter(e => e.status === 'verified')
  assert.deepEqual(completed.map(e => `${Number(e.rank.match(/최종(\d+)위/)[1])}:${e.pokemonKey}`), expected)
  assert.ok(completed.every(e => e.build && canImportCreatorSample(e) && e.build.moves.length === 4))
  assert.equal(completed.find(e => e.pokemonKey === 'hydreigon').build.ability, '부유')
  assert.equal(completed.find(e => e.pokemonKey === 'hydreigon').partialBuild.ability, '부유')
  assert.match(completed.find(e => e.pokemonKey === 'hydreigon').provenance.fields['partialBuild.ability'].location, /ふゆう/)
  assert.equal(m6TopTenSamples.filter(e => e.status === 'partial').length, 26)
})
