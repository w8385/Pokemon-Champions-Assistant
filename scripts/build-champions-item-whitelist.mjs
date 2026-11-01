import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'

// Offline, fail-closed membership audit. Historical network/PokeAPI reports remain untouched.
const root = path.resolve(new URL('..', import.meta.url).pathname)
const approvalBytes = await fs.readFile(path.join(root, 'data/champions-item-approval.json'))
if (createHash('sha256').update(approvalBytes).digest('hex') !== '1afd0b574b7b01c25f9feb68a5811832d2e6cc64096b4bbb770e4e561caab79c') {
  throw new Error('pinned approval fixture changed; independent review required')
}
const approval = JSON.parse(approvalBytes)
const source = await fs.readFile(path.join(root, 'src/championsItems.ts'), 'utf8')
const match = source.match(/export const CHAMPIONS_ITEM_OPTIONS = \[([\s\S]*?)\] as const/)
if (!match) throw new Error('missing Champions item registry')
const options = [...match[1].matchAll(/"([^"]+)"/g)].map(row => row[1])
const rows = approval.sourceRows
const ordinary = approval.approvedOrdinary
const stones = approval.requiredStones
const held = new Map(rows.map(row => [row.sourceItemId, row]))
const ids = new Set(rows.map(row => row.sourceItemId))
const names = new Set(rows.map(row => row.nameJa))
const approved = ordinary.map(row => row.canonical)
const pending = approval.sourceOnlyUnconfirmed
const equalSet = (a, b) => a.length === b.length && new Set(a).size === a.length && a.every(value => b.includes(value))
if (approval.sourceCommit !== '50e7233b78c3b81df29563f9695386c28e77fc95' ||
    approval.rawItemSha256 !== '556ad830a535d6280310379f8dfa738f45ef3f38896b86f4a3981aae8269df5e' ||
    approval.rawJapaneseNamesSha256 !== '4de61e0bb29d93ef7c494a3d0168d9e2bd5093943356543508ed6da8657e2b3c' ||
    rows.length !== 166 || ids.size !== 166 || names.size !== 166 ||
    ordinary.length !== 81 || stones.length !== 81 || pending.length !== 4 ||
    !equalSet(options, approved) ||
    !ordinary.every(({ canonical, sourceItemId }) => held.get(sourceItemId)?.nameJa === canonical && held.get(sourceItemId)?.categoryA !== '8') ||
    !stones.every(({ sourceItemId }) => held.get(sourceItemId)?.categoryA === '8') ||
    !pending.every(name => names.has(name) && !approved.includes(name)) ||
    ordinary.some(row => !Number.isInteger(row.sourceItemId)) ||
    !equalSet(rows.filter(row => row.categoryA === '8').map(row => row.sourceItemId), stones.map(row => row.sourceItemId)) ||
    !equalSet(rows.filter(row => row.categoryA !== '8').map(row => row.nameJa), [...approved, ...pending]) ||
    ['とつげきチョッキ', '돌격조끼', 'Assault Vest'].some(name => source.includes(JSON.stringify(name)))) {
  throw new Error('unapproved/missing item, source collision or pinned snapshot mismatch; no files written')
}
const report = {
  sourceCommit: approval.sourceCommit,
  rawSourceSha256: approval.rawItemSha256,
  rawJapaneseNamesSha256: approval.rawJapaneseNamesSha256,
  evidence: 'Pinned game namespace ID + Japanese label intersect separately checked-in provisional ordinary approval; no fresh network collection',
  currentVersionVerified: false,
  currentSeasonNumber: null,
  usagePageCount: 0,
  opendataItemCount: 0,
  sourceRowCount: rows.length,
  approvedOrdinaryCount: approved.length,
  requiredFormStoneCount: stones.length,
  sourceOnlyUnconfirmed: pending,
  excludedUserReportedNotIntroduced: ['とつげきチョッキ', '돌격조끼', 'Assault Vest'],
  historicalReport: 'reports/championsItemWhitelistReport.json (82-item historical record retained, not current approval)',
  approvedOrdinary: ordinary,
  requiredStones: stones,
  sourceSummaryByItem: Object.fromEntries(ordinary.map(row => [row.canonical, { sourceItemId: row.sourceItemId, sources: ['pinned-game-row', 'checked-in-provisional-approval'], usagePages: 0, opendata: 0 }])),
}
const target = path.join(root, 'reports/championsOnlyItemApprovalReport.json')
const bytes = `${JSON.stringify(report, null, 2)}\n`
if (process.argv.includes('--check')) {
  if (await fs.readFile(target, 'utf8') !== bytes) throw new Error('stale Champions item approval report')
  console.log('Champions item approval: 81 ordinary, 81 form stones; offline unchanged')
} else {
  if (await fs.readFile(target, 'utf8').catch(() => null) !== bytes) await fs.writeFile(target, bytes)
  console.log('Champions item approval: 81 ordinary, 81 form stones; offline report written')
}
