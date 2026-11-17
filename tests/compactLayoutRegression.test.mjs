import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import postcss from 'postcss'

const css = [
  readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/features/single/matchupWorkspace.css', import.meta.url), 'utf8'),
].join('\n')
const root = postcss.parse(css)

function declarationsAt(selector, width) {
  const declarations = new Map()
  root.walkRules(rule => {
    if (!rule.selectors.some(part => part.trim() === selector)) return
    const media = rule.parent.type === 'atrule' && rule.parent.name === 'media' ? rule.parent.params : ''
    const max = media.match(/\(max-width:\s*(\d+)px\)/)
    const min = media.match(/\(min-width:\s*(\d+)px\)/)
    if ((max && width > Number(max[1])) || (min && width < Number(min[1]))) return
    rule.nodes?.forEach(node => {
      if (node.type === 'decl') declarations.set(node.prop, node.value)
    })
  })
  return declarations
}

test('party cards use their parent gap instead of stacking child margins', () => {
  const spacing = declarationsAt('.party-member-card > :is(.pokemon-build-fields, .inline-move-card)', 1280)
  assert.equal(spacing.get('margin-top'), '0')
})

test('mobile build fields give the item a full row', () => {
  const narrow = declarationsAt('.pokemon-build-fields > .item-meta-chip', 390)
  assert.equal(narrow.get('grid-column'), '1 / -1')
  assert.equal(declarationsAt('.pokemon-build-fields > .item-meta-chip', 391).get('grid-column'), undefined)
})

test('mobile matchup stacks the party and opponent panes at full width', () => {
  const narrow = declarationsAt('.single-workspace .unified-pair-pickers', 390)
  assert.equal(narrow.get('grid-template-columns'), 'minmax(0, 1fr)')
  assert.equal(declarationsAt('.single-workspace .unified-pair-pickers', 760).get('grid-template-columns'), 'minmax(0, 1fr)')
  assert.equal(declarationsAt('.unified-pair-pickers', 761).get('grid-template-columns'), 'repeat(2, minmax(0, 1fr))')
})

test('the sample builder keeps the shared two-column stat density on narrow screens', () => {
  const narrow = declarationsAt('#sample-builder-card .quick-compact-stat-editor .stat-preview-list', 390)
  assert.equal(narrow.get('grid-template-columns'), 'repeat(2, minmax(0, 1fr))')
  assert.equal(declarationsAt('#sample-builder-card .quick-compact-stat-editor .stat-preview-list', 391).get('grid-template-columns'), 'repeat(3, minmax(0, 1fr))')
})

test('the shared stat editor owns one tile and slider geometry in every screen', () => {
  const tile = declarationsAt('.quick-compact-stat-editor .stat-preview-row', 1280)
  const preview = declarationsAt('.quick-compact-tile-preview', 1280)
  const slider = declarationsAt('.quick-compact-effort-slider', 1280)
  const range = declarationsAt(".quick-compact-effort-bounds > input[type='range']", 1280)
  const webkitThumb = declarationsAt(".quick-compact-effort-bounds > input[type='range']::-webkit-slider-thumb", 1280)

  assert.equal(tile.get('height'), '84px')
  assert.equal(preview.get('grid-template-rows'), '30px 32px')
  assert.equal(slider.get('--effort-thumb-size'), '18px')
  assert.equal(slider.get('--effort-track-y'), '15px')
  assert.equal(slider.get('height'), '32px')
  assert.equal(range.get('height'), '32px')
  assert.equal(webkitThumb.get('margin-top'), '-7.5px')

  const screenScoped = new Set()
  root.walkRules(rule => rule.selectors.filter(selector => selector.includes('.quick-damage .quick-compact')).forEach(selector => screenScoped.add(selector)))
  assert.deepEqual([...screenScoped], ['.quick-damage .quick-compact-tile-value > small'])
})
