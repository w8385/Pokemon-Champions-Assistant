import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const sampleMovesPath = path.join(root, 'src', 'domain/samples/sampleMoves.ts')
const dexGameLearnsetsPath = path.join(root, 'src', 'canonical-data/champions/dexGameLearnsets.json')
const verifiedDataPath = path.join(root, 'src', 'canonical-data/champions/pokemon_champions_verified_data.json')
const outputWhitelistPath = path.join(root, 'src', 'canonical-data/champions/championsLearnedMoveWhitelist.json')
const outputReportPath = path.join(root, 'reports', 'championsLearnedMoveWhitelistReport.json')

function confidenceLabel(tier, validationCount, sampleCount, isPresent) {
  if (!isPresent) return 'conflict'
  const score = (validationCount * 2) + sampleCount + (tier === 'core' ? 2 : tier === 'options' ? 1 : 0)
  if (score >= 6) return 'high'
  if (score >= 4) return 'medium'
  return 'low'
}

async function loadSampleMoves() {
  const source = await fs.readFile(sampleMovesPath, 'utf8')
  const withoutType = source.replace(/export type[\s\S]*?\n}\n\n/, '')
  const expression = withoutType.replace(/export const sampleMoves\s*:[^=]+?=\s*/, '')
  return Function(`"use strict"; return (${expression.trim().replace(/;\s*$/, '')});`)()
}

const [sampleMoves, dexGameLearnsets, verifiedRaw] = await Promise.all([
  loadSampleMoves(),
  fs.readFile(dexGameLearnsetsPath, 'utf8').then(JSON.parse),
  fs.readFile(verifiedDataPath, 'utf8').then(JSON.parse),
])

const verifiedRows = Array.isArray(verifiedRaw) ? verifiedRaw : (verifiedRaw.rows ?? verifiedRaw.pokemon ?? [])
const rowByKey = new Map(verifiedRows.map((row) => [row.key, row]))

const whitelist = {
  _meta: {
    generatedAt: new Date().toISOString(),
    purpose: '현재 사이트가 학습/추천하고 있는 종별 가용 기술만 추린 learned whitelist',
    sourceOfTruth: 'src/domain/samples/sampleMoves.ts',
    comparedAgainst: 'src/canonical-data/champions/dexGameLearnsets.json',
    exactFormSource: dexGameLearnsets.source,
    caveat: '전체 기술풀이 아니라 현재 사이트가 학습한 종/추천기술만 포함하며, 각 이름은 고정 게임 스냅샷의 정확한 폼별 표기와 일치한다.',
  },
  pokemon: {},
}

const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    speciesTracked: 0,
    whitelistMoves: 0,
    core: 0,
    options: 0,
    utility: 0,
    presentInExactFormPool: 0,
    missingFromExactFormPool: 0,
    untranslatedMoveLabels: 0,
  },
  missingBySpecies: {},
  untranslatedMoveLabels: [],
}

const untranslated = new Set()

for (const entry of sampleMoves) {
  const row = rowByKey.get(entry.key)
  const form = dexGameLearnsets.forms[entry.key]
  const pool = (form?.moves ?? []).map((id) => dexGameLearnsets.moves[String(id)]).filter(Boolean)
  const poolByName = new Map(pool.map((move) => [move.appName, move]))
  const moves = []
  const missingMoves = []
  const seen = new Set()
  const validationCount = entry.source?.validation?.length ?? 0
  const sampleCount = entry.source?.samples?.length ?? 0

  for (const [tier, names] of [['core', entry.core ?? []], ['options', entry.options ?? []], ['utility', entry.utility ?? []]]) {
    for (const rawName of names) {
      const canonicalName = rawName
      if (seen.has(`${tier}::${canonicalName}`)) continue
      seen.add(`${tier}::${canonicalName}`)
      const matchedMove = poolByName.get(canonicalName)
      const presentInExactFormPool = Boolean(matchedMove)
      const confidence = confidenceLabel(tier, validationCount, sampleCount, presentInExactFormPool)
      const move = {
        name: rawName,
        canonicalName,
        type: matchedMove?.type ?? null,
        tier,
        presentInExactFormPool,
        confidence,
      }
      moves.push(move)
      report.totals.whitelistMoves += 1
      report.totals[tier] += 1
      if (presentInExactFormPool) report.totals.presentInExactFormPool += 1
      else {
        report.totals.missingFromExactFormPool += 1
        missingMoves.push(rawName)
      }
      if (/^[A-Za-z0-9 .'-]+$/.test(rawName)) untranslated.add(rawName)
    }
  }

  whitelist.pokemon[entry.key] = {
    displayName: row ? {
      ko: row.name_ko,
      en: row.name_en,
      ja: row.name_ja ?? row.name_en,
    } : null,
    source: entry.source,
    notes: entry.notes ?? [],
    availableMoves: moves.map((move) => move.canonicalName),
    moves,
  }

  if (missingMoves.length) report.missingBySpecies[entry.key] = missingMoves
  report.totals.speciesTracked += 1
}

report.untranslatedMoveLabels = Array.from(untranslated).sort((a, b) => a.localeCompare(b, 'en'))
report.totals.untranslatedMoveLabels = report.untranslatedMoveLabels.length

if (report.totals.missingFromExactFormPool) {
  throw new Error(`Curated recommendations outside exact-form learnsets: ${JSON.stringify(report.missingBySpecies)}`)
}

await fs.mkdir(path.dirname(outputWhitelistPath), { recursive: true })
await fs.mkdir(path.dirname(outputReportPath), { recursive: true })
await fs.writeFile(outputWhitelistPath, `${JSON.stringify(whitelist, null, 2)}\n`)
await fs.writeFile(outputReportPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(`Generated ${path.relative(root, outputWhitelistPath)}`)
console.log(`Generated ${path.relative(root, outputReportPath)}`)
console.log(`Tracked species: ${report.totals.speciesTracked}`)
console.log(`Whitelist moves: ${report.totals.whitelistMoves}`)
if (report.totals.missingFromExactFormPool) console.log(`Missing from exact-form pool: ${report.totals.missingFromExactFormPool}`)
