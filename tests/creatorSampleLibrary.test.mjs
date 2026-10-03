import test from 'node:test'
import assert from 'node:assert/strict'
import { catalog, filterCreatorSamples, filterCreatorSources, groupCreatorSources, individualCreatorSources, relatedCreatorParties, canImportCreatorSample, createLinkDraft, sanitizeLinkDrafts, isVerifiedRankerSample } from '../src/creatorSampleLibrary.ts'
import { championsData, additionalFormSpecs, supportedSpeciesKeys } from '../src/effectiveRoster.ts'
import { prepareCreatorParty } from '../src/creatorPartyImport.ts'

const monoKeys = ['mega-scizor', 'ceruledge', 'garchomp', 'mega-floette', 'rotom-wash', 'mega-starmie']
const mono = catalog.filter(e => e.provenance.sourceId === '224319761655')

// Synthetic fixtures exercise the schema; they are never shown as real creator/rank entries.
const complete = {
  id: 'fixture', format: 'singles', language: 'ko', title: '가상 샘플', creator: 'fixture',
  provenance: { sourceUrl: 'https://example.org/video', verifiedAt: '2026-01-01', evidence: 'fixture' },
  status: 'verified', pokemonKey: 'garchomp', rank: null,
  build: { nature: 'jolly', item: 'test item', ability: 'test ability', evs: { hp: 0, attack: 32, defense: 0, spAttack: 0, spDefense: 2, speed: 32 }, moves: ['a', 'b', 'c', 'd'] },
}

test('catalog keeps the three original uploads and all six blog party members', () => {
  assert.deepEqual([...new Set(catalog.filter(e => e.platform === 'youtube').map(e => e.creator))].sort(), ['눈파티', '모노', '케미쨩'])
  assert.deepEqual([...new Set(catalog.filter(e => e.platform === 'youtube').map(e => e.provenance.sourceId))].sort(), ['HQDEZg-Zgv8', 'Ix8nrNnmTUk', 'ihwnR8FJWtM'])
  assert.deepEqual(mono.map(e => e.pokemonKey), monoKeys)
  assert.ok(mono.every(e => e.creator === '모노' && e.provenance.sourceUrl === 'https://m.blog.naver.com/2tjqja/224319761655'))
  assert.ok(mono.every(e => supportedSpeciesKeys.has(e.pokemonKey) && supportedSpeciesKeys.has(e.partialBuild.actualStatsForm)))
  assert.equal(new Set(catalog.map(e => e.id)).size, catalog.length)
  for (const entry of catalog) {
    assert.equal(entry.rank, null)
    assert.equal(entry.provenance.canonicalUrl, entry.provenance.sourceUrl)
    assert.equal(entry.provenance.collectedAt, '2026-10-03')
    assert.equal(canImportCreatorSample(entry), mono.includes(entry) || entry.provenance.sourceId === 'Ix8nrNnmTUk')
    if (mono.includes(entry)) {
      assert.equal(entry.status, 'verified')
      assert.equal(entry.provenance.publishedAt, '2026-06-18')
      assert.equal(entry.provenance.verifiedAt, '2026-10-03')
      assert.deepEqual(entry.partialBuild.moves, entry.build.moves)
    } else if (entry.provenance.sourceId !== 'Ix8nrNnmTUk') {
      assert.equal(entry.status, 'partial')
      assert.equal(entry.build, null)
      assert.equal(entry.provenance.publishedAt, null)
    }
  }
})

test('document taxonomy groups the original six under one party and all are importable', () => {
  const sources = groupCreatorSources(catalog)
  const party = sources.find(source => source.sourceId === '224319761655')
  assert.equal(sources.length, 4)
  assert.equal(party.contentKind, 'party')
  assert.equal(party.platform, 'blog')
  assert.equal(party.canonicalUrl, 'https://m.blog.naver.com/2tjqja/224319761655')
  assert.deepEqual(party.members.map(member => member.pokemonKey), monoKeys)
  assert.equal(party.confirmedMemberCount, 6)
  assert.equal(party.completeMemberCount, 6)
  assert.equal(party.partySize, 6)
  assert.deepEqual(party.members.map(member => member.partialBuild.nature), ['adamant', 'adamant', 'impish', 'timid', 'timid', 'adamant'])
  assert.equal(sources.find(source => source.sourceId === 'ihwnR8FJWtM').contentKind, 'pokemon')
  assert.deepEqual(sources.filter(source => source.platform === 'youtube' && source.sourceId !== 'ihwnR8FJWtM').map(source => source.contentKind), ['pokemon', 'party'])
})

