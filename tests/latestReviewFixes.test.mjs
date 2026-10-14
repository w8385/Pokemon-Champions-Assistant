import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { comparisonSides } from '../src/unifiedComparisonAdapter.ts'
import { effectiveComparisonSpeed } from '../src/unifiedComparisonSpeed.ts'
import { getSpeedAbility, speedActivationAllowed } from '../src/speedAbilities.ts'
const fixture = JSON.parse(readFileSync(new URL('./fixtures/unifiedEntryFixture.json', import.meta.url)))
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
test('saved localized Libero is canonical for selection and damage, source stays Korean', () => {
 const source=structuredClone(fixture.party[0]); const [own]=comparisonSides([source], [],0,0,{},(key,raw)=>raw==='리베로'?'libero':raw)
 assert.equal(own.ability,'libero'); assert.equal(source.ability,'리베로')
})
test('opponent recorded defense and special defense modifiers remain independent of speed and effort',()=>{
 const [,opp]=comparisonSides(fixture.party,fixture.opponents,0,0,{})
 assert.equal(opp.statNatureMultipliers.defense,1.1)
 assert.equal(opp.statNatureMultipliers.spDefense,fixture.opponents[0].spDefenseNature)
 assert.equal(opp.speedNatureMultiplier,fixture.opponents[0].natureBoost?1.1:1)
})
test('activation registry covers seven prerequisites and status, not active by default',()=>{
 assert.equal(getSpeedAbility('quick-feet')?.multiplier,1.5)
 assert.equal(speedActivationAllowed('quick-feet',{weather:'none',terrain:'none',item:'',scarf:false,statused:true}),true)
 assert.equal(speedActivationAllowed('swift-swim',{weather:'rain',terrain:'none',item:'',scarf:false,statused:false}),true)
 assert.equal(speedActivationAllowed('swift-swim',{weather:'sun',terrain:'none',item:'',scarf:false,statused:false}),false)
 assert.equal(speedActivationAllowed('unburden',{weather:'none',terrain:'none',item:'',scarf:true,statused:false}),false)
})
test('unburden held scarf is rejected before comparing speed',()=>{
 assert.equal(effectiveComparisonSpeed({key:'normal',speed:100},0,1,0,true,2,'unburden').value,null)
})
test('comparison speed assumptions and nature travel with side, not role',()=>{
 assert.match(app,/speedScarfOverride/); assert.match(app,/speedAbilityActive/)
 assert.doesNotMatch(app,/const \[opponentScarf, setOpponentScarf\]/)
 assert.doesNotMatch(app,/const \[abilityActive, setAbilityActive\]/)
})
test('default single party starts with pair, not wizard; quick remains independent',()=>{
 assert.match(app,/mainSection === 'single' && activeTab === 'party'[^]*?unified-single-pair/)
 assert.match(app,/comparisonMode \? '대면비교' : '간단 대미지'/)
 assert.match(app,/mainSection === 'single' && activeTab === 'party'[^]*?QuickDamagePanel/)
 assert.match(app,/mainSection === 'single' && activeTab === 'party'[^]*?전체 내 파티 편집/)
})
