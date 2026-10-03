import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const creatorMoves = app.slice(app.indexOf('className="move-card inline-move-card creator-library-moves"'), app.indexOf('</ReadonlyPokemonCard>', app.indexOf('className="move-card inline-move-card creator-library-moves"')))
test('library shared move slot uses the same input surface and tooltip binding as party, read-only not disabled', () => {
  assert.match(creatorMoves, /<RegisteredMoveSlot/)
  assert.match(creatorMoves, /inputProps=\{\{ readOnly: true/)
  assert.doesNotMatch(creatorMoves, /<input\b/)
  assert.match(creatorMoves, /bindTooltip\(move \? moveTooltipData\(move, siteLanguage\) : null\)/)
  assert.doesNotMatch(creatorMoves, /disabled/)
  assert.doesNotMatch(creatorMoves, /onChange:/)
})
