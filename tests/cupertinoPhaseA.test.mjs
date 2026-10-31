import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { readFileSync } from 'node:fs'
import { homeRoute, routeGroups, routeIconFor } from '../src/navigation.ts'

let server, UiIcon, PageHeading
test.before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  UiIcon = (await server.ssrLoadModule('/src/UiIcon.tsx')).UiIcon
  PageHeading = (await server.ssrLoadModule('/src/PageHeading.tsx')).PageHeading
})
test.after(async () => { await server?.close() })

test('all seven real destinations have typed decorative icons and native hrefs in both mounted call sites', () => {
  const links = routeGroups.flatMap(group => group.links)
  assert.equal(links.length, 7)
  for (const link of links) {
    assert.ok(link.icon)
    const markup = renderToStaticMarkup(React.createElement(UiIcon, { name: link.icon }))
    assert.match(markup, /<svg[^>]*aria-hidden="true"[^>]*>/)
    assert.equal(routeIconFor(link.section, link.tab), link.icon)
  }
  assert.equal(routeIconFor('home'), homeRoute.icon)
  assert.equal(routeIconFor('sample', 'damage'), 'lab')
})

test('PageHeading mounts a real icon beside its short visible title and keeps action owner', () => {
  const markup = renderToStaticMarkup(React.createElement(PageHeading, { title: '계산기', icon: 'calculator', actions: React.createElement('button', null, '적용') }))
  assert.match(markup, /<svg[^>]*aria-hidden="true"/)
  assert.match(markup, /<h2>계산기<\/h2>/)
  assert.match(markup, /<button>적용<\/button>/)
  assert.match(renderToStaticMarkup(React.createElement(UiIcon, { name: 'globe' })), /viewBox="0 0 24 24"/)
})

test('home and header actually consume the shared destination renderer without changing ownership or unknown data', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const nav = app.slice(app.indexOf('id="primary-navigation"'), app.indexOf('</nav>', app.indexOf('id="primary-navigation"')))
  const home = app.slice(app.indexOf('className="home-route-groups"'), app.indexOf('</section>)}', app.indexOf('className="home-route-groups"')))
  assert.match(nav, /group\.links\.map\(link => <a key=\{link\.href\} href=\{link\.href\}/)
  assert.match(nav, /<UiIcon name=\{link\.icon\}/)
  assert.match(nav, /aria-current=\{/)
  assert.match(home, /group\.links\.map\(link => <a key=\{link\.href\} className="home-route-card calm" href=\{link\.href\}>/)
  assert.match(home, /<UiIcon name=\{link\.icon\}/)
  assert.match(home, /<UiIcon name="chevron"/)
  assert.doesNotMatch(home, /내 포켓몬과 기술 기준을 정리합니다/)
  assert.match(app, /<PageHeading title=/)
  assert.match(app, /<UiIcon name="globe"/)
  assert.match(app, /<UiIcon name="settings"/)
  assert.match(app, /미확인|unknown/)
  assert.match(app, /type-badge|TypeBadge/)
})

test('dark common tokens and final scoped control states leave semantic palettes intact', () => {
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
  assert.match(css, /--ui-group:/)
  assert.match(css, /--ui-separator:/)
  assert.match(css, /\.home-route-card[^{}]*\{[^}]*var\(--ui-elevated\)/)
  assert.match(css, /\.header-primary-tab\.active[^{}]*\{[^}]*var\(--ui-selection\)/)
  assert.match(css, /:focus-visible/)
  assert.match(css, /\.quick-result\.quick-ko-certain/)
  assert.match(css, /\.stat-theme-hp/)
  assert.doesNotMatch(css.slice(css.lastIndexOf('@media (max-width: 390px)')), /\.header-route-menu \.header-route-group-links\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\)/, 'narrow navigation keeps paired destinations instead of a tall eight-row stack')
  assert.doesNotMatch(css, /prefers-color-scheme:\s*light/)
})
