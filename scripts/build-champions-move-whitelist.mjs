import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const baselinePath = path.join(root, 'src', 'pokemonMovePools.json')
const verifiedDataPath = path.join(root, 'src', 'pokemon_champions_verified_data.json')
const whitelistPath = path.join(root, 'src', 'championsMovePools.json')
const sourceMetaPath = path.join(root, 'src', 'championsMovePoolSources.json')
const reportPath = path.join(root, 'reports', 'championsMoveWhitelistCoverage.json')

function relatedMovePoolKeys(key) {
  const keys = [key]
  if (key.startsWith('mega-')) keys.push(key.slice(5))
  const [first, ...rest] = key.split('-')
  if (['alolan', 'galarian', 'hisuian', 'paldean'].includes(first) && rest.length) keys.push(rest.join('-'))
  return Array.from(new Set(keys))
}

function sortMoves(a, b) {
  return a.name.localeCompare(b.name, 'ko')
}

const baseline = JSON.parse(await fs.readFile(baselinePath, 'utf8'))
const verifiedRaw = JSON.parse(await fs.readFile(verifiedDataPath, 'utf8'))
const verifiedRows = Array.isArray(verifiedRaw)
  ? verifiedRaw
  : verifiedRaw.rows ?? verifiedRaw.pokemon ?? []

const whitelist = {}
const sources = {}
const missing = []
const seeded = []

for (const row of verifiedRows) {
  if (!row?.key) continue
  const merged = new Map()
  const mergedFromKeys = relatedMovePoolKeys(row.key)
  for (const poolKey of mergedFromKeys) {
    for (const move of baseline[poolKey] ?? []) {
      if (!move?.name) continue
      if (!merged.has(move.name)) merged.set(move.name, { name: move.name, type: move.type ?? null })
    }
  }

  const moves = Array.from(merged.values()).sort(sortMoves)
  whitelist[row.key] = moves

  const status = moves.length ? 'seeded_from_pokeapi_baseline' : 'missing'
  if (moves.length) seeded.push(row.key)
  else missing.push(row.key)

  sources[row.key] = {
    status,
    display_name: {
      ko: row.name_ko,
      en: row.name_en,
      ja: row.name_ja ?? row.name_en,
    },
    baselineSource: 'src/pokemonMovePools.json (PokeAPI-derived local embedded move pool)',
    generatedFromKeys: mergedFromKeys,
    moveCount: moves.length,
    verificationPolicy: {
      requiredSources: ['champs.pokedb.tokyo', 'PokemonDB', 'Serebii'],
      currentState: moves.length ? 'Needs Champions-specific verification before claiming definitive whitelist.' : 'No seeded move pool present; manual verification required first.',
    },
    notes: mergedFromKeys.length > 1
      ? ['폼/메가 키는 현재 베이스 종 기술풀을 병합해 시드했습니다.']
      : [],
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    species: verifiedRows.length,
    seededFromBaseline: seeded.length,
    missing: missing.length,
  },
  missingKeys: missing,
  seededKeysSample: seeded.slice(0, 30),
  policy: {
    whitelistFile: 'src/championsMovePools.json',
    sourceMetaFile: 'src/championsMovePoolSources.json',
    baseline: 'src/pokemonMovePools.json',
    definitiveWhitelistRule: 'Only moves validated against Champions-specific evidence should be treated as confirmed in future review passes.',
  },
}

await fs.mkdir(path.dirname(reportPath), { recursive: true })
await fs.writeFile(whitelistPath, `${JSON.stringify(whitelist, null, 2)}\n`)
await fs.writeFile(sourceMetaPath, `${JSON.stringify({
  _meta: {
    generatedAt: new Date().toISOString(),
    sourceOfTruth: 'src/championsMovePools.json',
    seededFrom: 'src/pokemonMovePools.json',
    purpose: '포켓몬 챔피언스 전용 확정 화이트리스트로 발전시키기 위한 종별 검증 메타데이터',
  },
  pokemon: sources,
}, null, 2)}\n`)
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(`Generated ${path.relative(root, whitelistPath)}`)
console.log(`Generated ${path.relative(root, sourceMetaPath)}`)
console.log(`Generated ${path.relative(root, reportPath)}`)
console.log(`Seeded species: ${seeded.length}/${verifiedRows.length}`)
if (missing.length) console.log(`Missing species: ${missing.length}`)
