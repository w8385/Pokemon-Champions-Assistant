import test from 'node:test'
import assert from 'node:assert/strict'
import { parseLibraryContext, libraryListHref, libraryDetailHref, writeLibraryContext } from '../src/libraryViewRoute.ts'
import { catalog, filterCreatorSources, groupCreatorSources, individualCreatorSources, filterCreatorSamples } from '../src/creatorSampleLibrary.ts'

test('library view URL round trips region, format, query and kind without touching Dex params', () => {
  const context = { language: 'ja', format: 'singles', query: 'ピカ', kind: 'pokemon' }
  const href = libraryListHref(context)
  assert.deepEqual(parseLibraryContext(new URL(href.slice(1), 'https://local.test').searchParams), context)
  assert.equal(libraryDetailHref('individual:youtube:abc', context), `#/sample-library/${encodeURIComponent('individual:youtube:abc')}?libRegion=ja&libFormat=singles&libQuery=%E3%83%94%E3%82%AB&libKind=pokemon`)
  const params = new URLSearchParams('dexTab=move&q=flame')
  writeLibraryContext(params, context)
  assert.equal(params.get('q'), 'flame')
  assert.equal(params.get('dexTab'), 'move')
})
test('invalid and absent library context normalize to safe all-region party list', () => {
  assert.deepEqual(parseLibraryContext(new URLSearchParams('libRegion=evil&libFormat=doublesx&libKind=unknown')), { language: 'all', format: 'all', query: '', kind: 'party' })
  assert.equal(libraryListHref(parseLibraryContext(new URLSearchParams())), '#/sample-builder?sampleTab=library')
  assert.deepEqual(parseLibraryContext(new URLSearchParams(), 'individual:abc'), { language: 'all', format: 'all', query: '', kind: 'pokemon' })
})
test('all region is a union of source and individual records, and filtering preserves source identity', () => {
  for (const sources of [groupCreatorSources(catalog), individualCreatorSources(catalog)]) {
    const all = filterCreatorSources(sources, { language: 'all', format: 'all', query: '', contentKind: 'all' })
    assert.deepEqual(new Set(all.map(s => s.id)), new Set(sources.map(s => s.id)))
    assert.equal(all.length, new Set(all.map(s => s.id)).size)
    for (const language of ['ko', 'ja']) assert.deepEqual(filterCreatorSources(sources, { language, format: 'singles', query: '', contentKind: 'all' }).map(s => s.id), all.filter(s => s.language === language && s.format === 'singles').map(s => s.id))
  }
  assert.equal(filterCreatorSamples(catalog, { language: 'all', format: 'all', query: '' }).length, catalog.length)
})
