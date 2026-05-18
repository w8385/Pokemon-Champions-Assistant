import fs from 'node:fs/promises'
import path from 'node:path'
import championsData from '../src/pokemon_champions_verified_data.json' with { type: 'json' }
import moveMetaReport from '../reports/championsMoveMetaReport.json' with { type: 'json' }
import championsLearnedMoveMeta from '../src/championsLearnedMoveMeta.json' with { type: 'json' }
import pokeApiMoveDetailsCache from '../reports/pokeapiMoveDetailsCache.json' with { type: 'json' }

const OUTPUT_PATH = path.resolve('src/championsUsageTopMoves.json')
const BASE_URL = 'https://champs.pokedb.tokyo'
const SINGLE_RULE = 0
const rows = championsData.rows ?? []
const availableMoveNames = new Set(Object.keys(championsLearnedMoveMeta))

const FORM_QUALIFIER_BY_KEY = {
  hisui: 'ヒスイ',
  alolan: 'アローラ',
  galarian: 'ガラル',
  paldean: 'パルデア',
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function normalizeJaText(value) {
  return String(value ?? '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, '')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/Ｘ/g, 'X')
    .replace(/Ｙ/g, 'Y')
    .trim()
}

async function fetchText(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  return response.text()
}

async function loadJaNameByKey() {
  const filePath = path.resolve('src/jaNames.ts')
  const source = await fs.readFile(filePath, 'utf8')
  const match = source.match(/export const jaNameByKey = (\{[\s\S]*\}) as const/)
  if (!match) throw new Error('Failed to parse src/jaNames.ts')
  return Function(`return (${match[1]})`)()
}

function parseSelectedSeason(html) {
  const selectedMatch = html.match(/<option value="(\d+)" selected>/)
  if (selectedMatch) return Number(selectedMatch[1])
  const firstOption = html.match(/<option value="(\d+)"/)
  if (firstOption) return Number(firstOption[1])
  throw new Error('Failed to determine selected season from list page')
}

function parseSeasonLabel(html, season) {
  const re = new RegExp(`<option value="${season}"[^>]*>[\\s\\S]*?シーズン([^<]+)</option>`)
  const match = html.match(re)
  if (!match) return `season-${season}`
  return match[1].replace(/\s+/g, ' ').trim()
}

function parseListEntries(html) {
  const entries = []
  const regex = /<a href="(\/pokemon\/show\/[^"?]+\?season=\d+&rule=\d+)" class="list-pokemon button is-fullwidth">[\s\S]*?<div class="pokemon-name">([^<]+)<\/div>/g
  let match
  while ((match = regex.exec(html))) {
    const href = match[1]
    const nameJa = match[2].trim()
    const pageKeyMatch = href.match(/\/pokemon\/show\/([^?]+)/)
    if (!pageKeyMatch) continue
    entries.push({ href, pageKey: pageKeyMatch[1], nameJa })
  }
  return entries
}

function parseTopMoves(html) {
  const moves = []
  const regex = /<div class="pokemon-trend__move-item">[\s\S]*?<span class="pokemon-trend__move-name">([^<]+)<\/span>[\s\S]*?<span class="pokemon-trend__move-rate is-family-monospace">\s*([\d.]+)<small>%<\/small>/g
  let match
  while ((match = regex.exec(html))) {
    moves.push({ nameJa: match[1].trim(), rate: Number(match[2]) })
  }
  return moves
}

function baseKeyForRow(row) {
  if (row.key.startsWith('mega-')) return row.key.replace(/^mega-/, '').replace(/-(x|y)$/i, '')
  if (row.key.endsWith('-hisui')) return row.key.replace(/-hisui$/, '')
  if (row.key.endsWith('-alolan')) return row.key.replace(/-alolan$/, '')
  if (row.key.endsWith('-galarian')) return row.key.replace(/-galarian$/, '')
  if (row.key.endsWith('-paldean')) return row.key.replace(/-paldean$/, '')
  if (row.key.endsWith('-female')) return row.key.replace(/-female$/, '')
  if (row.key.endsWith('-male')) return row.key.replace(/-male$/, '')
  if (row.key === 'floette-eternal-flower') return 'floette-eternal-flower'
  return row.key
}

function japaneseNameCandidates(row, jaNameByKey) {
  const mapped = jaNameByKey[row.key] ?? row.name_ko ?? row.name_en
  const baseKey = baseKeyForRow(row)
  const baseJa = jaNameByKey[baseKey] ?? mapped
  const exact = []
  const fallback = [baseJa]

  for (const [suffix, qualifier] of Object.entries(FORM_QUALIFIER_BY_KEY)) {
    if (row.key.endsWith(`-${suffix}`)) {
      exact.push(`${baseJa} (${qualifier})`, `${baseJa}(${qualifier})`)
      break
    }
  }

  if (row.key.endsWith('-female')) exact.push(`${baseJa} (メス)`, `${baseJa}(メス)`)
  if (row.key.endsWith('-male')) exact.push(`${baseJa} (オス)`, `${baseJa}(オス)`)

  if (row.key.startsWith('mega-')) {
    if (/-(x)$/i.test(row.key)) exact.push(`メガ${baseJa} X`, `メガ${baseJa}Ｘ`, `メガ${baseJa}X`)
    else if (/-(y)$/i.test(row.key)) exact.push(`メガ${baseJa} Y`, `メガ${baseJa}Ｙ`, `メガ${baseJa}Y`)
    else exact.push(`メガ${baseJa}`)
  }

  exact.push(mapped)

  if (row.key === 'floette-eternal-flower') {
    exact.unshift('フラエッテ:永遠', 'フラエッテ (えいえんのはな)', 'フラエッテ(えいえんのはな)')
    exact.push('フラエッテ')
    fallback.push('フラエッテ', 'フラエッテ:永遠')
  }

  if (row.key === 'mega-floette') {
    fallback.push('フラエッテ:永遠')
  }

  return {
    exact: unique(exact),
    fallback: unique(fallback),
  }
}

