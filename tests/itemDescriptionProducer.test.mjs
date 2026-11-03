import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync, mkdtempSync, writeFileSync, statSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { createServer } from 'vite'
import vm from 'node:vm'
import ts from 'typescript'
import { requiredMegaStone } from '../src/domain/champions/itemIdentity.ts'
import { championsData, additionalFormSpecs } from '../src/domain/champions/effectiveRoster.ts'
import { CHAMPIONS_ITEM_OPTIONS } from '../src/domain/champions/championsItems.ts'

const root = new URL('..', import.meta.url).pathname
const fixture = JSON.parse(readFileSync(new URL('../data/item-description-primary.json', import.meta.url)))
const historic = JSON.parse(readFileSync(new URL('../data/item-description-historical.json', import.meta.url)))
const output = JSON.parse(readFileSync(new URL('../src/canonical-data/dex/dexDescriptions.json', import.meta.url)))
const keys = new Set([...CHAMPIONS_ITEM_OPTIONS, ...[...championsData.rows, ...additionalFormSpecs].map(row => requiredMegaStone(row.key)).filter(Boolean)])
const run = (...args) => spawnSync('python3', ['scripts/build_item_descriptions.py', ...args], { cwd: root, encoding: 'utf8' })

test('pinned producer checks offline and 162 identities preserve 43 historical entries', () => {
  assert.equal(keys.size, 162)
  assert.equal(fixture.records.length, 119)
  assert.deepEqual(new Set([...Object.keys(historic), ...fixture.records.map(r => r.canonicalId)]), keys)
  for (const [key, value] of Object.entries(historic)) assert.deepEqual(output.items[key], value)
  for (const row of fixture.records) {
    assert.ok(row.sourceItemId)
    const entry = output.items[row.canonicalId]
    assert.equal(entry.sourceItemId, row.sourceItemId, row.canonicalId)
    assert.equal(entry.itemId, undefined)
    for (const locale of ['ko', 'en', 'ja']) {
      assert.equal(entry.text[locale].summary, row.text[locale])
      assert.equal(entry.text[locale].detail, row.text[locale])
    }
  }
  assert.equal(Object.keys(output.items).length, 162)
  const check = run('--check')
  assert.equal(check.status, 0, check.stderr || check.stdout)
})

test('generator is byte-stable; check does not write and rejects stale/mutated inputs', () => {
  const dir = mkdtempSync(join(tmpdir(), 'item-desc-'))
  try {
    const outfile = join(dir, 'bundle.json')
    const input = readFileSync(new URL('../src/canonical-data/dex/dexDescriptions.json', import.meta.url))
    writeFileSync(outfile, input)
    const first = run('--output', outfile)
    assert.equal(first.status, 0, first.stderr)
    const second = run('--output', outfile)
    assert.equal(second.status, 0, second.stderr)
    assert.deepEqual(readFileSync(outfile), input)
    const before = statSync(outfile).mtimeMs
    assert.equal(run('--check', '--output', outfile).status, 0)
    assert.equal(statSync(outfile).mtimeMs, before)
    writeFileSync(outfile, Buffer.concat([input, Buffer.from(' ')]))
    assert.notEqual(run('--check', '--output', outfile).status, 0)
    assert.equal(statSync(outfile).size, input.length + 1)
    const originalManifest = JSON.parse(readFileSync(new URL('../data/item-description-manifest.json', import.meta.url)))
    const copied = structuredClone(fixture)
    const fixturePath = join(dir, 'fixture.json'), manifestPath = join(dir, 'manifest.json')
    const attempt = (mutation, expected) => {
      const changed = structuredClone(copied)
      mutation(changed)
      const bytes = Buffer.from(JSON.stringify(changed))
      writeFileSync(fixturePath, bytes)
      writeFileSync(manifestPath, JSON.stringify({ ...originalManifest, fixtureSha256: createHash('sha256').update(bytes).digest('hex') }))
      const result = run('--check', '--output', outfile, '--fixture', fixturePath, '--manifest', manifestPath)
      assert.notEqual(result.status, 0)
      assert.match(result.stderr, expected)
    }
    attempt(f => { f.records[0].sourceItemId = f.records[1].sourceItemId }, /duplicate|source label/i)
    attempt(f => { f.records.find(r => r.canonicalId === '후딘나이트').sourceNames.ko = '가짜나이트' }, /unapproved stone alias/i)
    attempt(f => { f.records[0].sourceNames.en = f.records[1].sourceNames.en }, /alias collision/i)
    attempt(f => { f.records[0].sourceItemId = null }, /unresolved source/i)
    writeFileSync(fixturePath, Buffer.from(JSON.stringify(copied) + ' '))
    writeFileSync(manifestPath, JSON.stringify(originalManifest))
    assert.match(run('--check', '--fixture', fixturePath, '--manifest', manifestPath).stderr, /hash mismatch/)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('actual Dex item option producer browses all required stones and searches localized aliases', () => {
  const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const ast = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  let fn
  function visit(node) { if (ts.isFunctionDeclaration(node) && node.name?.text === 'filterDexItemOptions') fn = node; ts.forEachChild(node, visit) }
  visit(ast)
  assert.ok(fn)
  const context = vm.createContext({ rows: [...championsData.rows, ...additionalFormSpecs], requiredMegaStone, CHAMPIONS_ITEM_OPTIONS,
    itemDescriptionFor: key => output.items[key] ?? null,
    displayItemLabel: key => key,
    normalizeSearchText: text => text.normalize('NFKC').toLowerCase().replace(/[^0-9a-z가-힣ぁ-んァ-ヶ一-龯]+/g, ''),
    byDisplayName: items => [...items],
  })
  vm.runInContext(ts.transpileModule(`${fn.getText(ast)};globalThis.search = filterDexItemOptions`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context)
  assert.equal(context.search('', 'ko').length, 162)
  for (const key of keys) assert.ok(context.search(key, 'ko').includes(key), key)
  assert.ok(context.search('후디나이트', 'ko').includes('후딘나이트'))
  assert.ok(context.search('Alakazite', 'en').includes('후딘나이트'))
  assert.ok(context.search('リザードナイトX', 'ja').length > 0, 'NFKC fullwidth suffix matches without removing X')
})

test('live lazy accessor reaches every canonical key and evidenced alias', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
  try {
    const { loadDexDescriptions, resolveItemInfo, itemDescriptionFor } = await server.ssrLoadModule('/src/adapters/catalog/data.ts')
    await loadDexDescriptions()
    for (const key of keys) assert.equal(itemDescriptionFor(key) ? resolveItemInfo(key)?.key : key, key)
    assert.equal(resolveItemInfo('후디나이트')?.key, '후딘나이트')
    assert.equal(resolveItemInfo('フーディナイト')?.key, '후딘나이트')
    for (const raw of ['とつげきチョッキ', '돌격조끼', 'Assault Vest']) {
      assert.equal(itemDescriptionFor(raw), null)
      assert.equal(resolveItemInfo(raw), null)
    }
  } finally { await server.close() }
})
