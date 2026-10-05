import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildSpeedLine } from '../src/speedLine.ts'
import { actualStat } from '../src/statMechanics.ts'

const species = [
  { key: 'slow', name_ko: '느림', name_en: 'Slow', speed: 50 },
  { key: 'fast', name_ko: '빠름', name_en: 'Fast', speed: 100 },
  { key: 'tie', name_ko: '동속', name_en: 'Tie', speed: 100 },
]

test('level-50 Champions actual Speed is sorted descending, with stable ties', () => {
  const result = buildSpeedLine(species, { effort: 32, nature: 'boost', query: '', forms: 'all' })
  assert.deepEqual(result.map(({ row, speed }) => [row.key, speed]), [
    ['fast', 167], ['tie', 167], ['slow', 112],
  ])
  assert.equal(result[0].speed, actualStat(100, 32, 1.1))
})

test('search matches localized names and keys while mega filter is precise', () => {
  const entries = [
    ...species,
    { key: 'mega-fast', name_ko: '메가빠름', name_en: 'Mega Fast', speed: 130 },
    { key: 'mr-mime', name_ko: '마임맨', name_en: 'Mr. Mime', speed: 90 },
  ]
  const options = { effort: 0, nature: 'neutral', query: '', forms: 'nonMega' }
  assert.deepEqual(buildSpeedLine(entries, options).map((entry) => entry.row.key), ['fast', 'tie', 'mr-mime', 'slow'])
  assert.deepEqual(buildSpeedLine(entries, { ...options, forms: 'mega' }).map((entry) => entry.row.key), ['mega-fast'])
  assert.deepEqual(buildSpeedLine(entries, { ...options, query: '마임' }).map((entry) => entry.row.key), ['mr-mime'])
  assert.deepEqual(buildSpeedLine(entries, { ...options, query: 'MIME' }).map((entry) => entry.row.key), ['mr-mime'])
})

test('full verified roster is ordered by computed Speed, not base-stat table order', () => {
  const data = JSON.parse(readFileSync(new URL('../src/pokemon_champions_verified_data.json', import.meta.url), 'utf8'))
  const sorted = buildSpeedLine(data.rows, { effort: 0, nature: 'lower', query: '', forms: 'all' })
  assert.equal(sorted.length, data.rows.length)
  assert.ok(sorted.length > 300)
  assert.ok(sorted.every((entry, i) => i === 0 || sorted[i - 1].speed >= entry.speed))
  assert.ok(sorted.every(({ row, speed }) => speed === actualStat(row.speed, 0, 0.9)))
})

test('independent speed-line route and navigation retain existing menus and shared calculator', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const types = readFileSync(new URL('../src/app/types.ts', import.meta.url), 'utf8')
  assert.match(types, /'speedLine'/)
  assert.match(app, /routePath === '\/speed-line'/)
  assert.match(app, /setMainSection\('speedLine'\)/)
  assert.match(app, /<SpeedLinePanel rows=\{rows\} state=\{speedLineState\}/)
  assert.match(app, /import \{ actualStat \} from '\.\/statMechanics'/)
  assert.doesNotMatch(app, /function actualStat\(/)
  assert.doesNotMatch(app, /setSampleWorkbenchTab\('rankers'\)/)
  assert.match(app, /setMainSection\('dex'\)/)
})
