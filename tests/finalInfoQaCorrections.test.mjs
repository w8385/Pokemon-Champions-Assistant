import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { dexSelectionId } from '../src/dex/helpers.ts'
import { libraryDetailHref, libraryListHref, parseLibraryContext } from '../src/libraryViewRoute.ts'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const ast = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
function extract(name) {
  let match
  function visit(node) {
    if ((ts.isVariableDeclaration(node) || ts.isFunctionDeclaration(node)) && node.name?.getText(ast) === name) match = node
    if (!match) ts.forEachChild(node, visit)
  }
  visit(ast)
  assert.ok(match, `${name} must exist`)
  return match.getText(ast)
}
function runtime(expression, context) {
  return vm.runInNewContext(ts.transpileModule(expression, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context)
}

test('filtered library context survives real URL roundtrip and direct-detail list-return href', () => {
  const context = { language: 'ja', format: 'all', query: 'M-6', kind: 'party' }
  const detail = libraryDetailHref('blog:https://example.test/entry', context)
  const restored = parseLibraryContext(new URL(detail.slice(1), 'https://example.test').searchParams)
  assert.equal(restored.language, 'ja')
  assert.equal(restored.query, 'M-6')
  const list = libraryListHref(restored)
  assert.equal(new URL(list.slice(1), 'https://example.test').searchParams.get('libRegion'), 'ja')
  assert.equal(new URL(list.slice(1), 'https://example.test').searchParams.get('libQuery'), 'M-6')
})

test('Dex emitted cross-category detail href carries destination query for direct reload', () => {
  const context = { URLSearchParams, dexSelectionId, dexListHref: '#/dex?dexTab=pokemon&q=rotom&uq=rotom', dexSearchMode: 'pokemon', siteLanguage: 'ko', searchDisplayLabel: key => key === 'rotom' ? '로토무' : key, displayItemLabel: key => key }
  runtime(`const dexDetailHref = ${extract('dexDetailHref').split('= ').slice(1).join('= ')}; globalThis.href = dexDetailHref`, context)
  for (const [kind, key, label] of [['move', '10만볼트', '10만볼트'], ['pokemon', 'rotom', '로토무'], ['ability', 'levitate', '부유'], ['item', 'item-key', '도구']]) {
    context.dexSearchMode = kind === 'pokemon' ? 'move' : 'pokemon'
    const params = new URL(context.href(kind, key, label).slice(1), 'https://example.test').searchParams
    assert.equal(params.get('dexTab'), kind)
    assert.equal(params.get('sel'), dexSelectionId(kind, key))
    assert.equal(params.get('q'), label)
    assert.equal(params.get('uq'), label)
  }
})

test('Japanese home party eyebrow uses the actual translated label', () => {
  const context = {}
  runtime(`const ${extract('UI_TRANSLATIONS')}; ${extract('translateText')}; globalThis.translate = translateText`, context)
  assert.equal(context.translate('ja', '파티 관리'), 'パーティ管理')
  assert.equal(context.translate('en', '파티 관리'), 'Party')
  assert.equal(context.translate('ko', '파티 관리'), '파티 관리')
})

test('Dex detail cross-category chips emit native hrefs for fresh-tab navigation', () => {
  const required = ['dex-ability-', 'dex-move-chip-', 'dex-move-learner-', 'dex-ability-pokemon-']
  const found = new Map()
  function visit(node) {
    if (ts.isJsxOpeningElement(node)) {
      const text = node.getText(ast)
      for (const prefix of required) if (text.includes(prefix)) found.set(prefix, {
        tag: node.tagName.getText(ast),
        href: node.attributes.properties.some(attr => ts.isJsxAttribute(attr) && attr.name.text === 'href'),
      })
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  for (const prefix of required) assert.deepEqual(found.get(prefix), { tag: 'a', href: true }, prefix)
})
