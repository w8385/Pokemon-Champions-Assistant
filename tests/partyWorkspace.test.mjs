import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { readFileSync } from 'node:fs'

let server, work
const empty = () => Array.from({length:6}, () => ({key:'',ability:'',item:'',picked:false,config:{nature:'hardy',scarf:false,speedStage:0},evs:{hp:0,attack:0,defense:0,spAttack:0,spDefense:0,speed:0},tuning:{magicNumber:0,maxValue:0}}))
const team = (key, item = '') => empty().map((slot,i) => i === 0 ? {...slot,key,item} : slot)
const preset = (id, party, moves = []) => ({id,label:id,party,lockedMovesBySlot:[moves,...Array.from({length:5},()=>[])]})
test.before(async () => { server = await createServer({server:{middlewareMode:true,hmr:false},appType:'custom',optimizeDeps:{noDiscovery:true,include:[]}}); work = await server.ssrLoadModule('/src/partyWorkspace.ts') })
test.after(async () => { await server?.close() })
test('migration selects matching record, restores divergent working draft once, and never guesses a missing party', () => {
  const a = preset('a',team('a')), b = preset('b',team('b'))
  let state = work.initializeWorkspace({party:team('draft'),confirmedMovesByKey:{draft:['X']},savedPartyPresets:[a,b],activePartyPresetId:'a'}, empty())
  assert.equal(state.savedPartyPresets.length,3); assert.equal(state.savedPartyPresets[2].label,'복구한 파티'); assert.equal(state.savedPartyPresets[0].party[0].key,'a')
  state = work.initializeWorkspace(state,empty()); assert.equal(state.savedPartyPresets.length,3)
  assert.equal(work.initializeWorkspace({savedPartyPresets:[a,b]},empty()).activePartyPresetId,'a')
  assert.equal(work.initializeWorkspace({party:team('b'),savedPartyPresets:[a,b]},empty()).activePartyPresetId,'b')
  assert.equal(work.initializeWorkspace({},empty()).savedPartyPresets.length,1)
})
test('missing legacy moves map uses matching record rather than making a false recovery', () => {
  const a = preset('a',team('a'),['X','','Z',''])
  const s = work.initializeWorkspace({party:a.party,savedPartyPresets:[a]},empty())
  assert.equal(s.savedPartyPresets.length,1)
  assert.deepEqual(s.confirmedMovesByKey.a,['X','','Z',''])
})
test('App initializes party-facing drafts and selection from the restored active record', () => {
  const a = preset('a',team('lopunny','old-item')), b = preset('b',team('corviknight','new-item'),['Brave Bird'])
  const recovered = work.initializeWorkspace({savedPartyPresets:[a,b],activePartyPresetId:'b'},team('lopunny','old-item'))
  assert.equal(recovered.party[0].key,'corviknight')
  assert.equal(recovered.party[0].item,'new-item')
  assert.deepEqual(recovered.confirmedMovesByKey.corviknight,['Brave Bird','','',''])
  const app = readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8')
  for (const field of ['partySearch','partyItemDrafts']) {
    const initialization = app.match(new RegExp(`const \\[${field},[^\\n]+`))?.[0]
    assert.ok(initialization, `${field} initializer exists`)
    assert.match(initialization,/initialWorkspace\.party\.map\(/, `${field} must use the restored record, not the starter party`)
  }
  assert.match(app,/const \[selectedMy, setSelectedMy\][^\n]*initialWorkspace\.party\.length/)
  assert.match(app,/const initialDoubleParty[^\n]*initialWorkspace\.party/)
})
test('live rename preserves the space typed before the next word and refuses blank labels', () => {
  let state = work.initializeWorkspace({party:team('a')},empty())
  const id = state.activePartyPresetId
  for (const label of ['파티','파티 ','파티 A']) {
    state = work.workspaceReducer(state,{type:'RENAME',id,label})
    assert.equal(state.savedPartyPresets[0].label,label)
  }
  const before = state
  state = work.workspaceReducer(state,{type:'RENAME',id,label:'   '})
  assert.strictEqual(state,before)
})
test('rapid select/edit/select snapshots only active record, including sparse moves', () => {
  const a = preset('a',team('a'),['A','','C','']), b = preset('b',team('b'),['B'])
  let s = work.initializeWorkspace({party:a.party,confirmedMovesByKey:{a:['A','','C','']},savedPartyPresets:[a,b],activePartyPresetId:'a'},empty())
  s = work.workspaceReducer(s,{type:'SELECT',id:'b'})
  s = work.workspaceReducer(s,{type:'EDIT_PARTY',update:prev => prev.map((m,i) => i ? m : {...m,item:'new'})})
  s = work.workspaceReducer(s,{type:'SELECT',id:'a'})
  assert.deepEqual(s.savedPartyPresets[0].lockedMovesBySlot[0],['A','','C',''])
  assert.equal(s.savedPartyPresets[1].party[0].item,'new'); assert.equal(s.savedPartyPresets[0].party[0].item,'')
  assert.equal(s.savedPartyPresets.length,2); assert.deepEqual(s.confirmedMovesByKey.a,['A','','C',''])
})
test('duplicate species conflicting slot moves survive unrelated edits; direct move edit shares within active party', () => {
  const party = team('a'); party[1] = {...party[0]}
  const record = {id:'a',label:'a',party,lockedMovesBySlot:[['X','','Z',''],['Y'],[],[],[],[]]}
  let s = work.initializeWorkspace({party,confirmedMovesByKey:{a:['X','','Z','']},savedPartyPresets:[record],activePartyPresetId:'a'},empty())
  s = work.workspaceReducer(s,{type:'EDIT_PARTY',update:p=>p.map((m,i)=>i===0?{...m,ability:'test'}:m)})
  assert.deepEqual(s.savedPartyPresets[0].lockedMovesBySlot[1],['Y'])
  s = work.workspaceReducer(s,{type:'EDIT_MOVES',update:m=>({...m,a:['N','','Q','']}),key:'a'})
  assert.deepEqual(s.savedPartyPresets[0].lockedMovesBySlot.slice(0,2),[['N','','Q',''],['N','','Q','']])
})
test('new empty, rename, delete active and last, reset retain editable identity', () => {
  let s = work.initializeWorkspace({party:team('a')},empty())
  s = work.workspaceReducer(s,{type:'CREATE',id:'new',label:'new',emptyParty:empty()})
  assert.equal(s.savedPartyPresets.length,2); assert.ok(s.party.every(m=>!m.key))
  s = work.workspaceReducer(s,{type:'RENAME',id:'new',label:'Live'})
  assert.equal(s.savedPartyPresets[0].label,'Live')
  s = work.workspaceReducer(s,{type:'DELETE',id:'new',emptyParty:empty()}); assert.equal(s.party[0].key,'a')
  s = work.workspaceReducer(s,{type:'DELETE',id:s.activePartyPresetId,emptyParty:empty()}); assert.equal(s.savedPartyPresets.length,1); assert.ok(s.party.every(m=>!m.key))
  s = work.workspaceReducer(s,{type:'RESET',id:'reset',emptyParty:empty()}); assert.equal(s.savedPartyPresets.length,1)
})
test('v1 backup accepts optional active ID and an empty editable record', async () => {
  const {validateBackup} = await server.ssrLoadModule('/src/backupValidation.ts')
  const payload = {version:1,party:empty(),opponents:[],savedPartyPresets:[preset('blank',empty())],activePartyPresetId:'blank'}
  assert.equal(validateBackup(payload).activePartyPresetId,'blank')
  assert.equal(validateBackup({...payload,activePartyPresetId:undefined}).version,1)
  assert.throws(()=>validateBackup({...payload,activePartyPresetId:42}))
})
test('OCR build and moves commit together without changing another record', () => {
  const a = preset('a',team('a'),['A']), b = preset('b',team('b'),['B'])
  let s = work.initializeWorkspace({party:a.party,confirmedMovesByKey:{a:['A']},savedPartyPresets:[a,b],activePartyPresetId:'a'},empty())
  s = work.workspaceReducer(s,{type:'EDIT_BUILD',targetId:'a',party:team('c'),moves:{c:['X','','Z','']}})
  assert.equal(s.savedPartyPresets[0].party[0].key,'c')
  assert.deepEqual(s.savedPartyPresets[0].lockedMovesBySlot[0],['X','','Z',''])
  assert.deepEqual(s.savedPartyPresets[1],b)
})
test('App routes OCR and selected record mutations through atomic workspace actions', () => {
  const app = readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8')
  const ocr = app.slice(app.indexOf('const applyOcrImportedParty'),app.indexOf('const importPartyFromImage'))
  assert.match(ocr,/dispatchWorkspace\(\{ type: 'EDIT_BUILD'/)
  assert.doesNotMatch(ocr,/setParty\(|setConfirmedMovesByKey\(/)
  const imageFlow = app.slice(app.indexOf('const importPartyFromImage'),app.indexOf('const librarySource ='))
  assert.match(imageFlow,/const targetId = workspaceRef\.current\.activePartyPresetId[\s\S]*?await import\('tesseract\.js'\)/)
  assert.match(imageFlow,/runGuardedOcrImport\([\s\S]*?workspaceSelectionRevision\.current === selectionRevision/)
  assert.match(app,/action\.type === 'IMPORT'[^\n]*workspaceSelectionRevision\.current\+\+/)
  assert.match(imageFlow,/result === 'stale'[\s\S]*?setPartyImageImportStatus\(lt\('파티 선택이 변경되어 사진을 반영하지 않았습니다\. 다시 시도해 주세요\.'\)\)/)
  assert.match(app,/activePartyPresetId,\s*sampleWorkbenchTab/)
  assert.match(app,/persistWorkspace\(\(\) => window.localStorage, STORAGE_KEY, payload\)/)
  assert.match(app,/persistenceStatus === 'failed'/)
})
test('storage exception keeps memory and retry writes latest selected record', () => {
  const a = preset('a',team('a'))
  let state = work.initializeWorkspace({party:a.party,savedPartyPresets:[a]},empty())
  state = work.workspaceReducer(state,{type:'EDIT_PARTY',update:p=>p.map((m,i)=>i ? m : {...m,item:'latest'})})
  assert.equal(work.persistWorkspace({setItem(){throw Error('quota')}},'key',state),false)
  let raw = ''
  assert.equal(work.persistWorkspace({setItem(_key,value){raw=value}},'key',state),true)
  assert.equal(JSON.parse(raw).savedPartyPresets[0].party[0].item,'latest')
})
test('late OCR recognition after A to B switch aborts without touching either record or UI draft', async () => {
  const a = preset('a',team('a'),['A']), b = preset('b',team('b'),['B'])
  let state = work.initializeWorkspace({party:a.party,confirmedMovesByKey:{a:['A']},savedPartyPresets:[a,b],activePartyPresetId:'a'},empty())
  let resolveRecognition
  const pendingRecognition = new Promise(resolve => { resolveRecognition = resolve })
  const startId = state.activePartyPresetId
  let epoch = 0, uiDraft = 'B search'
  const startEpoch = epoch
  const operation = work.runGuardedOcrImport({files:['image'],recognize:()=>pendingRecognition,parse:()=>[{member:team('c')[0],lockedMoves:['X']}],
    confirm:()=>true,isCurrent:()=>state.activePartyPresetId===startId && epoch===startEpoch && state.savedPartyPresets.some(p=>p.id===startId),
    apply:imported=>{state=work.workspaceReducer(state,{type:'EDIT_BUILD',targetId:startId,party:team(imported[0].member.key),moves:{c:['X']}}); uiDraft='C search'}})
  state = work.workspaceReducer(state,{type:'SELECT',id:'b'}); epoch++
  resolveRecognition('ocr')
  assert.equal(await operation,'stale')
  assert.equal(state.activePartyPresetId,'b')
  assert.deepEqual(state.savedPartyPresets,[a,b]); assert.equal(uiDraft,'B search')
  // A -> B -> A still invalidates a second pending request.
  let completeSecond
  const second = work.runGuardedOcrImport({files:['image'],recognize:()=>new Promise(resolve=>{completeSecond=resolve}),parse:()=>[1],
    confirm:()=>true,isCurrent:()=>state.activePartyPresetId==='b' && epoch===1,apply:()=>{uiDraft='wrong'}})
  state = work.workspaceReducer(state,{type:'SELECT',id:'a'}); epoch++
  state = work.workspaceReducer(state,{type:'SELECT',id:'b'}); epoch++
  completeSecond('ocr')
  assert.equal(await second,'stale'); assert.equal(uiDraft,'B search'); assert.deepEqual(state.savedPartyPresets,[a,b])
})
test('OCR recognition applies normally only to the captured record', async () => {
  const a = preset('a',team('a')), b = preset('b',team('b'))
  let state = work.initializeWorkspace({party:a.party,savedPartyPresets:[a,b]},empty())
  const result = await work.runGuardedOcrImport({files:['image'],recognize:async()=> 'ocr',parse:()=>[{member:team('c')[0],lockedMoves:['X']}],
    confirm:()=>true,isCurrent:()=>state.activePartyPresetId==='a',apply:()=>{state=work.workspaceReducer(state,{type:'EDIT_BUILD',targetId:'a',party:team('c'),moves:{c:['X']}})}})
  assert.equal(result,'applied'); assert.equal(state.savedPartyPresets[0].party[0].key,'c'); assert.deepEqual(state.savedPartyPresets[1],b)
  const stale = work.workspaceReducer(state,{type:'SELECT',id:'b'})
  assert.strictEqual(work.workspaceReducer(stale,{type:'EDIT_BUILD',targetId:'a',party:team('wrong'),moves:{}}),stale)
})
test('storage getter exception is caught and retry succeeds with latest state', () => {
  const state = work.initializeWorkspace({party:team('a')},empty())
  assert.equal(work.persistWorkspace(()=>{throw Error('storage denied')},'key',state),false)
  let raw = ''
  assert.equal(work.persistWorkspace(()=>({setItem(_key,value){raw=value}}),'key',state),true)
  assert.equal(JSON.parse(raw).activePartyPresetId,state.activePartyPresetId)
})

