import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const baselinePath = path.join(root, 'src', 'pokemonMovePools.json')
const verifiedDataPath = path.join(root, 'src', 'pokemon_champions_verified_data.json')
const moveNameOverridesPath = path.join(root, 'src', 'championsMoveNameOverrides.json')
const whitelistPath = path.join(root, 'src', 'championsMovePools.json')
const sourceMetaPath = path.join(root, 'src', 'championsMovePoolSources.json')
const reportPath = path.join(root, 'reports', 'championsMoveWhitelistCoverage.json')
const recommendationAuditPath = path.join(root, 'reports', 'championsRecommendationAudit.json')
const sampleMovesPath = path.join(root, 'src', 'sampleMoves.ts')
const recommendationAuditOverridesPath = path.join(root, 'src', 'championsRecommendationAuditOverrides.json')

const POKEMON_ALIAS_CANDIDATES = {
  'mega-meowstic': ['meowstic-male', 'meowstic-female'],
  lycanroc: ['lycanroc-midday', 'lycanroc-midnight', 'lycanroc-dusk'],
  maushold: ['maushold-family-of-four', 'maushold-family-of-three'],
  meowstic: ['meowstic-male', 'meowstic-female'],
  'tauros-paldean': ['tauros-paldea-combat-breed', 'tauros-paldea-blaze-breed', 'tauros-paldea-aqua-breed'],
  palafin: ['palafin-zero', 'palafin-hero'],
  morpeko: ['morpeko-full-belly', 'morpeko-hangry'],
  mimikyu: ['mimikyu-disguised', 'mimikyu-busted'],
  gourgeist: ['gourgeist-average', 'gourgeist-small', 'gourgeist-large', 'gourgeist-super'],
  basculegion: ['basculegion-male', 'basculegion-female'],
  aegislash: ['aegislash-shield', 'aegislash-blade'],
  'mr.-rime': ['mr-rime'],
  'raichu-alolan': ['raichu-alola'],
  'ninetales-alolan': ['ninetales-alola'],
  'stunfisk-galarian': ['stunfisk-galar'],
  'slowbro-galarian': ['slowbro-galar'],
  'slowking-galarian': ['slowking-galar'],
  'mega-charizard-x': ['charizard-mega-x'],
  'mega-charizard-y': ['charizard-mega-y'],
  'mega-floette': ['floette-eternal'],
  'floette-eternal-flower': ['floette-eternal'],
}

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

function pokemonApiCandidates(key) {
  const set = new Set([key])
  const aliasList = POKEMON_ALIAS_CANDIDATES[key] ?? []
  for (const alias of aliasList) set.add(alias)
  if (key.startsWith('mega-')) {
    const base = key.slice(5)
    set.add(`${base}-mega`)
    set.add(base)
  }
  const suffixRegionalMap = {
    alolan: 'alola',
    galarian: 'galar',
    hisuian: 'hisui',
    paldean: 'paldea',
  }
  const parts = key.split('-')
  const suffix = parts.at(-1)
  if (suffix && suffixRegionalMap[suffix] && parts.length > 1) {
    const base = parts.slice(0, -1).join('-')
    set.add(`${base}-${suffixRegionalMap[suffix]}`)
    set.add(base)
  }
  return Array.from(set)
}

const baseline = JSON.parse(await fs.readFile(baselinePath, 'utf8'))
const verifiedRaw = JSON.parse(await fs.readFile(verifiedDataPath, 'utf8'))
const moveNameOverrides = JSON.parse(await fs.readFile(moveNameOverridesPath, 'utf8'))
const recommendationAuditOverrides = JSON.parse(await fs.readFile(recommendationAuditOverridesPath, 'utf8'))
const verifiedRows = Array.isArray(verifiedRaw)
  ? verifiedRaw
  : verifiedRaw.rows ?? verifiedRaw.pokemon ?? []

const moveMetaCache = new Map()
const pokemonMoveCache = new Map()

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

