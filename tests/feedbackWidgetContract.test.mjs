import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const widgetSource = readFileSync(new URL('../src/features/feedback/FeedbackWidget.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')

const view = {
  mainSection: 'home', activeTab: 'party', sampleWorkbenchTab: 'builder',
  sampleLibraryDetailOpen: false, dexSearchMode: 'pokemon', dexDetailOpen: false,
}

let server
let FeedbackWidget

test.before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  ;({ FeedbackWidget } = await server.ssrLoadModule('/src/features/feedback/FeedbackWidget.tsx'))
})

test.after(async () => { await server?.close() })

test('App mounts exactly one global widget after the main workspace', () => {
  assert.equal((appSource.match(/<FeedbackWidget\b/g) ?? []).length, 1)
  const mainClose = appSource.lastIndexOf('</main>')
  const widget = appSource.lastIndexOf('<FeedbackWidget')
  assert.ok(mainClose >= 0 && widget > mainClose)
  assert.match(appSource.slice(widget), /mainSection[\s\S]*activeTab[\s\S]*sampleWorkbenchTab[\s\S]*dexSearchMode/)
})

test('closed launcher is localized and exposes dialog semantics without rendering a hidden dialog', () => {
  const labels = { ko: '의견 보내기', en: 'Send feedback', ja: '意見を送る' }
  for (const [language, label] of Object.entries(labels)) {
    const html = renderToStaticMarkup(React.createElement(FeedbackWidget, { language, view, endpoint: '' }))
    assert.equal((html.match(/feedback-launcher/g) ?? []).length, 1)
    assert.match(html, new RegExp(`aria-label="${label}"`))
    assert.match(html, /aria-haspopup="dialog"/)
    assert.match(html, /aria-expanded="false"/)
    assert.doesNotMatch(html, /role="dialog"/)
  }
})

test('dialog contract covers focus, escape, scroll lock, status and retry-safe draft UX', () => {
  assert.match(widgetSource, /createPortal\(/)
  assert.match(widgetSource, /role="dialog" aria-modal="true" aria-labelledby="feedback-title" aria-describedby="feedback-description"/)
  assert.match(widgetSource, /event\.key === 'Escape'/)
  assert.match(widgetSource, /event\.key !== 'Tab'/)
  assert.match(widgetSource, /document\.body\.style\.overflow = 'hidden'/)
  assert.match(widgetSource, /launcherRef\.current\?\.focus\(\)/)
  assert.match(widgetSource, /aria-busy=\{status === 'submitting'\}/)
  assert.match(widgetSource, /role="status" aria-live="polite"/)
  assert.match(widgetSource, /role="alert"/)
  assert.match(widgetSource, /if \(submittingRef\.current \|\| status === 'submitting'/)
  assert.match(widgetSource, /disabled=\{status === 'submitting'\}/)
  assert.match(widgetSource, /await postFeedback\(submittedRequest, \{ endpoint \}\)/)
  assert.match(widgetSource, /setMessage\(''\)[\s\S]*setStatus\('sent'\)/)
})

test('ordinary submissions stay inside the site and always target the relay', () => {
  assert.match(widgetSource, /VITE_FEEDBACK_ENDPOINT\?\.trim\(\) \|\| `\$\{import\.meta\.env\.BASE_URL\}api\/feedback`/)
  assert.match(widgetSource, /feedbackClipboardText\(request\(\), language\)/)
  assert.doesNotMatch(widgetSource, /if \(website\).*setStatus\('sent'\)/)
  assert.doesNotMatch(widgetSource, /github(?:\.com)?|forms\.gle|handoff|openExternal/i)
  assert.doesNotMatch(widgetSource, /target="_blank"/)
})

test('privacy disclosure is localized and feedback code does not inspect sensitive browser state', () => {
  assert.match(widgetSource, /파티·상대 정보, 메모, 검색어, 원본 URL은 보내지 않습니다/)
  assert.match(widgetSource, /Party data, notes, searches, and the original URL are never included/)
  assert.match(widgetSource, /パーティ、メモ、検索語、元のURLは送りません/)
  assert.doesNotMatch(widgetSource, /localStorage|sessionStorage|window\.location|location\.(?:href|hash|search)|navigator\.userAgent/)
})

test('overlay styles preserve layout, safe areas, mobile sheet density and layer order', () => {
  assert.match(css, /\.feedback-launcher\s*\{[\s\S]*position:\s*fixed/)
  assert.match(css, /\.feedback-launcher\s*\{[\s\S]*z-index:\s*35/)
  assert.match(css, /\.feedback-backdrop\s*\{[\s\S]*z-index:\s*1300/)
  assert.match(css, /env\(safe-area-inset-(?:right|bottom)\)/)
  assert.match(css, /@media \(max-width: 600px\)[\s\S]*\.feedback-panel[\s\S]*max-height:\s*min\(86dvh, 760px\)/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
})
