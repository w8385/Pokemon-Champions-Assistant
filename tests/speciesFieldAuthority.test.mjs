import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'
import { createServer } from 'vite'
import { championsData, additionalFormSpecs, supportedSpeciesKeys } from '../src/effectiveRoster.ts'
import { actualStat } from '../src/statMechanics.ts'
import { applyChoiceScarf } from '../src/speedModifiers.ts'

const root = path.resolve(new URL('..', import.meta.url).pathname)
const source = file => fs.readFile(path.join(root, file), 'utf8')
const stats = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed']
const fields = ['name_ko', 'name_en', 'name_ja', 'types', ...stats]
const derived = ['fast', 'neutral', 'uninvested', 'scarf_fast', 'scarf_neutral']
const keys = rows => new Set(rows.map(row => row.key))
const sorted = set => [...set].sort()
const backup = key => ({ version: 1, party: [{ key }], opponents: [] })
function assertTypeLabels(row) {
  assert.deepEqual(row.types_ko, row.types.map(type => {
    assert.ok(Object.hasOwn(typeLabels, type), `${row.key}: unknown type ${type}`)
    return typeLabels[type]
  }), `${row.key} type labels`)
}
let server, app, validateBackup, typeLabels

test.before(async () => {
  typeLabels = JSON.parse(await source('src/typeKoLabels.json'))
  server = await createServer({ root, server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent', plugins: [{ name: 'test-export-real-app-roster', enforce: 'pre', transform(code, id) {
    if (path.resolve(id) === path.join(root, 'src/App.tsx')) return `${code}\nexport { rows as authorityRows, indexByKey as authorityIndex, megaBaseKey as authorityMegaBaseKey, filterSpeciesOptions as authoritySearch };`
  } }] })
  app = await server.ssrLoadModule('/src/App.tsx')
  ;({ validateBackup } = await server.ssrLoadModule('/src/backupValidation.ts'))
})
test.after(async () => { await server?.close() })