test('content-kind filter matches member search yet retains all members in one party document', () => {
  const matches = filterCreatorSources(groupCreatorSources(catalog), { language: 'ko', format: 'singles', query: 'rotom-wash', contentKind: 'party' })
  assert.equal(matches.length, 1)
  assert.deepEqual(matches[0].members.map(member => member.pokemonKey), monoKeys)
  assert.deepEqual(filterCreatorSources(groupCreatorSources(catalog), { language: 'ko', format: 'all', query: '', contentKind: 'pokemon' }).map(source => source.sourceId), ['Ix8nrNnmTUk', 'ihwnR8FJWtM'])
  assert.deepEqual(filterCreatorSources(groupCreatorSources(catalog), { language: 'ko', format: 'all', query: '', contentKind: 'unknown' }), [])
  assert.deepEqual(filterCreatorSources(groupCreatorSources(catalog), { language: 'ko', format: 'singles', query: '', contentKind: 'pokemon' }).map(source => source.sourceId), ['Ix8nrNnmTUk'])
})

test('눈파티 image-backed Pinsir details cite each field without inferring battle format', () => {
  const pinsir = catalog.find(e => e.pokemonKey === 'mega-pinsir')
  assert.equal(pinsir.provenance.sourceUrl, 'https://www.youtube.com/watch?v=ihwnR8FJWtM')
  assert.equal(pinsir.format, null)
  assert.deepEqual(pinsir.partialBuild, {
    nature: 'adamant', item: '쁘사이저나이트', ability: '스카이스킨',
    preMegaAbilities: ['자기과신', '괴력집게'],
    evs: { hp: 19, attack: 32, defense: 0, spAttack: 0, spDefense: 1, speed: 14 },
    moves: ['전광석화', '누르기', '칼춤', '업어후리기'],
  })
  for (const field of ['nature', 'item', 'ability', 'preMegaAbilities', 'evs', 'moves']) {
    const evidence = pinsir.provenance.fields[`partialBuild.${field}`]
    assert.match(evidence.sourceUrl, /^https:\/\/mblogthumb-phinf\.pstatic\.net\/.*%EB%A9%94%EA%B0%80_/)
    assert.match(evidence.location, /메가 쁘사이저/)
    assert.equal(evidence.checkedAt, '2026-10-03')
  }
  assert.equal(pinsir.provenance.fields.format, undefined)
  assert.equal(canImportCreatorSample(pinsir), false)
})

