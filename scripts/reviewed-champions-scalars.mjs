import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import ts from 'typescript'

export const FIXTURE = 'tests/fixtures/champions-reviewed-scalars'
export const MANIFEST_SHA256 = '3fa3fe0a6fea9d3c72630f8796c7e2773769cf22e4b356758be5ee0f0385615c'
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const assert = (condition, message) => { if (!condition) throw Error(message) }
const safeKey = key => { assert(typeof key === 'string' && key && !['__proto__','prototype','constructor'].includes(key),`unsafe key: ${key}`); return key }

function properties(node, context, allowMethods = false) {
  assert(node && ts.isObjectLiteralExpression(node),`${context}: expected object literal`)
  const result = new Map()
  for (const member of node.properties) {
    assert((ts.isPropertyAssignment(member) || (allowMethods && ts.isMethodDeclaration(member))) && (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name)),`${context}: nonliteral property`)
    const key = safeKey(member.name.text)
    assert(!result.has(key),`${context}: duplicate field ${key}`)
    result.set(key,ts.isPropertyAssignment(member) ? member.initializer : null)
  }
  return result
}
function literalNumber(node, context) {
  assert(node && ts.isNumericLiteral(node) && /^\d+$/.test(node.text),`${context}: numeric literal required`)
  const n = Number(node.text)
  assert(Number.isSafeInteger(n),`${context}: integer out of range`)
  return n
}
function literalString(node, context) {
  assert(node && ts.isStringLiteral(node),`${context}: string literal required`)
  return node.text
}
function moveTable(bytes, filename) {
  const file = ts.createSourceFile(filename,bytes.toString(),ts.ScriptTarget.Latest,true,ts.ScriptKind.TS)
  assert(file.parseDiagnostics.length === 0,`${filename}: invalid TypeScript syntax`)
  const declarations = file.statements.filter(ts.isVariableStatement).flatMap(statement=>statement.declarationList.declarations).filter(declaration=>declaration.name.getText(file)==='Moves')
  assert(declarations.length===1,`${filename}: missing/duplicate Moves table`)
  return properties(declarations[0].initializer,filename)
}

// Reads AST nodes only. Neither TypeScript text nor imported upstream modules are evaluated.
export async function reviewedChampionsScalars(root, source, generated, fixture = FIXTURE, expectedManifestSha = MANIFEST_SHA256) {
  const dir = path.join(root,fixture)
  const manifestBytes = await fs.readFile(path.join(dir,'manifest.json'))
  assert(sha(manifestBytes)===expectedManifestSha,'reviewed manifest hash mismatch')
  const manifest = JSON.parse(manifestBytes)
  assert(manifest.commit==='d12b9c1e905d1f98dd0e2f2fd04987d721a735f5' && manifest.reviewedFields===18 && manifest.reviewedRows.length===18,'reviewed pin/count mismatch')
  const buffers = {}
  for (const filename of ['champions-moves.ts','base-moves.ts','LICENSE']) {
    const bytes = await fs.readFile(path.join(dir,filename))
    assert(sha(bytes)===manifest.files[filename].sha256 && bytes.length===manifest.files[filename].bytes,`${filename} hash mismatch`)
    buffers[filename]=bytes
  }
  const mod = moveTable(buffers['champions-moves.ts'],'champions-moves.ts')
  const base = moveTable(buffers['base-moves.ts'],'base-moves.ts')
  const byNum = new Map()
  for (const [identifier,node] of base) {
    const fields = properties(node,`base ${identifier}`,true)
    if (!fields.has('num') || !ts.isNumericLiteral(fields.get('num'))) continue // unrelated legacy special entries
    const id = literalNumber(fields.get('num'),`base ${identifier}.num`)
    if (!byNum.has(id)) byNum.set(id,[])
    byNum.get(id).push(identifier)
  }
  const byId = new Map(Object.entries(source).map(([name,row])=>[row.id,name]))
  const seen = new Set(), ledger=[]
  for (const row of manifest.reviewedRows) {
    assert(row && Object.keys(row).sort().join(',')==='field,id,identifier,modLine,name,previous,sourceKo,value',`reviewed row unsupported field`)
    assert(Number.isSafeInteger(row.id) && row.id>0 && !seen.has(row.id),`duplicate or invalid reviewed ID: ${row.id}`)
    seen.add(row.id)
    assert(safeKey(row.name)===byId.get(row.id) && source[row.name]?.sourceKo===row.sourceKo,`unknown ID/name/sourceKo: ${row.id}`)
    assert(safeKey(row.identifier)===byNum.get(row.id)?.[0] && byNum.get(row.id)?.length===1,`base num ambiguous or identifier mismatch: ${row.id}`)
    assert(row.field==='power' || row.field==='accuracy',`unsupported field: ${row.field}`)
    assert(Number.isInteger(row.value) && row.value>=1 && row.value<=(row.field==='accuracy'?100:250),`invalid ${row.field} range or boolean accuracy: ${row.id}`)
    assert(generated[row.name]?.[row.field]===row.previous,`reviewed previous value differs: ${row.name}.${row.field}`)
    const baseFields = properties(base.get(row.identifier),`base ${row.identifier}`,true)
    const modFields = properties(mod.get(row.identifier),`mod ${row.identifier}`,true)
    assert(baseFields.get('num') && literalNumber(baseFields.get('num'),`base ${row.identifier}.num`)===row.id,`base num mismatch: ${row.id}`)
    const baseType = literalString(baseFields.get('type'),`base ${row.identifier}.type`).toLowerCase()
    const modType = modFields.has('type') ? literalString(modFields.get('type'),`mod ${row.identifier}.type`).toLowerCase() : baseType
    assert(/^(normal|fire|water|electric|grass|ice|fighting|poison|ground|flying|psychic|bug|rock|ghost|dragon|dark|steel|fairy)$/.test(modType) && source[row.name].type===modType,`type mismatch: ${row.id}`)
    const upstreamField = row.field==='power'?'basePower':'accuracy'
    const value = literalNumber(modFields.get(upstreamField),`mod ${row.identifier}.${upstreamField}`)
    assert(value===row.value,`reviewed scalar mismatch: ${row.id}.${row.field}`)
    assert(Number.isInteger(row.modLine) && row.modLine>0 && Number.isInteger(row.previous),`invalid review provenance: ${row.id}`)
    ledger.push({id:row.id,name:row.name,identifier:row.identifier,field:row.field,previous:row.previous,value,modLine:row.modLine})
  }
  assert(seen.size===18 && ledger.filter(row=>row.field==='power').length===15 && ledger.filter(row=>row.field==='accuracy').length===3,'reviewed field count mismatch')
  return {manifest,ledger}
}
