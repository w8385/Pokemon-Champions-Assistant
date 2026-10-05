import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'vite'
import { fileURLToPath } from 'node:url'
import dex from '../src/dexDescriptions.json' with { type: 'json' }
import { SPEED_ABILITIES } from '../src/speedAbilities.ts'

test('speed ability labels match the canonical dex without eagerly shipping its descriptions', async () => {
  for (const ability of SPEED_ABILITIES) {
    const source = dex.abilities[ability.slug]
    assert.deepEqual([ability.labelKo, ability.labelEn, ability.labelJa], [source.nameKo, source.nameEn, source.nameJa])
  }
  const result = await build({ configFile: false, logLevel: 'silent', build: { write: false, minify: false, lib: { entry: fileURLToPath(new URL('../src/speedAbilities.ts', import.meta.url)), formats: ['es'] } } })
  const outputs = (Array.isArray(result) ? result : [result]).flatMap(bundle => bundle.output)
  const bytes = outputs.reduce((total, output) => total + Buffer.byteLength(output.type === 'chunk' ? output.code : output.source), 0)
  assert.ok(bytes < 12000, `Seven ability labels and conditions must stay small; bundled ${bytes} bytes`)
})
