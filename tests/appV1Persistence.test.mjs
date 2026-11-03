import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

let server, io
const source = name => readFileSync(new URL(name, import.meta.url), 'utf8')
test.before(async () => {
  server = await createServer({server:{middlewareMode:true,hmr:false},appType:'custom',optimizeDeps:{noDiscovery:true,include:[]}})
  io = await server.ssrLoadModule('/src/adapters/persistence/appV1.ts')
})
test.after(async () => { await server?.close() })

test('single main-v1 owner is imported by the real App and party domain is I/O-free', () => {
  const app = source('../src/App.tsx'), party = source('../src/domain/party/partyWorkspace.ts'), adapter = source('../src/adapters/persistence/appV1.ts')
  assert.equal(io.STORAGE_KEY,'pokemon-champions-assistant-demo:v1')
  assert.match(app,/import \{ STORAGE_KEY, loadPersistedState, persistWorkspace \} from '\.\/adapters\/persistence\/appV1'/)
  assert.match(app,/loadPersistedState\(\)/)
  assert.match(app,/persistWorkspace\(\(\) => window\.localStorage, STORAGE_KEY, payload\)/)
  assert.doesNotMatch(app,/\b(?:const STORAGE_KEY|function loadPersistedState)\b/)
  assert.doesNotMatch(party,/\b(?:persistWorkspace|localStorage|\bStorage\b)\b/)
  assert.equal((adapter.match(/pokemon-champions-assistant-demo:v1/g) ?? []).length,1)
})

test('reader accepts absent, empty and arbitrary object without migration, rejects invalid JSON and non-object roots', () => {
  // Browser global is installed only for the scope of each case, then restored.
  const prior = globalThis.window
  try {
    for (const raw of [null, '']) {
      globalThis.window = {localStorage:{getItem:key => { assert.equal(key,io.STORAGE_KEY); return raw }}}
      assert.deepEqual(io.loadPersistedState(),{value:null,error:false})
    }
    for (const raw of ['{', 'null','[]','42','"text"','true']) {
      globalThis.window = {localStorage:{getItem:()=>raw}}
      assert.deepEqual(io.loadPersistedState(),{value:null,error:true},raw)
    }
    const raw = '{"unknown":{"item":"무명", "moves":["A","","C",""]},"blank":"","picked":false}'
    globalThis.window = {localStorage:{getItem:()=>raw}}
    assert.deepEqual(io.loadPersistedState(),{value:JSON.parse(raw),error:false})
    globalThis.window = {get localStorage(){throw Error('denied')}}
    assert.deepEqual(io.loadPersistedState(),{value:null,error:true})
    globalThis.window = {localStorage:{getItem(){throw Error('denied')}}}
    assert.deepEqual(io.loadPersistedState(),{value:null,error:true})
    delete globalThis.window
    assert.deepEqual(io.loadPersistedState(),{value:null,error:false})
  } finally { if (prior === undefined) delete globalThis.window; else globalThis.window = prior }
})

test('writer preserves exact key/serialization order and catches direct/factory/getter/JSON errors', () => {
  const payload = {party:[{picked:false,item:'?',moves:['A','','C','']}],unknown:{x:1},blank:''}
  let saved
  assert.equal(io.persistWorkspace({setItem(key,raw){saved=[key,raw]}},io.STORAGE_KEY,payload),true)
  assert.deepEqual(saved,[io.STORAGE_KEY,JSON.stringify(payload)])
  assert.equal(io.persistWorkspace(()=>({setItem(key,raw){saved=[key,raw]}}),io.STORAGE_KEY,payload),true)
  assert.deepEqual(saved,[io.STORAGE_KEY,JSON.stringify(payload)])
  assert.equal(io.persistWorkspace({setItem(){throw Error('quota')}},io.STORAGE_KEY,payload),false)
  assert.equal(io.persistWorkspace(()=>{throw Error('factory denied')},io.STORAGE_KEY,payload),false)
  assert.equal(io.persistWorkspace({get setItem(){throw Error('getter denied')}},io.STORAGE_KEY,payload),false)
  assert.equal(io.persistWorkspace({setItem(){throw Error('must not set')}},io.STORAGE_KEY,{bad:1n}),false)
  assert.equal(io.persistWorkspace({setItem(){throw Error('must not set')}},io.STORAGE_KEY,{toJSON(){throw Error('serialize denied')}}),false)
})
