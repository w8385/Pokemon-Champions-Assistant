import { CHAMPIONS_ITEM_ALIASES, CHAMPIONS_ITEM_OPTIONS, localizedChampionsItemLabel } from './championsItems.ts'
import { championsData, additionalFormSpecs } from './effectiveRoster.ts'

const ordinaryItems = new Set<string>(CHAMPIONS_ITEM_OPTIONS)
const aliases = new Map<string, string>(CHAMPIONS_ITEM_OPTIONS.flatMap(item => [...new Set([
  item, localizedChampionsItemLabel(item, 'ko'), localizedChampionsItemLabel(item, 'en'),
  ...(CHAMPIONS_ITEM_ALIASES[item] ?? []),
].map(label => label.trim()).filter(Boolean))].map(label => [label.toLowerCase(), item] as const)))

// Form-to-stone identity is projected from the effective roster, not sprite paths or an item whitelist.
const stones = new Map([...championsData.rows, ...additionalFormSpecs].filter(row => row.key.startsWith('mega-')).map(row => {
  const name = row.name_ko.replace(/^메가/, '').trim()
  const suffix = name.match(/\s*([XYZ])$/i)
  return [row.key, suffix ? `${name.replace(/\s*[XYZ]$/i, '').trim()}나이트${suffix[1].toUpperCase()}` : `${name}나이트`] as const
}))
const stoneNames = new Set(stones.values())
// Only source-recorded Japanese spellings in m6TopTenSamples; not a guessed stone-name transliterator.
const stoneAliases = new Map<string, string>([
  ['ルカリオナイトZ', '루카리오나이트Z'], ['メタグロスナイト', '메타그로스나이트'],
  ['カイリュナイト', '망나뇽나이트'], ['ルカリオナイト', '루카리오나이트'],
  ['フラエッテナイト', '플라엣테나이트'], ['ガブリアスナイトZ', '한카리아스나이트Z'],
  ['ギャラドスナイト', '갸라도스나이트'],
])

export function requiredMegaStone(formKey: string): string | null {
  return stones.get(formKey) ?? null
}

export function canonicalHeldItem(raw: string): string {
  return aliases.get(raw.trim().toLowerCase()) ?? stoneAliases.get(raw.trim()) ?? raw.trim()
}

export type HeldItemStatus = 'none' | 'allowed' | 'required-stone' | 'incompatible' | 'unknown'
export function classifyHeldItem(formKey: string, raw: string): { status: HeldItemStatus; raw: string; canonical: string | null; requiredStone: string | null } {
  const requiredStone = requiredMegaStone(formKey)
  const canonical = canonicalHeldItem(raw)
  if (!canonical) return { status: requiredStone ? 'incompatible' : 'none', raw, canonical: '', requiredStone }
  if (requiredStone) return { status: canonical === requiredStone ? 'required-stone' : 'incompatible', raw, canonical: ordinaryItems.has(canonical) || stoneNames.has(canonical) ? canonical : null, requiredStone }
  if (stoneNames.has(canonical)) return { status: 'incompatible', raw, canonical, requiredStone }
  return { status: ordinaryItems.has(canonical) ? 'allowed' : 'unknown', raw, canonical: ordinaryItems.has(canonical) ? canonical : null, requiredStone }
}

// Only explicit form selection may replace a held item; restoration never calls this.
export function itemForSpeciesSelection(formKey: string, oldRaw: string): string {
  const stone = requiredMegaStone(formKey)
  if (stone) return stone
  const selected = classifyHeldItem(formKey, oldRaw)
  return selected.status === 'allowed' ? selected.canonical! : ''
}

export function isCalculableHeldItem(formKey: string, raw: string): boolean {
  return ['none', 'allowed', 'required-stone'].includes(classifyHeldItem(formKey, raw).status)
}
