import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const card = readFileSync(new URL('../src/PokemonCardOverview.tsx', import.meta.url), 'utf8')
const sections = [app.slice(app.indexOf('const creatorCard ='), app.indexOf('return (\n    <div className="app-shell"')), app.slice(app.indexOf('registeredMoves.map('), app.indexOf('memberTopSuggestedMoves.length ?')), app.slice(app.indexOf('sampleRegisteredMoves.map('), app.indexOf('sampleMovePool?.status === \'loading\' ? <div className="move-pool-helper sample-move-pool-helper"'))]

test('one shared field owns the input; all three callers supply tooltip-bound props, not input children', () => {
  assert.match(card, /export function RegisteredMoveSlot/)
  assert.match(card, /<input\b[^>]*\{\.\.\.inputProps\}/s)
  assert.doesNotMatch(card, /children \?\? <strong/)
  assert.equal((app.match(/<RegisteredMoveSlot/g) ?? []).length, 3)
  for (const section of sections) {
    assert.match(section, /inputProps=\{\{/)
    assert.match(section, /bindTooltip\(move \? moveTooltipData\(move, siteLanguage\) : null\)/)
    assert.doesNotMatch(section, /<input\b/)
  }
  assert.match(sections[0], /readOnly: true/)
  assert.doesNotMatch(sections[0], /disabled:/)
  assert.match(sections[1], /onChange:/)
  assert.match(sections[2], /onChange:/)
})

test('ReactDOM renders the same accessible input and metadata for editable and readonly moves', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { RegisteredMoveSlot } = await server.ssrLoadModule('/src/PokemonCardOverview.tsx')
    const labels = { slot: '번', category: v => v, power: '위력', accuracy: '명중', pp: 'PP', unknown: '미확인' }
    const props = { number: 1, name: '얼음엄니', type: 'ice', meta: { category: 'physical', power: 65, accuracy: 95, pp: 15 }, labels }
    for (const inputProps of [{ readOnly: true, 'aria-label': '기술 1', 'data-tooltip': 'ice fang' }, { onChange: () => {}, placeholder: '기술 입력' }]) {
      const html = renderToStaticMarkup(React.createElement(RegisteredMoveSlot, { ...props, inputProps }))
      assert.match(html, /class="registered-move-slot/)
      assert.equal((html.match(/<input\b/g) ?? []).length, 1)
      assert.match(html, /value="얼음엄니"/)
      assert.match(html, /위력 65/)
      assert.match(html, /명중 95%/)
      if (inputProps.readOnly) { assert.match(html, /readOnly=""/); assert.doesNotMatch(html, /disabled=""/) }
    }
  } finally { await server.close() }
})

test('shared move input composes focus and blur tooltips with editor handlers', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { RegisteredMoveSlot } = await server.ssrLoadModule('/src/PokemonCardOverview.tsx')
    const calls = []
    const slot = RegisteredMoveSlot({ number: 1, name: '얼음엄니', labels: { slot: '번', category: v => v, power: '위력', accuracy: '명중', pp: 'PP', unknown: '미확인' },
      inputProps: { onFocus: () => calls.push('editor-focus'), onBlur: () => calls.push('editor-blur'), onChange: () => calls.push('editor-change') },
      tooltipProps: { onFocus: () => calls.push('tooltip-focus'), onBlur: () => calls.push('tooltip-blur'), onMouseEnter: () => calls.push('tooltip-hover') },
    })
    const input = React.Children.toArray(slot.props.children).find(child => child.type === 'input')
    input.props.onFocus({})
    input.props.onBlur({})
    assert.deepEqual(calls, ['tooltip-focus', 'editor-focus', 'tooltip-blur', 'editor-blur'])
    input.props.onMouseEnter({})
    input.props.onChange({})
    assert.deepEqual(calls, ['tooltip-focus', 'editor-focus', 'tooltip-blur', 'editor-blur', 'tooltip-hover', 'editor-change'])
  } finally { await server.close() }
})

test('creator card does not calculate actual stats or invent zero EV from incomplete evidence', () => {
  assert.match(app, /evsKnown/)
  assert.match(sections[0], /!entry\.partialBuild\?\.evsKnown/)
  assert.match(app, /showEffort=\{Boolean\(build\?\.evs \|\| entry\.partialBuild\?\.evsKnown\)\}/)
  assert.match(sections[0], /statsUnknown=\{lt\('미확인'\)\}/)
})
