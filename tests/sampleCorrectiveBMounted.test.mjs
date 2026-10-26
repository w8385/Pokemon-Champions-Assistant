import test from 'node:test'
import assert from 'node:assert/strict'
import React, { act } from 'react'
import { Window } from 'happy-dom'
import { createServer } from 'vite'
const browser = new Window({url:'http://localhost/#/sample-builder?sampleTab=damage'})
Object.assign(globalThis,{window:browser,document:browser.document,localStorage:browser.localStorage,HTMLElement:browser.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true})
const {createRoot} = await import('react-dom/client')
const server = await createServer({server:{middlewareMode:true,hmr:false},appType:'custom',optimizeDeps:{noDiscovery:true,include:[]},logLevel:'silent'})
const App = (await server.ssrLoadModule('/src/App.tsx')).default
const {loadFormLearnset} = await server.ssrLoadModule('/src/sharedLearnsets.ts')
const {loadMoveMetaByName} = await server.ssrLoadModule('/src/dex/data.ts')
test.after(async()=>{await server.close();await browser.happyDOM.abort()})
const store='pokemon-champions-assistant-demo:v1'
const member={key:'grimmsnarl',item:'',ability:'',picked:false,evs:{hp:0,attack:0,defense:0,spAttack:0,spDefense:0,speed:0},config:{nature:'hardy',scarf:false,speedStage:0},tuning:{magicNumber:0,maxValue:0}}
const target={key:'corviknight',item:'',ability:'',opponentMoves:['바디프레스','','',''],moveName:'legacy-forward',opponentMoveName:'',attackEv:0,defenseEv:0,spAttackEv:0,spDefenseEv:0,hpEv:0,speedEv:0,attackNature:1,defenseNature:1,spAttackNature:1,spDefenseNature:1,reverseAttackStage:0,reverseDefenseStage:0,reverseBurned:false,reverseReflect:false,reverseLightScreen:false,reverseAuroraVeil:false,reverseDefenderFullHp:true}
async function mounted(){
 const host=document.createElement('div');document.body.append(host)
 const root=createRoot(host)
 await act(async()=>{root.render(React.createElement(App))})
 await act(async()=>{await Promise.all([loadFormLearnset('grimmsnarl'),loadFormLearnset('corviknight'),loadMoveMetaByName()]);await new Promise(resolve=>setTimeout(resolve,70))})
 return {host,root}
}
async function change(el,value){assert.ok(el,'missing input');await act(async()=>{if(el.type==='checkbox'){el.click()}else{const proto=el.tagName==='SELECT'?browser.HTMLSelectElement.prototype:browser.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,String(value));el.dispatchEvent(new browser.Event('input',{bubbles:true}));el.dispatchEvent(new browser.Event('change',{bubbles:true}))}})}
function range(host,direction,move){const section=[...host.querySelectorAll('.sample-damage-direction-result')].find(e=>e.getAttribute('aria-label')===direction);assert.ok(section,`${direction} section missing ${window.location.href} ${host.textContent.slice(0,800)}`);const row=direction==='상대 → 내 포켓몬' ? [...section.querySelectorAll('.sample-opponent-move-cell')].find(e=>e.querySelector('input')?.value===move)?.querySelector('.sample-damage-move-result') : [...section.querySelectorAll('.sample-damage-move-result')].find(e=>e.textContent.includes(move));assert.ok(row,`${move} missing`);const text=row.textContent;const number=text.match(/(\d+) ~ (\d+)/);assert.ok(number,`no numerical damage: ${text.slice(0,220)}`);return Number(number[1])}
test('mounted App projects both direction owner ranks and persisted target conditions',async()=>{
 localStorage.clear();localStorage.setItem(store,JSON.stringify({mainSection:'sample',sampleWorkbenchTab:'damage',sampleForge:member,sampleLockedMoves:['바디프레스','속임수','',''],sampleDamageTargets:[target]}))
 let view=await mounted()
 try{
  const forward=()=>range(view.host,'내 포켓몬 → 상대','바디프레스')
  const reverse=()=>range(view.host,'상대 → 내 포켓몬','바디프레스')
  const baseline=[forward(),reverse()]
  const labels=()=>[...view.host.querySelectorAll('.sample-conditions-owner-grid label')]
  const input=(match)=>{const label=labels().find(e=>e.textContent.includes(match));assert.ok(label,match);return label.querySelector('input, select')}
  await change(input('내 포켓몬 방어 랭크'),2)
  assert.ok(forward()>baseline[0]);assert.ok(reverse()<baseline[1])
  await change(input('상대 포켓몬 방어 랭크'),2)
  assert.equal(reverse(),baseline[1])
  await change(input('내 포켓몬 방어 실수치'),220)
  assert.notEqual(forward(),baseline[0])
  assert.equal(JSON.parse(localStorage.getItem(store)).sampleDamageTargets[0].moveName,'legacy-forward')
  const snapshot=JSON.parse(localStorage.getItem(store)).sampleDamageTargets[0].sampleConditions
  assert.equal(snapshot.own.defenseStage,2);assert.equal(snapshot.opponent.defenseStage,2)
 }finally{await act(async()=>view.root.unmount());view.host.remove()}
 view=await mounted()
 try{assert.equal(JSON.parse(localStorage.getItem(store)).sampleDamageTargets[0].sampleConditions.own.actual.defense,220);assert.ok(range(view.host,'내 포켓몬 → 상대','바디프레스')>0)}finally{await act(async()=>view.root.unmount());view.host.remove();localStorage.clear()}
})
