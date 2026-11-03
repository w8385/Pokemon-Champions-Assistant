import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { CHAMPIONS_ITEM_OPTIONS } from '../src/domain/champions/championsItems.ts'
import { championsData, additionalFormSpecs } from '../src/domain/champions/effectiveRoster.ts'
import { requiredMegaStone, classifyHeldItem } from '../src/domain/champions/itemIdentity.ts'

const root = new URL('..', import.meta.url)
const source = JSON.parse(readFileSync(new URL('../data/champions-item-approval.json', import.meta.url)))
const reportPath = new URL('../reports/championsOnlyItemApprovalReport.json', import.meta.url)
const report = JSON.parse(readFileSync(reportPath))
const run = (...args) => spawnSync('node', ['scripts/build-champions-item-whitelist.mjs', ...args], { cwd: root.pathname, encoding: 'utf8', env: { ...process.env, HTTP_PROXY: 'http://127.0.0.1:1', HTTPS_PROXY: 'http://127.0.0.1:1' } })

test('pinned namespace and explicit approval produce exact 81/81 without promoting source-only berries', () => {
  const rows = source.sourceRows
  assert.equal(rows.length, 166)
  assert.equal(new Set(rows.map(row => row.sourceItemId)).size, 166)
  assert.equal(source.rawItemSha256, '556ad830a535d6280310379f8dfa738f45ef3f38896b86f4a3981aae8269df5e')
  assert.equal(source.rawJapaneseNamesSha256, '4de61e0bb29d93ef7c494a3d0168d9e2bd5093943356543508ed6da8657e2b3c')
  assert.equal(createHash('sha256').update(readFileSync(new URL('../data/champions-item-approval.json', import.meta.url))).digest('hex'), '1afd0b574b7b01c25f9feb68a5811832d2e6cc64096b4bbb770e4e561caab79c')
  assert.deepEqual(new Set(CHAMPIONS_ITEM_OPTIONS), new Set(source.approvedOrdinary.map(row => row.canonical)))
  assert.deepEqual(new Set([...championsData.rows, ...additionalFormSpecs].map(row => requiredMegaStone(row.key)).filter(Boolean)), new Set(source.requiredStones.map(row => row.canonical)))
  assert.equal(report.usagePageCount, 0)
  assert.equal(report.opendataItemCount, 0)
  assert.equal(report.currentVersionVerified, false)
  assert.deepEqual(source.sourceOnlyUnconfirmed, ['クラボのみ', 'モモンのみ', 'チーゴのみ', 'ナナシのみ'])
  for (const name of source.sourceOnlyUnconfirmed) assert.equal(classifyHeldItem('garchomp', name).status, 'unknown')
  assert.equal(rows.filter(row => row.categoryA === '8').length, 81)
  assert.equal(rows.filter(row => row.categoryA !== '8').length, 85)
})

test('offline approval check is byte/mtime invariant; historical 82-item report is retained', () => {
  const before = readFileSync(reportPath)
  const mtime = statSync(reportPath).mtimeMs
  const result = run('--check')
  assert.equal(result.status, 0, result.stderr)
  assert.deepEqual(readFileSync(reportPath), before)
  assert.equal(statSync(reportPath).mtimeMs, mtime)
  const historical = JSON.parse(readFileSync(new URL('../reports/championsItemWhitelistReport.json', import.meta.url)))
  assert.equal(historical.whitelistItemCount, 82)
  assert.deepEqual(historical.sourceSummaryByItem['とつげきチョッキ'].sources, [])
})

test('opponent item input rejects newly typed unknown without mutating restored raw', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const owner = readFileSync(new URL('../src/features/single/useOpponentEntries.ts', import.meta.url), 'utf8')
  const commit = owner.slice(owner.indexOf('const commitOpponentItemInput ='), owner.indexOf('const commitOpponentAbilityInput ='))
  assert.match(app, /useOpponentEntries\(/)
  assert.match(app, /commitOpponentItemInput\(selectedOpp/)
  assert.match(commit, /draft === displayItemLabel\(member\.item, siteLanguage\)/)
  assert.match(commit, /classifyHeldItem\(member\.key, draft\)/)
  assert.match(commit, /if \(!\['none', 'allowed', 'required-stone'\]\.includes\(identity\.status\)\)/)
  assert.ok(commit.indexOf('setOpponents(next)') > commit.indexOf('classifyHeldItem(member.key, draft)'))
  assert.match(app, /item: typeof raw\.item === 'string' \? raw\.item : ''/)
})