test('모노 six members have source-backed fields, pre-Mega stat forms and distinct supported import keys', () => {
  const expected = [
    ['mega-scizor', 'adamant', '핫삼나이트', '테크니션', [32,24,10,0,0,0], ['칼춤','불릿펀치','탁쳐서떨구기','인파이트'], [177,191,130,67,100,85], 'scizor'],
    ['ceruledge', 'adamant', '기합의띠', '깨어진갑옷', [1,32,0,0,1,32], ['인파이트','폴터가이스트','야습','칼춤'], [151,194,100,72,121,137], 'ceruledge'],
    ['garchomp', 'impish', '자뭉열매', '까칠한피부', [32,0,30,0,0,4], ['지진','드래곤테일','압정뿌리기','스텔스록'], [215,150,159,90,105,126], 'garchomp'],
    ['mega-floette', 'timid', '플라엣테나이트', '플라워베일', [0,0,6,28,0,32], ['문포스','드레인키스','파멸의빛','명상'], [149,76,93,173,148,158], 'floette-eternal-flower'],
    ['rotom-wash', 'timid', '구애스카프', '부유', [6,0,0,32,0,28], ['하이드로펌프','10만볼트','볼트체인지','트릭'], [131,76,127,157,127,147], 'rotom-wash'],
    ['mega-starmie', 'adamant', '아쿠스타나이트', '자연회복', [2,32,0,0,0,32], ['아쿠아브레이크','아이스스피너','사이코커터','아쿠아제트'], [137,139,105,108,105,167], 'starmie'],
  ]
  const stats = ['hp','attack','defense','spAttack','spDefense','speed']
  for (const [key, nature, item, ability, evs, moves, actual, form] of expected) {
    const entry = mono.find(e => e.pokemonKey === key)
    assert.ok(entry)
    assert.deepEqual([entry.build.nature, entry.build.item, entry.build.ability], [nature, item, ability])
    assert.deepEqual(stats.map(stat => entry.build.evs[stat]), evs)
    assert.deepEqual(entry.build.moves, moves)
    assert.deepEqual(stats.map(stat => entry.partialBuild.actualStats[stat]), actual)
    assert.equal(entry.partialBuild.actualStatsForm, form)
    assert.equal(canImportCreatorSample(entry), true)
    for (const field of ['item', 'ability', 'evs', 'moves', 'nature', 'actualStats', 'actualStatsForm']) {
      const evidence = entry.provenance.fields[`partialBuild.${field}`]
      assert.match(evidence.sourceUrl, /^https:\/\/mblogthumb-phinf\.pstatic\.net\/.*%ED%8C%8C%ED%8B%B0_/)
      assert.match(evidence.sourceUrl, new RegExp(`%ED%8C%8C%ED%8B%B0_${['evs','nature','actualStats','actualStatsForm'].includes(field) ? '2' : '1'}`))
      assert.match(evidence.location, new RegExp(entry.title.split(' — ')[1]))
      assert.equal(evidence.checkedAt, '2026-10-03')
    }
    assert.match(entry.provenance.fields['partialBuild.nature'].location, /↑.*↓/)
    assert.equal(entry.provenance.fields.format.sourceUrl, entry.provenance.sourceUrl)
    if (key.startsWith('mega-')) {
      assert.match(entry.provenance.fields['partialBuild.actualStats'].location, /메가진화 전/)
      assert.deepEqual(entry.partialBuild.preMegaAbilities, [ability])
      assert.match(entry.provenance.fields['partialBuild.ability'].location, /메가진화 전/)
    }
  }
})

test('source stat arrows establish nature and recorded actual stats without substituting Mega Scizor stats', () => {
  const [rotom, scizor] = ['rotom-wash', 'mega-scizor'].map(key => catalog.find(e => e.pokemonKey === key))
  assert.equal(rotom.partialBuild.nature, 'timid') // speed ↑, attack ↓
  assert.equal(scizor.partialBuild.nature, 'adamant') // attack ↑, special attack ↓
  assert.deepEqual(rotom.partialBuild.actualStats, { hp: 131, attack: 76, defense: 127, spAttack: 157, spDefense: 127, speed: 147 })
  assert.deepEqual(scizor.partialBuild.actualStats, { hp: 177, attack: 191, defense: 130, spAttack: 67, spDefense: 100, speed: 85 })
  assert.equal(scizor.partialBuild.actualStatsForm, 'scizor')
  for (const entry of [rotom, scizor]) {
    assert.match(entry.provenance.fields['partialBuild.nature'].location, /↑.*↓/)
    assert.match(entry.provenance.fields['partialBuild.actualStats'].sourceUrl, /%ED%8C%8C%ED%8B%B0_2/)
  }
})

