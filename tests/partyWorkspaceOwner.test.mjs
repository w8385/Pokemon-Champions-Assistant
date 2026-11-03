import test from 'node:test'
import assert from 'node:assert/strict'
import React, { act } from 'react'
import { Window } from 'happy-dom'
import { createServer } from 'vite'

const slot = key => ({key, ability:'', item:'', picked:false, config:{nature:'hardy',scarf:false,speedStage:0}, evs:{hp:0,attack:0,defense:0,spAttack:0,spDefense:0,speed:0}, tuning:{magicNumber:0,maxValue:0}})
const party = key => [slot(key)]
const preset = (id,key,moves=[]) => ({id,label:id,party:party(key),lockedMovesBySlot:[moves]})
let server, usePartyWorkspace, initializeWorkspace, runGuardedOcrImport, createRoot, container, root, latest, domWindow
const mount = async (initial, status = 'saved') => {
  const marks = []
  function Probe() { latest = usePartyWorkspace(initial, () => { if (status !== 'failed' && status !== 'read-failed') marks.push('saving') }); return null }
  await act(async () => { root = createRoot(container); root.render(React.createElement(Probe)) })
  return marks
}
test.before(async () => {
  domWindow = new Window({url:'http://localhost/'})
  globalThis.window = domWindow; globalThis.document = domWindow.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  ;({ createRoot } = await import('react-dom/client'))
  container = document.createElement('div'); document.body.append(container)
  server = await createServer({server:{middlewareMode:true,hmr:false},appType:'custom',optimizeDeps:{noDiscovery:true,include:[]}})
  ;({usePartyWorkspace} = await server.ssrLoadModule('/src/features/party/usePartyWorkspace.ts'))
  ;({initializeWorkspace,runGuardedOcrImport} = await server.ssrLoadModule('/src/domain/party/partyWorkspace.ts'))
})
test.after(async () => { await server?.close(); container?.remove(); await domWindow?.happyDOM?.cancelAsync?.() })
test.afterEach(async () => { if (root) await act(async () => {root.unmount()}); root = null })
test('mounted owner synchronously composes same-tick functional edits, moves and preset transitions', async () => {
  const a = preset('a','a',['A','','C','']), b = preset('b','b',['B'])
  const initial = initializeWorkspace({party:a.party,confirmedMovesByKey:{a:['A','','C','']},savedPartyPresets:[a,b],activePartyPresetId:'a'},party(''))
  const marks = await mount(initial)
  await act(async () => {
    latest.setParty(prev => prev.map(member => ({...member,item:'one'})))
    latest.setParty(prev => prev.map(member => ({...member,item:member.item+'-two'})))
    assert.equal(latest.workspaceRef.current.party[0].item,'one-two')
    latest.setConfirmedMovesByKey(prev => ({...prev,a:['N','','Z','']}))
    assert.equal(latest.workspaceRef.current.savedPartyPresets[0].lockedMovesBySlot[0][2],'Z')
    assert.equal(latest.workspaceSelectionRevision.current,0)
    latest.selectPreset('b')
    assert.equal(latest.workspaceSelectionRevision.current,1)
    latest.selectPreset('a')
    assert.equal(latest.workspaceSelectionRevision.current,2)
  })
  assert.equal(latest.workspace.party[0].item,'one-two')
  assert.deepEqual(latest.workspace.savedPartyPresets[1],b)
  assert.deepEqual(latest.workspace.confirmedMovesByKey.a,['N','','Z',''])
  assert.deepEqual(marks,['saving','saving','saving'])
})
test('mounted owner retains failed status, active deletion fallback and OCR revision stale guard', async () => {
  const a = preset('a','a'), b = preset('b','b')
  const initial = initializeWorkspace({party:a.party,savedPartyPresets:[a,b],activePartyPresetId:'a'},party(''))
  const marks = await mount(initial,'failed')
  let recognize
  const pending = runGuardedOcrImport({files:['image'],recognize:()=>new Promise(resolve=>{recognize=resolve}),parse:()=>[slot('c')],confirm:()=>true,
    isCurrent: (() => { const revision = latest.workspaceSelectionRevision.current, id = latest.workspaceRef.current.activePartyPresetId; return () => latest.workspaceSelectionRevision.current === revision && latest.workspaceRef.current.activePartyPresetId === id })(),
    apply:()=> latest.applyImportedBuild('a',party('c'),{})})
  await act(async () => {
    latest.selectPreset('b'); latest.selectPreset('a')
    latest.deletePreset('a', party(''), 'replacement')
    assert.equal(latest.workspaceRef.current.activePartyPresetId,'b')
    latest.importWorkspace(initial)
    assert.equal(latest.workspaceSelectionRevision.current,4)
  })
  recognize('ocr')
  assert.equal(await pending,'stale')
  assert.deepEqual(marks,[])
  assert.equal(latest.workspace.party[0].key,'a')
})
test('mounted preset commands retain blank/unknown fields, copy isolation and last-record fallback', async () => {
  const original = preset('a','a',['X','','Z',''])
  original.party[0].item = 'unknown raw item'
  original.party[0].picked = true
  await mount(initializeWorkspace({party:original.party,confirmedMovesByKey:{a:['X','','Z','']},savedPartyPresets:[original]},party('')),'read-failed')
  await act(async () => {
    latest.addPreset(preset('copy','copy',['Y']))
    latest.renamePreset('a','A ')
    latest.createPreset('new','New',party(''))
    latest.selectPreset('a')
  })
  assert.equal(latest.workspace.party[0].item,'unknown raw item')
  assert.equal(latest.workspace.party[0].picked,true)
  assert.deepEqual(latest.workspace.confirmedMovesByKey.a,['X','','Z',''])
  assert.equal(latest.workspace.savedPartyPresets.find(record=>record.id==='a').label,'A ')
  await act(async () => {
    latest.deletePreset('copy',party(''),'fallback')
    latest.deletePreset('new',party(''),'fallback')
    latest.deletePreset('a',party(''),'fallback')
  })
  assert.equal(latest.workspace.activePartyPresetId,'fallback')
  assert.equal(latest.workspace.savedPartyPresets.length,1)
  assert.equal(latest.workspace.party[0].key,'')
})
