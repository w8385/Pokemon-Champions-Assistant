import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { calcDamage } from '../src/domain/battle/damageCore.ts'
import { reviewedChampionsScalars, FIXTURE } from '../scripts/reviewed-champions-scalars.mjs'

const root = fileURLToPath(new URL('../',import.meta.url))
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'))
const source = read('src/canonical-data/champions/dexGameMoveIndex.json')
const current = read('src/canonical-data/champions/championsLearnedMoveMeta.json')
const legacy = read('src/canonical-data/champions/championsMoveMetaLegacyEvidence.json')
const rows = read(`${FIXTURE}/manifest.json`).reviewedRows
const sha = bytes => createHash('sha256').update(bytes).digest('hex')

test('exact 18 reviewed fields and no other field or row change, including alias 152',async()=>{
  const {ledger} = await reviewedChampionsScalars(root,source,legacy)
  assert.equal(ledger.length,18)
  assert.deepEqual(ledger.map(({id,field,value})=>({id,field,value})),rows.map(({id,field,value})=>({id,field,value})))
  const approved = new Set(ledger.map(row=>`${row.name}.${row.field}`))
  for(const [name,record] of Object.entries(current)) {
    const baseline = legacy[name] ?? {type:source[name].type,category:null,power:null,accuracy:null,pp:null,priority:null}
    for(const [field,value] of Object.entries(record)) if(!approved.has(`${name}.${field}`)) {
      if(field==='type' && source[name]) assert.equal(value,source[name].type)
      else if((name==='얼음숨결'||name==='업어후리기')&&field==='alwaysCrit') assert.equal(value,true)
      else assert.deepEqual(value,baseline[field],`${name}.${field}`)
    }
    for(const field of Object.keys(baseline)) assert.ok(Object.hasOwn(record,field),`${name}.${field} missing`)
  }
  for(const row of rows){assert.equal(source[row.name].id,row.id);assert.equal(current[row.name][row.field],row.value);assert.equal(legacy[row.name][row.field],row.previous)}
  assert.equal(source['찝게햄머'].sourceKo,'집게해머')
  assert.equal(current['찝게햄머'].accuracy,95)
  assert.equal(current['소울비트'].accuracy,100)
  assert.equal(current['부리캐논'].pp,15)
})

test('actual producer metadata reaches catalog lookup and named First Impression damage',async()=>{
  const server=await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'silent'})
  try {
    const [{getMoveMetadata},{lookupMoveMeta},{MOVE_META_BY_NAME}] = await Promise.all([
      server.ssrLoadModule('/src/domain/champions/moveMetadata.ts'),
      server.ssrLoadModule('/src/adapters/catalog/movePresentation.ts'),
      server.ssrLoadModule('/src/adapters/catalog/data.ts'),
    ])
    Object.assign(MOVE_META_BY_NAME,current)
    const record=getMoveMetadata('만나자마자'), meta=lookupMoveMeta('만나자마자')
    assert.equal(record.id,660)
    assert.equal(meta.power,100)
    const stats={hp:200,attack:150,defense:100,spAttack:100,spDefense:100}
    const result=calcDamage(stats,stats,meta.power,meta.category,1,1,meta)
    const old=calcDamage(stats,stats,90,meta.category,1,1,{...meta,power:90})
    assert.ok(result.rolls.some((roll,i)=>roll!==old.rolls[i]),'100 vs 90 must change damage rolls')
    assert.ok(result.min>old.min)
  } finally {await server.close()}
})

