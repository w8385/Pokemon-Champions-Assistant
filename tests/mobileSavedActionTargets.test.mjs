import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import postcss from 'postcss'

const css = postcss.parse(readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8'))
const rules = []
css.walkRules((rule) => rules.push(rule))
const declarations = (rule) => Object.fromEntries(rule.nodes.filter((node) => node.type === 'decl').map(({ prop, value }) => [prop, value]))
const selectorRule = (selector) => rules.find((rule) => rule.selector === selector)
const targets = ['.party-preset-controls button', '.party-preset-card-actions button', '.saved-sample-list button', '.sample-builder-save-button', '.sample-builder-apply-button']

test('mobile saved party and sample actions use the shared 44px main-action minimum', () => {
  const standard = selectorRule('.action-button')
  const compact = selectorRule('.pick-chip')
  assert.equal(declarations(standard)['min-height'], '44px')
  assert.equal(declarations(compact)['min-height'], '34px')
  const scoped = rules.find((rule) => targets.every((selector) => rule.selector.split(',').map((part) => part.trim()).includes(selector)))
  assert.ok(scoped, 'the five saved-action selectors need one scoped mobile override')
  assert.equal(scoped.parent.type, 'atrule')
  assert.equal(scoped.parent.name, 'media')
  assert.match(scoped.parent.params, /max-width:\s*(?:600|640)px/)
  assert.equal(declarations(scoped)['min-height'], declarations(standard)['min-height'])
  assert.ok(rules.indexOf(scoped) > rules.indexOf(compact), 'scoped target minimum must win over the later global pick-chip rule')
  assert.equal(declarations(scoped)['font-size'], undefined, 'do not shrink action labels to fit')
  assert.equal(declarations(scoped).width, undefined, 'keep existing responsive wrapping and widths')
  assert.ok(targets.every((selector) => scoped.selector.split(',').map((part) => part.trim()).includes(selector)))
  assert.ok(!scoped.selector.includes('.pick-chip'), 'do not enlarge unrelated compact chips')
  assert.equal(declarations(selectorRule('.party-preset-controls'))['flex-wrap'], 'wrap')
  assert.equal(declarations(selectorRule('.party-preset-card-actions'))['flex-wrap'], 'wrap')
  assert.equal(declarations(selectorRule('.sample-saved-actions'))['grid-template-columns'], 'auto minmax(0, 1fr) auto')
  assert.match(css.toString(), /:where\(\.action-button, \.pick-chip, \.tab-chip, \.autocomplete-item\):disabled/)
})
