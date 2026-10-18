import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import { previousSeasonRankerSamples } from '../src/previousSeasonRankerSamples.ts'
import { m6TopTenSamples } from '../src/m6TopTenSamples.ts'
import { confirmedCreatorEfforts } from '../src/creatorConfirmedEfforts.ts'
import { championsData } from '../src/effectiveRoster.ts'

// Execute the actual caller and stat helper; 999 is a callback sentinel, not a battle stat.
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const overview = readFileSync(new URL('../src/PokemonCardOverview.tsx', import.meta.url), 'utf8')
const start = app.indexOf('  const creatorCard = (entry: CreatorSample) => {')
const end = app.indexOf('    // The Mega ability', start)
assert.ok(start >= 0 && end > start)
const helperStart = overview.indexOf('export function createReadonlyCardStats(')
const helperEnd = overview.indexOf('/** Shared registered slot', helperStart)
const appTree = ts.createSourceFile('App.tsx', app, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const formHelpers = appTree.statements.filter(node => ts.isFunctionDeclaration(node) && ['megaRawBaseKey','megaBaseKey'].includes(node.name?.text)).map(node => node.getText(appTree)).join('\n')
const code = formHelpers + '\n' + overview.slice(helperStart, helperEnd).replace('export function', 'function') +
  app.slice(start, end) + '\nreturn { stats, statsLabel, member, sourceStatsShown }; }; globalThis.creatorCard = creatorCard;'
const keys = ['hp','attack','defense','spAttack','spDefense','speed']
function render(entry, base = false) {
  const context = { rows: championsData.rows, indexByKey: new Map(championsData.rows.map(r => [r.key,r])),
    creatorMegaSelection: base ? {[entry.id]:false} : {},
    EFFORT_STAT_OPTIONS: keys.map(key => ({key,label:key})), lt: value => value,
    statThemeClass: key => key, partyStatValue: () => 999,
    confirmedCreatorEfforts,
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

test('a complete or fully evidenced partial build computes another form; sparse source unknowns remain null', () => {
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
  for (const key of ['mega-lucario-z','mega-charizard-y']) {
    const entry = m6TopTenSamples.find(e => e.rank.includes('최종4위') && e.pokemonKey === key)
    const pre = render(entry, true)
    assert.equal(pre.sourceStatsShown, true)
    assert.deepEqual(pre.stats.map(s => s.value), keys.map(k => entry.partialBuild.actualStats[k]))
    const mega = render(entry)
    assert.equal(mega.sourceStatsShown, false)
    assert.ok(mega.member)
    assert.deepEqual(mega.member.evs, entry.partialBuild.evsKnown)
    assert.ok(mega.stats.every(s => s.value === 999))
  }
})
