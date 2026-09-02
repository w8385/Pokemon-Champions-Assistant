import fs from 'node:fs/promises'
import path from 'node:path'

const GUIDE_URL = 'https://champs.pokedb.tokyo/guide/opendata'
const ROOT_URL = 'https://champs.pokedb.tokyo'
const POKEMON_LIST_URL = `${ROOT_URL}/pokemon/list`
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
  'こだわりスカーフ': 'choice-scarf',
  'ようせいのハネ': 'fairy-feather',
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

async function getText(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`)
  return res.text()
}

function getLocalizedName(names, lang) {
  return names.find((entry) => entry.language?.name === lang)?.name ?? null
}

function decodeHtmlEntities(value) {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&#34;', '"')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
}

function parseUsagePieCharts(html) {
  const arrays = [...html.matchAll(/usagePieChart\((\[.*?\])\)/g)].map((match) => match[1])
  return arrays
    .map((encoded) => {
      try {
        return JSON.parse(decodeHtmlEntities(encoded))
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

function parseCurrentSeasonNumber(listHtml) {
  const seasonMatches = [...listHtml.matchAll(/\/pokemon\/show\/\d{4}-\d{2}\?season=(\d+)&rule=0/g)].map((match) => Number(match[1]))
  const maxSeason = Math.max(...seasonMatches, 0)
  if (!maxSeason) throw new Error('Failed to detect current season from pokemon list page')
  return maxSeason
}

function extractShowUrls(listHtml, season, rule) {
  const pattern = new RegExp(`/pokemon/show/\\d{4}-\\d{2}\\?season=${season}&rule=${rule}`, 'g')
  return uniqueSorted([...listHtml.matchAll(pattern)].map((match) => absoluteUrl(match[0])))
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length)
  let cursor = 0
  async function run() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await worker(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length || 1) }, () => run()))
  return results
}

const guideHtml = await getText(GUIDE_URL)
const listHtmlCurrentSingle = await getText(`${POKEMON_LIST_URL}?rule=0`)
const currentSeasonNumber = parseCurrentSeasonNumber(listHtmlCurrentSingle)

const jsonUrls = uniqueSorted(
  [...guideHtml.matchAll(/href="(\/opendata\/[^\"]+\.json)"/g)].map((match) => absoluteUrl(match[1])),
)

if (!jsonUrls.length) throw new Error('No opendata JSON URLs found on guide page')

const usageListPages = []
for (let season = 1; season <= currentSeasonNumber; season += 1) {
  for (const rule of [0, 1]) {
    const url = `${POKEMON_LIST_URL}?season=${season}&rule=${rule}`
    const html = season === currentSeasonNumber && rule === 0 ? listHtmlCurrentSingle : await getText(url)
    const showUrls = extractShowUrls(html, season, rule)
    usageListPages.push({
      url,
      season,
      rule,
      showPageCount: showUrls.length,
      showUrls,
    })
  }
}

const datasets = []
const opendataItems = []
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
  opendataItems.push(...uniqueItems)
}

const usagePageRecords = await mapWithConcurrency(
  usageListPages.flatMap((page) => page.showUrls.map((showUrl) => ({ season: page.season, rule: page.rule, showUrl }))),
  6,
  async ({ season, rule, showUrl }) => {
    const html = await getText(showUrl)
    const itemCharts = parseUsagePieCharts(html).filter((rows) => rows[0] && typeof rows[0].item_key === 'number')
    const items = []
    for (const rows of itemCharts) {
      for (const row of rows) {
        if (typeof row?.name !== 'string' || typeof row?.item_key !== 'number') continue
        items.push({
          itemKey: row.item_key,
          name: row.name,
          rank: row.rank ?? null,
          rate: row.rate ?? null,
        })
      }
    }
    return { season, rule, showUrl, items }
  },
)

const usageItemMap = new Map()
for (const record of usagePageRecords) {
  for (const item of record.items) {
    const current = usageItemMap.get(item.name) ?? {
      itemKeys: new Set(),
      pages: [],
      seasonRules: new Set(),
      bestRank: Number.POSITIVE_INFINITY,
      highestRate: 0,
    }
    current.itemKeys.add(item.itemKey)
    current.pages.push({ url: record.showUrl, season: record.season, rule: record.rule, rank: item.rank, rate: item.rate })
    current.seasonRules.add(`S${record.season}-R${record.rule}`)
    if (typeof item.rank === 'number') current.bestRank = Math.min(current.bestRank, item.rank)
    if (typeof item.rate === 'number') current.highestRate = Math.max(current.highestRate, item.rate)
    usageItemMap.set(item.name, current)
  }
}

const usageItems = uniqueSorted([...usageItemMap.keys()])
const opendataUniqueItems = uniqueSorted(opendataItems)
const combinedItems = uniqueSorted([...usageItems, ...opendataUniqueItems])
const excludedMegaStones = combinedItems.filter(isMegaStone)
const excludedNoItem = combinedItems.filter((item) => item === '持ち物なし')
const whitelistItems = combinedItems.filter((item) => item !== '持ち物なし' && !isMegaStone(item))

const onlyInUsagePages = whitelistItems.filter((item) => usageItemMap.has(item) && !opendataUniqueItems.includes(item))
const onlyInOpenData = whitelistItems.filter((item) => opendataUniqueItems.includes(item) && !usageItemMap.has(item))
const inBothSources = whitelistItems.filter((item) => usageItemMap.has(item) && opendataUniqueItems.includes(item))

const itemList = await getJson(POKEAPI_ITEM_LIST_URL)
const detailsByJa = new Map()
const detailsById = new Map()
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
      const detail = {
        id: data.id,
        apiName: entry.name,
        ko: getLocalizedName(data.names, 'ko'),
        en: getLocalizedName(data.names, 'en'),
      }
      detailsById.set(data.id, detail)
      if (ja) detailsByJa.set(ja, detail)
    } catch {
      // skip bad item detail; report will show missing label
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()))

function detailForItem(item) {
  // Usage-site item_key values are not PokéAPI item IDs. Prefer the exact
  // Japanese localized name match; treating item_key as a PokéAPI ID shifts
  // labels and sprites onto unrelated items.
  return detailsByJa.get(item) ?? null
}

const koLabelEntries = whitelistItems
  .map((item) => [item, MANUAL_KO_LABELS[item] ?? detailForItem(item)?.ko ?? null])
  .filter(([, ko]) => typeof ko === 'string' && ko)

const enLabelEntries = whitelistItems
  .map((item) => [item, detailForItem(item)?.en ?? null])
  .filter(([, en]) => typeof en === 'string' && en)

const aliasEntries = whitelistItems.map((item) => {
  const detail = detailForItem(item)
  const aliases = uniqueSorted([
    ...(detail?.ko ? [detail.ko] : []),
    ...(detail?.en ? [detail.en] : []),
    ...(MANUAL_SHORT_ALIASES[item] ?? []),
  ], 'ko')
  return [item, aliases]
}).filter(([, aliases]) => aliases.length)

const spriteEntries = whitelistItems
  .map((item) => {
    const detail = detailForItem(item)
    return [item, MANUAL_SPRITE_PATHS[item] ?? detail?.apiName ?? null]
  })
  .filter(([, apiName]) => typeof apiName === 'string' && apiName)

const ts = `export const CHAMPIONS_ITEM_OPTIONS = [\n${toTsStringArray(whitelistItems)}\n] as const\n\nexport type ChampionsItem = typeof CHAMPIONS_ITEM_OPTIONS[number]\n\nexport const CHAMPIONS_ITEM_LABEL_KO: Partial<Record<ChampionsItem, string>> = {\n${koLabelEntries.map(([item, ko]) => `  ${JSON.stringify(item)}: ${JSON.stringify(ko)},`).join('\n')}\n}\n\nexport const CHAMPIONS_ITEM_LABEL_EN: Partial<Record<ChampionsItem, string>> = {\n${enLabelEntries.map(([item, en]) => `  ${JSON.stringify(item)}: ${JSON.stringify(en)},`).join('\n')}\n}\n\nexport const CHAMPIONS_ITEM_ALIASES: Partial<Record<ChampionsItem, string[]>> = {\n${aliasEntries.map(([item, aliases]) => `  ${JSON.stringify(item)}: [${aliases.map((alias) => JSON.stringify(alias)).join(', ')}],`).join('\n')}\n}\n\nexport const CHAMPIONS_ITEM_SPRITE_MAP: Partial<Record<ChampionsItem, string>> = {\n${spriteEntries.map(([item, slug]) => `  ${JSON.stringify(item)}: ${JSON.stringify(slug)},`).join('\n')}\n}\n\nexport function localizedChampionsItemLabel(item: string, language: 'ko' | 'en' | 'ja' = 'ko') {\n  if (language === 'ja') return item\n  if (language === 'ko') return CHAMPIONS_ITEM_LABEL_KO[item as ChampionsItem] ?? item\n  return CHAMPIONS_ITEM_LABEL_EN[item as ChampionsItem] ?? CHAMPIONS_ITEM_LABEL_KO[item as ChampionsItem] ?? item\n}\n`

const missingKoLabels = whitelistItems.filter((item) => !(MANUAL_KO_LABELS[item] ?? detailForItem(item)?.ko))

const report = {
  generatedAt: new Date().toISOString(),
  currentSeasonNumber,
  sourceGuideUrl: GUIDE_URL,
  sourceJsonUrls: jsonUrls,
  sourcePokemonListBaseUrl: POKEMON_LIST_URL,
  sourcePokeApiItemListUrl: POKEAPI_ITEM_LIST_URL,
  datasets,
  usageListPages: usageListPages.map((page) => ({
    url: page.url,
    season: page.season,
    rule: page.rule,
    showPageCount: page.showPageCount,
  })),
  usagePageCount: usagePageRecords.length,
  extractedItemCount: combinedItems.length,
  opendataItemCount: opendataUniqueItems.length,
  usagePageItemCount: usageItems.length,
  whitelistItemCount: whitelistItems.length,
  onlyInUsagePagesCount: onlyInUsagePages.length,
  onlyInUsagePages,
  onlyInOpenDataCount: onlyInOpenData.length,
  onlyInOpenData,
  inBothSourcesCount: inBothSources.length,
  excludedMegaStoneCount: excludedMegaStones.length,
  excludedMegaStones,
  excludedNoItemCount: excludedNoItem.length,
  excludedNoItem,
  whitelistItems,
  verifiedKoLabels: Object.fromEntries(koLabelEntries),
  missingKoLabels,
  manualSpritePaths: MANUAL_SPRITE_PATHS,
  sourceSummaryByItem: Object.fromEntries(whitelistItems.map((item) => {
    const usageEntry = usageItemMap.get(item)
    const detail = detailForItem(item)
    return [item, {
      sources: [usageEntry ? 'usage-pages' : null, opendataUniqueItems.includes(item) ? 'opendata' : null].filter(Boolean),
      usagePageReferences: usageEntry ? {
        itemKeys: [...usageEntry.itemKeys].sort((a, b) => a - b),
        pageCount: usageEntry.pages.length,
        bestRank: Number.isFinite(usageEntry.bestRank) ? usageEntry.bestRank : null,
        highestRate: usageEntry.highestRate || null,
        seasonRuleCount: usageEntry.seasonRules.size,
        samplePages: usageEntry.pages.slice(0, 5),
      } : null,
      pokeApi: detail ? {
        id: detail.id,
        apiName: detail.apiName,
        ko: detail.ko,
        en: detail.en,
      } : null,
    }]
  })),
  notes: [
    'Primary source is aggregated held-item usage from Pokémon pages on champs.pokedb.tokyo across seasons 1..current for both single(rule=0) and double(rule=1).',
    'Usage pages are more reliable than top-team opendata alone because they surface broader per-species held-item usage.',
    'Opendata remains as a supplement because some low-frequency items can appear there without surfacing in the usage-page top slices.',
    'Japanese item names remain the source-of-truth for reverse-mapping Champions site data.',
    'Korean and English labels are sourced from PokeAPI item names when available.',
    'Mega stones are excluded because the app handles mega items separately via species-locked item generation.',
    '持ち物なし is excluded because the app represents no-item as an empty value.',
  ],
}

await fs.writeFile(srcPath, ts)
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(`wrote ${path.relative(rootDir, srcPath)} (${whitelistItems.length} items)`) 
console.log(`wrote ${path.relative(rootDir, reportPath)}`)
console.log(`usage-page only items: ${onlyInUsagePages.length}`)
console.log(`opendata only items: ${onlyInOpenData.length}`)
if (missingKoLabels.length) console.log(`missing ko labels: ${missingKoLabels.join(', ')}`)
