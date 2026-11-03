import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultSpeedLineState, parseSpeedLineState, writeSpeedLineState } from '../src/features/speedline/speedLineState.ts'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const roster = [
  { key: 'slow', speed: 50, name_ko: '느림', name_en: 'Slow', types: [] },
  { key: 'odd', speed: 100, name_ko: '홀수', name_en: 'Odd', types: [] },
  { key: 'mega-odd', speed: 130, name_ko: '메가홀수', name_en: 'Mega Odd', types: [] },
  { key: 'mega-absol-z', speed: 151, name_ko: 'Z메가', name_en: 'Z Mega', types: [] },
]
test('fresh and legacy coverage URLs normalize to individual detail without losing conditions', () => {
  assert.equal(defaultSpeedLineState.view, 'detail')
  const legacy = parseSpeedLineState(new URLSearchParams('slv=3&view=ranges&ref=odd&refEp=0&refNature=neutral&refStage=2&target=slow&targetItem=scarf&targetAbility=swift-swim&items=both&abilities=conditions&q=target&forms=nonMega&cmp=equal&sort=asc&range=around&gap=9&listEp=4&listNature=lower'))
  assert.equal(legacy.state.view, 'detail')
  assert.deepEqual(legacy.warnings, [])
  assert.equal(legacy.state.referenceEffort, 0)
  assert.equal(legacy.state.referenceNature, 'neutral')
  assert.equal(legacy.state.referenceStage, 2)
  assert.equal(legacy.state.targetItem, 'scarf')
  assert.equal(legacy.state.targetAbility, 'swift-swim')
  assert.equal(legacy.state.items, 'both')
  assert.equal(legacy.state.query, 'target')
  assert.equal(legacy.state.listEffort, 4)
  const params = new URLSearchParams()
  writeSpeedLineState(params, legacy.state)
  assert.equal(params.get('view'), 'detail')
  assert.deepEqual(parseSpeedLineState(params).state, legacy.state)
  const oldState = { ...legacy.state, view: 'ranges' }
  writeSpeedLineState(params, oldState)
  assert.equal(params.get('view'), 'detail')
  assert.deepEqual(parseSpeedLineState(params).state, legacy.state)
})
let server, Panel
test.before(async () => { server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } }); Panel = (await server.ssrLoadModule('/src/features/speedline/SpeedLinePanel.tsx')).default })
test.after(async () => { await server?.close() })
const render = (patch = {}, warnings = []) => renderToStaticMarkup(React.createElement(Panel, { rows: roster, state: { ...defaultSpeedLineState, ...patch }, onChange() {}, language: 'ko', translate: x => x, displayName: x => x.name_ko, warnings }))
test('fresh individual mode selects no Scarf; legacy ranges state renders the same detail without mode switch', () => {
  const html = render({ referenceKey: 'odd', view: 'ranges' })
  assert.match(html, /구애스카프<select[^>]*><option value="both">미적용·적용 모두<\/option><option value="normal" selected="">미적용<\/option>/)
  assert.match(html, /data-variant="normal"/)
  assert.doesNotMatch(html, /data-variant="scarf"|추월컷 커버리지|speed-line-view-switch|speed-coverage-table/)
  assert.match(render({ referenceKey: 'odd', items: 'both' }), /data-variant="scarf"/)
})
test('legacy filters and invalid URLs remain visible in individual mode', () => {
  const parsed = parseSpeedLineState(new URLSearchParams('view=ranges&ref=odd&refEp=77&refAbility=bogus&items=scarf&abilities=off'))
  assert.deepEqual(parsed.warnings, ['refEp', 'refAbility'])
  const html = render(parsed.state, parsed.warnings)
  assert.match(html, /refEp, refAbility/)
  assert.match(html, /bogus/)
  assert.match(html, /선택한 특성이 이 폼에 없습니다/)
  assert.doesNotMatch(html, /speed-coverage-table|speed-line-view-switch/)
})
test('unknown reference and forbidden Scarf target retain repair path', () => {
  assert.match(render({ referenceKey: 'missing' }), /missing/)
  const html = render({ referenceKey: 'odd', targetKey: 'mega-absol-z', targetItem: 'scarf' })
  assert.match(html, /구애스카프 미적용으로 바꾸기/)
  assert.doesNotMatch(html, /speed-coverage-table/)
})
