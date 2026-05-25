#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import Tesseract from 'tesseract.js'

const PROJECT_ROOT = path.resolve(new URL('..', import.meta.url).pathname)
const FIXTURE_DIR = path.join(PROJECT_ROOT, 'fixtures', 'party-image-import')
const REPORT_DIR = path.join(PROJECT_ROOT, 'reports')
const REPORT_PATH = path.join(REPORT_DIR, 'partyImageImportHarness.json')

const championsData = JSON.parse(await fs.readFile(path.join(PROJECT_ROOT, 'src', 'pokemon_champions_verified_data.json'), 'utf8'))
const dexDescriptions = JSON.parse(await fs.readFile(path.join(PROJECT_ROOT, 'src', 'dexDescriptions.json'), 'utf8'))
const rows = Array.isArray(championsData?.rows) ? championsData.rows : []

const FIXTURES = [
  path.join(FIXTURE_DIR, 'party-list-sample-1.png'),
  path.join(FIXTURE_DIR, 'party-list-sample-2.png'),
]
const EXPECTED_KEYS = ['ceruledge', 'archaludon', 'hippowdon', 'gyarados']

function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '')
}

function matchesLooseQuery(source, query) {
  if (!source || !query) return false
  let cursor = 0
  for (const ch of query) {
    cursor = source.indexOf(ch, cursor)
    if (cursor === -1) return false
    cursor += 1
  }
  return true
}

