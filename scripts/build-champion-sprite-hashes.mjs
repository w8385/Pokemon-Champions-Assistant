import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { atomicReplaceFiles, readJsonIfExists } from './lib/atomic-output.mjs'

const root = path.resolve(new URL('..', import.meta.url).pathname)
const sourcePath = path.join(root, 'src', 'canonical-data/champions/pokemon_champions_verified_data.json')
const optionIndex = process.argv.indexOf('--output')
if (optionIndex >= 0 && !process.argv[optionIndex + 1]) throw new Error('Missing value for --output')
const outputPath = optionIndex >= 0 ? path.resolve(process.argv[optionIndex + 1]) : path.join(root, 'src', 'assets/championSpriteHashes.json')
const allowPartial = process.argv.includes('--allow-partial')

function computeDHash(buffer) {
  const bits = []
  for (let y = 0; y < 16; y += 1) {
    for (let x = 0; x < 15; x += 1) {
      const left = buffer[y * 16 + x]
      const right = buffer[y * 16 + x + 1]
      bits.push(left > right ? '1' : '0')
    }
  }
  let hex = ''
  for (let i = 0; i < bits.length; i += 4) {
    hex += Number.parseInt(bits.slice(i, i + 4).join(''), 2).toString(16)
  }
  return hex
}

async function hashSprite(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`sprite fetch failed: ${url} (${res.status})`)
  const arrayBuffer = await res.arrayBuffer()
  const image = sharp(Buffer.from(arrayBuffer)).flatten({ background: '#ffffff' }).grayscale().resize(16, 16, { fit: 'contain', background: '#ffffff' }).raw()
  const { data } = await image.toBuffer({ resolveWithObject: true })
  return computeDHash(data)
}

const raw = JSON.parse(await fs.readFile(sourcePath, 'utf8'))
const rows = Array.isArray(raw?.rows) ? raw.rows : []
const previous = await readJsonIfExists(outputPath, [])
const results = []
const failures = []
for (const row of rows) {
  if (!row?.key || !row?.sprite) continue
  try {
    const hash = await hashSprite(row.sprite)
    results.push({ key: row.key, hash })
    console.log(`hashed ${row.key}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    failures.push({ key: row.key, message })
    console.warn(`failed ${row.key}: ${message}`)
  }
}
const resultKeys = results.map(entry => entry.key)
const uniqueKeys = new Set(resultKeys)
if (!results.length) throw new Error('Refusing to replace sprite hashes with an empty result')
if (uniqueKeys.size !== results.length) throw new Error('Refusing duplicate sprite hash keys')
if (results.some(entry => !/^[0-9a-f]{60}$/.test(entry.hash))) throw new Error('Refusing malformed sprite hashes')
const previousKeys = new Set(Array.isArray(previous) ? previous.map(entry => entry?.key).filter(Boolean) : [])
const retainedPrevious = [...previousKeys].filter(key => uniqueKeys.has(key)).length
const coverageCollapsed = previousKeys.size > 0 && (
  results.length < Math.ceil(previousKeys.size * 0.95)
  || retainedPrevious < Math.ceil(previousKeys.size * 0.95)
)
if (!allowPartial && (failures.length || coverageCollapsed)) {
  throw new Error(`Refusing partial sprite hashes: failures=${failures.length}, previous=${previousKeys.size}, next=${results.length}, retained=${retainedPrevious}`)
}
if (allowPartial && (failures.length || coverageCollapsed)) {
  console.warn(`Allowing reviewed partial sprite hashes: failures=${failures.length}, previous=${previousKeys.size}, next=${results.length}, retained=${retainedPrevious}`)
}
await atomicReplaceFiles([{ target: outputPath, content: `${JSON.stringify(results, null, 2)}\n` }])
console.log(`wrote ${results.length} sprite hashes -> ${outputPath}`)
