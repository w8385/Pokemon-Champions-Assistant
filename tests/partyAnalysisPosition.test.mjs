import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const source = ts.createSourceFile('App.tsx', readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const className = node => node.attributes?.properties.find(attribute => ts.isJsxAttribute(attribute) && attribute.name.text === 'className')?.initializer?.text
const children = node => ts.isJsxElement(node) ? node.children.filter(child => ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) : []
const visit = (node, result) => {
  if ((ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) && className(ts.isJsxElement(node) ? node.openingElement : node) === 'party-columns party-manage-columns') result.push(node)
  ts.forEachChild(node, child => visit(child, result))
}

test('saved party, all six editable cards, and the sole analysis panel appear in DOM order', () => {
  const containers = []
  visit(source, containers)
  assert.equal(containers.length, 1)
  const content = children(containers[0])
  const names = content.map(node => ts.isJsxElement(node) ? className(node.openingElement) : node.tagName.getText(source))
  const preset = names.indexOf('party-preset-board')
  const grid = names.indexOf('entry-grid manage-entry-grid')
  const analysis = names.indexOf('PartyAnalysisPanel')
  assert.ok(preset >= 0 && grid > preset && analysis > grid, `expected saved party → cards → analysis; got ${names.join(' → ')}`)
  assert.equal(names.filter(name => name === 'PartyAnalysisPanel').length, 1)
  const gridSource = content[grid].getText(source)
  assert.match(gridSource, /party\.map\(\(member, idx\) =>/)
  assert.match(gridSource, /id=\{`party-slot-\$\{idx\}`\} className=\{`card entry-card /)
})
