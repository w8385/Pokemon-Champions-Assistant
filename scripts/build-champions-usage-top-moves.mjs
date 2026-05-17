import fs from 'node:fs/promises'
import path from 'node:path'
import championsData from '../src/pokemon_champions_verified_data.json' with { type: 'json' }
import moveMetaReport from '../reports/championsMoveMetaReport.json' with { type: 'json' }
import championsLearnedMoveMeta from '../src/championsLearnedMoveMeta.json' with { type: 'json' }

const FORMAT_PRIORITY = [
  'gen9nationaldexag',
  'gen9nationaldexubers',
  'gen9nationaldex',
  'gen9nationaldexuu',
  'gen9nationaldexru',
  'gen9ubers',
  'gen9ou',
  'gen9uu',
  'gen9ru',
  'gen9nu',
  'gen9pu',
  'gen9zu',
]

const OUTPUT_PATH = path.resolve('src/championsUsageTopMoves.json')
const STATS_BASE_URL = 'https://pkmn.github.io/smogon/data/stats'
const rows = championsData.rows ?? []
const availableMoveNames = new Set(Object.keys(championsLearnedMoveMeta))

const englishToKoreanMove = new Map(
  (moveMetaReport.generatedMoves ?? [])
    .map((entry) => [entry.en, entry.ko ?? entry.moveName])
    .filter(([en, ko]) => en && ko),
)

function hyphenate(value) {
  return value.replace(/ /g, '-')
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function exactSpeciesCandidates(nameEn) {
  const values = [nameEn, hyphenate(nameEn)]
  const megaSimple = /^Mega\s+(.+)$/.exec(nameEn)
  if (megaSimple) {
    const base = megaSimple[1]
    values.push(`${base}-Mega`, `${hyphenate(base)}-Mega`)
  }
  const megaSplit = /^Mega\s+(.+)\s+([A-Z])$/.exec(nameEn)
  if (megaSplit) {
    const [, base, suffix] = megaSplit
    values.push(`${base}-Mega-${suffix}`, `${hyphenate(base)}-Mega-${suffix}`)
  }
  const alola = /^(.*) Alolan$/.exec(nameEn)
  if (alola) values.push(`${alola[1]}-Alola`, `${hyphenate(alola[1])}-Alola`)
  const galar = /^(.*) Galarian$/.exec(nameEn)
  if (galar) values.push(`${galar[1]}-Galar`, `${hyphenate(galar[1])}-Galar`)
  const paldea = /^(.*) Paldean$/.exec(nameEn)
  if (paldea) values.push(`${paldea[1]}-Paldea`, `${hyphenate(paldea[1])}-Paldea`)
  const male = /^(.*) Male$/.exec(nameEn)
  if (male) values.push(`${male[1]}-M`, `${hyphenate(male[1])}-M`)
  const female = /^(.*) Female$/.exec(nameEn)
  if (female) values.push(`${female[1]}-F`, `${hyphenate(female[1])}-F`)
  if (nameEn === 'Floette Eternal Flower') values.push('Floette-Eternal')
  return unique(values)
}

function fallbackSpeciesCandidates(nameEn) {
  const values = []
  const megaSimple = /^Mega\s+(.+)$/.exec(nameEn)
  if (megaSimple) {
    const base = megaSimple[1].replace(/\s+[A-Z]$/, '')
    values.push(base, hyphenate(base))
  }
  const regional = /^(.*) (Alolan|Galarian|Paldean)$/.exec(nameEn)
  if (regional) values.push(regional[1], hyphenate(regional[1]))
  const gendered = /^(.*) (Male|Female)$/.exec(nameEn)
  if (gendered) values.push(gendered[1], hyphenate(gendered[1]))
  if (nameEn === 'Floette Eternal Flower') values.push('Floette', 'Floette-Eternal')
  if (nameEn === 'Tauros Paldean') values.push('Tauros')
  if (nameEn === 'Gourgeist') values.push('Gourgeist-Super', 'Gourgeist-Large', 'Gourgeist-Average', 'Gourgeist-Small')
  if (nameEn === 'Palafin') values.push('Palafin-Hero', 'Palafin')
  if (nameEn === 'Basculegion Male') values.push('Basculegion-M')
  if (nameEn === 'Basculegion Female') values.push('Basculegion-F')
  return unique(values)
}

function resolveTopMoves(pokemonStats) {
  if (!pokemonStats?.moves) return []
  return Object.entries(pokemonStats.moves)
    .sort((a, b) => b[1] - a[1])
    .map(([moveEn]) => englishToKoreanMove.get(moveEn))
    .filter((moveKo) => moveKo && availableMoveNames.has(moveKo))
    .filter((moveKo, index, arr) => arr.indexOf(moveKo) === index)
    .slice(0, 10)
}

async function fetchFormat(format) {
  const response = await fetch(`${STATS_BASE_URL}/${format}.json`)
  if (!response.ok) throw new Error(`Failed to fetch ${format}: ${response.status}`)
  return response.json()
}

const datasets = new Map()
for (const format of FORMAT_PRIORITY) {
  datasets.set(format, await fetchFormat(format))
}

const result = {}
const coverage = { exact: 0, fallback: 0, missing: 0 }

for (const row of rows) {
  const exactCandidates = exactSpeciesCandidates(row.name_en)
  const fallbackCandidates = fallbackSpeciesCandidates(row.name_en)
  let found = null

  for (const format of FORMAT_PRIORITY) {
    const pokemon = datasets.get(format)?.pokemon ?? {}
    const exactMatch = exactCandidates.find((candidate) => pokemon[candidate])
    if (exactMatch) {
      found = { format, sourcePokemon: exactMatch, fallback: false, stats: pokemon[exactMatch] }
      break
    }
  }

  if (!found) {
    for (const format of FORMAT_PRIORITY) {
      const pokemon = datasets.get(format)?.pokemon ?? {}
      const fallbackMatch = fallbackCandidates.find((candidate) => pokemon[candidate])
      if (fallbackMatch) {
        found = { format, sourcePokemon: fallbackMatch, fallback: true, stats: pokemon[fallbackMatch] }
        break
      }
    }
  }

  if (!found) {
    coverage.missing += 1
    continue
  }

  const moves = resolveTopMoves(found.stats)
  if (!moves.length) {
    coverage.missing += 1
    continue
  }

  if (found.fallback) coverage.fallback += 1
  else coverage.exact += 1

  result[row.key] = {
    moves,
    sourceFormat: found.format,
    sourcePokemon: found.sourcePokemon,
    fallback: found.fallback,
  }
}

await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
console.log(`Wrote ${Object.keys(result).length} usage top-move entries to ${OUTPUT_PATH}`)
console.log(`Coverage: exact=${coverage.exact}, fallback=${coverage.fallback}, missing=${coverage.missing}`)
