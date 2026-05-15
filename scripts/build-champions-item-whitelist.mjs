import fs from 'node:fs/promises'
import path from 'node:path'

const GUIDE_URL = 'https://champs.pokedb.tokyo/guide/opendata'
const ROOT_URL = 'https://champs.pokedb.tokyo'
const POKEAPI_ITEM_LIST_URL = 'https://pokeapi.co/api/v2/item?limit=2200'

const MANUAL_SHORT_ALIASES = {
  'きあいのタスキ': ['기띠', '띠'],
  'こだわりスカーフ': ['스카프'],
  'たべのこし': ['먹밥', '남은음식'],
  'ひかりのこな': ['반짝가루'],
  'メタルコート': ['금속코트'],
  'メンタルハーブ': ['멘탈허브'],
  'ようせいのハネ': ['요정의깃털'],
}

const MANUAL_KO_LABELS = {
  'ようせいのハネ': '요정의깃털',
}

const MANUAL_SPRITE_PATHS = {
  'ようせいのハネ': 'item-sprites/fairy-feather.png',
}

const rootDir = path.resolve(new URL('..', import.meta.url).pathname)
const srcPath = path.join(rootDir, 'src', 'championsItems.ts')
const reportPath = path.join(rootDir, 'reports', 'championsItemWhitelistReport.json')

function absoluteUrl(href) {
  return new URL(href, ROOT_URL).toString()
}

function uniqueSorted(values, locale = 'ja') {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, locale))
}

function isMegaStone(item) {
  return item.includes('ナイト')
}

function toTsStringArray(items, indent = '  ') {
  return items.map((item) => `${indent}${JSON.stringify(item)},`).join('\n')
}

async function getJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`)
  return res.json()
}

function getLocalizedName(names, lang) {
  return names.find((entry) => entry.language?.name === lang)?.name ?? null
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
  const data = await getJson(url)
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

const itemList = await getJson(POKEAPI_ITEM_LIST_URL)
const detailsByJa = new Map()
let cursor = 0
const concurrency = 24

async function worker() {
  while (cursor < itemList.results.length) {
    const index = cursor
    cursor += 1
    const entry = itemList.results[index]
    try {
      const data = await getJson(entry.url)
      const ja = getLocalizedName(data.names, 'ja-Hrkt') ?? getLocalizedName(data.names, 'ja')
      if (!ja || !whitelistItems.includes(ja)) continue
      detailsByJa.set(ja, {
        apiName: entry.name,
        ko: getLocalizedName(data.names, 'ko'),
        en: getLocalizedName(data.names, 'en'),
      })
    } catch {
      // skip bad item detail; report will show missing label
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()))

const koLabelEntries = whitelistItems
  .map((item) => [item, MANUAL_KO_LABELS[item] ?? detailsByJa.get(item)?.ko ?? null])
  .filter(([, ko]) => typeof ko === 'string' && ko)

const enLabelEntries = whitelistItems
  .map((item) => [item, detailsByJa.get(item)?.en ?? null])
  .filter(([, en]) => typeof en === 'string' && en)

const aliasEntries = whitelistItems.map((item) => {
  const aliases = uniqueSorted([
    ...(detailsByJa.get(item)?.ko ? [detailsByJa.get(item).ko] : []),
    ...(detailsByJa.get(item)?.en ? [detailsByJa.get(item).en] : []),
    ...(MANUAL_SHORT_ALIASES[item] ?? []),
  ], 'ko')
  return [item, aliases]
}).filter(([, aliases]) => aliases.length)

const spriteEntries = whitelistItems
  .map((item) => [item, MANUAL_SPRITE_PATHS[item] ?? detailsByJa.get(item)?.apiName ?? null])
  .filter(([, apiName]) => typeof apiName === 'string' && apiName)

const ts = `export const CHAMPIONS_ITEM_OPTIONS = [\n${toTsStringArray(whitelistItems)}\n] as const\n\nexport type ChampionsItem = typeof CHAMPIONS_ITEM_OPTIONS[number]\n\nexport const CHAMPIONS_ITEM_LABEL_KO: Partial<Record<ChampionsItem, string>> = {\n${koLabelEntries.map(([item, ko]) => `  ${JSON.stringify(item)}: ${JSON.stringify(ko)},`).join('\n')}\n}\n\nexport const CHAMPIONS_ITEM_LABEL_EN: Partial<Record<ChampionsItem, string>> = {\n${enLabelEntries.map(([item, en]) => `  ${JSON.stringify(item)}: ${JSON.stringify(en)},`).join('\n')}\n}\n\nexport const CHAMPIONS_ITEM_ALIASES: Partial<Record<ChampionsItem, string[]>> = {\n${aliasEntries.map(([item, aliases]) => `  ${JSON.stringify(item)}: [${aliases.map((alias) => JSON.stringify(alias)).join(', ')}],`).join('\n')}\n}\n\nexport const CHAMPIONS_ITEM_SPRITE_MAP: Partial<Record<ChampionsItem, string>> = {\n${spriteEntries.map(([item, slug]) => `  ${JSON.stringify(item)}: ${JSON.stringify(slug)},`).join('\n')}\n}\n\nexport function localizedChampionsItemLabel(item: string, language: 'ko' | 'en' | 'ja' = 'ko') {\n  if (language === 'ja') return item\n  if (language === 'ko') return CHAMPIONS_ITEM_LABEL_KO[item as ChampionsItem] ?? item\n  return CHAMPIONS_ITEM_LABEL_EN[item as ChampionsItem] ?? CHAMPIONS_ITEM_LABEL_KO[item as ChampionsItem] ?? item\n}\n`

const missingKoLabels = whitelistItems.filter((item) => !(MANUAL_KO_LABELS[item] ?? detailsByJa.get(item)?.ko))

const report = {
  generatedAt: new Date().toISOString(),
  sourceGuideUrl: GUIDE_URL,
  sourceJsonUrls: jsonUrls,
  sourcePokeApiItemListUrl: POKEAPI_ITEM_LIST_URL,
  datasets,
  extractedItemCount: uniqueItems.length,
  whitelistItemCount: whitelistItems.length,
  excludedMegaStoneCount: excludedMegaStones.length,
  excludedMegaStones,
  excludedNoItemCount: excludedNoItem.length,
  excludedNoItem,
  whitelistItems,
  verifiedKoLabels: Object.fromEntries(koLabelEntries),
  missingKoLabels,
  manualSpritePaths: MANUAL_SPRITE_PATHS,
  notes: [
    'Whitelist is built from publicly linked Champions opendata JSON files.',
    'Japanese item names remain the source-of-truth for reverse-mapping Champions opendata.',
    'Korean labels are sourced from PokeAPI item names when available.',
    'Mega stones are excluded because the app handles mega items separately via species-locked item generation.',
    '持ち物なし is excluded because the app represents no-item as an empty value.',
  ],
}

await fs.writeFile(srcPath, ts)
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(`wrote ${path.relative(rootDir, srcPath)} (${whitelistItems.length} items)`)
console.log(`wrote ${path.relative(rootDir, reportPath)}`)
if (missingKoLabels.length) console.log(`missing ko labels: ${missingKoLabels.join(', ')}`)