function buildJapaneseMoveMap() {
  const jaToKo = new Map()

  for (const entry of moveMetaReport.generatedMoves ?? []) {
    const ko = entry.ko ?? entry.moveName
    const apiName = entry.apiName
    const ja = pokeApiMoveDetailsCache[apiName]?.names?.ja
    if (ja && ko) jaToKo.set(normalizeJaText(ja), ko)
  }

  const manualOverrides = {
    '１０まんボルト': '10만볼트',
    '１０まんばりき': '10만마력',
    '３ぼんのや': '3연화살',
    'アクセルブレイク': '액셀브레이크',
    'アクアブレイク': '아쿠아브레이크',
    'インファイト': '인파이트',
    'おんがえし': '은혜갚기',
    'グロウパンチ': '그로우펀치',
    'トリプルアクセル': '트리플악셀',
    'ねこだまし': '속이다',
    'とんぼがえり': '유턴',
    'ドレインパンチ': '드레인펀치',
    'マッハパンチ': '마하펀치',
    'かみなりパンチ': '번개펀치',
    'つるぎのまい': '칼춤',
    'であいがしら': '기선제압',
  }

  for (const [ja, ko] of Object.entries(manualOverrides)) {
    jaToKo.set(normalizeJaText(ja), ko)
  }

  return jaToKo
}

const jaNameByKey = await loadJaNameByKey()
const jaMoveToKo = buildJapaneseMoveMap()
const listHtml = await fetchText(`${BASE_URL}/pokemon/list?rule=${SINGLE_RULE}`)
const season = parseSelectedSeason(listHtml)
const seasonLabel = parseSeasonLabel(listHtml, season)
const listEntries = parseListEntries(listHtml)

if (!listEntries.length) throw new Error('No Pokémon entries found on Japanese Champions list page')

const listByName = new Map(listEntries.map((entry) => [normalizeJaText(entry.nameJa), entry]))
const pageCache = new Map()
const missingMoveNames = new Map()

async function getPageTopMoves(entry) {
  if (pageCache.has(entry.href)) return pageCache.get(entry.href)
  const html = await fetchText(`${BASE_URL}${entry.href}`)
  const rawMoves = parseTopMoves(html)
  const translatedMoves = []

  for (const move of rawMoves) {
    const moveKo = jaMoveToKo.get(normalizeJaText(move.nameJa))
    if (!moveKo || !availableMoveNames.has(moveKo)) {
      missingMoveNames.set(move.nameJa, (missingMoveNames.get(move.nameJa) ?? 0) + 1)
      continue
    }
    if (!translatedMoves.includes(moveKo)) translatedMoves.push(moveKo)
  }

  const payload = {
    moves: translatedMoves.slice(0, 10),
    rawMoves,
  }
  pageCache.set(entry.href, payload)
  return payload
}

const result = {}
const coverage = { exact: 0, fallback: 0, missing: 0 }

for (const row of rows) {
  const candidates = japaneseNameCandidates(row, jaNameByKey)
  const exactEntry = candidates.exact.map((name) => listByName.get(normalizeJaText(name))).find(Boolean)
  const fallbackEntry = !exactEntry
    ? candidates.fallback.map((name) => listByName.get(normalizeJaText(name))).find(Boolean)
    : null
  const entry = exactEntry ?? fallbackEntry

  if (!entry) {
    coverage.missing += 1
    continue
  }

  const { moves } = await getPageTopMoves(entry)
  if (!moves.length) {
    coverage.missing += 1
    continue
  }

  const fallback = !exactEntry
  if (fallback) coverage.fallback += 1
  else coverage.exact += 1

  result[row.key] = {
    moves,
    sourceSite: 'champs.pokedb.tokyo',
    sourceSeason: season,
    sourceSeasonLabel: seasonLabel,
    sourceRule: SINGLE_RULE,
    sourcePokemon: entry.nameJa,
    sourcePageKey: entry.pageKey,
    fallback,
  }
}

await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(result, null, 2)}\n`, 'utf8')

console.log(`Wrote ${Object.keys(result).length} usage top-move entries to ${OUTPUT_PATH}`)
console.log(`Source: champs.pokedb.tokyo season=${season} (${seasonLabel}) rule=${SINGLE_RULE}`)
console.log(`Coverage: exact=${coverage.exact}, fallback=${coverage.fallback}, missing=${coverage.missing}`)
if (missingMoveNames.size) {
  const topMissing = [...missingMoveNames.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)
  console.log('Unmapped Japanese move names:', topMissing)
}
