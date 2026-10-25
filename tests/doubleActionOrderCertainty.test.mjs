import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { createServer } from 'vite'

const text = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const source = ts.createSourceFile('App.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
let memo, preview, notice
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'doubleActionOrder') memo = node.initializer
  if (ts.isCallExpression(node) && node.expression.getText(source) === 'doubleActionOrder.map' && node.getText(source).includes('double-speed-preview-item')) preview = node
  if (ts.isConditionalExpression(node) && node.getText(source).includes("lt('전체 행동순 미확인 · 속도 미확인 포켓몬이 있어 슬롯 순서로 표시합니다.')")) notice = node
  ts.forEachChild(node, visit)
}
visit(source)
assert.ok(memo && preview && notice)

const slots = ['myLeft', 'myRight', 'oppLeft', 'oppRight']
const makeMeta = (occupied) => Object.fromEntries(slots.map(slot => [slot, {
  side: slot.startsWith('my') ? 'my' : 'opp', label: slot,
  option: occupied[slot] ? { row: { key: slot, name: slot }, member: { key: slot } } : null,
}]))
const transpile = (code, jsx = false) => ts.transpileModule(code, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None,
  jsx: jsx ? ts.JsxEmit.React : undefined,
} }).outputText
function textOf(node) {
  if (node == null || typeof node === 'boolean') return ''
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (typeof node !== 'object') return String(node)
  return textOf(node.children)
}

async function actualOrder(occupied, speeds, trickRoom = false) {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { presentDoubleActionOrder } = await server.ssrLoadModule('/src/doubleOrderPresentation.ts')
    const context = vm.createContext({
      doubleSlotMeta: makeMeta(occupied), doubleActionOptionsBySlot: {}, doubleActionMoveBySlot: {},
      doubleSpeedBySlot: speeds, doubleTrickRoom: trickRoom, siteLanguage: 'ko', lt: value => value,
      displayName: row => row.name, choicesForPool: () => [], movePoolByKey: {},
      resolveMoveMeta: () => null, lookupMoveMeta: () => null, presentDoubleActionOrder,
    })
    vm.runInContext(`${transpile(`const run = ${memo.arguments[0].getText(source)}; globalThis.order = run();`)}\n`, context)
    const React = { createElement: (tag, props, ...children) => ({ tag, props, children }) }
    Object.assign(context, { React, doubleActionOrder: context.order })
    vm.runInContext(`${transpile(`globalThis.preview = ${preview.getText(source)}`, true)}\n`, context)
    vm.runInContext(`${transpile(`globalThis.notice = ${notice.getText(source)}`, true)}\n`, context)
    return { order: context.order, labels: context.preview.map(row => textOf(row.children[0])), speeds: context.preview.map(row => textOf(row.children[2])), notice: textOf(context.notice) }
  } finally { await server.close() }
}

test('occupied unknown Speed removes every overall rank and does not present a guessed partial order', async () => {
  const result = await actualOrder({ myLeft: true, myRight: true, oppLeft: true }, { myLeft: 150, myRight: null, oppLeft: 90 })
  assert.deepEqual(Array.from(result.order, entry => entry.slot), slots) // board order, not a fabricated speed order
  assert.deepEqual(Array.from(result.order, entry => entry.rank), [null, null, null, null])
  assert.ok(result.labels.every(label => !/\d+순위/.test(label)), result.labels.join(', '))
  assert.deepEqual(Array.from(result.speeds), ['150', '—', '90', '—'])
  assert.match(result.notice, /전체 행동순 미확인/)
})

test('known participating Speeds retain ordered ranks despite unselected board positions', async () => {
  const result = await actualOrder({ myLeft: true, oppLeft: true }, { myLeft: 90, myRight: null, oppLeft: 150, oppRight: null })
  assert.deepEqual(Array.from(result.order.filter(entry => entry.occupied), entry => entry.slot), ['oppLeft', 'myLeft'])
  assert.deepEqual(Array.from(result.order.filter(entry => entry.occupied), entry => entry.rank), [1, 2])
  assert.ok(result.labels.some(label => label.includes('1순위')))
  assert.ok(result.labels.some(label => label.includes('2순위')))
  assert.equal(result.labels.filter(label => /\d+순위/.test(label)).length, 2)
  assert.equal(result.notice, '')
})

test('repairing an unknown Speed restores normal and Trick Room ranks', async () => {
  for (const trickRoom of [false, true]) {
    const result = await actualOrder({ myLeft: true, oppLeft: true }, { myLeft: 90, oppLeft: 150 }, trickRoom)
    assert.deepEqual(Array.from(result.order.filter(entry => entry.occupied), entry => entry.slot), trickRoom ? ['myLeft', 'oppLeft'] : ['oppLeft', 'myLeft'])
    assert.deepEqual(Array.from(result.order.filter(entry => entry.occupied), entry => entry.rank), [1, 2])
  }
})