function normalizeMoveName(name) {
  return moveNameOverrides[name]?.ko ?? name
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

async function fetchMoveMeta(url) {
  if (!moveMetaCache.has(url)) {
    moveMetaCache.set(url, fetchJson(url).then((json) => ({
      name: normalizeMoveName(
        json.names?.find((entry) => entry.language?.name === 'ko')?.name
        ?? json.names?.find((entry) => entry.language?.name === 'ja-Hrkt')?.name
        ?? json.names?.find((entry) => entry.language?.name === 'en')?.name
        ?? json.name,
      ),
      type: typeof json.type?.name === 'string' ? json.type.name : null,
    })))
  }
  return moveMetaCache.get(url)
}

async function fetchPokemonMovePoolFromApi(key) {
  if (pokemonMoveCache.has(key)) return pokemonMoveCache.get(key)
  const task = (async () => {
    for (const candidate of pokemonApiCandidates(key)) {
      try {
        const pokemon = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${candidate}`)
        const moves = await Promise.all(
          (pokemon.moves ?? []).map((entry) => fetchMoveMeta(entry.move.url).catch(() => null))
        )
        const deduped = new Map()
        for (const move of moves) {
          if (!move?.name) continue
          if (!deduped.has(move.name)) deduped.set(move.name, move)
        }
        const sorted = Array.from(deduped.values()).sort(sortMoves)
        if (sorted.length) return { moves: sorted, candidate }
      } catch {
        // try next candidate
      }
    }
    return { moves: [], candidate: null }
  })()
  pokemonMoveCache.set(key, task)
  return task
}

const whitelist = {}
const sources = {}
const seededFromBaseline = []
const seededFromApiAlias = []
const missing = []
const untranslatedMoves = new Set()
const sampleMoves = await loadSampleMoves()

for (const row of verifiedRows) {
  if (!row?.key) continue
  const merged = new Map()
  const mergedFromKeys = relatedMovePoolKeys(row.key)
  for (const poolKey of mergedFromKeys) {
    for (const move of baseline[poolKey] ?? []) {
      if (!move?.name) continue
      const normalizedName = normalizeMoveName(move.name)
      if (!merged.has(normalizedName)) merged.set(normalizedName, { name: normalizedName, type: move.type ?? null })
    }
  }

  let sourceStatus = 'seeded_from_pokeapi_baseline'
  let fetchCandidate = null
  if (!merged.size) {
    const fetched = await fetchPokemonMovePoolFromApi(row.key)
    fetchCandidate = fetched.candidate
    for (const move of fetched.moves) {
      if (!merged.has(move.name)) merged.set(move.name, move)
    }
    sourceStatus = merged.size ? 'seeded_from_pokeapi_alias_fetch' : 'missing'
  }

  const moves = Array.from(merged.values()).sort(sortMoves)
  for (const move of moves) {
    if (/[A-Za-z]/.test(move.name)) untranslatedMoves.add(move.name)
  }
  whitelist[row.key] = moves

  if (sourceStatus === 'seeded_from_pokeapi_baseline') seededFromBaseline.push(row.key)
  else if (sourceStatus === 'seeded_from_pokeapi_alias_fetch') seededFromApiAlias.push(row.key)
  else missing.push(row.key)

  sources[row.key] = {
    status: sourceStatus,
    display_name: {
      ko: row.name_ko,
      en: row.name_en,
      ja: row.name_ja ?? row.name_en,
    },
    baselineSource: 'src/pokemonMovePools.json (PokeAPI-derived local embedded move pool)',
    generatedFromKeys: mergedFromKeys,
    fetchedPokemonApiCandidate: fetchCandidate,
    moveCount: moves.length,
    verificationPolicy: {
      requiredSources: ['champs.pokedb.tokyo', 'PokemonDB', 'Serebii'],
      currentState: moves.length ? 'Needs Champions-specific verification before claiming definitive whitelist.' : 'No seeded move pool present; manual verification required first.',
    },
    notes: [
      ...(mergedFromKeys.length > 1 ? ['폼/메가 키는 현재 베이스 종 기술풀을 병합해 시드했습니다.'] : []),
      ...(sourceStatus === 'seeded_from_pokeapi_alias_fetch' ? ['baseline 비어 있는 종은 PokeAPI 별칭 후보에서 추가 시드 생성했습니다.'] : []),
    ],
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    species: verifiedRows.length,
    seededFromBaseline: seededFromBaseline.length,
    seededFromApiAlias: seededFromApiAlias.length,
    missing: missing.length,
    untranslatedMoveLabels: untranslatedMoves.size,
  },
  missingKeys: missing,
  seededFromApiAliasKeys: seededFromApiAlias,
  untranslatedMoveLabels: Array.from(untranslatedMoves).sort((a, b) => a.localeCompare(b, 'en')),
  seededKeysSample: [...seededFromBaseline, ...seededFromApiAlias].slice(0, 30),
  policy: {
    whitelistFile: 'src/championsMovePools.json',
    sourceMetaFile: 'src/championsMovePoolSources.json',
    baseline: 'src/pokemonMovePools.json',
    definitiveWhitelistRule: 'Only moves validated against Champions-specific evidence should be treated as confirmed in future review passes.',
  },
}

const recommendationAudit = {
  generatedAt: new Date().toISOString(),
  totals: {
    speciesTracked: sampleMoves.length,
    recommendedMoves: 0,
    presentInWhitelist: 0,
    missingFromWhitelist: 0,
    untranslatedRecommendedMoves: 0,
  },
  species: {},
  missingBySpecies: {},
}

for (const entry of sampleMoves) {
  const whitelistMoves = new Set((whitelist[entry.key] ?? []).map((move) => move.name))
  const validationCount = entry.source?.validation?.length ?? 0
  const sampleCount = entry.source?.samples?.length ?? 0
  const auditEntry = {
    source: entry.source,
    notes: entry.notes ?? [],
    tiers: {},
    missingMoves: [],
  }

  for (const [tier, moves] of Object.entries({ core: entry.core ?? [], options: entry.options ?? [], utility: entry.utility ?? [] })) {
    auditEntry.tiers[tier] = moves.map((move) => {
      const alias = recommendationAuditOverrides.aliases?.[move] ?? null
      const canonicalMove = alias ?? move
      const speciesMoveKey = `${entry.key}::${move}`
      const override = recommendationAuditOverrides.speciesMoveNotes?.[speciesMoveKey] ?? null
      const present = whitelistMoves.has(canonicalMove)
      const status = present
        ? (alias ? 'alias_match' : 'verified_in_whitelist')
        : (override?.status ?? 'missing_from_whitelist')
      const confidence = confidenceLabel(tier, validationCount, sampleCount, present)
      recommendationAudit.totals.recommendedMoves += 1
      if (present) recommendationAudit.totals.presentInWhitelist += 1
      else {
        recommendationAudit.totals.missingFromWhitelist += 1
        auditEntry.missingMoves.push(move)
      }
      if (/[A-Za-z]/.test(move)) recommendationAudit.totals.untranslatedRecommendedMoves += 1
      return {
        move,
        canonicalMove,
        presentInWhitelist: present,
        status,
        confidence,
        validationCount,
        sampleCount,
        note: override?.note ?? null,
      }
    })
  }

  recommendationAudit.species[entry.key] = auditEntry
  if (auditEntry.missingMoves.length) recommendationAudit.missingBySpecies[entry.key] = auditEntry.missingMoves
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
await fs.writeFile(recommendationAuditPath, `${JSON.stringify(recommendationAudit, null, 2)}\n`)

console.log(`Generated ${path.relative(root, whitelistPath)}`)
console.log(`Generated ${path.relative(root, sourceMetaPath)}`)
console.log(`Generated ${path.relative(root, reportPath)}`)
console.log(`Generated ${path.relative(root, recommendationAuditPath)}`)
console.log(`Seeded from baseline: ${seededFromBaseline.length}/${verifiedRows.length}`)
console.log(`Seeded from alias fetch: ${seededFromApiAlias.length}/${verifiedRows.length}`)
if (missing.length) console.log(`Missing species: ${missing.length}`)
if (recommendationAudit.totals.missingFromWhitelist) console.log(`Recommended moves missing from whitelist: ${recommendationAudit.totals.missingFromWhitelist}`)
