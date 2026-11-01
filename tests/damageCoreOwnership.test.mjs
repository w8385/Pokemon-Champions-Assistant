import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import ts from 'typescript'

const coreUrl = new URL('../src/domain/battle/damageCore.ts', import.meta.url)
const appUrl = new URL('../src/App.tsx', import.meta.url)
const baseline = JSON.parse(readFileSync(new URL('./fixtures/damage-core-baseline.json', import.meta.url), 'utf8'))

function declarations(url) {
  const source = ts.createSourceFile(url.pathname, readFileSync(url, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  return { source, names: new Map(source.statements.filter(ts.isFunctionDeclaration).map(node => [node.name?.text, node])) }
}

test('real damage core owns identical frozen function bodies; App calls its actual exports', async () => {
  assert.ok(existsSync(coreUrl), 'damageCore.ts is absent: extraction not implemented yet')
  const { source, names } = declarations(coreUrl)
  const app = declarations(appUrl)
  const coreText = readFileSync(coreUrl, 'utf8')
  const appText = readFileSync(appUrl, 'utf8')
  assert.match(coreText, /const DAMAGE_MOD_SCALE = 4096/)
  for (const [name, frozen] of Object.entries(baseline.functions)) {
    assert.ok(names.has(name), `missing actual implementation: ${name}`)
    assert.equal(createHash('sha256').update(names.get(name).body.getText(source)).digest('hex'), frozen.bodySHA256, `${name} changed its formula`)
    assert.ok(!app.names.has(name), `duplicate App implementation: ${name}`)
  }
  assert.match(appText, /import \{[^}]*calcDamage[^}]*\} from '\.\/domain\/battle\/damageCore'/)
  const { calcDamage, engineMovePower, chainMods, DAMAGE_MOD_SCALE } = await import(coreUrl.href)
  assert.equal(typeof calcDamage, 'function')
  assert.equal(engineMovePower(65, 1.5), 97)
  assert.equal(chainMods([4096]), 4096)
  assert.equal(DAMAGE_MOD_SCALE, 4096)
  for (const [id, ...args] of baseline.cases) assert.deepEqual(calcDamage(baseline.stats, baseline.stats, ...args), baseline.outcomes[id], id)
})
