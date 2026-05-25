import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const appPath = path.join(root, 'src', 'App.tsx')
const verifiedPath = path.join(root, 'src', 'pokemon_champions_verified_data.json')
const reportPath = path.join(root, 'reports', 'abilityDamageHarness.json')

const appSource = fs.readFileSync(appPath, 'utf8')
const verified = JSON.parse(fs.readFileSync(verifiedPath, 'utf8'))
const rows = Array.isArray(verified) ? verified : verified.rows
const allAbilities = [...new Set(rows.flatMap((row) => row.abilities || []))].sort()

function extractFunctionBlock(source, name) {
  const start = source.indexOf(`function ${name}`)
  if (start < 0) return ''
  const tail = source.slice(start)
  const signatureMatch = tail.match(new RegExp(`function\\s+${name}[^]*?\\)\\s*\\{`))
  if (!signatureMatch) return ''
  const bodyStart = start + signatureMatch[0].length - 1
  let depth = 0
  for (let i = bodyStart; i < source.length; i += 1) {
    const ch = source[i]
    if (ch === '{') depth += 1
    else if (ch === '}') {
      depth -= 1
      if (depth === 0) return source.slice(start, i + 1)
    }
  }
  return source.slice(start)
}

const damageBlock = [
  extractFunctionBlock(appSource, 'resolveAbilityAdjustedMoveMeta'),
  extractFunctionBlock(appSource, 'resolveStabMultiplier'),
  extractFunctionBlock(appSource, 'resolveDamageModifiers'),
].join('\n')
const slugMatches = [...damageBlock.matchAll(/'([a-z][a-z-]+)'/g)].map((m) => m[1])
const implemented = new Set(slugMatches.filter((slug) => allAbilities.includes(slug)))

const requiresMoveTags = new Set([
  'aerilate', 'dragonize', 'iron-fist', 'liquid-voice', 'mega-launcher', 'mega-sol', 'pixilate', 'piercing-drill', 'refrigerate', 'sharpness', 'strong-jaw', 'tough-claws',
])
const requiresHpOrStatusContext = new Set([
  'berserk', 'blaze', 'flare-boost', 'guts', 'marvel-scale', 'merciless', 'multiscale', 'overgrow', 'poison-heal', 'quick-feet', 'shadow-shield', 'swarm', 'torrent',
])
const requiresTurnOrFieldContext = new Set([
  'analytic', 'electromorphosis', 'gale-wings', 'minus', 'opportunist', 'parental-bond', 'plus', 'power-spot', 'quick-draw', 'reckless', 'rivalry', 'sand-force', 'sheer-force', 'skill-link', 'solar-power', 'stance-change', 'super-luck', 'supreme-overlord', 'transistor',
])
const manualBattleState = new Set([
  'anger-point', 'competitive', 'contrary', 'defiant', 'gooey', 'intimidate', 'moxie', 'speed-boost', 'stamina', 'weak-armor',
])
const weatherOrTerrainDriven = new Set([
  'chlorophyll', 'drizzle', 'drought', 'forecast', 'hydration', 'ice-body', 'leaf-guard', 'mimicry', 'rain-dish', 'sand-rush', 'sand-spit', 'sand-stream', 'sand-veil', 'slush-rush', 'snow-cloak', 'snow-warning', 'surge-surfer', 'swift-swim',
])
const indirectOrNonDamage = new Set([
  'aftermath', 'anticipation', 'armor-tail', 'aroma-veil', 'big-pecks', 'bulletproof', 'cheek-pouch', 'clear-body', 'cloud-nine', 'compoundeyes', 'corrosion', 'cud-chew', 'curious-medicine', 'cursed-body', 'cute-charm', 'damp', 'disguise', 'early-bird', 'flame-body', 'flower-veil', 'friend-guard', 'frisk', 'gluttony', 'harvest', 'healer', 'heavy-metal', 'hospitality', 'hunger-switch', 'hyper-cutter', 'illuminate', 'illusion', 'immunity', 'imposter', 'infiltrator', 'innards-out', 'inner-focus', 'insomnia', 'justified', 'keen-eye', 'klutz', 'levitate', 'light-metal', 'limber', 'long-reach', 'magic-bounce', 'magic-guard', 'magician', 'magma-armor', 'minus', 'mirror-armor', 'mold-breaker', 'moody', 'mummy', 'natural-cure', 'no-guard', 'oblivious', 'overcoat', 'own-tempo', 'pickpocket', 'pickup', 'poison-point', 'poison-touch', 'prankster', 'pressure', 'purifying-salt', 'queenly-majesty', 'receiver', 'regenerator', 'ripen', 'rock-head', 'rough-skin', 'scrappy', 'screen-cleaner', 'shadow-tag', 'shed-skin', 'shell-armor', 'shield-dust', 'soundproof', 'spicy-spray', 'stall', 'stalwart', 'static', 'steadfast', 'stench', 'sticky-hold', 'sturdy', 'supersweet-syrup', 'sweet-veil', 'symbiosis', 'synchronize', 'tangled-feet', 'telepathy', 'toxic-debris', 'trace', 'unburden', 'unnerve', 'unseen-fist', 'wandering-spirit', 'white-smoke', 'zero-to-hero'
])
const defenderDamageRelevant = new Set([
  'dry-skin', 'earth-eater', 'fairy-aura', 'filter', 'flash-fire', 'friend-guard', 'fur-coat', 'heatproof', 'ice-scales', 'levitate', 'lightning-rod', 'motor-drive', 'multiscale', 'prism-armor', 'purifying-salt', 'sap-sipper', 'shadow-shield', 'solid-rock', 'soundproof', 'thick-fat', 'volt-absorb', 'water-absorb', 'water-bubble'
])