test('Mono HAS Mega Gyarados is one individual source, not an importable rental party', () => {
  const source = groupCreatorSources(catalog).find(s => s.sourceId === 'Ix8nrNnmTUk')
  assert.equal(source.contentKind, 'pokemon')
  assert.equal(source.partySize, null)
  assert.equal(source.confirmedMemberCount, 1)
  assert.equal(source.completeMemberCount, 1)
  assert.deepEqual(source.members.map(m => m.pokemonKey), ['mega-gyarados'])
  assert.equal(source.canonicalUrl, 'https://www.youtube.com/watch?v=Ix8nrNnmTUk')
  const entry = source.members[0]
  assert.equal(entry.id, 'youtube-Ix8nrNnmTUk-mega-gyarados')
  assert.equal(canImportCreatorSample(entry), true)
  assert.deepEqual([entry.build.nature,entry.build.item,entry.build.ability], ['adamant','갸라도스나이트','위협'])
  assert.deepEqual(entry.build.moves, ['얼음엄니','지진','파워휩','용의춤'])
  assert.deepEqual(entry.build.evs, { hp: 5, attack: 32, defense: 10, spAttack: 0, spDefense: 0, speed: 19 })
  assert.deepEqual(entry.partialBuild.actualStats, { hp: 175, attack: 194, defense: 109, spAttack: 72, spDefense: 120, speed: 120 })
  assert.equal(entry.partialBuild.actualStatsForm, 'gyarados')
  for (const field of ['item','ability','moves','evs','nature','actualStats','actualStatsForm']) {
    const evidence = entry.provenance.fields[`partialBuild.${field}`]
    assert.equal(evidence.sourceUrl,source.canonicalUrl)
    assert.match(evidence.location, new RegExp(['nature','evs','actualStats','actualStatsForm'].includes(field) ? '02:55.*mono-t175.png' : '02:52.*mono-t172.png'))
  }
  assert.match(entry.provenance.fields['partialBuild.nature'].location,/↑.*↓/)
  assert.deepEqual(entry.partialBuild.preMegaAbilities,['위협'])
  assert.match(entry.provenance.fields['partialBuild.nature'].location,/슬롯 2/)
  assert.match(entry.provenance.evidence,/개별 샘플/)
  assert.equal(prepareCreatorParty(source, key => championsData.rows.find(row => row.key === key)?.abilities_ko ?? null), null)
})

test('Mono six recorded slots remain individually findable, with only Gyarados featured in the presentation', () => {
  const members = catalog.filter(e => e.provenance.sourceId === 'Ix8nrNnmTUk')
  assert.deepEqual(members.map(e => e.pokemonKey), ['hydreigon','mega-gyarados','archaludon','mega-lopunny','hippowdon','gholdengo'])
  assert.deepEqual(members.map(e => e.featuredSample), [false,true,false,false,false,false])
  assert.ok(members.every(e => e.contentKind === 'pokemon' && e.creator === '모노' && canImportCreatorSample(e)))
  assert.deepEqual(groupCreatorSources(catalog).find(s => s.sourceId === 'Ix8nrNnmTUk').members, [members[1]])
  for (const [index, entry] of members.entries()) {
    assert.equal(entry.provenance.sourceUrl, 'https://www.youtube.com/watch?v=Ix8nrNnmTUk')
    assert.match(entry.provenance.fields['partialBuild.item'].location, new RegExp(`슬롯 ${index + 1}`))
    assert.match(entry.provenance.fields['partialBuild.actualStats'].location, new RegExp(`02:55.*슬롯 ${index + 1}`))
    assert.match(entry.provenance.evidence, /메가갸라도스 개별 샘플/)
  }
})

test('individual index contains every recorded member once regardless of source presentation', () => {
  const individuals = individualCreatorSources(catalog)
  assert.equal(individuals.length, 19)
  assert.equal(new Set(individuals.map(s => s.id)).size, 19)
  assert.deepEqual(individuals.map(s => s.members[0].id).sort(), catalog.map(e => e.id).sort())
  assert.equal(individuals[0].members[0].pokemonKey, 'mega-gyarados')
  assert.equal(individuals[0].members[0].featuredSample, true)
  assert.ok(individuals.every(s => s.id === `individual:${s.members[0].id}` && s.members.length === 1 && s.partySize === null && s.contentKind === 'pokemon' && s.confirmedMemberCount === 1))
  assert.ok(individuals.every(s => s.canonicalUrl === s.members[0].provenance.canonicalUrl && s.creator === s.members[0].creator && s.sourceId === s.members[0].provenance.sourceId))
  assert.equal(individuals.filter(s => s.completeMemberCount === 1).length, 12)
  assert.equal(individuals.filter(s => s.completeMemberCount === 0).length, 7)
  assert.equal(filterCreatorSources(individuals, { language: 'ko', format: 'singles', query: 'hydreigon', contentKind: 'pokemon' }).length, 1)
  assert.equal(individuals.filter(s => s.sourceId === 'Ix8nrNnmTUk').length, 6)
  assert.equal(groupCreatorSources(catalog).filter(s => s.contentKind === 'party').length, 2)
})

