import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const nav = source.slice(source.indexOf('<nav id="primary-navigation"'), source.indexOf('</nav>', source.indexOf('<nav id="primary-navigation"')))
const handlers = Array.from(nav.matchAll(/onClick=\{(.+?)\}(?=\s+aria-current)/gs), match => match[1])
const helperUrl = new URL('../src/headerNavigation.ts', import.meta.url)
const closeHeaderMenu = existsSync(fileURLToPath(helperUrl)) ? (await import(helperUrl.href)).closeHeaderMenu : undefined

for (const [index, name] of ['home link', 'submenu link including same-route selection'].entries()) {
  test(`${name} dismisses every native group and the mobile navigation`, () => {
    assert.equal(handlers.length, 2, 'Exercise both real App link handlers')
    const groups = [true, true, false].map(open => ({ open, removeAttribute(name) { assert.equal(name, 'open'); this.open = false } }))
    const navigation = { querySelectorAll(selector) { assert.equal(selector, 'details[open]'); return groups.filter(group => group.open) } }
    const link = { closest(selector) { assert.equal(selector, '#primary-navigation'); return navigation } }
    let mobileOpen = true
    const handler = new Function('setMobileNavOpen', 'closeHeaderMenu', `return (${handlers[index]})`)(value => { mobileOpen = value }, closeHeaderMenu)
    const event = { currentTarget: link, target: {}, preventDefault() { assert.fail('Navigation must retain native anchor behavior') } }
    handler(event)
    assert.equal(mobileOpen, false)
    assert.deepEqual(groups.map(group => group.open), [false, false, false])
  })
}
