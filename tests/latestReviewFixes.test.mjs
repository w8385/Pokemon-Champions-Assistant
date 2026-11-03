import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { comparisonSides } from '../src/domain/party/unifiedComparisonAdapter.ts'
import { effectiveComparisonSpeed } from '../src/domain/battle/unifiedComparisonSpeed.ts'
import { getSpeedAbility, speedActivationAllowed } from '../src/domain/battle/speed/speedAbilities.ts'
const fixture = JSON.parse(readFileSync(new URL('./fixtures/unifiedEntryFixture.json', import.meta.url)))
const quickModel = readFileSync(new URL('../src/features/damage/quickModel.ts', import.meta.url), 'utf8')
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const route = readFileSync(new URL('../src/app/routeState.ts', import.meta.url), 'utf8')
const partyView = readFileSync(new URL('../src/features/party/PartyView.tsx', import.meta.url), 'utf8'), member = readFileSync(new URL('../src/features/party/PartyMemberCard.tsx', import.meta.url), 'utf8'), board = readFileSync(new URL('../src/features/party/PartyPresetBoard.tsx', import.meta.url), 'utf8'), editorOwner = readFileSync(new URL('../src/features/party/usePartyEditor.ts', import.meta.url), 'utf8')
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
 assert.match(quickModel,/speedScarfOverride/); assert.match(quickModel,/speedAbilityActive/)
 assert.doesNotMatch(app,/const \[opponentScarf, setOpponentScarf\]/)
 assert.doesNotMatch(app,/const \[abilityActive, setAbilityActive\]/)
})
test('default single party starts with pair, not wizard; quick remains independent',()=>{
 assert.match(app,/mainSection === 'single'[^]*?unified-single-pair/)
 assert.match(app, /<PageHeading title=\{lt\(mainSection === 'home'[^]*?'대면'[^]*?'계산기'/)
 assert.match(app,/mainSection === 'single'[^]*?QuickDamagePanel/)
 assert.match(app,/빈 슬롯: 내 파티 관리에서 포켓몬을 등록하세요/)
 assert.match(app,/group\.links\.map\(link => <a key=\{link\.href\} className="home-route-card calm" href=\{link\.href\}>/)
})
test('party route owns the original editor and real callbacks, not a copied comparison panel',()=>{
 assert.match(app, /<PartyView\b/)
 const editor=partyView
 assert.match(app,/mainSection === 'party' \|\| \(mainSection === 'double' && activeTab === 'party'\)/)
 assert.match(editor,/createNewParty/)
 assert.match(board,/onClick=\{\(\) => applyPartyPreset\(preset.id\)\}/)
 assert.match(app,/setConfirmedMoveSlot/)
 assert.match(partyView,/selectMoveOption: editor\.selectMoveOption|selectMoveOption: \(key: string/)
 assert.match(member,/<MoveSlotsEditor/)
 assert.match(member,/partyStatValue\(row, member, stat\.key\)/)
 assert.match(route,/viewState\.mainSection === 'party' \? '\/party'/)
 assert.match(route,/routePath === '\/party'/)
 assert.doesNotMatch(app.slice(app.indexOf('mainSection === \'home\' ? ('),app.indexOf('mainSection !== \'home\' && mainSection')), /setMainSection\('double'\)/)
})
test('empty Singles comparison sends party registration to party management and retains explicit build apply',()=>{
 const start=app.indexOf('className="unified-single-pair"')
 const end=app.indexOf("{(mainSection === 'party' ||",start)
 const pair=app.slice(start,end)
 assert.match(pair,/빈 슬롯: 내 파티 관리에서 포켓몬을 등록하세요/)
 assert.match(pair,/onSaveEntry=/)
 assert.doesNotMatch(pair,/href="#\/single\?tab=pick"|href="#\/party"/)
})
