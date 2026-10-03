import test from 'node:test'
import assert from 'node:assert/strict'
import { catalog, filterCreatorSamples, filterCreatorSources, groupCreatorSources, canImportCreatorSample, createLinkDraft, sanitizeLinkDrafts, isVerifiedRankerSample } from '../src/creatorSampleLibrary.ts'
import { championsData, supportedSpeciesKeys } from '../src/effectiveRoster.ts'
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
  assert.deepEqual(sources.filter(source => source.platform === 'youtube' && source.sourceId !== 'ihwnR8FJWtM').map(source => source.contentKind), ['party', 'party'])
})

test('content-kind filter matches member search yet retains all members in one party document', () => {
  const matches = filterCreatorSources(groupCreatorSources(catalog), { language: 'ko', format: 'singles', query: 'rotom-wash', contentKind: 'party' })
  assert.equal(matches.length, 1)
  assert.deepEqual(matches[0].members.map(member => member.pokemonKey), monoKeys)
  assert.deepEqual(filterCreatorSources(groupCreatorSources(catalog), { language: 'ko', format: 'all', query: '', contentKind: 'pokemon' }).map(source => source.sourceId), ['ihwnR8FJWtM'])
  assert.deepEqual(filterCreatorSources(groupCreatorSources(catalog), { language: 'ko', format: 'all', query: '', contentKind: 'unknown' }), [])
  assert.deepEqual(filterCreatorSources(groupCreatorSources(catalog), { language: 'ko', format: 'singles', query: '', contentKind: 'pokemon' }), [])
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

test('original Mono video forms a separate six-member importable party with every field at its own frame', () => {
  const source = groupCreatorSources(catalog).find(s => s.sourceId === 'Ix8nrNnmTUk')
  const expected = [
    ['hydreigon','modest','구애스카프','부유',[2,0,0,32,0,32],['용성군','악의파동','불대문자','유턴'],[169,112,110,194,110,150],'hydreigon'],
    ['mega-gyarados','adamant','갸라도스나이트','위협',[5,32,10,0,0,19],['얼음엄니','지진','파워휩','용의춤'],[175,194,109,72,120,120],'gyarados'],
    ['archaludon','careful','자몽열매','지구력',[32,0,5,0,25,4],['스텔스록','드래곤테일','아이언헤드','전기자석파'],[197,125,155,130,121,109],'archaludon'],
    ['mega-lopunny','adamant','이어롭나이트','유연',[1,32,1,0,0,32],['칼춤','마하펀치','인파이트','트리플악셀'],[141,140,105,66,116,157],'lopunny'],
    ['hippowdon','impish','먹다남은음식','모래날림',[32,0,32,0,2,0],['지진','방어','하품','게으름피우기'],[215,132,187,79,94,67],'hippowdon'],
    ['gholdengo','modest','생명의구슬','황금몸',[25,0,0,30,0,11],['골드러시','섀도볼','나쁜음모','HP회복'],[187,72,115,201,111,115],'gholdengo'],
  ]
  const stats = ['hp','attack','defense','spAttack','spDefense','speed']
  assert.equal(source.partySize, 6)
  assert.equal(source.confirmedMemberCount, 6)
  assert.equal(source.completeMemberCount, 6)
  assert.equal(source.members.length, 6)
  assert.equal(source.canonicalUrl, 'https://www.youtube.com/watch?v=Ix8nrNnmTUk')
  for (const [index, [key,nature,item,ability,evs,moves,actual,form]] of expected.entries()) {
    const entry = source.members[index]
    assert.equal(entry.id, `youtube-Ix8nrNnmTUk-${key}`)
    assert.equal(entry.pokemonKey, key)
    assert.equal(supportedSpeciesKeys.has(key), true)
    assert.equal(supportedSpeciesKeys.has(form), true)
    assert.deepEqual([entry.build.nature,entry.build.item,entry.build.ability],[nature,item,ability])
    assert.deepEqual(stats.map(stat => entry.build.evs[stat]),evs)
    assert.deepEqual(entry.build.moves,moves)
    assert.deepEqual(stats.map(stat => entry.partialBuild.actualStats[stat]),actual)
    assert.equal(entry.partialBuild.actualStatsForm,form)
    assert.equal(canImportCreatorSample(entry),true)
    for (const field of ['item','ability','moves','evs','nature','actualStats','actualStatsForm']) {
      const evidence = entry.provenance.fields[`partialBuild.${field}`]
      assert.equal(evidence.sourceUrl,source.canonicalUrl)
      assert.match(evidence.location, new RegExp(['nature','evs','actualStats','actualStatsForm'].includes(field) ? '02:55.*mono-t175.png' : '02:52.*mono-t172.png'))
    }
    assert.match(entry.provenance.fields['partialBuild.nature'].location,/↑.*↓/)
    if (key.startsWith('mega-')) assert.deepEqual(entry.partialBuild.preMegaAbilities,[ability])
    assert.equal(entry.rank,null)
  }
  assert.match(source.members[0].provenance.evidence,/9YGJB9NFJL.*not|9YGJB9NFJL.*미확인/)
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

test('the real roster prepares Mono video as a six-party preset without replacing source pre-Mega abilities', () => {
  const sources = groupCreatorSources(catalog)
  const abilities = key => championsData.rows.find(row => row.key === key)?.abilities_ko ?? null
  const monoVideo = sources.find(source => source.sourceId === 'Ix8nrNnmTUk')
  const prepared = prepareCreatorParty(monoVideo, abilities)
  assert.deepEqual(prepared.party.map(member => member.key), monoVideo.members.map(member => member.pokemonKey))
  assert.equal(prepared.party.find(member => member.key === 'mega-gyarados').ability, '틀깨기')
  assert.equal(prepared.party.find(member => member.key === 'mega-lopunny').ability, '배짱')
  assert.equal(prepared.party.find(member => member.key === 'archaludon').item, '자몽열매')
  assert.deepEqual(prepared.lockedMovesBySlot, monoVideo.members.map(member => member.build.moves))
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
