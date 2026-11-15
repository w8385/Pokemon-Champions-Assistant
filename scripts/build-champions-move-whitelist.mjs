import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { atomicReplaceFiles } from './lib/atomic-output.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const optionValue = name => {
  const index = process.argv.indexOf(name)
  if (index < 0) return null
  if (!process.argv[index + 1]) throw new Error(`Missing value for ${name}`)
  return process.argv[index + 1]
}
const outputPath = (name, fallback) => path.resolve(root, optionValue(name) ?? fallback)
const allowPartial = process.argv.includes('--allow-partial')

const baselinePath = path.join(root, 'src', 'canonical-data/champions/pokemonMovePools.json')
const verifiedDataPath = path.join(root, 'src', 'canonical-data/champions/pokemon_champions_verified_data.json')
const moveNameOverridesPath = path.join(root, 'src', 'canonical-data/champions/championsMoveNameOverrides.json')
const whitelistPath = outputPath('--whitelist-output', 'src/canonical-data/champions/championsMovePools.json')
const sourceMetaPath = outputPath('--sources-output', 'src/canonical-data/champions/championsMovePoolSources.json')
const reportPath = outputPath('--report-output', 'reports/championsMoveWhitelistCoverage.json')
const recommendationAuditPath = outputPath('--audit-output', 'reports/championsRecommendationAudit.json')
const sampleMovesPath = path.join(root, 'src', 'domain/samples/sampleMoves.ts')
const recommendationAuditOverridesPath = path.join(root, 'src', 'canonical-data/champions/championsRecommendationAuditOverrides.json')

const POKEMON_ALIAS_CANDIDATES = {
  'persian-alolan': ['persian-alola'],
  toxtricity: ['toxtricity-amped', 'toxtricity-low-key'],
  squawkabilly: ['squawkabilly-green-plumage', 'squawkabilly-blue-plumage', 'squawkabilly-yellow-plumage', 'squawkabilly-white-plumage'],
  'mega-absol-z': ['absol'],
  'mega-garchomp-z': ['garchomp'],
  'mega-lucario-z': ['lucario'],
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
  'mega-pyroar': ['pyroar-male'],
  'mega-raichu-x': ['raichu', 'raichu-alola'],
  'mega-raichu-y': ['raichu', 'raichu-alola'],
  'mega-floette': ['floette', 'floette-eternal'],
  'floette-eternal-flower': ['floette', 'floette-eternal'],
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
const upstreamFailures = []

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
  if (!res.ok) {
    const error = new Error(`${res.status} ${url}`)
    error.status = res.status
    throw error
  }
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
    const merged = new Map()
    const fetchedCandidates = []
    for (const candidate of pokemonApiCandidates(key)) {
      try {
        const pokemon = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${candidate}`)
        const entries = pokemon.moves ?? []
        const settled = await Promise.allSettled(entries.map(entry => fetchMoveMeta(entry.move.url)))
        const moves = []
        settled.forEach((result, index) => {
          if (result.status === 'fulfilled') moves.push(result.value)
          else upstreamFailures.push({ kind: 'move', key, candidate, url: entries[index]?.move?.url, message: String(result.reason) })
        })
        for (const move of moves) {
          if (!move?.name) continue
          if (!merged.has(move.name)) merged.set(move.name, move)
        }
        if (moves.length) fetchedCandidates.push(candidate)
      } catch (error) {
        if (error?.status !== 404) upstreamFailures.push({ kind: 'pokemon', key, candidate, message: String(error) })
      }
    }
    return { moves: Array.from(merged.values()).sort(sortMoves), candidate: fetchedCandidates[0] ?? null, candidates: fetchedCandidates }
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
    baselineSource: 'src/canonical-data/champions/pokemonMovePools.json (PokeAPI-derived local embedded move pool)',
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
    whitelistFile: 'src/canonical-data/champions/championsMovePools.json',
    sourceMetaFile: 'src/canonical-data/champions/championsMovePoolSources.json',
    baseline: 'src/canonical-data/champions/pokemonMovePools.json',
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

const expectedKeys = verifiedRows.filter(row => row?.key).map(row => row.key).sort()
const actualKeys = Object.keys(whitelist).sort()
if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
  throw new Error(`Generated whitelist keys do not match verified roster: expected=${expectedKeys.length}, actual=${actualKeys.length}`)
}
const previousMoveCount = Object.values(baseline).reduce((sum, moves) => sum + (Array.isArray(moves) ? moves.length : 0), 0)
const nextMoveCount = Object.values(whitelist).reduce((sum, moves) => sum + moves.length, 0)
const emptiedExisting = expectedKeys.filter(key => Array.isArray(baseline[key]) && baseline[key].length && !whitelist[key].length)
const moveCountCollapsed = previousMoveCount > 0 && nextMoveCount < Math.floor(previousMoveCount * 0.95)
if (!nextMoveCount) throw new Error('Refusing to replace move pools with an empty result')
if (!allowPartial && (upstreamFailures.length || missing.length || emptiedExisting.length || moveCountCollapsed)) {
  throw new Error(`Refusing partial move whitelist: upstream failures=${upstreamFailures.length}, missing=${missing.length}, emptied=${emptiedExisting.length}, moves=${previousMoveCount}->${nextMoveCount}`)
}
if (allowPartial && (upstreamFailures.length || missing.length || emptiedExisting.length || moveCountCollapsed)) {
  console.warn(`Allowing reviewed partial move whitelist: upstream failures=${upstreamFailures.length}, missing=${missing.length}, emptied=${emptiedExisting.length}, moves=${previousMoveCount}->${nextMoveCount}`)
}
const generatedAt = new Date().toISOString()
await atomicReplaceFiles([
  { target: whitelistPath, content: `${JSON.stringify(whitelist, null, 2)}\n` },
  { target: sourceMetaPath, content: `${JSON.stringify({
    _meta: {
      generatedAt,
      sourceOfTruth: 'src/canonical-data/champions/championsMovePools.json',
      seededFrom: 'src/canonical-data/champions/pokemonMovePools.json',
      purpose: '포켓몬 챔피언스 전용 확정 화이트리스트로 발전시키기 위한 종별 검증 메타데이터',
    },
    pokemon: sources,
  }, null, 2)}\n` },
  { target: reportPath, content: `${JSON.stringify(report, null, 2)}\n` },
  { target: recommendationAuditPath, content: `${JSON.stringify(recommendationAudit, null, 2)}\n` },
])
console.log(`Generated ${path.relative(root, whitelistPath)}`)
console.log(`Generated ${path.relative(root, sourceMetaPath)}`)
console.log(`Generated ${path.relative(root, reportPath)}`)
console.log(`Generated ${path.relative(root, recommendationAuditPath)}`)
console.log(`Seeded from baseline: ${seededFromBaseline.length}/${verifiedRows.length}`)
console.log(`Seeded from alias fetch: ${seededFromApiAlias.length}/${verifiedRows.length}`)
if (missing.length) console.log(`Missing species: ${missing.length}`)
if (recommendationAudit.totals.missingFromWhitelist) console.log(`Recommended moves missing from whitelist: ${recommendationAudit.totals.missingFromWhitelist}`)