test('pinned inputs and reviewed manifest reject corruption without executing upstream TS',async()=>{
  const dir=fs.mkdtempSync(path.join(process.env.TMPDIR ?? '/tmp','reviewed-scalars-'))
  try {
    fs.cpSync(path.join(root,FIXTURE),dir,{recursive:true})
    const fixture='.'
    const manifestPath=path.join(dir,'manifest.json')
    const original=fs.readFileSync(manifestPath)
    const sourceFile=path.join(dir,'champions-moves.ts')
    const originalMod=fs.readFileSync(sourceFile)
    fs.appendFileSync(sourceFile,'\nthrow Error("upstream executed")\n')
    await assert.rejects(reviewedChampionsScalars(dir,source,legacy,fixture),/hash mismatch/)
    fs.writeFileSync(sourceFile,originalMod)
    const poisoned=Buffer.concat([Buffer.from('throw Error("upstream executed");\n'),originalMod])
    fs.writeFileSync(sourceFile,poisoned)
    const poisonManifest=JSON.parse(original)
    poisonManifest.files['champions-moves.ts'].sha256=sha(poisoned)
    poisonManifest.files['champions-moves.ts'].bytes=poisoned.length
    const poisonBytes=Buffer.from(JSON.stringify(poisonManifest))
    fs.writeFileSync(manifestPath,poisonBytes)
    assert.equal((await reviewedChampionsScalars(dir,source,legacy,fixture,sha(poisonBytes))).ledger.length,18,'unexecuted upstream statement')
    fs.writeFileSync(sourceFile,originalMod)
    fs.writeFileSync(manifestPath,original)
    const badSource=structuredClone(source);badSource['만나자마자'].type='water'
    await assert.rejects(reviewedChampionsScalars(dir,badSource,legacy,fixture),/type mismatch/)
    const cases = [
      ['duplicate ID',m=>{m.reviewedRows[1].id=660},/duplicate|unknown ID/],
      ['unknown ID',m=>{m.reviewedRows[0].id=9999},/unknown ID/],
      ['unsupported PP',m=>{m.reviewedRows[0].field='pp'},/unsupported field/],
      ['unsupported flags',m=>{m.reviewedRows[0].flags={sound:1}},/unsupported field/],
      ['boolean accuracy',m=>{m.reviewedRows[1].value=true},/range or boolean/],
      ['out-of-range power',m=>{m.reviewedRows[0].value=999},/range or boolean/],
      ['prototype key',m=>{m.reviewedRows[0].identifier='__proto__'},/unsafe key/],
      ['wrong type',m=>{m.reviewedRows[0].name='만나자마자'},/unknown ID/],
    ]
    for(const [label,mutate,rejection] of cases){
      const m=JSON.parse(original);mutate(m)
      const bytes=Buffer.from(JSON.stringify(m))
      fs.writeFileSync(manifestPath,bytes)
      await assert.rejects(reviewedChampionsScalars(dir,source,legacy,fixture,sha(bytes)),rejection,label)
    }
    fs.writeFileSync(manifestPath,original)
    const license=path.join(dir,'LICENSE');fs.appendFileSync(license,'tampered')
    await assert.rejects(reviewedChampionsScalars(dir,source,legacy,fixture),/LICENSE hash mismatch/)
    fs.writeFileSync(license,fs.readFileSync(path.join(root,FIXTURE,'LICENSE')))
    const mod=originalMod.toString()
    for(const [label,changed,rejection] of [
      ['nonliteral',mod.replace('firstimpression: {\n\t\tinherit: true,\n\t\tbasePower: 100','firstimpression: {\n\t\tinherit: true,\n\t\tbasePower: Number(100)'),/numeric literal/],
      ['duplicate scalar',mod.replace('firstimpression: {\n\t\tinherit: true,\n\t\tbasePower: 100','firstimpression: {\n\t\tinherit: true,\n\t\tbasePower: 100,\n\t\tbasePower: 100'),/duplicate field/],
    ]){
      assert.notEqual(changed,mod,label)
      fs.writeFileSync(sourceFile,changed)
      const m=JSON.parse(original);m.files['champions-moves.ts'].sha256=sha(Buffer.from(changed));m.files['champions-moves.ts'].bytes=Buffer.byteLength(changed)
      const bytes=Buffer.from(JSON.stringify(m));fs.writeFileSync(manifestPath,bytes)
      await assert.rejects(reviewedChampionsScalars(dir,source,legacy,fixture,sha(bytes)),rejection,label)
    }
  } finally {fs.rmSync(dir,{recursive:true,force:true})}
})
