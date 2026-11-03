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
  assert.match(member, /<MoveSlotsEditor className="inline-move-card"[^]*?slots=\{registeredMoves\.slice\(0, 4\)\.map\(/)
  assert.match(member, /while \(registeredMoves\.length < 4\) registeredMoves\.push\(''\)/)
  for (const width of [320, 390, 600, 601, 1280]) assert.equal(columnsAt('.move-slots-editor-grid', width)?.value, width <= 600 ? oneColumn : twoColumns)
})

test('builder registered moves use the same shared 600px policy', () => {
  const builder = app.split('id="sample-builder-section"')[1].split('{renderSampleMoveEditor()}')[0]
  assert.match(builder, /id="sample-builder-card"/)
  assert.match(app, /slots=\{sampleRegisteredMoves\.slice\(0, 4\)\.map\(\(move, moveIdx\)/)
  for (const width of [320, 390, 600, 601, 1280]) assert.equal(columnsAt('.move-slots-editor-grid', width)?.value, width <= 600 ? oneColumn : twoColumns)
})
