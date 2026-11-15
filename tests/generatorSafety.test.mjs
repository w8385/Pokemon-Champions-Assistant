import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))

function offlineRun(script, args, directory) {
  const guard = path.join(directory, 'no-network.mjs')
  writeFileSync(guard, "globalThis.fetch = async () => { throw Error('HTTP forbidden by generator safety test') }\n")
  return spawnSync(process.execPath, ['--import', guard, path.join(root, script), ...args], {
    cwd: root,
    encoding: 'utf8',
    timeout: 60_000,
  })
}

function assertPreserved(target, bytes) {
  assert.deepEqual(readFileSync(target), bytes)
  assert.equal(readdirSync(path.dirname(target)).some(name => name.endsWith('.tmp')), false)
}

test('usage generator failure preserves the previous artifact', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'usage-generator-safety-'))
  try {
    const output = path.join(directory, 'usage.json')
    writeFileSync(output, '{"sentinel":true}\n')
    const before = readFileSync(output)
    const result = offlineRun('scripts/build-champions-usage-top-moves.mjs', ['--output', output], directory)
    assert.notEqual(result.status, 0, result.stderr)
    assertPreserved(output, before)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('move-whitelist upstream failure preserves all four previous artifacts', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'whitelist-generator-safety-'))
  try {
    const paths = {
      whitelist: path.join(directory, 'whitelist.json'),
      sources: path.join(directory, 'sources.json'),
      report: path.join(directory, 'report.json'),
      audit: path.join(directory, 'audit.json'),
    }
    for (const target of Object.values(paths)) writeFileSync(target, '{"sentinel":true}\n')
    const before = Object.fromEntries(Object.entries(paths).map(([key, target]) => [key, readFileSync(target)]))
    const result = offlineRun('scripts/build-champions-move-whitelist.mjs', [
      '--whitelist-output', paths.whitelist,
      '--sources-output', paths.sources,
      '--report-output', paths.report,
      '--audit-output', paths.audit,
    ], directory)
    assert.notEqual(result.status, 0, result.stderr)
    for (const [key, target] of Object.entries(paths)) assertPreserved(target, before[key])
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('sprite hash download failure cannot replace a nonempty index', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'sprite-generator-safety-'))
  try {
    const output = path.join(directory, 'hashes.json')
    writeFileSync(output, `${JSON.stringify([{ key: 'sentinel', hash: '0'.repeat(60) }])}\n`)
    const before = readFileSync(output)
    const result = offlineRun('scripts/build-champion-sprite-hashes.mjs', ['--output', output], directory)
    assert.notEqual(result.status, 0, result.stderr)
    assertPreserved(output, before)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
