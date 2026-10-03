import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const card = readFileSync(new URL('../src/PokemonCardOverview.tsx', import.meta.url), 'utf8')

test('builder reuses shared six-tile grid with editable sample styling', () => {
  assert.match(app, /<PokemonStatGrid\s+stats=\{EFFORT_STAT_OPTIONS\.map\(/)
  assert.match(app, /className="sample-stat-preview-list"/)
  assert.match(app, /onTune=\{\(\) => setSampleTuningModalOpen\(true\)\}/)
  assert.match(card, /sample-stat-preview-row/)
  assert.match(card, /sample-stat-topline/)
  assert.match(card, /sample-stat-ev/)
})

test('library and rankers share one grouped filtered visible source list and empty state', () => {
  assert.ok(/const visibleSources = filterCreatorSources\(groupCreatorSources\(catalog\)/.test(app))
  assert.ok(/visibleSources\.map\(\(source\)/.test(app))
  assert.ok(/!visibleSources\.length/.test(app))
  assert.equal((app.match(/filterCreatorSources\(groupCreatorSources\(catalog\)/g) ?? []).length, 1)
})

test('only builder, speed and damage render save and apply actions', () => {
  assert.ok(/\{\['builder', 'speed', 'damage'\]\.includes\(sampleWorkbenchTab\) \? <section className="panel wide">\s*<div className="sample-builder-action-card">/.test(app))
})

test('home sample builder card explicitly selects builder tab', () => {
  assert.ok(/onClick=\{\(\) => \{ setMainSection\('sample'\); setSampleWorkbenchTab\('builder'\) \}\}>\s*<div className="home-route-card-copy">\s*<span className="home-route-eyebrow">\{lt\('샘플 조정'\)\}/.test(app))
})

test('English and Japanese translate link format and unrecorded actual stats', () => {
  for (const section of [app.split('  en: {')[1]?.split('  ja: {')[0], app.split('  ja: {')[1]?.split('\n  },')[0]]) {
    assert.ok(section?.includes("'링크 형식':"))
    assert.ok(section?.includes("'실수치 미기록':"))
  }
})

test('details omit repeated card facts while retaining rank, evidence and import gate', () => {
  const details = app.split('<details key={entry.id} className="creator-library-member">')[1]?.split('</details>')[0]
  assert.ok(details)
  assert.ok(!details.includes('creator-library-build'))
  assert.ok(details.includes('entry.rank'))
  assert.ok(details.includes('구성 근거 이미지'))
  assert.ok(details.includes('canImportCreatorSample(entry)'))
})
