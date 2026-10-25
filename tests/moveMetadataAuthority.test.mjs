import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import vm from 'node:vm'
import { createServer } from 'vite'
import { presentDoubleActionOrder } from '../src/doubleOrderPresentation.ts'

const text = readFileSync(new URL('../src/App.tsx', import.meta.url),'utf8')
const ast = ts.createSourceFile('App.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)
const legacy = JSON.parse(readFileSync(new URL('../src/championsLearnedMoveMeta.json',import.meta.url),'utf8'))
const historicalEvidence = JSON.parse(readFileSync(new URL('../src/championsMoveMetaLegacyEvidence.json',import.meta.url),'utf8'))
const pinned = JSON.parse(readFileSync(new URL('../src/dexGameMoveIndex.json',import.meta.url),'utf8'))
const aliases = JSON.parse(readFileSync(new URL('../src/championsMoveMetaNameAliases.json',import.meta.url),'utf8'))
function fn(name) { const found=ast.statements.find(node=>ts.isFunctionDeclaration(node)&&node.name?.text===name); assert.ok(found,name); return found.getText(ast) }
async function runtime() {
  const server=await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'silent'})
  try {
    const [{getDexGameMove,getDexGameMoveNames,getDexGameMoveIdentity},{getMoveMetadata}, {searchMoves}, {MOVE_META_BY_NAME}] = await Promise.all([
      server.ssrLoadModule('/src/dexGameMoveIndex.ts'),server.ssrLoadModule('/src/moveMetadata.ts'),server.ssrLoadModule('/src/moveSearch.ts'),server.ssrLoadModule('/src/dex/data.ts')])
    Object.assign(MOVE_META_BY_NAME,legacy)
    const context={MOVE_META_BY_NAME,getDexGameMove,getDexGameMoveNames,getDexGameMoveIdentity,getMoveMetadata,
      normalizeSearchText: s=>s.toLowerCase().replace(/[^0-9a-z가-힣ぁ-んァ-ヶ一-龯]+/g,''),
      MOVE_NAME_ALIASES:aliases,MOVE_NAME_ALIASES_BY_NORMALIZED:new Map(), searchMoves,
      byDisplayName:(items,name)=>items.sort((a,b)=>name(a).localeCompare(name(b),'ko')),
      moveDescriptionFor:()=>null, displayTypeName: t=>t, displayMoveCategoryName:c=>c ?? 'unknown',resolvedMovePower: m=>m.power,
      localizedDexText:()=>null,translateText:(_lang,s)=>s }
    const code=ts.transpileModule(`${['moveNameCandidates','findMatchingMoveOption','lookupMoveMeta','resolveMoveType','resolveMoveMeta','moveSearchCandidates','dexMoveIndex','filterDexMoveOptions','moveTooltipData'].map(fn).join('\n')}\nglobalThis.api={lookupMoveMeta,resolveMoveType,resolveMoveMeta,filterDexMoveOptions,moveTooltipData}`,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText
    vm.runInNewContext(code,context)
    return {api:context.api,getMoveMetadata,getDexGameMoveIdentity}
  } finally {await server.close()}
}

test('real App readers agree with pinned types for conflict moves including tooltip and browse',async()=>{
  const {api}=await runtime()
  for(const [name,type] of [['성장','grass'],['집게덫','steel']]){
    assert.equal(api.lookupMoveMeta(name)?.type,type)
    assert.equal(api.resolveMoveMeta(name,[],{})?.type,type)
    assert.equal(api.resolveMoveType(name,[],{}),type)
    assert.equal(api.moveTooltipData(name,'ko')?.accentType,type)
    assert.equal(api.filterDexMoveOptions('',{allowLoose:false}).find(row=>row.name===name)?.meta.type,type)
    assert.equal(api.filterDexMoveOptions(name,{allowLoose:false}).find(row=>row.name===name)?.meta.type,type)
  }
})

test('source-only 747 has unknown non-type metadata and priority across actual readers',async()=>{
  const {api,getMoveMetadata}=await runtime()
  const name='볼가득넣기', record=getMoveMetadata(name)
  assert.equal(record.id,747)
  assert.equal(record.canonicalName,name)
  assert.equal(record.meta.type,'normal')
  for(const field of ['category','power','accuracy','pp','priority']) {
    assert.equal(record.meta[field],null,field)
    assert.equal(record.provenance[field],'unknown',field)
  }
  assert.equal(api.resolveMoveMeta(name,[],{}).priority,null)
  assert.equal(api.filterDexMoveOptions(name).find(row=>row.name===name)?.meta.priority,null)
  assert.equal(api.moveTooltipData(name,'ko').rows.find(row=>row.label==='타입')?.value,'normal')
})

test('510 source identities and all historical-only rows survive without invented IDs',async()=>{
  const {getMoveMetadata,api,getDexGameMoveIdentity}=await runtime()
  assert.equal(Object.keys(pinned).length,510)
  assert.equal(Object.keys(legacy).length,732)
  assert.equal(Object.keys(historicalEvidence).length,731)
  const shared=Object.keys(pinned).filter(name=>historicalEvidence[name]),historical=Object.keys(historicalEvidence).filter(name=>!pinned[name])
  assert.equal(shared.length,509); assert.equal(historical.length,222)
  for(const [name,source] of Object.entries(pinned)) {
    const row=getMoveMetadata(name)
    assert.equal(row.id,source.id,name);assert.equal(row.canonicalName,name);assert.equal(row.meta.type,source.type)
    if(legacy[name]) for(const [field,value] of Object.entries(legacy[name])) if(field!=='type') assert.deepEqual(row.meta[field],value,`${name}.${field}`)
  }
  const options=api.filterDexMoveOptions('')
  assert.equal(options.length,730) // 510 pinned + 220 source-less historical cards; two aliases fold into their ID.
  for(const name of historical) {
    const row=getMoveMetadata(name)
    if(row.id === null) assert.deepEqual(row.meta,legacy[name],name)
    else for(const [field,value] of Object.entries(legacy[name])) if(field!=='type') assert.deepEqual(row.meta[field],value,`${name}.${field}`)
    assert.equal(row.id, getDexGameMoveIdentity(name)?.id ?? null,name)
    const option=options.find(option=>option.name===name)
    if(row.id === null) assert.ok(option,name)
    else assert.ok(api.filterDexMoveOptions(name,{allowLoose:false}).find(option=>option.name===row.canonicalName),name)
  }
})

test('evidenced aliases resolve in either direction; source-less component remains unresolved',async()=>{
  const {getMoveMetadata,getDexGameMoveIdentity}=await runtime()
  for(const [left,right] of Object.entries(aliases)) {
    const a=getDexGameMoveIdentity(left),b=getDexGameMoveIdentity(right)
    if(a && b && a.id===b.id){assert.equal(getMoveMetadata(left).id,a.id);assert.equal(getMoveMetadata(right).id,a.id)}
    else if(!a&&!b){assert.equal(getMoveMetadata(left)?.id ?? null,null);assert.equal(getMoveMetadata(right)?.id ?? null,null)}
  }
})

test('occupied selected move with unknown priority never receives a definite Double rank',()=>{
  const entries=[{idx:0,occupied:true,priority:null,speed:120,selectedMove:'볼가득넣기'},{idx:1,occupied:true,priority:0,speed:100,selectedMove:'성장'}]
  assert.ok(presentDoubleActionOrder(entries,false).every(entry=>entry.rank===null))
  assert.equal(presentDoubleActionOrder([{idx:0,occupied:true,priority:0,speed:120,selectedMove:''}],false)[0].rank,1)
})
