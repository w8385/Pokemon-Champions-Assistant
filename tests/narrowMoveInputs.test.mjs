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
    const condition = rule.parent.type === 'atrule' && ['media', 'container'].includes(rule.parent.name) ? rule.parent.params : ''
    const max = condition.match(/\(max-width:\s*(\d+)px\)/)
    const min = condition.match(/\(min-width:\s*(\d+)px\)/)
    if ((max && width > Number(max[1])) || (min && width < Number(min[1]))) return
    rule.walkDecls('grid-template-columns', declaration => rules.push({ value: declaration.value, condition, important: Boolean(declaration.important) }))
  })
  return rules.at(-1)
}

const twoColumns = 'repeat(2, minmax(0, 1fr))'
const oneColumn = 'minmax(0, 1fr)'

test('party registered moves use the shared named-container policy and root spacing rhythm', () => {
  assert.match(view, /<PartyMemberCard\b/)
  const party = member.split('ownerId={`party-${idx}-${member.key}`}')[0]
  assert.match(party, /id=\{`party-slot-\$\{idx\}`\} className=\{`card entry-card /)
  assert.match(member, /<MoveSlotsEditor className="inline-move-card party-move-slots"[^]*?slots=\{registeredMoves\.slice\(0, 4\)\.map\(/)
  assert.match(member, /while \(registeredMoves\.length < 4\) registeredMoves\.push\(''\)/)
  assert.match(css, /\.move-slots-editor-cell\[data-empty='true'\] \.move-slots-editor-slot\.registered-move-slot\s*\{[^}]*min-height:\s*74px/)
  assert.match(css, /\.manage-entry-grid\s*\{[^}]*gap:\s*var\(--gap-card\)/)
  assert.match(css, /\.party-member-card\s*\{[^}]*gap:\s*var\(--gap-card\)[^}]*margin-bottom:\s*0/)
  for (const width of [320, 390, 479, 480, 600, 1280]) assert.equal(columnsAt('.move-slots-editor-grid', width)?.value, width < 480 ? oneColumn : twoColumns)
})

test('shared usage moves flow through two narrow rows and become a wide 5x2 grid', () => {
  assert.match(member, /<MoveUsageSuggestions label=\{lt\('사용률 상위 기술'\)\}/)

  const narrowGrid = css.match(/\.move-usage-suggestions-grid\s*\{([^}]*)\}/)?.[1] ?? ''
  assert.match(narrowGrid, /display:\s*grid/)
  assert.match(narrowGrid, /grid-template-columns:\s*none/)
  assert.match(narrowGrid, /grid-template-rows:\s*repeat\(2,\s*minmax\(36px,\s*auto\)\)/)
  assert.match(narrowGrid, /grid-auto-flow:\s*column/)
  assert.match(narrowGrid, /grid-auto-columns:\s*minmax\(128px,\s*1fr\)/)
  assert.match(narrowGrid, /overflow-x:\s*auto/)

  assert.match(css, /\.move-usage-suggestion\s*\{[^}]*min-height:\s*36px/)
  assert.match(css, /@container move-editor \(min-width:\s*560px\)\s*\{[^]*?\.move-usage-suggestions-grid\s*\{[^}]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)[^}]*grid-template-rows:\s*repeat\(2,\s*minmax\(36px,\s*auto\)\)[^}]*grid-auto-flow:\s*row[^}]*grid-auto-columns:\s*auto[^}]*overflow-x:\s*visible/)
  assert.match(css, /@media \(pointer:\s*coarse\)\s*\{[^]*?\.move-usage-suggestion\s*\{[^}]*min-height:\s*var\(--hit-target\)/)
})

test('builder registered moves use the same shared named-container policy', () => {
  const builder = app.split('id="sample-builder-section"')[1].split('{renderSampleMoveEditor()}')[0]
  assert.match(builder, /id="sample-builder-card"/)
  assert.match(app, /slots=\{sampleRegisteredMoves\.slice\(0, 4\)\.map\(\(move, moveIdx\)/)
  for (const width of [320, 390, 479, 480, 600, 1280]) assert.equal(columnsAt('.move-slots-editor-grid', width)?.value, width < 480 ? oneColumn : twoColumns)
})
