import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { appTranslate } from './appTranslations.mjs'
import { routeGroups } from '../src/app/navigation.ts'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

test('builder reuses the inline compact six-stat editor instead of a tuning popup', () => {
  const builder = app.slice(app.indexOf('<section id="sample-builder-section"'), app.indexOf('<section id="sample-speed-section"'))
  assert.match(builder, /<CompactStatEditor identity=\{`sample-builder-\$\{sampleForge\.key\}`\}/)
  assert.match(builder, /stats=\{EFFORT_STAT_OPTIONS\.map\(stat =>/)
  assert.match(builder, /onEffort=\{\(key, value\) => setSampleForge/)
  assert.match(builder, /onNature=\{nature => setSampleForge/)
  assert.match(builder, /magicScale=\{effortMagicProjection\(sampleRow, sampleForge\.evs, sampleForge\.config\.nature\)\.scale\}/)
  assert.doesNotMatch(builder, /<PokemonStatGrid|sampleTuningOpener|<EffortTuningModal/)
})

test('library uses one filtered visible list and a separate source detail', () => {
  assert.ok(/const visibleSources = filterCreatorSources\(/.test(app))
  assert.ok(/visibleSources\.map\(\(source\)/.test(app))
  assert.ok(/!visibleSources\.length/.test(app))
  assert.ok(/librarySourceId/.test(app))
})

test('research lab keeps save and apply actions while library does not render them', () => {
  const builder = app.slice(app.indexOf('<section id="sample-builder-section"'), app.indexOf('<section id="sample-speed-section"'))
  assert.match(builder, /<div className="sample-builder-action-card">/)
  assert.ok(builder.indexOf('id="sample-moves-card"') < builder.indexOf('className="sample-builder-action-card"'))
  assert.equal((app.match(/className="sample-builder-action-card"/g) ?? []).length, 1)
  assert.ok(app.indexOf('id="sample-saved-card"') > app.indexOf('id="sample-damage-section"'))
})

test('home sample builder card explicitly selects builder tab', () => {
  assert.equal(routeGroups.find(group => group.section === 'sample').links.find(link => link.tab === 'builder').href, '#/sample-builder?sampleTab=builder')
  assert.match(app, /group\.links\.map\(link => <a key=\{link\.href\} className="home-route-card calm" href=\{link\.href\}>/)
})

test('English and Japanese translate link format and unrecorded actual stats', () => {
  const translate = appTranslate()
  for (const language of ['en', 'ja']) {
    for (const text of ['링크 형식', '실수치 미기록']) {
      assert.notEqual(translate(language, text), text, `${language}: ${text}`)
    }
  }
})

test('source provenance stays visible beside each detail card with import gate', () => {
  const details = app.split('className="creator-library-member-context"')[1]?.split('</div>')[0]
  assert.ok(details)
  assert.ok(details.includes('entry.provenance'))
  assert.ok(details.includes('creator-library-evidence-links'))
  assert.ok(details.includes('href={evidence.sourceUrl}'))
  assert.ok(details.includes('evidence.location'))
  assert.ok(details.includes('canImportCreatorSample(entry)'))
  assert.ok(!app.includes('<details className="creator-library-provenance">'))
})
