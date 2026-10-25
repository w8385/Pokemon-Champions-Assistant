import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const input = relative => path.join(root, relative)
const SOURCE = 'src/dexGameMoveIndex.json'
const EVIDENCE = 'src/championsMoveMetaLegacyEvidence.json'
const LEGACY_REPORT = 'reports/championsMoveMetaLegacyReport.json'
const OVERRIDES = 'src/championsMoveMetaOverrides.json'
const ALIASES = 'src/championsMoveMetaNameAliases.json'
const EVIDENCE_SHA256 = '183edc049bfaf73369301985b4e03b0b0da188e47e19f87acedb9727cc05ec35'
const SOURCE_SHA256 = '821c977af77863f53abffd95668e4173d67b42de76d8e1c79c89903d54ec9c3c'
const LEGACY_REPORT_SHA256 = '406acf626f4184056faa9e3e33ac4c5a2152188ca0fbbc20bad2bbd8dbf5a2b4'

function options(args) {
  const result = { check: false, output: input('src/championsLearnedMoveMeta.json'), report: input('reports/championsMoveMetaReport.json') }
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]
    if (arg === '--offline') continue // Offline is always the only supported mode.
    if (arg === '--check') { result.check = true; continue }
    if (arg === '--output' || arg === '--report') {
      if (!args[index + 1]) throw Error(`missing value for ${arg}`)
      result[arg.slice(2)] = path.resolve(args[++index])
      continue
    }
    throw Error(`unknown argument ${arg}`)
  }
  if (result.output === result.report) throw Error('output and report must be different files')
  return result
}

async function readPinned(relative, expectedSha) {
  const bytes = await fs.readFile(input(relative))
  const actual = createHash('sha256').update(bytes).digest('hex')
  if (actual !== expectedSha) throw Error(`${relative} hash mismatch: ${actual}; review pinned input before rebuilding`)
  return JSON.parse(bytes)
}

async function readJson(relative) {
  return JSON.parse(await fs.readFile(input(relative),'utf8'))
}

function assert(condition, message) {
  if (!condition) throw Error(message)
}

function validateAliases(source, aliases) {
  const neighbors = new Map()
  for (const [left,right] of Object.entries(aliases)) {
    for (const [name,other] of [[left,right],[right,left]]) {
      if (!neighbors.has(name)) neighbors.set(name,new Set())
      neighbors.get(name).add(other)
    }
  }
  const visited = new Set()
  let anchored = 0, sourceLess = 0
  for (const name of neighbors.keys()) {
    if (visited.has(name)) continue
    const queue = [name], ids = new Set([source[name]?.id].filter(id=>id != null))
    visited.add(name)
    for (const current of queue) for (const next of neighbors.get(current) ?? []) {
      if (visited.has(next)) continue
      visited.add(next); queue.push(next)
      if (source[next]) ids.add(source[next].id)
    }
    assert(ids.size <= 1,`alias component has conflicting source IDs: ${queue.join(', ')}`)
    if (ids.size) anchored++; else sourceLess++
  }
  return { anchored, sourceLess }
}

async function build() {
  const [source, legacy, previousReport, overrides, aliases] = await Promise.all([
    readPinned(SOURCE,SOURCE_SHA256),readPinned(EVIDENCE,EVIDENCE_SHA256),
    readPinned(LEGACY_REPORT,LEGACY_REPORT_SHA256),readJson(OVERRIDES),readJson(ALIASES),
  ])
  const sourceNames = Object.keys(source), legacyNames = Object.keys(legacy)
  const historical = legacyNames.filter(name=>!Object.hasOwn(source,name))
  const intersection = sourceNames.filter(name=>Object.hasOwn(legacy,name))
  assert(sourceNames.length === 510 && new Set(sourceNames.map(name=>source[name].id)).size === 510,'pinned source IDs must be unique and complete')
  assert(legacyNames.length === 731 && intersection.length === 509 && historical.length === 222,'legacy evidence coverage changed')
  for (const [name,row] of Object.entries(source)) assert(Number.isInteger(row.id) && row.sourceKo && typeof row.type === 'string' && row.type,`invalid source row ${name}`)
  for (const [name,fields] of Object.entries(overrides)) {
    assert(Object.hasOwn(legacy,name),`override without evidence: ${name}`)
    assert(!Object.hasOwn(fields,'id') && !Object.hasOwn(fields,'type'),`override must not own ID/type: ${name}`)
    for (const [field,value] of Object.entries(fields)) assert(JSON.stringify(legacy[name][field]) === JSON.stringify(value),`override differs from frozen evidence: ${name}.${field}`)
  }
  const aliasComponents = validateAliases(source,aliases)
  const generated = {}
  // Source controls eligibility and basic type; the frozen archive supplies other legacy fields.
  for (const name of sourceNames) {
    const evidence = legacy[name]
    const { type: _historicalType, ...nonType } = evidence ?? {}
    generated[name] = evidence
      ? { type: source[name].type, ...nonType }
      : { type: source[name].type, category: null, power: null, accuracy: null, pp: null, priority: null }
  }
  // Historical raw names, including source-anchored aliases, retain their own exact rows.
  for (const name of historical) generated[name] = legacy[name]

  const oldMatches = previousReport.generatedMoves
  assert(Array.isArray(oldMatches) && oldMatches.length === legacyNames.length,'historical match provenance missing')
  assert(new Set(oldMatches.map(row=>row.moveName)).size === legacyNames.length && oldMatches.every(row=>Object.hasOwn(legacy,row.moveName)), 'historical match names differ from frozen evidence')
  const report = {
    source: {
      identityAndType: SOURCE,
      historicalFieldEvidence: EVIDENCE,
      historicalMatchProvenance: LEGACY_REPORT,
      manualOverrides: OVERRIDES,
      aliases: ALIASES,
      offline: true,
      sourceSnapshot: 'projectpokemon/champout@50e7233b78c3b81df29563f9695386c28e77fc95 (2026-09-09 pinned)',
    },
    totals: {
      pinnedIds: sourceNames.length,
      sharedLegacyRows: intersection.length,
      legacyOnlyRows: historical.length,
      sourceOnlyRows: sourceNames.length - intersection.length,
      generatedMetaMoves: Object.keys(generated).length,
      aliasAnchoredComponents: aliasComponents.anchored,
      aliasSourceLessComponents: aliasComponents.sourceLess,
    },
    // Historical API-name mapping is provenance, not authority for new metadata.
    generatedMoves: [...oldMatches, ...sourceNames.filter(name=>!legacy[name]).map(name=>({moveName:name,apiName:null,ko:null,en:null}))],
  }
  return { generated, report }
}

async function main() {
  const targets = options(process.argv.slice(2))
  const {generated,report} = await build()
  const outputs = [[targets.output,`${JSON.stringify(generated,null,2)}\n`],[targets.report,`${JSON.stringify(report,null,2)}\n`]]
  if (targets.check) {
    for (const [target,expected] of outputs) {
      const actual = await fs.readFile(target,'utf8').catch(()=>null)
      assert(actual === expected,`stale or missing generated output: ${target}`)
    }
    console.log('offline move metadata and report are byte-identical; no files written')
    return
  }
  for (const [target,content] of outputs) {
    await fs.mkdir(path.dirname(target),{recursive:true})
    await fs.writeFile(target,content)
  }
  console.log(`offline metadata ${Object.keys(generated).length} rows; historical evidence 731 rows; HTTP 0`)
}

main().catch(error=>{console.error(error);process.exitCode=1})