test('both actual KO label producers consume the same 18-entry input and generator buildRow uses it', async () => {
  const appText = await source('src/App.tsx'), generatorText = await source('scripts/sync-champions-verified-data.mjs')
  assert.match(appText, /import typeKoLabels from ['"]\.\/typeKoLabels\.json['"]/)
  assert.match(appText, /const TYPE_KO_BY_KEY: Record<string, string> = typeKoLabels/)
  assert.match(generatorText, /JSON\.parse\(await fs\.readFile\(path\.join\(root, 'src', 'typeKoLabels\.json'\), 'utf8'\)\)/)
  assert.equal(Object.keys(typeLabels).length, 18)
  assert.deepEqual(sorted(new Set(Object.keys(typeLabels))), sorted(new Set(['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'])))
  assert.equal(new Set(Object.values(typeLabels)).size, 18)
  const ast = ts.createSourceFile('generator.mjs', generatorText, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
  const functions = ['actualStat', 'speedTemplate', 'buildRow'].map(name => {
    const node = ast.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name)
    assert.ok(node, `generator ${name}`)
    return node.getText(ast)
  }).join('\n')
  const generatorBuildRow = vm.runInNewContext(`const CHAMPIONS_EFFORT_PER_STAT_CAP = 32;\n${functions}\nbuildRow`, { TYPE_KO_BY_KEY: typeLabels, Math })
  const fixture = { id: 9, key: 'fixture', canonicalFormSlug: 'base', name_ko: '검사용', name_en: 'Fixture', name_ja: 'テスト', types: Object.keys(typeLabels), abilities: [], abilities_ko: [], stats: { hp: 50, attack: 65, defense: 107, spAttack: 105, spDefense: 107, speed: 86 }, sprite: null, sprite_status: 'fixture' }
  const generated = generatorBuildRow(fixture)
  assert.deepEqual(Array.from(generated.types_ko), Object.values(typeLabels))
  assert.equal(generated.fast, actualStat(86, 32, 1.1))
})

test('real App index, rendered 332+9 forms, accepted backup keys and form fields have the same identities', () => {
  const { authorityRows: rows, authorityIndex: index } = app
  assert.equal(championsData.rows.length, 332)
  assert.equal(additionalFormSpecs.length, 9)
  assert.equal(rows.length, 341)
  assert.equal(index.size, 341)
  const baseKeys = keys(championsData.rows), extraKeys = keys(additionalFormSpecs), actualKeys = keys(rows)
  assert.equal(baseKeys.size, 332)
  assert.equal(extraKeys.size, 9)
  assert.equal(actualKeys.size, 341)
  assert.deepEqual(sorted(actualKeys), sorted(supportedSpeciesKeys))
  assert.deepEqual(sorted(index.keys()), sorted(actualKeys))
  assert.equal([...baseKeys].filter(key => extraKeys.has(key)).length, 0)
  const originals = new Map([...championsData.rows, ...additionalFormSpecs].map(row => [row.key, row]))
  for (const row of rows) {
    assert.strictEqual(index.get(row.key), row, `${row.key} App index identity`)
    assert.deepEqual(validateBackup(backup(row.key)), backup(row.key), `${row.key} backup accepted`)
    const original = originals.get(row.key)
    for (const field of fields) assert.deepEqual(row[field], original[field], `${row.key}.${field}`)
    if (extraKeys.has(row.key)) {
      const base = index.get(row.key.split('-')[0])
      assert.ok(base, `${row.key} base`)
      for (const field of ['abilities', 'abilities_ko']) assert.deepEqual(row[field], base[field], `${row.key}.${field} inherited`)
      assert.notStrictEqual(row, base, `${row.key} owns separate row`)
    }
  }
  assert.deepEqual(validateBackup(backup('')), backup(''))
  assert.throws(() => validateBackup(backup('__unknown_form__')), /backup/i)
  for (const key of ['rotom-heat','rotom-wash','rotom-frost','rotom-fan','rotom-mow','gourgeist-small','gourgeist-average','gourgeist-large','gourgeist-super','mega-charizard-x','mega-raichu-y','mega-garchomp-z','mega-floette','floette-eternal-flower']) {
    assert.ok(index.has(key), key)
    assert.ok(app.authoritySearch(key, { includeMega: true, allowLoose: false }).some(row => row.key === key), `${key} exact search`)
  }
  assert.equal(app.authorityMegaBaseKey('mega-garchomp-z'), 'garchomp')
  assert.deepEqual(stats.map(stat => index.get('mega-floette')[stat]), [74,85,87,155,148,102])
  assert.deepEqual(stats.map(stat => index.get('floette-eternal-flower')[stat]), [74,65,67,125,128,92])
})

test('every rendered type label and 1705 cached Speed values follow the shared label input and existing mechanics', () => {
  const rows = app.authorityRows
  assert.equal(rows.length * derived.length, 1705)
  for (const row of rows) {
    assertTypeLabels(row)
    const neutral = actualStat(row.speed, 32)
    const fast = actualStat(row.speed, 32, 1.1)
    const expected = [fast, neutral, actualStat(row.speed, 0), applyChoiceScarf(fast), applyChoiceScarf(neutral)]
    for (const [i, field] of derived.entries()) assert.equal(row[field], expected[i], `${row.key}.${field}`)
  }
  const changed = { ...app.authorityIndex.get('rotom-wash'), types_ko: ['잘못된 라벨'] }
  assert.throws(() => assertTypeLabels(changed), /rotom-wash type labels/, 'copied row mutation must be detected without changing catalog')
})

test('exact-form learnsets remain a 339 mapped + 2 unresolved partition, not a new roster supplier', async () => {
  const { forms, unresolved } = JSON.parse(await source('src/dexGameLearnsets.json'))
  const mapped = new Set(Object.keys(forms)), unknown = new Set(Object.keys(unresolved))
  assert.equal(mapped.size, 339)
  assert.deepEqual(sorted(unknown), ['mega-meowstic', 'tauros-paldean'])
  assert.equal([...mapped].filter(key => unknown.has(key)).length, 0)
  assert.deepEqual(sorted(new Set([...mapped, ...unknown])), sorted(keys(app.authorityRows)))
})
