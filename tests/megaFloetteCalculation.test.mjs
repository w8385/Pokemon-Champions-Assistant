import test from 'node:test'
import assert from 'node:assert/strict'
import { actualStat } from '../src/statMechanics.ts'
import { championsData, additionalFormSpecs, supportedSpeciesKeys } from '../src/effectiveRoster.ts'
import { catalog, groupCreatorSources } from '../src/creatorSampleLibrary.ts'
import { prepareCreatorParty } from '../src/creatorPartyImport.ts'

const roster = new Map(championsData.rows.map(row => [row.key, row]))
for (const form of additionalFormSpecs) roster.set(form.key, { ...roster.get(form.key.split('-')[0]), ...form })
const source = groupCreatorSources(catalog).find(s => s.sourceId === '224319761655')
const stats = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed']
const calculate = (row, build) => stats.map((stat, i) => actualStat(row[stat], build.evs[stat], i === 0 ? 1 : build.nature === 'timid' ? stat === 'speed' ? 1.1 : stat === 'attack' ? .9 : 1 : stat === 'attack' ? 1.1 : stat === 'spAttack' ? .9 : 1, i === 0))

test('canonical Mega Floette base stats and derived level-50 speed metrics differ from Eternal Floette', () => {
  const mega = roster.get('mega-floette'), eternal = roster.get('floette-eternal-flower')
  assert.deepEqual(stats.map(stat => mega[stat]), [74,85,87,155,148,102])
  assert.deepEqual(stats.map(stat => eternal[stat]), [74,65,67,125,128,92])
  assert.deepEqual(['fast','neutral','uninvested','scarf_fast','scarf_neutral'].map(k => mega[k]), [169,154,122,253,231])
  assert.deepEqual(['fast','neutral','uninvested','scarf_fast','scarf_neutral'].map(k => eternal[k]), [158,144,112,237,216])
})

test('Mono recorded pre-Mega numbers remain unchanged while Mega numbers calculate from its own base', () => {
  const build = source.members.find(m => m.pokemonKey === 'mega-floette').partialBuild
  assert.equal(build.actualStatsForm, 'floette-eternal-flower')
  assert.deepEqual(stats.map(stat => build.actualStats[stat]), [149,76,93,173,148,158])
  assert.deepEqual(calculate(roster.get(build.actualStatsForm), build), [149,76,93,173,148,158])
  assert.deepEqual(calculate(roster.get('mega-floette'), build), [149,94,113,203,168,169])
  const starmie = source.members.find(m => m.pokemonKey === 'mega-starmie').partialBuild
  assert.deepEqual(calculate(roster.get('mega-starmie'), starmie), [137,167,125,135,125,172])
})

test('real effective roster accepts six Mono builds with canonical Mega abilities', () => {
  const result = prepareCreatorParty(source, key => roster.get(key)?.abilities_ko ?? null)
  assert.deepEqual(result.party.map(member => member.key), source.members.map(member => member.pokemonKey))
  assert.deepEqual([result.party[3].ability, result.party[5].ability], ['페어리오라','천하장사'])
  assert.equal(supportedSpeciesKeys.has('floette-eternal-flower'), true)
  assert.equal(prepareCreatorParty(source, key => key === 'mega-floette' ? ['플라워베일', '페어리오라'] : roster.get(key)?.abilities_ko ?? null), null)
})
