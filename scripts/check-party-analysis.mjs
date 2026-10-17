import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { analyzePartyMatchups, alwaysOnAbilityImmunity } from '../src/partyAnalysis.ts'

// The production chart, not a second copy of matchup data.
const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const chartLiteral = source.match(/const typeChart: Record<[^\n]+ = (\{[\s\S]*?\n\})\n\nconst normalizedTypeChart/)
assert.ok(chartLiteral, 'canonical type chart available')
const chart = vm.runInNewContext(`(${chartLiteral[1]})`)
const lowerChart = Object.fromEntries(Object.entries(chart).map(([attack, targets]) => [attack.toLowerCase(), Object.fromEntries(Object.entries(targets).map(([defend, value]) => [defend.toLowerCase(), value]))]))
const row = (key, types, ability = '') => ({ key, name: key, types, ability, sprite: '', moves: [] })
const move = (name, type, category = 'physical') => ({ name, type, category })
const run = (members, options = {}) => analyzePartyMatchups(members, lowerChart, options)

// RED: all six slots contribute without ever reading picked; registered moves only.
const six = [row('rotom', ['electric', 'ghost'], 'levitate'), row('dragon', ['dragon', 'flying']), row('steel', ['steel']), row('water', ['water']), row('grass', ['grass']), row('fire', ['fire'])]
six[0].moves = [move('10만볼트', 'electric', 'special')]
let result = run(six)
assert.equal(result.memberCount, 6)
assert.equal(result.offense.find(x => x.type === 'water').hits.length, 1)
assert.equal(result.offense.find(x => x.type === 'ground').hits.length, 0)
assert.equal(result.defense.find(x => x.type === 'ground').members.find(x => x.key === 'rotom').multiplier, 0)
assert.equal(result.defense.find(x => x.type === 'ice').members.find(x => x.key === 'dragon').multiplier, 4)
assert.equal(result.defense.find(x => x.type === 'grass').members.find(x => x.key === 'water').multiplier, 2)
assert.equal(result.defense.find(x => x.type === 'grass').members.find(x => x.key === 'fire').multiplier, 0.5)
assert.equal(alwaysOnAbilityImmunity('ground', 'levitate'), true)
assert.equal(alwaysOnAbilityImmunity('ground', '부유'), true)
assert.equal(alwaysOnAbilityImmunity('electric', 'motor-drive'), true)
assert.equal(alwaysOnAbilityImmunity('ground', ''), false)
assert.equal(run([{ ...six[0], ability: '부유' }]).defense.find(x => x.type === 'ground').members[0].multiplier, 0)
assert.equal(run([{ ...six[0], ability: 'unknown' }]).defense.find(x => x.type === 'ground').members[0].multiplier, 2)
assert.equal(run([{ ...six[0], ability: '' }]).defense.find(x => x.type === 'ground').members[0].multiplier, 2)
assert.equal(run([{ ...six[0], ability: '' }]).warnings.length, 0)
result = run([{ ...six[0], moves: [move('전기자석파', 'electric', 'status'), move('변동기', null), move('웨더볼', 'normal'), move('모르는 기술', null)] }])
assert.equal(result.offense.find(x => x.type === 'water').hits.length, 0)
assert.ok(result.warnings.some(x => x.includes('웨더볼')))
assert.ok(result.warnings.some(x => x.includes('모르는 기술')))
assert.equal(run([{ ...six[0], moves: [] }]).offense.every(x => x.hits.length === 0), true)
assert.equal(run([{ ...six[0], moves: [move('10만볼트', 'electric')] }]).offense.find(x => x.type === 'water').hits.length, 1)
assert.equal(run([{ ...six[0], moves: [move('냉동빔', 'ice')] }]).offense.find(x => x.type === 'water').hits.length, 0)
assert.equal(run([row('invalid', ['bogus'])]).memberCount, 0)
assert.ok(run([row('invalid', ['bogus'])]).warnings.length)
assert.equal(run([]).memberCount, 0)
assert.equal(result.offense.length, 18)
assert.equal(result.defense.length, 18)
assert.ok(source.includes('analyzePartyMatchups('), 'mounted app calls analysis')
const ruin = run([{ ...row('mega-floette', ['fairy']), moves: [move('파멸의빛', 'fairy', 'special')] }])
assert.equal(ruin.offense.find(x => x.type === 'dragon').count, 1, 'Light of Ruin retains ordinary Fairy coverage')
assert.equal(ruin.warnings.length, 0, 'Light of Ruin is not a conditional-type move')
for (const name of ['프리즈드라이', 'Freeze-Dry']) {
  const member = { ...row('glaceon', ['ice']), moves: [move(name, 'ice', 'special')] }
  const freezeDry = run([member])
  assert.equal(freezeDry.offense.find(x => x.type === 'dragon').count, 1, 'Freeze-Dry retains Ice coverage against Dragon')
  assert.equal(freezeDry.offense.find(x => x.type === 'water').hits[0]?.moves[0].multiplier, 2, 'Freeze-Dry hits a single Water type for 2x')
  assert.equal(freezeDry.offense.find(x => x.type === 'fire').count, 0, 'Freeze-Dry does not invent Fire coverage')
  assert.equal(freezeDry.warnings.length, 0)
  const mountedResolver = run([member], { offensiveEffectiveness: (type, target) => lowerChart[type]?.[target] ?? 1 })
  assert.equal(mountedResolver.offense.find(x => x.type === 'water').count, 1, 'mounted ability resolver preserves the move-specific Water interaction')
}
console.log('party analysis fixture assertions passed')
