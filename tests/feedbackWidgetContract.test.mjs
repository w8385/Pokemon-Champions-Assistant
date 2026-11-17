import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import React, { act } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Window } from 'happy-dom'

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const widgetSource = readFileSync(new URL('../src/features/feedback/FeedbackWidget.tsx', import.meta.url), 'utf8')
const screenshotSource = readFileSync(new URL('../src/features/feedback/feedbackScreenshot.ts', import.meta.url), 'utf8')
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
  assert.match(widgetSource, /await postFeedback\(submittedRequest, \{ endpoint, screenshot: screenshot\?\.blob \}\)/)
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
  assert.match(widgetSource, /입력 데이터와 원본 URL은 이 정보에 포함하지 않습니다/)
  assert.match(widgetSource, /Input data and the original URL are not included in these details/)
  assert.match(widgetSource, /入力データと元のURLはこの情報に含まれません/)
  assert.match(widgetSource, /화면에 보이는 파티·상대·입력 내용이 포함될 수 있어요/)
  assert.match(widgetSource, /Visible party, opponent, and input data may be included/)
  assert.match(widgetSource, /表示中のパーティ、相手、入力内容が含まれる場合があります/)
  assert.doesNotMatch(widgetSource, /localStorage|sessionStorage|window\.location|location\.(?:href|hash|search)|navigator\.userAgent/)
})

test('screen capture is lazy, bounded, previewable and removable before multipart submission', () => {
  assert.match(screenshotSource, /await import\('html2canvas-pro'\)/)
  assert.match(screenshotSource, /MAX_FEEDBACK_SCREENSHOT_BYTES = 1_800_000/)
  assert.match(screenshotSource, /ignoreElements: element => element\.hasAttribute\('data-feedback-capture-exclude'\)/)
  assert.match(screenshotSource, /signal\?: AbortSignal/)
  assert.match(screenshotSource, /signal,/)
  assert.ok((widgetSource.match(/data-feedback-capture-exclude=""/g) ?? []).length >= 2)
  assert.match(widgetSource, /className="feedback-screenshot-preview"/)
  assert.match(widgetSource, /onClick=\{screenshotStatus === 'capturing' \|\| screenshotStatus === 'ready' \? removeScreenshot : recaptureScreenshot\}/)
  assert.match(widgetSource, /feedback-screenshot-status[^]*?role="status" aria-live="polite"/)
  assert.doesNotMatch(widgetSource, /className="feedback-screenshot-state" role="status"/)
  assert.match(widgetSource, /window\.URL\.revokeObjectURL/)
  assert.match(widgetSource, /screenshotStatus === 'capturing'/)
  assert.match(widgetSource, /screenshotAbortRef\.current\?\.abort\(\)/)
  assert.match(widgetSource, /screenshotStatusRef\.current !== 'removed'/)
  assert.match(css, /\.feedback-screenshot-preview\s*\{[^}]*grid-template-columns:/)
  assert.match(css, /\.feedback-screenshot-preview > img\s*\{[^}]*object-fit:\s*contain/)
})

test('overlay styles preserve layout, safe areas, mobile sheet density and layer order', () => {
  assert.match(css, /\.feedback-launcher\s*\{[\s\S]*position:\s*fixed/)
  assert.match(css, /\.feedback-launcher\s*\{[\s\S]*z-index:\s*35/)
  assert.match(css, /\.feedback-backdrop\s*\{[\s\S]*z-index:\s*1300/)
  assert.match(css, /env\(safe-area-inset-(?:right|bottom)\)/)
  assert.match(css, /@media \(max-width: 600px\)[\s\S]*\.feedback-panel[\s\S]*max-height:\s*min\(86dvh, 760px\)/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
})

test('explicit screenshot removal survives closing and reopening an otherwise empty draft', async () => {
  const browser = new Window({ url: 'http://localhost/#/single?tab=party' })
  browser.requestAnimationFrame = () => 1
  browser.cancelAnimationFrame = () => {}
  const globalKeys = ['window', 'document', 'HTMLElement', 'Element', 'IS_REACT_ACT_ENVIRONMENT']
  const previous = new Map(globalKeys.map(key => [key, globalThis[key]]))
  Object.assign(globalThis, {
    window: browser,
    document: browser.document,
    HTMLElement: browser.HTMLElement,
    Element: browser.Element,
    IS_REACT_ACT_ENVIRONMENT: true,
  })
  const { createRoot } = await import('react-dom/client')
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  const button = label => [...document.querySelectorAll('button')].find(candidate => candidate.textContent.trim() === label || candidate.getAttribute('aria-label') === label)
  try {
    await act(async () => root.render(React.createElement(FeedbackWidget, { language: 'ko', view, endpoint: '/api/feedback' })))
    await act(async () => { host.querySelector('.feedback-launcher').click(); await Promise.resolve() })
    assert.ok(button('첨부 안 함'))
    await act(async () => button('첨부 안 함').click())
    assert.ok(document.querySelector('.feedback-screenshot-removed'))
    await act(async () => button('닫기').click())
    await act(async () => { host.querySelector('.feedback-launcher').click(); await Promise.resolve() })
    assert.ok(document.querySelector('.feedback-screenshot-removed'))
    assert.ok(button('다시 캡처'))
    assert.equal(button('첨부 안 함'), undefined)
  } finally {
    await act(async () => root.unmount())
    host.remove()
    await browser.happyDOM.abort()
    for (const key of globalKeys) {
      const value = previous.get(key)
      if (value === undefined) delete globalThis[key]
      else globalThis[key] = value
    }
  }
})
