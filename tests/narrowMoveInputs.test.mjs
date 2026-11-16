import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import postcss from 'postcss'

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const member = readFileSync(new URL('../src/features/party/PartyMemberCard.tsx', import.meta.url), 'utf8'), view = readFileSync(new URL('../src/features/party/PartyView.tsx', import.meta.url), 'utf8')
const root = postcss.parse(css)

function columnsAt(selector, width) {
  const rules = []
  root.walkRules(rule => {
    if (!rule.selector.split(',').some(part => part.trim() === selector)) return
    const media = rule.parent.type === 'atrule' && rule.parent.name === 'media' ? rule.parent.params : ''
    const max = media.match(/\(max-width:\s*(\d+)px\)/)
    const min = media.match(/\(min-width:\s*(\d+)px\)/)
    if ((max && width > Number(max[1])) || (min && width < Number(min[1]))) return
    rule.walkDecls('grid-template-columns', declaration => rules.push({ value: declaration.value, media, important: Boolean(declaration.important) }))
  })
  return rules.at(-1)
}

const twoColumns = 'repeat(2, minmax(0, 1fr))'
const oneColumn = 'minmax(0, 1fr)'

test('party registered moves use the shared 600px policy', () => {
  assert.match(view, /<PartyMemberCard\b/)
  const party = member.split('ownerId={`party-${idx}-${member.key}`}')[0]
  assert.match(party, /id=\{`party-slot-\$\{idx\}`\} className=\{`card entry-card /)
  assert.match(member, /<MoveSlotsEditor className="inline-move-card party-move-slots"[^]*?slots=\{registeredMoves\.slice\(0, 4\)\.map\(/)
  assert.match(member, /while \(registeredMoves\.length < 4\) registeredMoves\.push\(''\)/)
  assert.match(css, /\.party-member-card \.party-move-slots \.move-slots-editor-cell\[data-empty='true'\][^}]*min-height:\s*72px/)
  for (const width of [320, 390, 600, 601, 1280]) assert.equal(columnsAt('.move-slots-editor-grid', width)?.value, width <= 600 ? oneColumn : twoColumns)
})

test('party usage moves flow sequentially through two mobile rows and become a wide 5x2 grid', () => {
  assert.match(member, /className="move-chip-wrap party-top-move-grid"/)

  const narrowGrid = css.match(/\.party-member-card \.top-move-chip-card \.party-top-move-grid\s*\{([^}]*)\}/)?.[1] ?? ''
  assert.match(narrowGrid, /display:\s*grid/)
  assert.match(narrowGrid, /grid-template-columns:\s*none/)
  assert.match(narrowGrid, /grid-template-rows:\s*repeat\(2,\s*minmax\(36px,\s*auto\)\)/)
  assert.match(narrowGrid, /grid-auto-flow:\s*column/)
  assert.match(narrowGrid, /grid-auto-columns:\s*minmax\(120px,\s*1fr\)/)
  assert.match(narrowGrid, /overflow-x:\s*auto/)

  assert.match(css, /\.party-member-card \.top-move-chip-card \.party-top-move-grid \.move-chip\s*\{[^}]*min-height:\s*36px/)
  assert.match(css, /@container party-member \(min-width:\s*560px\)\s*\{[^]*?\.party-member-card \.top-move-chip-card \.party-top-move-grid\s*\{[^}]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)[^}]*grid-auto-flow:\s*row[^}]*grid-auto-columns:\s*auto[^}]*overflow-x:\s*visible/)
})

test('builder registered moves use the same shared 600px policy', () => {
  const builder = app.split('id="sample-builder-section"')[1].split('{renderSampleMoveEditor()}')[0]
  assert.match(builder, /id="sample-builder-card"/)
  assert.match(app, /slots=\{sampleRegisteredMoves\.slice\(0, 4\)\.map\(\(move, moveIdx\)/)
  for (const width of [320, 390, 600, 601, 1280]) assert.equal(columnsAt('.move-slots-editor-grid', width)?.value, width <= 600 ? oneColumn : twoColumns)
})
