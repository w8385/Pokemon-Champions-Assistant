import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const championsMovePoolsPath = path.join(root, 'src', 'championsMovePools.json')
const moveNameOverridesPath = path.join(root, 'src', 'championsMoveNameOverrides.json')
const moveMetaNameAliasesPath = path.join(root, 'src', 'championsMoveMetaNameAliases.json')
const moveMetaOverridesPath = path.join(root, 'src', 'championsMoveMetaOverrides.json')
const outputMetaPath = path.join(root, 'src', 'championsLearnedMoveMeta.json')
const outputReportPath = path.join(root, 'reports', 'championsMoveMetaReport.json')
const cachePath = path.join(root, 'reports', 'pokeapiMoveDetailsCache.json')

const POKEAPI_MOVE_LIST_URL = 'https://pokeapi.co/api/v2/move?limit=2000'
const CONCURRENCY = 12

function normalizeText(value) {
  return String(value ?? '').toLowerCase().replace(/[^0-9a-z가-힣ぁ-んァ-ヶ一-龯]+/g, '')
}

function chunk(items, size) {
  const result = []
  for (let idx = 0; idx < items.length; idx += size) result.push(items.slice(idx, idx + size))
  return result
}

async function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'pokemon-champions-assistant/0.1 (+https://github.com/w8385/Pokemon-Champions-Assistant)',
      'accept': 'application/json',
    },
  })
  if (!response.ok) throw new Error(`fetch failed ${response.status} ${url}`)
  return response.json()
}

function collectMoveNames(movePools) {
  const names = new Set()
  for (const value of Object.values(movePools)) {
    const moves = Array.isArray(value) ? value : (value?.moves ?? [])
    for (const move of moves) {
      if (move?.name) names.add(move.name)
    }
  }
  return Array.from(names).sort((a, b) => a.localeCompare(b, 'ko'))
}

function buildLookupKeys(detail, englishToKoMap) {
  const keys = new Set()
  const add = (value) => {
    if (!value) return
    keys.add(value)
    keys.add(normalizeText(value))
  }

  add(detail.name)
  add(detail.apiName)

  for (const [lang, value] of Object.entries(detail.names ?? {})) {
    if (lang === 'ko' || lang === 'ja' || lang === 'ja-Hrkt' || lang === 'en') add(value)
  }

  const overrideKo = englishToKoMap.get(detail.names?.en ?? '')
  if (overrideKo) add(overrideKo)

  return keys
}

function toMoveMeta(detail, overrides = {}) {
  return {
    type: detail.type,
    category: detail.category,
    power: detail.power,
    accuracy: detail.accuracy,
    ...(typeof detail.priority === 'number' && detail.priority !== 0 ? { priority: detail.priority } : {}),
    ...overrides,
  }
}

async function main() {
  const [movePools, moveNameOverrides, moveMetaNameAliases, moveMetaOverrides, cache] = await Promise.all([
    readJson(championsMovePoolsPath, {}),
    readJson(moveNameOverridesPath, {}),
    readJson(moveMetaNameAliasesPath, {}),
    readJson(moveMetaOverridesPath, {}),
    readJson(cachePath, {}),
  ])

  const englishToKoMap = new Map(
    Object.entries(moveNameOverrides ?? {})
      .filter(([, value]) => value?.ko)
      .map(([english, value]) => [english, value.ko]),
  )
  const normalizedNameAliases = new Map(
    Object.entries(moveMetaNameAliases ?? {}).flatMap(([from, to]) => {
      const entries = [[from, to], [normalizeText(from), to]]
      return entries
    }),
  )

  const moveNames = collectMoveNames(movePools)
  const moveIndex = await fetchJson(POKEAPI_MOVE_LIST_URL)
  const indexEntries = moveIndex.results ?? []

  const detailCache = { ...(cache ?? {}) }
  const missingDetailEntries = indexEntries.filter((entry) => !detailCache[entry.name])

  for (const batch of chunk(missingDetailEntries, CONCURRENCY)) {
    const resolved = await Promise.all(batch.map(async (entry) => {
      const detail = await fetchJson(entry.url)
      return [entry.name, {
        apiName: detail.name,
        type: detail.type?.name ?? null,
        category: detail.damage_class?.name ?? null,
        power: detail.power ?? null,
        accuracy: detail.accuracy ?? null,
        priority: detail.priority ?? 0,
        names: Object.fromEntries(
          (detail.names ?? [])
            .filter((item) => ['ko', 'ja', 'ja-Hrkt', 'en'].includes(item.language?.name))
            .map((item) => [item.language.name, item.name]),
        ),
      }]
    }))
    for (const [apiName, detail] of resolved) detailCache[apiName] = detail
  }

  const detailList = Object.values(detailCache)
  const detailByLookupKey = new Map()
  for (const detail of detailList) {
    for (const key of buildLookupKeys(detail, englishToKoMap)) {
      if (!detailByLookupKey.has(key)) detailByLookupKey.set(key, detail)
    }
  }

  const generatedMeta = {}
  const unmatched = []
  const matchedFrom = []

  for (const moveName of moveNames) {
    const alias = normalizedNameAliases.get(moveName) ?? normalizedNameAliases.get(normalizeText(moveName))
    const lookupKeys = [moveName, alias, normalizeText(moveName), alias ? normalizeText(alias) : null].filter(Boolean)
    const match = lookupKeys.map((key) => detailByLookupKey.get(key)).find(Boolean)
    if (!match) {
      unmatched.push(moveName)
      continue
    }

    generatedMeta[moveName] = toMoveMeta(match, moveMetaOverrides?.[moveName])
    matchedFrom.push({
      moveName,
      apiName: match.apiName,
      ko: match.names?.ko ?? null,
      en: match.names?.en ?? null,
    })
  }

  const report = {
    generatedAt: new Date().toISOString(),
    source: {
      movePools: path.relative(root, championsMovePoolsPath),
      moveNameOverrides: path.relative(root, moveNameOverridesPath),
      moveMetaOverrides: path.relative(root, moveMetaOverridesPath),
      pokeApi: POKEAPI_MOVE_LIST_URL,
      cache: path.relative(root, cachePath),
    },
    totals: {
      championsPoolMoves: moveNames.length,
      generatedMetaMoves: Object.keys(generatedMeta).length,
      unmatchedMoves: unmatched.length,
      cachedMoveDetails: Object.keys(detailCache).length,
    },
    unmatchedMoves: unmatched,
    generatedMoves: matchedFrom,
  }

  await Promise.all([
    fs.mkdir(path.dirname(outputMetaPath), { recursive: true }),
    fs.mkdir(path.dirname(outputReportPath), { recursive: true }),
    fs.mkdir(path.dirname(cachePath), { recursive: true }),
  ])

  await Promise.all([
    fs.writeFile(outputMetaPath, `${JSON.stringify(generatedMeta, null, 2)}\n`),
    fs.writeFile(outputReportPath, `${JSON.stringify(report, null, 2)}\n`),
    fs.writeFile(cachePath, `${JSON.stringify(detailCache, null, 2)}\n`),
  ])

  console.log(`wrote ${path.relative(root, outputMetaPath)} (${Object.keys(generatedMeta).length} moves)`)
  console.log(`wrote ${path.relative(root, outputReportPath)}`)
  console.log(`cached ${Object.keys(detailCache).length} pokeapi move details`)
  if (unmatched.length) console.log(`unmatched moves: ${unmatched.length}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
