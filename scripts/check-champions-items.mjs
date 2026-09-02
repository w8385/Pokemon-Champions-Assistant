import fs from 'node:fs/promises'
import path from 'node:path'

const rootDir = path.resolve(new URL('..', import.meta.url).pathname)
const source = await fs.readFile(path.join(rootDir, 'src', 'championsItems.ts'), 'utf8')
const appSource = await fs.readFile(path.join(rootDir, 'src', 'App.tsx'), 'utf8')
const pokemonData = JSON.parse(await fs.readFile(path.join(rootDir, 'src', 'pokemon_champions_verified_data.json'), 'utf8'))
const optionsMatch = source.match(/export const CHAMPIONS_ITEM_OPTIONS = \[([\s\S]*?)\] as const/)
if (!optionsMatch) throw new Error('Could not find CHAMPIONS_ITEM_OPTIONS')
const options = [...optionsMatch[1].matchAll(/["']([^"']+)["']/g)].map((entry) => entry[1])

function parseRecord(name) {
  const match = source.match(new RegExp(`export const ${name}[^=]*= \\{([\\s\\S]*?)\\n\\}`))
  if (!match) throw new Error(`Could not find ${name}`)
  return new Map([...match[1].matchAll(/["']([^"']+)["']:\s*["']([^"']+)["']/g)].map((entry) => [entry[1], entry[2]]))
}

const ko = parseRecord('CHAMPIONS_ITEM_LABEL_KO')
const en = parseRecord('CHAMPIONS_ITEM_LABEL_EN')
const sprites = parseRecord('CHAMPIONS_ITEM_SPRITE_MAP')
const failures = []

const megaMapMatch = appSource.match(/const MEGA_STONE_SPRITE_BY_KEY[^=]*= \{([\s\S]*?)\n\}/)
if (!megaMapMatch) throw new Error('Could not find MEGA_STONE_SPRITE_BY_KEY')
const megaSprites = new Map([...megaMapMatch[1].matchAll(/["']([^"']+)["']:\s*["']([^"']+)["']/g)].map((entry) => [entry[1], entry[2]]))

async function assertPng(filename, label) {
  try {
    const buffer = await fs.readFile(path.join(rootDir, 'public', 'item-sprites', filename))
    const pngSignature = '89504e470d0a1a0a'
    if (buffer.length < 100 || buffer.subarray(0, 8).toString('hex') !== pngSignature) {
      failures.push(`${label}: invalid sprite file ${filename}`)
    }
  } catch {
    failures.push(`${label}: missing sprite file ${filename}`)
  }
}

for (const item of options) {
  if (!ko.get(item)) failures.push(`${item}: missing Korean label`)
  if (!en.get(item)) failures.push(`${item}: missing English label`)
  const sprite = sprites.get(item)
  if (!sprite) {
    failures.push(`${item}: missing sprite mapping`)
    continue
  }
  const filename = path.basename(sprite.endsWith('.png') ? sprite : `${sprite}.png`)
  await assertPng(filename, item)
}

if (ko.get('こだわりスカーフ') !== '구애스카프') failures.push('Choice Scarf Korean label mismatch')
if (en.get('こだわりスカーフ') !== 'Choice Scarf') failures.push('Choice Scarf English label mismatch')
if (sprites.get('こだわりスカーフ') !== 'choice-scarf') failures.push('Choice Scarf sprite mismatch')
if (!appSource.includes("canonicalChampionsItemName(item).trim() === 'こだわりスカーフ'")) {
  failures.push('Speed calculator does not detect the canonical Choice Scarf item')
}
if (!appSource.includes('mySpeedNeeds(sampleRow, sampleCalcConfig, sampleCalcMember.item, scenario.speed)')) {
  failures.push('Speed cutoff calculator does not receive the held item')
}
if (!appSource.includes('config.scarf || isChoiceScarfItem(item)')) {
  failures.push('Speed cutoff calculator does not apply the held Choice Scarf')
}

const megaKeys = pokemonData.rows.map((row) => row.key).filter((key) => key.startsWith('mega-'))
for (const key of megaKeys) {
  const sprite = megaSprites.get(key)
  if (!sprite) {
    failures.push(`${key}: missing Mega Stone sprite mapping`)
    continue
  }
  const filename = path.basename(sprite.endsWith('.png') ? sprite : `${sprite}.png`)
  await assertPng(filename, key)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(`Champions items OK: ${options.length} held items and ${megaKeys.length} Mega Stones.`)