function cleanOcrLine(line) {
  return String(line ?? '')
    .replace(/[•·●▪■□◆◇○◎]/g, ' ')
    .replace(/[|｜]/g, 'I')
    .replace(/[“”"'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function scoreOcrCandidate(source, candidate) {
  if (!source || !candidate) return Number.POSITIVE_INFINITY
  if (source === candidate) return 0
  if (source.includes(candidate)) return source.length - candidate.length <= 6 ? 1 : 2
  if (candidate.includes(source)) return 2
  if (matchesLooseQuery(source, candidate) || matchesLooseQuery(candidate, source)) return 3
  return Number.POSITIVE_INFINITY
}

function speciesSearchCandidates(row) {
  return Array.from(new Set(
    [row.name_ko, row.name_en, row.name_ja, row.key]
      .filter(Boolean)
      .flatMap((entry) => [String(entry), normalizeSearchText(String(entry))]),
  ))
}

const speciesSearchIndex = rows.map((row) => ({ row, candidates: speciesSearchCandidates(row) }))
const abilityByKey = new Map()
for (const row of rows) {
  row.abilities.forEach((abilityKey, idx) => {
    if (!abilityByKey.has(abilityKey)) {
      abilityByKey.set(abilityKey, { key: abilityKey, koLabel: row.abilities_ko[idx] ?? abilityKey })
    }
  })
}

const moveNameAliases = { 회복: 'HP회복', 섀도클로: '섀도크루' }
function moveNameCandidates(name) {
  const base = String(name ?? '').trim()
  const alias = moveNameAliases[base]
  return Array.from(new Set([base, alias].filter(Boolean).flatMap((entry) => [entry, normalizeSearchText(entry)])))
}

const moveIndex = Object.entries(dexDescriptions.moves).map(([nameKo, description]) => ({
  nameKo,
  candidates: Array.from(new Set([
    nameKo,
    description.nameEn,
    description.nameJa,
    ...moveNameCandidates(nameKo),
  ].filter(Boolean).flatMap((entry) => [String(entry), normalizeSearchText(String(entry))]))),
}))

const abilityIndex = Object.entries(dexDescriptions.abilities).map(([abilityKey, description]) => {
  const fallback = abilityByKey.get(abilityKey)
  return {
    abilityKey,
    koLabel: fallback?.koLabel ?? description.nameKo,
    candidates: Array.from(new Set([
      abilityKey,
      fallback?.koLabel,
      description.nameKo,
      description.nameEn,
      description.nameJa,
    ].filter(Boolean).flatMap((entry) => [String(entry), normalizeSearchText(String(entry))]))),
  }
})

const itemIndex = Object.entries(dexDescriptions.items).map(([itemKey, description]) => ({
  itemKey,
  candidates: Array.from(new Set([
    itemKey,
    description.nameKo,
    description.nameEn,
    description.nameJa,
  ].filter(Boolean).flatMap((entry) => [String(entry), normalizeSearchText(String(entry))]))),
}))

const NATURES = [
  ['hardy', '노력'], ['lonely', '외로움'], ['brave', '용감'], ['adamant', '고집'], ['naughty', '개구쟁이'],
  ['bold', '대담'], ['docile', '온순'], ['relaxed', '무사태평'], ['impish', '장난꾸러기'], ['lax', '촐랑'],
  ['timid', '겁쟁이'], ['hasty', '성급'], ['serious', '성실'], ['jolly', '명랑'], ['naive', '천진난만'],
  ['modest', '조심'], ['mild', '의젓'], ['quiet', '냉정'], ['bashful', '수줍음'], ['rash', '덜렁'],
  ['calm', '차분'], ['gentle', '얌전'], ['sassy', '건방'], ['careful', '신중'], ['quirky', '변덕'],
]
const natureIndex = NATURES.map(([id, label]) => ({
  id,
  candidates: Array.from(new Set([id, label, normalizeSearchText(id), normalizeSearchText(label)])),
}))
const effortLabels = {
  hp: ['hp', 'h', '체력', 'hp체력'],
  attack: ['atk', 'attack', 'a', '공격'],
  defense: ['def', 'defense', 'b', '방어'],
  spAttack: ['spa', 'spatk', 'satk', 'specialattack', 'c', '특공', '특수공격'],
  spDefense: ['spd', 'spdef', 'sdef', 'specialdefense', 'd', '특방', '특수방어'],
  speed: ['spe', 'speed', 's', '스피드', '속도'],
}
const effortPatterns = Object.fromEntries(
  Object.entries(effortLabels).map(([stat, labels]) => [
    stat,
    labels.map((label) => new RegExp(`(?:^|[^a-z])${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:/=-]?\\s*(\\d{1,3})`, 'i')),
  ]),
)

function findBestSpeciesMatch(line) {
  const normalized = normalizeSearchText(cleanOcrLine(line))
  if (!normalized) return null
  return speciesSearchIndex.reduce((best, entry) => {
    const score = entry.candidates.reduce((min, candidate) => Math.min(min, scoreOcrCandidate(normalized, candidate)), Number.POSITIVE_INFINITY)
    if (!Number.isFinite(score)) return best
    if (!best || score < best.score) return { key: entry.row.key, score }
    return best
  }, null)
}

function findBestMoveMatch(line) {
  const normalized = normalizeSearchText(cleanOcrLine(line))
  if (!normalized) return null
  return moveIndex.reduce((best, entry) => {
    const score = entry.candidates.reduce((min, candidate) => Math.min(min, scoreOcrCandidate(normalized, candidate)), Number.POSITIVE_INFINITY)
    if (!Number.isFinite(score)) return best
    if (!best || score < best.score) return { nameKo: entry.nameKo, score }
    return best
  }, null)
}

function findBestAbilityMatch(line, key) {
  const normalized = normalizeSearchText(cleanOcrLine(line))
  const row = rows.find((entry) => entry.key === key)
  if (!normalized || !row) return null
  return abilityIndex.reduce((best, entry) => {
    if (!row.abilities.includes(entry.abilityKey)) return best
    const score = entry.candidates.reduce((min, candidate) => Math.min(min, scoreOcrCandidate(normalized, candidate)), Number.POSITIVE_INFINITY)
    if (!Number.isFinite(score)) return best
    if (!best || score < best.score) return { abilityKey: entry.abilityKey, koLabel: entry.koLabel, score }
    return best
  }, null)
}

function findBestItemMatch(line) {
  const normalized = normalizeSearchText(cleanOcrLine(line))
  if (!normalized) return null
  return itemIndex.reduce((best, entry) => {
    const score = entry.candidates.reduce((min, candidate) => Math.min(min, scoreOcrCandidate(normalized, candidate)), Number.POSITIVE_INFINITY)
    if (!Number.isFinite(score)) return best
    if (!best || score < best.score) return { itemKey: entry.itemKey, score }
    return best
  }, null)
}

function parseNature(lines) {
  for (const line of lines) {
    const normalized = normalizeSearchText(line)
    const matched = natureIndex.find((entry) => entry.candidates.some((candidate) => scoreOcrCandidate(normalized, candidate) <= 1))
    if (matched) return matched.id
  }
  return null
}

function parseEfforts(lines) {
  const next = { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 }
  for (const line of lines) {
    const normalized = normalizeSearchText(line)
    for (const stat of Object.keys(effortPatterns)) {
      for (const pattern of effortPatterns[stat]) {
        const match = normalized.match(pattern)
        if (match) {
          next[stat] = Math.max(0, Math.min(32, Math.trunc(Number(match[1]) || 0)))
          break
        }
      }
    }
  }
  return next
}

function defaultAbilityForKey(key) {
  const row = rows.find((entry) => entry.key === key)
  return row ? (row.abilities_ko[0] || row.abilities[0] || '') : ''
}

function abilityLabelForKey(key, abilityKey) {
  const row = rows.find((entry) => entry.key === key)
  if (!row) return defaultAbilityForKey(key)
  const idx = row.abilities.indexOf(abilityKey)
  return row.abilities_ko[idx] ?? defaultAbilityForKey(key)
}

function parseImportedMember(lines, speciesOverride = null) {
  const normalizedLines = lines.map(cleanOcrLine).filter(Boolean)
  const speciesKey = speciesOverride ?? normalizedLines.map((line) => findBestSpeciesMatch(line)).find((entry) => entry && entry.score <= 2)?.key ?? null
  if (!speciesKey) return null
  const moves = []
  let item = ''
  let ability = defaultAbilityForKey(speciesKey)
  for (const line of normalizedLines) {
    const itemMatch = findBestItemMatch(line)
    if (!item && itemMatch && itemMatch.score <= 2) item = itemMatch.itemKey
    const abilityMatch = findBestAbilityMatch(line, speciesKey)
    if (abilityMatch && abilityMatch.score <= 2) ability = abilityLabelForKey(speciesKey, abilityMatch.abilityKey)
    const moveMatch = findBestMoveMatch(line)
    if (moveMatch && moveMatch.score <= 2 && !moves.includes(moveMatch.nameKo)) moves.push(moveMatch.nameKo)
  }
  return {
    key: speciesKey,
    ability,
    item,
    nature: parseNature(normalizedLines),
    evs: parseEfforts(normalizedLines),
    moves: moves.slice(0, 4),
    rawLines: normalizedLines,
  }
}

function parseImportedDocuments(texts) {
  const orderedKeys = []
  const linesByKey = new Map()
  for (const text of texts) {
    const lines = text.split(/\r?\n/).map(cleanOcrLine).filter(Boolean)
    const anchors = lines
      .map((line, idx) => {
        const species = findBestSpeciesMatch(line)
        return species && species.score <= 2 ? { idx, key: species.key } : null
      })
      .filter(Boolean)
      .filter((entry, idx, list) => idx === 0 || entry.idx !== list[idx - 1].idx)
    for (let idx = 0; idx < anchors.length; idx += 1) {
      const anchor = anchors[idx]
      const nextIdx = anchors[idx + 1]?.idx ?? lines.length
      const segment = lines.slice(Math.max(0, anchor.idx - 1), nextIdx)
      if (!orderedKeys.includes(anchor.key)) orderedKeys.push(anchor.key)
      linesByKey.set(anchor.key, [...(linesByKey.get(anchor.key) ?? []), ...segment])
    }
  }
  return orderedKeys.slice(0, 6).map((key) => parseImportedMember(linesByKey.get(key) ?? [], key)).filter(Boolean)
}

await fs.mkdir(REPORT_DIR, { recursive: true })

const ocrTexts = []
const files = []
for (const filePath of FIXTURES) {
  const result = await Tesseract.recognize(filePath, 'jpn+eng+kor')
  files.push({ path: path.relative(PROJECT_ROOT, filePath), confidence: result.data.confidence ?? null })
  ocrTexts.push(result.data.text)
}

const imported = parseImportedDocuments(ocrTexts)
const importedKeys = imported.map((entry) => entry.key)
const missingKeys = EXPECTED_KEYS.filter((key) => !importedKeys.includes(key))
const report = {
  generatedAt: new Date().toISOString(),
  fixtures: files,
  expectedKeys: EXPECTED_KEYS,
  importedKeys,
  missingKeys,
  passed: missingKeys.length === 0,
  imported,
}
await fs.writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
if (missingKeys.length) process.exit(1)
