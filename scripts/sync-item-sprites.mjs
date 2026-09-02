import fs from 'node:fs/promises'
import path from 'node:path'

const rootDir = path.resolve(new URL('..', import.meta.url).pathname)
const itemsTsPath = path.join(rootDir, 'src', 'championsItems.ts')
const appTsxPath = path.join(rootDir, 'src', 'App.tsx')
const outputDir = path.join(rootDir, 'public', 'item-sprites')
const reportPath = path.join(rootDir, 'reports', 'itemSpriteSyncReport.json')

const POKEAPI_SPRITE_ROOT = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items'

function parseRecordBlock(source, name) {
  const match = source.match(new RegExp(`const ${name}[^=]*= \\{([\\s\\S]*?)\\n\\}`))
    ?? source.match(new RegExp(`export const ${name}[^=]*= \\{([\\s\\S]*?)\\n\\}`))
  if (!match) throw new Error(`Could not find ${name}`)
  const entries = [...match[1].matchAll(/['\"]([^'\"]+)['\"]:\s*['\"]([^'\"]+)['\"]/g)]
  return Object.fromEntries(entries.map(([, key, value]) => [key, value]))
}

function assetNameFromRef(ref) {
  const cleaned = ref.split('?')[0].split('#')[0]
  return path.basename(cleaned.endsWith('.png') ? cleaned : `${cleaned}.png`)
}

function remoteUrlFromRef(ref) {
  if (/^https?:\/\//.test(ref)) return ref
  if (ref.includes('/')) return null
  return `${POKEAPI_SPRITE_ROOT}/${ref}.png`
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function fileExists(target) {
  try {
    await fs.access(target)
    return true
  } catch {
    return false
  }
}

async function fetchBuffer(url, attempts = 3) {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'Pokemon-Champions-Assistant item sprite sync' } })
      if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`)
      const ab = await res.arrayBuffer()
      return Buffer.from(ab)
    } catch (error) {
      lastError = error
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 250))
    }
  }
  throw lastError
}

const itemsSource = await fs.readFile(itemsTsPath, 'utf8')
const appSource = await fs.readFile(appTsxPath, 'utf8')
const itemMap = parseRecordBlock(itemsSource, 'CHAMPIONS_ITEM_SPRITE_MAP')
const megaMap = parseRecordBlock(appSource, 'MEGA_STONE_SPRITE_BY_KEY')

await ensureDir(outputDir)

const refs = [
  ...Object.entries(itemMap).map(([key, ref]) => ({ kind: 'item', key, ref })),
  ...Object.entries(megaMap).map(([key, ref]) => ({ kind: 'mega', key, ref })),
]

const report = {
  generatedAt: new Date().toISOString(),
  outputDir: path.relative(rootDir, outputDir),
  total: refs.length,
  downloaded: [],
  reusedLocal: [],
  failures: [],
}

for (const entry of refs) {
  const assetName = assetNameFromRef(entry.ref)
  const outputPath = path.join(outputDir, assetName)
  const remoteUrl = remoteUrlFromRef(entry.ref)

  if (!remoteUrl) {
    if (await fileExists(outputPath)) {
      report.reusedLocal.push({ ...entry, assetName, outputPath: path.relative(rootDir, outputPath) })
      continue
    }
    report.failures.push({ ...entry, assetName, reason: 'missing local source asset' })
    continue
  }

  try {
    const buffer = await fetchBuffer(remoteUrl)
    await fs.writeFile(outputPath, buffer)
    report.downloaded.push({ ...entry, assetName, remoteUrl, outputPath: path.relative(rootDir, outputPath) })
  } catch (error) {
    if (await fileExists(outputPath)) {
      report.reusedLocal.push({ ...entry, assetName, outputPath: path.relative(rootDir, outputPath), fallback: 'existing local asset after fetch failure', remoteUrl })
    } else {
      report.failures.push({ ...entry, assetName, remoteUrl, reason: error instanceof Error ? error.message : String(error) })
    }
  }
}

await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(`wrote ${path.relative(rootDir, reportPath)}`)
console.log(`downloaded: ${report.downloaded.length}`)
console.log(`reused local: ${report.reusedLocal.length}`)
if (report.failures.length) {
  console.log(`failures: ${report.failures.length}`)
  for (const failure of report.failures) console.log(`- ${failure.kind}:${failure.key} -> ${failure.reason}`)
  process.exitCode = 1
}
