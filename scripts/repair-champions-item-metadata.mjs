import fs from 'node:fs/promises'
import path from 'node:path'

const rootDir = path.resolve(new URL('..', import.meta.url).pathname)
const sourcePath = path.join(rootDir, 'src', 'championsItems.ts')
const itemListUrl = 'https://pokeapi.co/api/v2/item?limit=2200'

function parseOptions(source) {
  const match = source.match(/export const CHAMPIONS_ITEM_OPTIONS = \[([\s\S]*?)\] as const/)
  if (!match) throw new Error('Could not find CHAMPIONS_ITEM_OPTIONS')
  return [...match[1].matchAll(/["']([^"']+)["']/g)].map((entry) => entry[1])
}

function localizedName(names, language) {
  return names.find((entry) => entry.language?.name === language)?.name ?? null
}

async function getJson(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Fetch failed ${response.status}: ${url}`)
  return response.json()
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length)
  let cursor = 0
  async function run() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await worker(items[index])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length || 1) }, run))
  return results
}

const source = await fs.readFile(sourcePath, 'utf8')
const options = parseOptions(source)
const itemList = await getJson(itemListUrl)
const details = await mapWithConcurrency(itemList.results, 24, async (entry) => {
  try {
    const data = await getJson(entry.url)
    return {
      slug: entry.name,
      ja: localizedName(data.names, 'ja-Hrkt') ?? localizedName(data.names, 'ja'),
      ko: localizedName(data.names, 'ko'),
      en: localizedName(data.names, 'en'),
    }
  } catch {
    return null
  }
})

const byJapaneseName = new Map(details.filter(Boolean).map((detail) => [detail.ja, detail]))
const missing = options.filter((item) => !byJapaneseName.has(item))
if (missing.length) throw new Error(`Missing PokéAPI item matches: ${missing.join(', ')}`)

const shortAliases = {
  'きあいのタスキ': ['기띠', '띠'],
  'こだわりスカーフ': ['스카프'],
  'たべのこし': ['먹밥'],
}

const record = (selector) => options
  .map((item) => `  ${JSON.stringify(item)}: ${selector(byJapaneseName.get(item), item)},`)
  .join('\n')

const output = `export const CHAMPIONS_ITEM_OPTIONS = [\n${options.map((item) => `  ${JSON.stringify(item)},`).join('\n')}\n] as const\n\nexport type ChampionsItem = typeof CHAMPIONS_ITEM_OPTIONS[number]\n\nexport const CHAMPIONS_ITEM_LABEL_KO: Record<ChampionsItem, string> = {\n${record((detail) => JSON.stringify(detail.ko))}\n}\n\nexport const CHAMPIONS_ITEM_LABEL_EN: Record<ChampionsItem, string> = {\n${record((detail) => JSON.stringify(detail.en))}\n}\n\nexport const CHAMPIONS_ITEM_ALIASES: Partial<Record<ChampionsItem, string[]>> = {\n${record((detail, item) => JSON.stringify([...new Set([detail.ko, detail.en, ...(shortAliases[item] ?? [])])]))}\n}\n\nexport const CHAMPIONS_ITEM_SPRITE_MAP: Record<ChampionsItem, string> = {\n${record((detail) => JSON.stringify(detail.slug))}\n}\n\nexport function localizedChampionsItemLabel(item: string, language: 'ko' | 'en' | 'ja' = 'ko') {\n  if (language === 'ja') return item\n  if (language === 'ko') return CHAMPIONS_ITEM_LABEL_KO[item as ChampionsItem] ?? item\n  return CHAMPIONS_ITEM_LABEL_EN[item as ChampionsItem] ?? CHAMPIONS_ITEM_LABEL_KO[item as ChampionsItem] ?? item\n}\n`

await fs.writeFile(sourcePath, output)
console.log(`Repaired ${options.length} Champions item records from exact Japanese PokéAPI names.`)
