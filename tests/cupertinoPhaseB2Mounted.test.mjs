import test from 'node:test'
import assert from 'node:assert/strict'
import React, { act } from 'react'
import { Window } from 'happy-dom'
import { createServer } from 'vite'
import { readFileSync } from 'node:fs'

const browser = new Window({ url: 'http://localhost/' })
Object.assign(globalThis, { window: browser, document: browser.document, HTMLElement: browser.HTMLElement, Element: browser.Element, IS_REACT_ACT_ENVIRONMENT: true })
const { createRoot } = await import('react-dom/client')
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
const { DamageRangeMeter } = await server.ssrLoadModule('/src/DamageRangeMeter.tsx')
test.after(async () => { await server.close(); await browser.happyDOM.abort() })
async function mount(element) {
  const host = document.createElement('div'); document.body.append(host)
  const root = createRoot(host)
  await act(async () => root.render(element))
  return { host, async cleanup() { await act(async () => root.unmount()); host.remove() } }
}

test('real mounted damage meter uses a common 0–100 HP axis, exact numbers and truthful a11y', async () => {
  const m = await mount(React.createElement(DamageRangeMeter, { damage: { min: 0, max: 0, minPct: '0.0', maxPct: '0.0' }, targetHp: 100, language: 'ko' }))
  assert.equal(m.host.querySelector('.damage-range-axis'), null, 'immune/zero must not show a false bar')
  assert.match(m.host.textContent, /0–0/)
  for (const [damage, hp, minWidth, maxWidth, label] of [
    [{ min: 0, max: 25, minPct: '0.0', maxPct: '25.0' }, 100, '0%', '25%', /대상 HP 100.*0.0–25.0%/],
    [{ min: 40, max: 140, minPct: '40.0', maxPct: '140.0' }, 100, '40%', '100%', /40.0–140.0%/],
  ]) {
    const next = await mount(React.createElement(DamageRangeMeter, { damage, targetHp: hp, language: 'ko' }))
    assert.equal(next.host.querySelector('.damage-range-solid').style.width, minWidth)
    assert.equal(next.host.querySelector('.damage-range-remainder').style.width, maxWidth)
    assert.match(next.host.querySelector('.damage-range-meter').getAttribute('aria-label'), label)
    assert.match(next.host.textContent, new RegExp(`${damage.min}–${damage.max}`))
    await next.cleanup()
  }
  await m.cleanup()
})

test('invalid and unsupported values cannot draw numeric bars', async () => {
  for (const [damage, hp] of [[null, 100], [{ min: 10, max: 20, minPct: '', maxPct: '20.0' }, 100], [{ min: 10, max: 20, minPct: '10.0', maxPct: ' ' }, 100], [{ min: NaN, max: 25, minPct: 'NaN', maxPct: '25.0' }, 100], [{ min: 10, max: 20, minPct: '10.0', maxPct: '20.0' }, 0], [{ min: 30, max: 20, minPct: '30.0', maxPct: '20.0' }, 100]]) {
    const mounted = await mount(React.createElement(DamageRangeMeter, { damage, targetHp: hp, language: 'en' }))
    assert.equal(mounted.host.querySelector('.damage-range-axis'), null)
    assert.equal(mounted.host.querySelector('.damage-range-meter'), null, 'invalid data must not render NaN or misleading numeric labels')
    await mounted.cleanup()
  }
})

test('all eight destinations retain concrete source consumers, not just heading icons', () => {
  const src = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const detail = readFileSync(new URL('../src/SpeedLinePanel.tsx', import.meta.url), 'utf8')
  const ranges = readFileSync(new URL('../src/SpeedLineRangesPanel.tsx', import.meta.url), 'utf8')
  for (const marker of ['home-route-card calm', 'party-preset-card-actions', 'entry-card-clear-button', 'quick-move-preview', 'creator-library-submit-row', 'sample-saved-actions', 'dex-back-link', '샘플 편집기로 보내기']) assert.ok(src.includes(marker), marker)
  for (const marker of ['speed-line-name-action', 'name="speed"', 'speed-line-investment']) assert.ok(detail.includes(marker), marker)
  for (const marker of ['speed-coverage-target-search', 'speed-coverage-target-list', 'name="search"']) assert.ok(ranges.includes(marker), marker)
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
  assert.match(css, /\.sample-builder-save-button,\s*\.sample-builder-apply-button\s*\{[^}]*min-height: 44px/)
  assert.match(css, /\.party-preset-grid\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\)/)
  assert.match(css, /\.party-preset-card\s*\{[^}]*min-height: 64px/)
  assert.match(src, /aria-label=\{`\$\{preset\.label\}: \$\{lt\('저장 파티 삭제'\)\}`\}/)
  assert.doesNotMatch(src, /className="app-data-notice"/)
  assert.doesNotMatch(src, /ready: '폼별 기술 · 2026-09-09/)
})

test('actual Quick and sample bilateral consumers share the visual without replacing action handlers', () => {
  const src = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  assert.match(src, /quick-move-preview[\s\S]*?<DamageRangeMeter[^>]*damage=\{preview\.damage\}/)
  assert.match(src, /className=\{`quick-result[\s\S]*?<DamageRangeMeter[^>]*damage=\{result\.damage\}/)
  assert.match(src, /entry\.forwardMoves\.find[\s\S]*?<DamageRangeMeter[^>]*damage=\{result\.damage\}/)
  assert.match(src, /entry\.reverseMoves\.find[\s\S]*?<DamageRangeMeter[^>]*damage=\{result\.damage\}/)
  assert.match(src, /onClick=\{\(\) => setSelected\(\{ side, index \}\)\}/)
  assert.match(src, /onClick=\{\(\) => renamePartyPreset\(preset\)\}/)
  assert.match(src, /if \(!window\.confirm\(`\$\{preset\.label\}: \$\{lt\('저장 파티 삭제'\)\}\?`\)\) return/)
  assert.match(src, /onClick=\{\(\) => confirmPartySlotReplacement\(entry\.member, selectedMy, entry\.lockedMoves\)\}/)
  assert.match(src, /onClick=\{\(\) => setCreatorLinkDrafts\(\(prev\) => prev\.filter\(\(entry\) => entry\.sourceUrl !== draft\.sourceUrl\)\)\}/)
})
