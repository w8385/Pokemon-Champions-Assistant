import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const source = ts.createSourceFile('PartyView.tsx', readFileSync(new URL('../src/features/party/PartyView.tsx', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const card = readFileSync(new URL('../src/features/party/PartyMemberCard.tsx', import.meta.url), 'utf8')
const board = readFileSync(new URL('../src/features/party/PartyPresetBoard.tsx', import.meta.url), 'utf8')
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
  assert.match(app, /<PartyView\b/)
  const preset = names.indexOf('PartyPresetBoard')
  const grid = names.indexOf('entry-grid manage-entry-grid')
  const analysis = names.indexOf('PartyAnalysisPanel')
  assert.ok(preset >= 0 && grid > preset && analysis > grid, `expected saved party → cards → analysis; got ${names.join(' → ')}`)
  assert.equal(names.filter(name => name === 'PartyAnalysisPanel').length, 1)
  const gridSource = content[grid].getText(source)
  assert.match(gridSource, /party\.map\(\(member, idx\) =>/)
  assert.match(gridSource, /<PartyMemberCard\b/)
  assert.match(card, /id=\{`party-slot-\$\{idx\}`\} className=\{`card entry-card /)
  assert.match(board, /className="party-preset-board"/)
})
