import test from 'node:test'
import assert from 'node:assert/strict'
import { catalog, filterCreatorSamples, canImportCreatorSample, createLinkDraft, sanitizeLinkDrafts } from '../src/creatorSampleLibrary.ts'

// Synthetic fixtures exercise the schema; they are never shown as real creator/rank entries.
const complete = {
  id: 'fixture', format: 'singles', language: 'ko', title: '가상 샘플', creator: 'fixture',
  provenance: { sourceUrl: 'https://example.org/video', verifiedAt: '2026-01-01', evidence: 'fixture' },
  status: 'verified', pokemonKey: 'garchomp', rank: null,
  build: { nature: 'jolly', item: 'test item', ability: 'test ability', evs: { hp: 0, attack: 32, defense: 0, spAttack: 0, spDefense: 2, speed: 32 }, moves: ['a', 'b', 'c', 'd'] },
}

test('catalog contains only original uploads from the three approved KR creators, without invented builds or rank', () => {
  assert.deepEqual(catalog.map(e => e.creator).sort(), ['눈파티', '모노', '케미쨩'])
  assert.deepEqual(catalog.map(e => e.provenance.sourceId).sort(), ['HQDEZg-Zgv8', 'Ix8nrNnmTUk', 'ihwnR8FJWtM'])
  for (const entry of catalog) {
    assert.equal(entry.platform, 'youtube')
    assert.equal(entry.status, 'partial')
    assert.equal(entry.rank, null)
    assert.equal(entry.build, null)
    assert.equal(entry.provenance.canonicalUrl, `https://www.youtube.com/watch?v=${entry.provenance.sourceId}`)
    assert.equal(entry.provenance.publishedAt, null)
    assert.equal(entry.provenance.collectedAt, '2026-10-03')
    assert.equal(canImportCreatorSample(entry), false)
  }
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