const categories = {
  implemented: [],
  requiresMoveTags: [],
  requiresHpOrStatusContext: [],
  requiresTurnOrFieldContext: [],
  manualBattleState: [],
  weatherOrTerrainDriven: [],
  indirectOrNonDamage: [],
  uncategorized: [],
}

for (const ability of allAbilities) {
  if (implemented.has(ability)) categories.implemented.push(ability)
  else if (requiresMoveTags.has(ability)) categories.requiresMoveTags.push(ability)
  else if (requiresHpOrStatusContext.has(ability)) categories.requiresHpOrStatusContext.push(ability)
  else if (requiresTurnOrFieldContext.has(ability)) categories.requiresTurnOrFieldContext.push(ability)
  else if (manualBattleState.has(ability)) categories.manualBattleState.push(ability)
  else if (weatherOrTerrainDriven.has(ability)) categories.weatherOrTerrainDriven.push(ability)
  else if (indirectOrNonDamage.has(ability)) categories.indirectOrNonDamage.push(ability)
  else categories.uncategorized.push(ability)
}

const damageRelevantMissing = allAbilities.filter((ability) => (
  !implemented.has(ability)
  && !indirectOrNonDamage.has(ability)
  && !manualBattleState.has(ability)
))

const report = {
  generatedAt: new Date().toISOString(),
  totalAbilities: allAbilities.length,
  implementedCount: categories.implemented.length,
  categories: Object.fromEntries(Object.entries(categories).map(([key, list]) => [key, { count: list.length, abilities: list }])),
  damageRelevantMissingCount: damageRelevantMissing.length,
  damageRelevantMissing,
  notableDefenderAbilities: [...defenderDamageRelevant].filter((ability) => allAbilities.includes(ability)).map((ability) => ({
    ability,
    implemented: implemented.has(ability),
  })),
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(`ability damage harness: ${categories.implemented.length}/${allAbilities.length} abilities referenced in calc`)
console.log(`uncategorized: ${categories.uncategorized.length}`)
console.log(`damage relevant missing: ${damageRelevantMissing.length}`)
if (categories.uncategorized.length) {
  console.log('uncategorized abilities:')
  for (const ability of categories.uncategorized) console.log(`- ${ability}`)
}
