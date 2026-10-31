import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { routeGroups } from '../src/navigation.ts'
import { appTranslate } from './appTranslations.mjs'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')

// The home and header must consume the same authoritative destinations, not parallel arrays.
test('home and header derive the same four ordered destination groups', () => {
  assert.deepEqual(routeGroups.map(group => group.links.length), [2, 2, 2, 1])
  assert.match(app, /routeGroups\.map\(group => <section key=\{group\.section\} className="home-route-group"/)
  assert.match(app, /group\.links\.map\(link => <a key=\{link\.href\} className="home-route-card/)
  assert.match(app, /href=\{link\.href\}/)
  assert.doesNotMatch(app.slice(app.indexOf('className="home-route-groups"'), app.indexOf('home-footer-text-block', app.indexOf('className="home-route-groups"'))), /href="#\//)
})

test('one reusable page heading precedes the content of every visible menu', () => {
  assert.match(app, /<main className="grid page-frame">\s*<PageHeading title=\{lt\(/)
  for (const title of ['홈', '내 파티', '대면', '계산기', '스피드라인', '샘플 라이브러리', '샘플 연구소', '도감']) assert.match(app, new RegExp(`'${title}'`))
  assert.doesNotMatch(app, /<h2>\{lt\('샘플 연구소'\)\} · \{lt\('샘플 빌드'\)\}<\/h2>/)
  assert.doesNotMatch(app, /<h2>\{lt\('도감'\)\}<\/h2>/)
})

test('home destination labels and the effort-cutoff description stay localized', () => {
  const translate = appTranslate()
  for (const language of ['en', 'ja']) {
    for (const label of ['홈', ...routeGroups.map(group => group.label), ...routeGroups.flatMap(group => group.links.map(link => link.label)), '노력치를 조정하며 상대 스피드 추월컷을 비교합니다.']) {
      assert.notEqual(translate(language, label), label, `${language}: ${label}`)
    }
  }
})

test('navigation uses quiet unboxed groups and a single 44px active destination', () => {
  assert.match(styles, /\.header-route-group\s*\{[^}]*border-left: 1px solid/)
  assert.match(styles, /\.header-primary-tab\s*\{[^}]*min-height: 44px/)
  assert.match(styles, /\.header-primary-tab\.active\s*\{[^}]*background: var\(--nav-active\)/)
  assert.match(styles, /\.header-primary-tab:focus-visible/)
  assert.match(app, /aria-current=\{mainSection === link\.section/)
  assert.match(app, /group\.links\.length > 1/)
})

test('mobile groups use aligned tracks and allow long localized link labels to wrap', () => {
  assert.match(styles, /\.header-route-menu > \.header-primary-tabs\s*\{[^}]*display: grid;[^}]*grid-template-columns: minmax\(0, 1fr\)/)
  assert.match(styles, /\.header-route-menu \.header-route-group\s*\{[^}]*grid-template-columns: 64px minmax\(0, 1fr\)/)
  assert.match(styles, /\.header-route-menu \.header-route-group-links\s*\{[^}]*grid-column: 2;[^}]*display: grid/)
  assert.match(styles, /\.header-route-menu \.header-route-group:last-child\s*\{[^}]*border-top: 1px solid/)
  assert.match(styles, /\.header-route-menu \.header-route-group:last-child \.header-route-group-links\s*\{[^}]*grid-column: 1 \/ -1/)
  assert.match(styles, /\.header-route-menu \.header-route-group-links \.header-primary-tab\s*\{[^}]*overflow-wrap: anywhere/)
})

test('shared page heading is a semantic heading with optional action lane', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  try {
    const { PageHeading } = await server.ssrLoadModule('/src/PageHeading.tsx')
    const markup = renderToStaticMarkup(React.createElement(PageHeading, { title: '계산기', actions: React.createElement('button', null, '바꾸기') }))
    assert.match(markup, /<h2[^>]*>계산기<\/h2>/)
    assert.match(markup, /<button>바꾸기<\/button>/)
  } finally { await server.close() }
})
