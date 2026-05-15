import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const appPath = path.join(root, 'src', 'App.tsx')
const reportPath = path.join(root, 'reports', 'typeEffectivenessHarness.json')

const TYPES = ['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy']

function extractTypeChart(source) {
  const match = source.match(/const typeChart:[\s\S]*?=\s*(\{[\s\S]*?\n\})\n\n(?:const|function) /)
  if (!match) throw new Error('typeChart block not found')
  return Function(`"use strict"; return (${match[1]});`)()
}

function buildMatrixFromChart(typeChart) {
  const normalizedChart = Object.fromEntries(
    Object.entries(typeChart).map(([attack, targets]) => [
      attack.toLowerCase(),
      Object.fromEntries(Object.entries(targets).map(([defend, value]) => [defend.toLowerCase(), value])),
    ]),
  )
  const matrix = {}
  for (const attack of TYPES) {
    matrix[attack] = {}
    for (const defend of TYPES) {
      matrix[attack][defend] = normalizedChart[attack]?.[defend] ?? 1
    }
  }
  return matrix
}

async function fetchTypeRelations() {
  const entries = await Promise.all(TYPES.map(async (type) => {
    const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`)
    if (!res.ok) throw new Error(`failed type fetch ${type}: ${res.status}`)
    const data = await res.json()
    const matrixRow = Object.fromEntries(TYPES.map((defend) => [defend, 1]))
    for (const target of data.damage_relations.double_damage_to ?? []) matrixRow[target.name] = 2
    for (const target of data.damage_relations.half_damage_to ?? []) matrixRow[target.name] = 0.5
    for (const target of data.damage_relations.no_damage_to ?? []) matrixRow[target.name] = 0
    return [type, matrixRow]
  }))
  return Object.fromEntries(entries)
}

function diffMatrices(localMatrix, remoteMatrix) {
  const diffs = []
  for (const attack of TYPES) {
    for (const defend of TYPES) {
      const local = localMatrix[attack][defend]
      const remote = remoteMatrix[attack][defend]
      if (local !== remote) diffs.push({ attack, defend, local, remote })
    }
  }
  return diffs
}

const source = await fs.readFile(appPath, 'utf8')
const localChart = extractTypeChart(source)
const localMatrix = buildMatrixFromChart(localChart)
const remoteMatrix = await fetchTypeRelations()
const diffs = diffMatrices(localMatrix, remoteMatrix)

const report = {
  generatedAt: new Date().toISOString(),
  source: {
    local: 'src/App.tsx#typeChart',
    remote: 'PokeAPI /type endpoints',
  },
  totals: {
    types: TYPES.length,
    pairs: TYPES.length * TYPES.length,
    mismatches: diffs.length,
  },
  mismatches: diffs,
}

await fs.mkdir(path.dirname(reportPath), { recursive: true })
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(`wrote ${path.relative(root, reportPath)}`)
console.log(`mismatches: ${diffs.length}`)
if (diffs.length) {
  for (const diff of diffs.slice(0, 20)) console.log(`${diff.attack} -> ${diff.defend}: local=${diff.local} remote=${diff.remote}`)
  process.exitCode = 1
}
