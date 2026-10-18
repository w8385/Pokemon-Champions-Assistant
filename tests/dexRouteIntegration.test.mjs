import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const ast = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
function declarations(name) {
  const found = []
  function visit(node) {
    if ((ts.isVariableDeclaration(node) || ts.isFunctionDeclaration(node)) && node.name?.getText(ast) === name) found.push(node.getText(ast))
    ts.forEachChild(node, visit)
  }
  visit(ast)
  return found.join('\n')
}
const dexStart = source.indexOf("{mainSection === 'dex' ? <>")
const dexEnd = source.indexOf("{(mainSection === 'single'", dexStart)
const dex = source.slice(dexStart, dexEnd)

test('unselected Dex renders the actual one grid instead of old duplicate result buttons', () => {
  assert.match(dex, /<DexBrowseGrid\b/)
  assert.doesNotMatch(dex, /dexSpeciesOptions\.map\(\(option\) => \{\s*const row/)
  assert.match(dex, /!dexSelectedValue\s*\?/)
  assert.doesNotMatch(declarations('dexResultKeys'), /setDexSelectedValue\(dexResultKeys\[0\]\)/)
})
test('selected Dex renders original four detail panels with back and full form-aware pool', () => {
  assert.match(dex, /dexSelectedValue\s*\?\s*</)
  assert.match(dex, /dex-detail-card/)
  assert.match(dex, /<DexMovePoolSection\b/)
  assert.match(dex, /href=\{dexListHref\}/)
  assert.match(source, /loadDexGameLearnset\(key\)\.then\(result/)
  // Battle callers keep their original resolver; Dex uses the independently dated game snapshot.
  assert.match(declarations('embeddedMovePoolForKey'), /resolveFormAwareMovePool\(key, relatedMovePoolKeys\(key\), embeddedMovePools\)/)
  assert.match(dex, /provenance=\{dexSelectedPool\?\.provenance\}/)
})
test('explicit selection resolves independently of current search results and no automatic first selection', () => {
  assert.doesNotMatch(source.slice(source.indexOf('const dexSelectedAllResult'), source.indexOf('const dexTopMoves')), /dexQueryPending \? null/)
  assert.doesNotMatch(source.slice(source.indexOf('const dexSelectedAllResult'), source.indexOf('const dexTopMoves')), /dexAbilityOptions\.find/)
  assert.doesNotMatch(source.slice(source.indexOf('const dexSelectedAllResult'), source.indexOf('const dexTopMoves')), /dexMoveOptions\.find/)
  assert.doesNotMatch(source.slice(source.indexOf('const dexSelectedAllResult'), source.indexOf('const dexTopMoves')), /dexSelectedValue\s*\?\s*dexSelectedValue/)
  assert.doesNotMatch(source.slice(source.indexOf('const dexResultKeys'), source.indexOf('const openDexPokemonDetail')), /setDexSelectedValue\(dexResultKeys\[0\]\)/)
})
