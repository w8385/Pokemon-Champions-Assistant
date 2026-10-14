import test from 'node:test'
import assert from 'node:assert/strict'
import { comparisonSides } from '../src/unifiedComparisonAdapter.ts'
const evs = { hp: 0, attack: 12, defense: 0, spAttack: 0, spDefense: 0, speed: 14 }
test('adapter uses selected saved build and registered moves without mutation', () => {
 const party = [{ key:'first', item:'', ability:'', config:{nature:'jolly',speedStage:1}, evs }, { key:'second', item:'', ability:'', config:{nature:'modest',speedStage:0}, evs }]
 const opponents = [{key:'opponent',item:'',ability:'',revealedMoves:['불꽃세례'],hpEv:2,defenseEv:3,spDefenseEv:4,speedEv:5,defenseNature:1,spDefenseNature:1,speedStage:0,natureBoost:false}]
 const [my, opp] = comparisonSides(party, opponents, 1, 0, {second:['무릎차기']})
 assert.equal(my.key,'second'); assert.equal(my.nature,'modest'); assert.equal(my.moves[0],'무릎차기')
 assert.equal(opp.key,'opponent'); assert.equal(opp.evs.speed,5); assert.equal(opp.moves[0],'불꽃세례')
 assert.notEqual(my.evs,party[1].evs); my.evs.attack=32; assert.equal(party[1].evs.attack,12)
})
test('empty selection stays empty rather than falling back to row zero', () => {
 const [my, opp] = comparisonSides([{key:'x', evs, config:{nature:'hardy'}}], [{key:'y'}], 1, 1, {})
 assert.equal(my.key,''); assert.equal(opp.key,'')
})
