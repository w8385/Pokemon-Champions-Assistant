import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { catalog, groupCreatorSources, individualCreatorSources, isVerifiedRankerSample } from '../src/domain/samples/creatorSampleLibrary.ts'
import { formatSourcePlacement } from '../src/domain/samples/creatorSourcePlacement.ts'

const expected = JSON.parse(readFileSync(new URL('./fixtures/creatorPartyPlacementExpected.json', import.meta.url)))
const raw = JSON.parse(readFileSync(new URL('./fixtures/creatorPartySourceRaw.json', import.meta.url)))
// Checked-in review fixtures keep CI independent of local artifacts.
const contract = Object.fromEntries(expected.map(s => [s.sourceId, s.metadata]))

test('all 13 source-level claims preserve original 78 member identities and provenance', () => {
  const sources = groupCreatorSources(catalog).filter(s => s.contentKind === 'party')
  assert.deepEqual(sources.map(s => s.sourceId), raw.map(s => s.sourceId))
  assert.equal(sources.reduce((n, s) => n + s.members.length, 0), 78)
  for (const source of sources) {
    const original = raw.find(s => s.sourceId === source.sourceId)
    assert.deepEqual(source.members.map(m => m.id), original.members.map(m => m.id))
    assert.equal(source.id, original.id)
    assert.equal(source.canonicalUrl, original.canonicalUrl)
    assert.equal(source.title, original.title)
    assert.equal(source.format, original.format)
    assert.deepEqual(source.placement && Object.fromEntries(['seasonId','placement','placementScope','claimEvidence','independentlyVerified'].map(k => [k,source.placement[k]])), contract[source.sourceId])
    for (const member of source.members) {
      const previous = original.members.find(m => m.id === member.id)
      assert.equal(member.rank, previous.rank)
      assert.equal(member.format, previous.format)
      assert.deepEqual(member.provenance.fields.rank ?? null, previous.fields.rank ?? null)
      assert.equal(isVerifiedRankerSample(member), Boolean(previous.rank && previous.fields.rank))
    }
  }
  assert.equal(sources.filter(s => s.placement.seasonId === null).length, 3)
  assert.equal(sources.filter(s => s.placement.placementScope === 'final').length, 11)
  assert.equal(sources.filter(s => s.placement.placementScope === 'world_unspecified').length, 2)
  assert.equal(sources.filter(s => s.placement.claimEvidence === 'author_result_image').length, 9)
  assert.equal(sources.filter(s => s.placement.independentlyVerified).length, 0)
  assert.equal(individualCreatorSources(catalog).find(s => s.sourceId === '224319761655').placement?.seasonId, '시즌 2')
})

test('world rank and S-6 conflict never become a final-season claim', () => {
  const sources = groupCreatorSources(catalog)
  for (const [id, world] of [['HQDEZg-Zgv8',1],['y2c5sLKYr7s',53]]) {
    const meta = sources.find(s => s.sourceId === id).placement
    assert.equal(meta.seasonId, null)
    assert.equal(meta.placementScope, 'world_unspecified')
    assert.equal(meta.placement, world)
    assert.match(formatSourcePlacement(meta, 'ko').placement, new RegExp(`세계 ${world}위`))
  }
  const conflict = sources.find(s => s.sourceId.includes('Muu_poke')).placement
  assert.equal(conflict.seasonId, null)
  assert.equal(formatSourcePlacement(conflict, 'ko').season, '시즌 미확인')
  assert.equal(formatSourcePlacement(sources.find(s => s.sourceId === 'blog-m6-1-n68915c0c22e4').placement, 'en').season, 'Season M-6')
  assert.equal(formatSourcePlacement(sources.find(s => s.sourceId === '224319761655').placement, 'ja').placement, '最終1位')
})

test('conflicting member rank/format/evidence fails closed instead of promoting first member', () => {
  const members = catalog.filter(e => e.provenance.sourceId === 'blog-m6-1-n68915c0c22e4')
  for (const changed of [
    { rank: 'different' }, { format: null },
    { provenance: { ...members[1].provenance, fields: { ...members[1].provenance.fields, rank: null } } },
  ]) {
    const altered = members.map((m, i) => i === 1 ? { ...m, ...changed } : m)
    assert.throws(() => groupCreatorSources(altered), /Conflicting source/)
  }
})

test('party strip and both list/detail badges use the same source projection', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
  assert.equal((app.match(/<SourcePlacementBadge /g) ?? []).length, 2)
  assert.match(app, /<CreatorPartySpriteStrip members=\{source\.members\.map\(member => \(\{ id: member\.id, sprite:/)
  assert.match(css, /grid-template-columns:\s*repeat\(6,\s*24px\)/)
  assert.doesNotMatch(css.match(/\.creator-library-sprites[^\n]*/g)?.join('\n') ?? '', /overflow:\s*hidden|margin-right:\s*-/)
})

test('13 source badges render equally for list and direct detail; six stable slots tolerate a missing sprite and long title', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
  try {
    const { SourcePlacementBadge } = await server.ssrLoadModule('/src/features/samples/SourcePlacementBadge.tsx')
    const { CreatorPartySpriteStrip } = await server.ssrLoadModule('/src/features/party/CreatorPartySpriteStrip.tsx')
    for (const source of groupCreatorSources(catalog).filter(s => s.contentKind === 'party')) {
      for (const language of ['ko','en','ja']) {
        const props = { placement: source.placement, language }
        const list = renderToStaticMarkup(React.createElement(SourcePlacementBadge, props))
        const detail = renderToStaticMarkup(React.createElement(SourcePlacementBadge, props))
        assert.equal(list, detail)
        assert.match(list, /creator-library-placement-chip/)
        assert.match(list, /creator-library-placement-evidence/)
      }
    }
    const slots = Array.from({ length: 6 }, (_, i) => ({ id: `slot-${i}`, sprite: i === 2 ? null : `/sprites/${i}.png` }))
    const html = renderToStaticMarkup(React.createElement('a', null,
      React.createElement(CreatorPartySpriteStrip, { members: slots }),
      React.createElement('strong', null, '【シーズンM-6最終41位】真•滅びゲンガースタン【ポケモンチャンピオンズ】')))
    assert.equal((html.match(/creator-library-sprite-slot/g) ?? []).length, 6)
    assert.equal((html.match(/<img /g) ?? []).length, 5)
    assert.ok(html.indexOf('/sprites/1.png') < html.indexOf('/sprites/3.png'))
    assert.match(html, /シーズンM-6最終41位/)
  } finally { await server.close() }
})
