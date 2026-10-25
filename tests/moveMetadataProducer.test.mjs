import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('../', import.meta.url))
const read = p => JSON.parse(readFileSync(path.join(root,p),'utf8'))
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const script = path.join(root,'scripts/build-champions-move-meta.mjs')
const source = read('src/dexGameMoveIndex.json')
const generated = read('src/championsLearnedMoveMeta.json')

function guardedRun(args, directory) {
  // A preload blocks both fetch and socket transports; the test must actually spawn the generator.
  const guard = path.join(directory,'no-network.mjs')
  writeFileSync(guard, "import net from 'node:net'; import http from 'node:http'; import https from 'node:https'; globalThis.fetch = () => { throw Error('HTTP forbidden') }; for (const module of [net,http,https]) { for (const method of ['connect','createConnection','request','get']) if (typeof module[method] === 'function') module[method] = () => { throw Error('HTTP forbidden') } }\n")
  return spawnSync(process.execPath,['--import',guard,script,...args],{cwd:root,encoding:'utf8'})
}

test('pinned IDs drive generated type while all 731 historical non-type fields and raw rows remain evidence', async () => {
  const evidence = readFileSync(path.join(root,'src/championsMoveMetaLegacyEvidence.json'))
  assert.equal(sha(evidence),'183edc049bfaf73369301985b4e03b0b0da188e47e19f87acedb9727cc05ec35')
  const original = JSON.parse(evidence)
  assert.equal(Object.keys(source).length,510)
  assert.equal(new Set(Object.values(source).map(row=>row.id)).size,510)
  assert.equal(Object.keys(original).length,731)
  assert.equal(Object.keys(generated).length,732)
  const shared = Object.keys(source).filter(name=>Object.hasOwn(original,name))
  const historical = Object.keys(original).filter(name=>!Object.hasOwn(source,name))
  assert.equal(shared.length,509)
  assert.equal(historical.length,222)
  assert.deepEqual(new Set(Object.keys(generated)),new Set([...Object.keys(source),...historical]))
  for (const [name,record] of Object.entries(source)) {
    assert.equal(generated[name].type,record.type,name)
    if (original[name]) for (const [field,value] of Object.entries(original[name])) {
      if (field !== 'type') assert.deepEqual(generated[name][field],value,`${name}.${field}`)
    }
  }
  for (const name of historical) assert.deepEqual(generated[name],original[name],name)
  assert.deepEqual(generated['볼가득넣기'],{type:'normal',category:null,power:null,accuracy:null,pp:null,priority:null})
  assert.equal(original['성장'].type,'normal')
  assert.equal(original['집게덫'].type,'grass')
  assert.equal(generated['성장'].type,'grass')
  assert.equal(generated['집게덫'].type,'steel')
  const server=await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'silent'})
  try {
    const [{getMoveMetadata},{getDexGameMoveIdentity},{MOVE_META_BY_NAME}]=await Promise.all([server.ssrLoadModule('/src/moveMetadata.ts'),server.ssrLoadModule('/src/dexGameMoveIndex.ts'),server.ssrLoadModule('/src/dex/data.ts')])
    Object.assign(MOVE_META_BY_NAME,generated) // Match the lazy catalog after it becomes ready.
    for(const [name,record] of Object.entries(source)) {
      const runtime=getMoveMetadata(name)
      assert.equal(runtime.id,record.id,name)
      assert.equal(runtime.meta.type,generated[name].type,name)
      for(const [field,value] of Object.entries(generated[name])) if(field!=='type') assert.deepEqual(runtime.meta[field],value,`${name}.${field}`)
    }
    for(const name of historical) {
      const runtime=getMoveMetadata(name)
      assert.equal(runtime.id,getDexGameMoveIdentity(name)?.id??null,name)
      for(const [field,value] of Object.entries(original[name])) if(field!=='type') assert.deepEqual(runtime.meta[field],value,`${name}.${field}`)
    }
  } finally {await server.close()}
})

test('offline producer replays byte-identically, check is read-only and stale output fails without HTTP', () => {
  const dir=mkdtempSync(path.join(tmpdir(),'move-meta-producer-'))
  try {
    const output=path.join(dir,'metadata.json'),report=path.join(dir,'report.json')
    const args=['--offline','--output',output,'--report',report]
    let result=guardedRun(args,dir)
    assert.equal(result.status,0,result.stderr)
    const first=readFileSync(output),firstReport=readFileSync(report)
    assert.deepEqual(JSON.parse(first),generated)
    assert.deepEqual(JSON.parse(firstReport),read('reports/championsMoveMetaReport.json'))
    result=guardedRun([...args,'--check'],dir)
    assert.equal(result.status,0,result.stderr)
    assert.deepEqual(readFileSync(output),first)
    assert.deepEqual(readFileSync(report),firstReport)
    writeFileSync(output,'{"stale":true}\n')
    const stale=readFileSync(output)
    result=guardedRun([...args,'--check'],dir)
    assert.notEqual(result.status,0,'stale --check must fail')
    assert.deepEqual(readFileSync(output),stale,'--check must never write')
    assert.deepEqual(readFileSync(report),firstReport,'--check must never write report')
  } finally {rmSync(dir,{recursive:true,force:true})}
})
