import fs from 'node:fs/promises'
import path from 'node:path'

const GUIDE_URL = 'https://champs.pokedb.tokyo/guide/opendata'
const ROOT_URL = 'https://champs.pokedb.tokyo'
const ITEM_SPRITE_MAP = {
  'きあいのタスキ': 'focus-sash',
  'こだわりスカーフ': 'choice-scarf',
  'たべのこし': 'leftovers',
  'ひかりのこな': 'bright-powder',
  'メタルコート': 'metal-coat',
  'メンタルハーブ': 'mental-herb',
  'オッカのみ': 'occa-berry',
  'ヤチェのみ': 'yache-berry',
  'ロゼルのみ': 'roseli-berry',
}

const rootDir = path.resolve(new URL('..', import.meta.url).pathname)
const srcPath = path.join(rootDir, 'src', 'championsItems.ts')
const reportPath = path.join(rootDir, 'reports', 'championsItemWhitelistReport.json')

function absoluteUrl(href) {
  return new URL(href, ROOT_URL).toString()
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'ja'))
}

function isMegaStone(item) {
  return item.includes('ナイト')
}

function toTsStringArray(items, indent = '  ') {
  return items.map((item) => `${indent}${JSON.stringify(item)},`).join('\n')
}

const guideHtml = await fetch(GUIDE_URL).then((res) => {
  if (!res.ok) throw new Error(`Failed to fetch guide: ${res.status}`)
  return res.text()
})

const jsonUrls = uniqueSorted(
  [...guideHtml.matchAll(/href="(\/opendata\/[^"]+\.json)"/g)].map((match) => absoluteUrl(match[1])),
)

if (!jsonUrls.length) throw new Error('No opendata JSON URLs found on guide page')

const datasets = []
const allItems = []
for (const url of jsonUrls) {
  const data = await fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Failed to fetch dataset ${url}: ${res.status}`)
    return res.json()
  })
  const items = []
  for (const teamEntry of data.teams ?? []) {
    for (const member of teamEntry.team ?? []) {
      if (typeof member.item === 'string' && member.item.trim()) items.push(member.item.trim())
    }
  }
  const uniqueItems = uniqueSorted(items)
  datasets.push({
    url,
    season: data.season ?? null,
    rule: data.rule ?? null,
    updatedAt: data.updated_at ?? null,
    uniqueItemCount: uniqueItems.length,
    uniqueItems,
  })
  allItems.push(...uniqueItems)
}

const uniqueItems = uniqueSorted(allItems)
const excludedMegaStones = uniqueItems.filter(isMegaStone)
const excludedNoItem = uniqueItems.filter((item) => item === '持ち物なし')
const whitelistItems = uniqueItems.filter((item) => item !== '持ち物なし' && !isMegaStone(item))

const ts = `export const CHAMPIONS_ITEM_OPTIONS = [\n${toTsStringArray(whitelistItems)}\n] as const\n\nexport type ChampionsItem = typeof CHAMPIONS_ITEM_OPTIONS[number]\n\nexport const CHAMPIONS_ITEM_ALIASES: Partial<Record<ChampionsItem, string[]>> = {}\n\nexport const CHAMPIONS_ITEM_SPRITE_MAP: Partial<Record<ChampionsItem, string>> = {\n${Object.entries(ITEM_SPRITE_MAP)
  .filter(([item]) => whitelistItems.includes(item))
  .map(([item, slug]) => `  ${JSON.stringify(item)}: ${JSON.stringify(slug)},`)
  .join('\n')}\n}\n`

const report = {
  generatedAt: new Date().toISOString(),
  sourceGuideUrl: GUIDE_URL,
  sourceJsonUrls: jsonUrls,
  datasets,
  extractedItemCount: uniqueItems.length,
  whitelistItemCount: whitelistItems.length,
  excludedMegaStoneCount: excludedMegaStones.length,
  excludedMegaStones,
  excludedNoItemCount: excludedNoItem.length,
  excludedNoItem,
  whitelistItems,
  notes: [
    'Whitelist is built from publicly linked Champions opendata JSON files.',
    'Mega stones are excluded because the app handles mega items separately via species-locked item generation.',
    '持ち物なし is excluded because the app represents no-item as an empty value.',
  ],
}

await fs.writeFile(srcPath, ts)
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(`wrote ${path.relative(rootDir, srcPath)} (${whitelistItems.length} items)`)
console.log(`wrote ${path.relative(rootDir, reportPath)}`)
