import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(new URL('..', import.meta.url).pathname)
const sourcePath = path.join(root, 'src', 'pokemon_champions_verified_data.json')
const outputPath = path.join(root, 'src', 'championSpriteHashes.json')

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
const results = []
for (const row of rows) {
  if (!row?.key || !row?.sprite) continue
  try {
    const hash = await hashSprite(row.sprite)
    results.push({ key: row.key, hash })
    console.log(`hashed ${row.key}`)
  } catch (error) {
    console.warn(`failed ${row.key}: ${error instanceof Error ? error.message : String(error)}`)
  }
}
await fs.writeFile(outputPath, `${JSON.stringify(results, null, 2)}\n`)
console.log(`wrote ${results.length} sprite hashes -> ${outputPath}`)
