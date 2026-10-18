import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import { previousSeasonRankerSamples } from '../src/previousSeasonRankerSamples.ts'
import { championsData } from '../src/effectiveRoster.ts'

// Execute the actual caller and stat helper; 999 is a callback sentinel, not a battle stat.
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const overview = readFileSync(new URL('../src/PokemonCardOverview.tsx', import.meta.url), 'utf8')
const start = app.indexOf('  const creatorCard = (entry: CreatorSample) => {')
const end = app.indexOf('    // The Mega ability', start)
assert.ok(start >= 0 && end > start)
const helperStart = overview.indexOf('export function createReadonlyCardStats(')
const helperEnd = overview.indexOf('/** Shared registered slot', helperStart)
const code = overview.slice(helperStart, helperEnd).replace('export function', 'function') +
  app.slice(start, end) + '\nreturn { stats, statsLabel, member, sourceStatsShown }; }; globalThis.creatorCard = creatorCard;'
const keys = ['hp','attack','defense','spAttack','spDefense','speed']
function render(entry, base = false) {
  const context = { indexByKey: new Map(championsData.rows.map(r => [r.key,r])),
    creatorMegaSelection: base ? {[entry.id]:false} : {},
    megaBaseKey: key => key.slice('mega-'.length).replace(/-z$/, ''),
    EFFORT_STAT_OPTIONS: keys.map(key => ({key,label:key})), lt: value => value,
    statThemeClass: key => key, partyStatValue: () => 999,
    displayName: row => row.key, siteLanguage: 'ko' }
  vm.runInNewContext(ts.transpileModule(code, {compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText, context)
  return JSON.parse(JSON.stringify(context.creatorCard(entry)))
}

test('complete source cards retain recorded stats alongside the confirmed build and known-effort metadata', () => {
  const entries = previousSeasonRankerSamples.filter(e => e.build)
  assert.equal(entries.length, 7)
  for (const entry of entries) {
    const view = render(entry)
    assert.deepEqual(view.stats.map(s => s.value), keys.map(k => entry.partialBuild.actualStats[k]), entry.id)
    assert.equal(view.sourceStatsShown, true)
    assert.ok(view.member, entry.id)
  }
})

test('only a complete build computes another form; sparse source unknowns remain null', () => {
  const dragonite = previousSeasonRankerSamples.find(e => e.pokemonKey === 'mega-dragonite')
  const base = render(dragonite, true)
  assert.equal(base.sourceStatsShown, false)
  assert.ok(base.member)
  assert.ok(base.stats.every(s => s.value === 999))
  const lucario = previousSeasonRankerSamples[0]
  const partial = render(lucario)
  assert.equal(partial.member, null)
  assert.equal(partial.stats.find(s => s.key === 'attack').value, null)
  assert.equal(partial.stats.find(s => s.key === 'spAttack').value, 237)
})
