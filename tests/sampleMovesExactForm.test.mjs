import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)
const learnsets = JSON.parse(readFileSync(new URL('src/canonical-data/champions/dexGameLearnsets.json', root), 'utf8'))

function loadSampleMoves() {
  const source = readFileSync(new URL('src/domain/samples/sampleMoves.ts', root), 'utf8')
  const withoutType = source.replace(/export type[\s\S]*?\n}\n\n/, '')
  const expression = withoutType.replace(/export const sampleMoves\s*:[^=]+?=\s*/, '')
  return Function(`"use strict"; return (${expression.trim().replace(/;\s*$/, '')});`)()
}

test('every curated sample move is the canonical label in its exact-form learnset', () => {
  for (const entry of loadSampleMoves()) {
    const form = learnsets.forms[entry.key]
    assert.ok(form, `${entry.key}: exact-form learnset is missing`)
    const exactNames = new Set(form.moves.map((id) => learnsets.moves[String(id)].appName))
    const recommendations = [...entry.core, ...(entry.options ?? []), ...(entry.utility ?? [])]
    for (const move of recommendations) {
      assert.ok(exactNames.has(move), `${entry.key}::${move} is not an exact-form canonical move`)
    }
  }
})
