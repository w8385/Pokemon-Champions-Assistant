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
 assert.match(app,/mainSection === 'single'[^]*?unified-single-pair/)
 assert.match(app,/comparisonMode \? '대면비교' : '간단 대미지'/)
 assert.match(app,/mainSection === 'single'[^]*?QuickDamagePanel/)
 assert.match(app,/href="#\/party"[^]*?내 파티 관리/)
})
test('party route owns the original editor and real callbacks, not a copied comparison panel',()=>{
 const editor=app.slice(app.indexOf('className="party-columns party-manage-columns"'),app.indexOf('className="entry-grid manage-entry-grid"')+100)
 assert.match(app,/mainSection === 'party' \|\| \(mainSection === 'double' && activeTab === 'party'\)/)
 assert.match(editor,/saveNewPartyPreset/)
 assert.match(editor,/confirmAndApplyPartyPreset/)
 assert.match(app,/mainSection === 'party'[^]*?RegisteredMoveSlot[^]*?setConfirmedMoveSlot/)
 assert.match(app,/mainSection === 'party'[^]*?partyStatValue/)
 assert.match(app,/viewState\.mainSection === 'party' \? '\/party'/)
 assert.match(app,/routePath === '\/party'/)
 assert.doesNotMatch(app.slice(app.indexOf('mainSection === \'home\' ? ('),app.indexOf('mainSection !== \'home\' && mainSection')), /setMainSection\('double'\)/)
})
test('empty Singles comparison accepts same-card species and explicit save',()=>{
 const start=app.indexOf('className="unified-single-pair"')
 const end=app.indexOf("{(mainSection === 'party' ||",start)
 const pair=app.slice(start,end)
 assert.match(pair,/빈 슬롯: 아래 카드에서 종·폼을 선택하세요/)
 assert.match(pair,/onSaveEntry=/)
 assert.doesNotMatch(pair,/href="#\/single\?tab=pick"|href="#\/party"/)
})
