import test from 'node:test'
import assert from 'node:assert/strict'
import { catalog, filterCreatorSamples, filterCreatorSources, groupCreatorSources, canImportCreatorSample, createLinkDraft, sanitizeLinkDrafts, isVerifiedRankerSample } from '../src/creatorSampleLibrary.ts'

// Synthetic fixtures exercise the schema; they are never shown as real creator/rank entries.
const complete = {
  id: 'fixture', format: 'singles', language: 'ko', title: '가상 샘플', creator: 'fixture',
  provenance: { sourceUrl: 'https://example.org/video', verifiedAt: '2026-01-01', evidence: 'fixture' },
  status: 'verified', pokemonKey: 'garchomp', rank: null,
  build: { nature: 'jolly', item: 'test item', ability: 'test ability', evs: { hp: 0, attack: 32, defense: 0, spAttack: 0, spDefense: 2, speed: 32 }, moves: ['a', 'b', 'c', 'd'] },
}

test('catalog keeps the three original uploads and separately identifies two blog Pokémon', () => {
  assert.deepEqual(catalog.filter(e => e.platform === 'youtube').map(e => e.creator).sort(), ['눈파티', '모노', '케미쨩'])
  assert.deepEqual(catalog.filter(e => e.platform === 'youtube').map(e => e.provenance.sourceId).sort(), ['HQDEZg-Zgv8', 'Ix8nrNnmTUk', 'ihwnR8FJWtM'])
  const blog = catalog.filter(e => e.platform === 'blog')
  assert.deepEqual(blog.map(e => e.pokemonKey).sort(), ['mega-scizor', 'rotom-wash'])
  assert.ok(blog.every(e => e.creator === '모노' && e.provenance.sourceId === '224319761655' && e.provenance.sourceUrl === 'https://m.blog.naver.com/2tjqja/224319761655'))
  assert.ok(blog.every(e => e.provenance.sourceUrl !== catalog.find(v => v.pokemonKey === 'mega-gyarados').provenance.sourceUrl))
  assert.equal(new Set(catalog.map(e => e.id)).size, catalog.length)
  for (const entry of catalog) {
    assert.equal(entry.status, 'partial')
    assert.equal(entry.rank, null)
    assert.equal(entry.build, null)
    assert.equal(entry.provenance.canonicalUrl, entry.provenance.sourceUrl)
    assert.equal(entry.provenance.publishedAt, null)
    assert.equal(entry.provenance.collectedAt, '2026-10-03')
    assert.equal(canImportCreatorSample(entry), false)
  }
})

test('document taxonomy groups the blog party once with two evidenced members, without asserting six complete builds', () => {
  const sources = groupCreatorSources(catalog)
  const party = sources.find(source => source.sourceId === '224319761655')
  assert.equal(sources.length, 4)
  assert.equal(party.contentKind, 'party')
  assert.equal(party.platform, 'blog')
  assert.equal(party.canonicalUrl, 'https://m.blog.naver.com/2tjqja/224319761655')
  assert.deepEqual(party.members.map(member => member.pokemonKey).sort(), ['mega-scizor', 'rotom-wash'])
  assert.equal(party.confirmedMemberCount, 2)
  assert.equal(party.completeMemberCount, 0)
  assert.equal(party.partySize, null)
  assert.deepEqual(party.members.map(member => member.partialBuild?.nature), ['timid', 'adamant'])
  assert.equal(sources.find(source => source.sourceId === 'ihwnR8FJWtM').contentKind, 'pokemon')
  assert.deepEqual(sources.filter(source => source.platform === 'youtube' && source.sourceId !== 'ihwnR8FJWtM').map(source => source.contentKind), ['unknown', 'unknown'])
})

test('content-kind filter matches member search yet retains all members in one party document', () => {
  const matches = filterCreatorSources(groupCreatorSources(catalog), { language: 'ko', format: 'singles', query: 'rotom-wash', contentKind: 'party' })
  assert.equal(matches.length, 1)
  assert.deepEqual(matches[0].members.map(member => member.pokemonKey).sort(), ['mega-scizor', 'rotom-wash'])
  assert.deepEqual(filterCreatorSources(groupCreatorSources(catalog), { language: 'ko', format: 'all', query: '', contentKind: 'pokemon' }).map(source => source.sourceId), ['ihwnR8FJWtM'])
  assert.deepEqual(filterCreatorSources(groupCreatorSources(catalog), { language: 'ko', format: 'all', query: '', contentKind: 'unknown' }).map(source => source.sourceId), ['Ix8nrNnmTUk', 'HQDEZg-Zgv8'])
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

test('모노 season-two singles blog has distinct image-backed Rotom-W and Scizor partial builds', () => {
  const [rotom, scizor] = ['rotom-wash', 'mega-scizor'].map(key => catalog.find(e => e.pokemonKey === key))
  assert.equal(rotom.format, 'singles')
  assert.equal(scizor.format, 'singles')
  assert.deepEqual(rotom.partialBuild, {
    nature: 'timid', item: '구애스카프', ability: '부유',
    evs: { hp: 6, attack: 0, defense: 0, spAttack: 32, spDefense: 0, speed: 28 },
    moves: ['하이드로펌프', '10만볼트', '볼트체인지', '트릭'],
    actualStats: { hp: 131, attack: 76, defense: 127, spAttack: 157, spDefense: 127, speed: 147 }, actualStatsForm: 'rotom-wash',
  })
  assert.deepEqual(scizor.partialBuild, {
    nature: 'adamant', item: '핫삼나이트', ability: '테크니션',
    evs: { hp: 32, attack: 24, defense: 10, spAttack: 0, spDefense: 0, speed: 0 },
    moves: ['칼춤', '불릿펀치', '탁쳐서떨구기', '인파이트'],
    actualStats: { hp: 177, attack: 191, defense: 130, spAttack: 67, spDefense: 100, speed: 85 }, actualStatsForm: 'scizor',
  })
  for (const entry of [rotom, scizor]) {
    assert.ok(entry.partialBuild.nature)
    for (const field of ['item', 'ability', 'evs', 'moves']) {
      const evidence = entry.provenance.fields[`partialBuild.${field}`]
      assert.match(evidence.sourceUrl, /^https:\/\/mblogthumb-phinf\.pstatic\.net\/.*%ED%8C%8C%ED%8B%B0_/)
      assert.match(evidence.sourceUrl, new RegExp(field === 'evs' ? '%ED%8C%8C%ED%8B%B0_2' : '%ED%8C%8C%ED%8B%B0_1'))
      assert.match(evidence.location, new RegExp(entry.pokemonKey === 'rotom-wash' ? '로토무' : '핫삼'))
      assert.equal(evidence.checkedAt, '2026-10-03')
    }
    assert.equal(entry.provenance.fields.format.sourceUrl, entry.provenance.sourceUrl)
    assert.equal(canImportCreatorSample(entry), false) // Evidence-backed partial display is not automatically an import approval.
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
