import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { createServer } from 'vite'

const text = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const source = ts.createSourceFile('App.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
let memo, errorFunction
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'doubleSpeedOrder') memo = node.initializer
  if (ts.isFunctionDeclaration(node) && node.name?.text === 'heldAbilityError') errorFunction = node
  ts.forEachChild(node, visit)
}
visit(source)
assert.ok(memo && errorFunction)
const roster = JSON.parse(readFileSync(new URL('../src/pokemon_champions_verified_data.json', import.meta.url))).rows

async function speedFor(ability, { trickRoom = false, tailwind = false } = {}) {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { isCalculableAbility } = await server.ssrLoadModule('/src/abilityIdentity.ts')
    const { isCalculableHeldItem } = await server.ssrLoadModule('/src/itemIdentity.ts')
    const row = roster.find(entry => entry.key === 'mega-starmie')
    const calls = []
    const context = vm.createContext({
      doubleBoardSlots: { myLeft: { row, member: { ability, item: '아쿠스타나이트' } }, myRight: null, oppLeft: null, oppRight: null },
      doubleTailwindMy: tailwind, doubleTailwindOpp: false, doubleTrickRoom: trickRoom,
      lt: value => value, siteLanguage: 'ko', displayName: row => row.name_ko,
      partySpeedValue: () => { calls.push('speed'); return 123 }, opponentSpeedValue: () => { calls.push('opponent'); return 234 },
      isCalculableAbility, isCalculableHeldItem, indexByKey: new Map(roster.map(row => [row.key, row])), rows: roster,
      abilityDescriptionFor: () => null,
    })
    const code = `${errorFunction.getText(source)}\nconst run = ${memo.arguments[0].getText(source)}; globalThis.result = run();`
    vm.runInContext(ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText, context)
    return { result: context.result.find(entry => entry.slot === 'myLeft'), calls }
  } finally { await server.close() }
}

test('actual Double speed callback rejects unknown and another form ability before computing or ordering numbers', async () => {
  for (const ability of ['legacy-ability-original', 'levitate']) {
    const { result, calls } = await speedFor(ability, { trickRoom: true, tailwind: true })
    assert.equal(result.speed, null, ability)
    assert.equal(result.effectiveSpeed, null, ability)
    assert.deepEqual(calls, [], ability)
  }
})

test('actual Double speed callback accepts explicit blank and a known localized form ability', async () => {
  for (const ability of ['', '천하장사', 'huge-power']) {
    const { result, calls } = await speedFor(ability, { tailwind: true })
    assert.equal(result.speed, 123, ability)
    assert.equal(result.effectiveSpeed, 246, ability)
    assert.deepEqual(calls, ['speed'])
  }
})

test('Double speed memo refreshes when lazy ability aliases become available', () => {
  assert.ok(memo.arguments[1].elements.some(entry => entry.getText(source) === 'asyncDataVersion'))
})
