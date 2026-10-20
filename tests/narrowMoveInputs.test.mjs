import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import postcss from 'postcss'

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
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

test('party registered moves use four full-width rows only below 360px', () => {
  const party = app.split('className="entry-grid manage-entry-grid"')[1].split('className="registered-move-grid"')[0]
  assert.match(party, /className="card entry-card"/)
  assert.match(app, /<div className="registered-move-grid">\s*\{registeredMoves\.map\(/)
  assert.match(app, /while \(registeredMoves\.length < 4\) registeredMoves\.push\(''\)/)
  const selector = '.manage-entry-grid .registered-move-grid'
  assert.deepEqual(columnsAt(selector, 320), { value: oneColumn, media: '(max-width: 359px)', important: false })
  for (const width of [390, 1280]) {
    assert.equal(columnsAt(selector, width), undefined)
    assert.equal(columnsAt('.registered-move-grid', width)?.value, twoColumns)
  }
})

test('builder registered moves use four full-width rows only below 360px', () => {
  const builder = app.split('id="sample-builder-section"')[1].split('className="registered-move-grid sample-registered-move-grid sample-track-input-grid"')[0]
  assert.match(builder, /id="sample-builder-card"/)
  assert.match(app, /\{sampleRegisteredMoves\.map\(\(move, moveIdx\) => \(/)
  const selector = '#sample-builder-section .sample-track-input-grid'
  assert.deepEqual(columnsAt(selector, 320), { value: oneColumn, media: '(max-width: 359px)', important: false })
  for (const width of [390, 1280]) {
    assert.equal(columnsAt(selector, width), undefined)
    assert.equal(columnsAt('.sample-registered-move-grid', width)?.value, twoColumns)
  }
})
