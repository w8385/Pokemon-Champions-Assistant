import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
test('creator whole-party import saves a preset then routes to the actual party manager without applying it', () => {
  const handler = app.match(/const importCreatorParty = \(source:[\s\S]*?\n  }/)
  assert.ok(handler, 'real App import handler exists')
  assert.match(handler[0], /prepareCreatorParty\(source/)
  assert.match(handler[0], /dispatchWorkspace\(\{ type: 'ADD', preset \}\)/)
  assert.match(handler[0], /setMainSection\('party'\)/)
  assert.doesNotMatch(handler[0], /applyPartyPreset\(/)
})