test('related Mono rental six can prepare a separate party without changing catalog taxonomy or entries', () => {
  const before = JSON.stringify(catalog.filter(e => e.provenance.sourceId === 'Ix8nrNnmTUk'))
  const source = relatedCreatorParties.Ix8nrNnmTUk
  assert.equal(source.contentKind, 'party')
  assert.equal(source.partySize, 6)
  assert.equal(source.completeMemberCount, 6)
  assert.deepEqual(source.members.map(m => m.pokemonKey), ['hydreigon','mega-gyarados','archaludon','mega-lopunny','hippowdon','gholdengo'])
  assert.ok(source.members.every(m => m.contentKind === 'party' && m !== catalog.find(e => e.id === m.id)))
  const abilities = key => [...championsData.rows, ...additionalFormSpecs].find(row => row.key === key)?.abilities_ko ?? null
  const prepared = prepareCreatorParty(source, abilities)
  assert.ok(prepared)
  assert.deepEqual(prepared.party.map(p => p.key), source.members.map(m => m.pokemonKey))
  assert.equal(JSON.stringify(catalog.filter(e => e.provenance.sourceId === 'Ix8nrNnmTUk')), before)
})

test('original Chemie video has six detailed partial cards with unknown nature and effort, never importable', () => {
  const source = groupCreatorSources(catalog).find(s => s.sourceId === 'HQDEZg-Zgv8')
  const expected = [
    ['greninja','급류','기합의띠',['파도타기','물수리검','악의파동','도발']],
    ['mimikyu','탈','리샘열매',['치근거리기','드레인펀치','야습','칼춤']],
    ['mega-charizard-x','맹화','리자몽나이트X',['플레어드라이브','역린','니트로차지','칼춤']],
    ['gyarados','위협','먹다남은음식',['폭포오르기','지진','도발','용의춤']],
    ['mega-kangaskhan','배짱','캥카나이트',['이판사판태클','지진','냉동펀치','불꽃펀치']],
    ['aegislash','배틀스위치','유루열매',['성스러운칼','야습','대타출동','칼춤']],
  ]
  assert.equal(source.partySize,6)
  assert.equal(source.confirmedMemberCount,6)
  assert.equal(source.completeMemberCount,0)
  assert.equal(source.members.length,6)
  for (const [index,[key,ability,item,moves]] of expected.entries()) {
    const entry = source.members[index]
    assert.equal(entry.id,`youtube-HQDEZg-Zgv8-${key}`)
    assert.equal(supportedSpeciesKeys.has(key),true)
    assert.deepEqual([entry.partialBuild.ability,entry.partialBuild.item,entry.partialBuild.moves],[ability,item,moves])
    assert.equal(entry.partialBuild.nature,undefined)
    assert.equal(entry.partialBuild.evs,undefined)
    assert.equal(entry.provenance.fields['partialBuild.nature'],undefined)
    assert.equal(entry.provenance.fields['partialBuild.evs'],undefined)
    assert.equal(entry.build,null)
    assert.equal(entry.rank,null)
    assert.equal(canImportCreatorSample(entry),false)
    for (const field of ['item','ability','moves']) {
      assert.equal(entry.provenance.fields[`partialBuild.${field}`].sourceUrl,source.canonicalUrl)
      assert.match(entry.provenance.fields[`partialBuild.${field}`].location,/10:42.*chemie-t642.png/)
    }
    if (key.startsWith('mega-')) assert.deepEqual(entry.partialBuild.preMegaAbilities,[ability])
  }
  assert.match(source.members[0].provenance.evidence,/ABADTP47YC.*미확인/)
})

test('only the six-member blog prepares a Mono party, not the individual Mono video', () => {
  const sources = groupCreatorSources(catalog)
  const blogParty = sources.find(source => source.sourceId === '224319761655')
  const abilities = key => [...championsData.rows, ...additionalFormSpecs].find(row => row.key === key)?.abilities_ko
    ?? [blogParty.members.find(member => member.pokemonKey === key).build.ability]
  const monoVideo = sources.find(source => source.sourceId === 'Ix8nrNnmTUk')
  assert.equal(prepareCreatorParty(monoVideo, abilities), null)
  const prepared = prepareCreatorParty(sources.find(source => source.sourceId === '224319761655'), abilities)
  assert.equal(prepared.party.length, 6)
  assert.equal(prepareCreatorParty(sources.find(source => source.sourceId === 'HQDEZg-Zgv8'), abilities), null)
})

test('ranker menu requires independently recorded rank evidence', () => {
  assert.equal(catalog.some(isVerifiedRankerSample), false)
  assert.equal(isVerifiedRankerSample({ ...complete, rank: '1위' }), false)
  assert.equal(isVerifiedRankerSample({ ...complete, rank: '1위', provenance: { ...complete.provenance, fields: { rank: { sourceUrl: 'https://example.org/ranking', location: 'season results', checkedAt: '2026-10-03' } } } }), true)
})

test('filters by region, format, Pokémon and free text', () => {
  const entries = [complete, { ...complete, id: 'other', language: 'ja', format: 'doubles', pokemonKey: 'rotom', title: '別の構築' }]
  assert.deepEqual(filterCreatorSamples(entries, { language: 'ko', format: 'singles', query: 'garchomp' }).map(e => e.id), ['fixture'])
  assert.deepEqual(filterCreatorSamples(entries, { language: 'ja', format: 'doubles', query: '別' }).map(e => e.id), ['other'])
  assert.deepEqual(filterCreatorSamples(entries, { language: 'ko', format: 'singles', query: 'missing' }), [])
})

test('only complete, source-verified, valid Champions builds import', () => {
  assert.equal(canImportCreatorSample(complete), true)
  assert.equal(canImportCreatorSample({ ...complete, status: 'partial' }), false)
  assert.equal(canImportCreatorSample({ ...complete, format: null }), false)
  assert.equal(canImportCreatorSample({ ...complete, provenance: { ...complete.provenance, verifiedAt: '' } }), false)
  assert.equal(canImportCreatorSample({ ...complete, build: { ...complete.build, moves: ['a', 'b'] } }), false)
  assert.equal(canImportCreatorSample({ ...complete, build: { ...complete.build, evs: { ...complete.build.evs, speed: 33 } } }), false)
  assert.equal(canImportCreatorSample({ ...complete, build: { ...complete.build, evs: { ...complete.build.evs, hp: 1 } } }), false)
})

test('submitted links are partial local drafts, require web URLs, and survive safe parsing', () => {
  assert.equal(createLinkDraft('javascript:alert(1)', 'ko', 'singles'), null)
  const draft = createLinkDraft('https://example.org/video', 'ja', 'doubles')
  assert.equal(draft?.status, 'partial')
  assert.equal(createLinkDraft('https://youtube.com/watch?v=abc123', 'ko', 'singles')?.platform, 'youtube')
  assert.equal(createLinkDraft('https://x.com/name/status/123', 'ko', 'singles')?.platform, 'x')
  assert.equal(draft?.platform, 'blog')
  assert.equal(draft?.creator, null)
  assert.equal(draft?.rank, null)
  assert.equal(canImportCreatorSample(draft), false)
  assert.deepEqual(sanitizeLinkDrafts([draft, { ...draft, sourceUrl: 'data:text/html,evil' }]), [draft])
})
