import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const root = process.cwd()
const verifiedPath = path.join(root, 'src', 'canonical-data/champions/pokemon_champions_verified_data.json')
const reportPath = path.join(root, 'reports', 'abilityDamageHarness.json')

const calculationSources = {
  abilityImmunities: fs.readFileSync(path.join(root, 'src', 'domain', 'battle', 'abilityImmunities.ts'), 'utf8'),
  modifierRules: fs.readFileSync(path.join(root, 'src', 'domain', 'battle', 'modifierRules.ts'), 'utf8'),
  moveEffects: fs.readFileSync(path.join(root, 'src', 'domain', 'battle', 'moveEffects.ts'), 'utf8'),
  moveTags: fs.readFileSync(path.join(root, 'src', 'domain', 'battle', 'moveTags.ts'), 'utf8'),
  statProjection: fs.readFileSync(path.join(root, 'src', 'domain', 'battle', 'statProjection.ts'), 'utf8'),
}
const verified = JSON.parse(fs.readFileSync(verifiedPath, 'utf8'))
const rows = Array.isArray(verified) ? verified : verified.rows
const allAbilities = [...new Set(rows.flatMap((row) => row.abilities || []))].sort()

function extractFunctionBlock(source, name) {
  const sourceFile = ts.createSourceFile('ability-damage-source.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  let match = null
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) match = node
    if (!match) ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return match ? source.slice(match.getStart(sourceFile), match.end) : ''
}

const calculationFunctions = [
  ['abilityImmunities', 'alwaysOnAbilityImmunity'],
  ['moveEffects', 'resolveAbilityAdjustedMoveMeta'],
  ['moveTags', 'protectionDamageMultiplier'],
  ['statProjection', 'attackingFormRow'],
  ['statProjection', 'battleFormRow'],
  ['moveEffects', 'resolveAbilityAdjustedTypes'],
  ['moveEffects', 'resolveStabMultiplier'],
  ['moveEffects', 'weatherFromAbility'],
  ['moveEffects', 'terrainFromAbility'],
  ['modifierRules', 'resolveDamageModifiers'],
]
const extractedFunctions = calculationFunctions.map(([sourceName, functionName]) => ({
  sourceName,
  functionName,
  source: extractFunctionBlock(calculationSources[sourceName], functionName),
}))
const missingFunctions = extractedFunctions.filter(({ source }) => !source)
const damageBlock = extractedFunctions.map(({ source }) => source).join('\n')
const slugMatches = [...damageBlock.matchAll(/'([a-z][a-z-]+)'/g)].map((m) => m[1])
const implemented = new Set(slugMatches.filter((slug) => allAbilities.includes(slug)))

const requiresMoveTags = new Set([
  'aerilate', 'aura-guard', 'dragonize', 'iron-fist', 'liquid-voice', 'mega-launcher', 'mega-sol', 'pixilate', 'piercing-drill', 'punk-rock', 'refrigerate', 'sharpness', 'strong-jaw', 'tough-claws',
])
const requiresHpOrStatusContext = new Set([
  'berserk', 'blaze', 'flare-boost', 'guts', 'marvel-scale', 'merciless', 'multiscale', 'overgrow', 'poison-heal', 'quick-feet', 'shadow-shield', 'swarm', 'torrent',
])
const requiresTurnOrFieldContext = new Set([
  'analytic', 'electromorphosis', 'gale-wings', 'minus', 'opportunist', 'parental-bond', 'plus', 'power-spot', 'quick-draw', 'reckless', 'rivalry', 'sand-force', 'sheer-force', 'skill-link', 'solar-power', 'stance-change', 'super-luck', 'supreme-overlord', 'transistor',
])
const manualBattleState = new Set([
  'anger-point', 'berserk', 'competitive', 'contrary', 'defiant', 'gooey', 'guard-dog', 'intimidate', 'moxie', 'opportunist', 'rattled', 'speed-boost', 'stakeout', 'stamina', 'thermal-exchange', 'weak-armor',
])
const weatherOrTerrainDriven = new Set([
  'chlorophyll', 'drizzle', 'drought', 'forecast', 'hydration', 'ice-body', 'leaf-guard', 'mimicry', 'rain-dish', 'sand-rush', 'sand-spit', 'sand-stream', 'sand-veil', 'slush-rush', 'snow-cloak', 'snow-warning', 'surge-surfer', 'swift-swim',
])
const indirectOrNonDamage = new Set([
  'aftermath', 'anticipation', 'armor-tail', 'aroma-veil', 'big-pecks', 'bulletproof', 'cheek-pouch', 'chlorophyll', 'clear-body', 'cloud-nine', 'compoundeyes', 'corrosion', 'cud-chew', 'curious-medicine', 'cursed-body', 'cute-charm', 'damp', 'disguise', 'early-bird', 'effect-spore', 'emergency-exit', 'flame-body', 'flower-veil', 'forewarn', 'friend-guard', 'frisk', 'gale-wings', 'gluttony', 'good-as-gold', 'harvest', 'healer', 'heavy-metal', 'hospitality', 'hunger-switch', 'hydration', 'hyper-cutter', 'ice-body', 'illuminate', 'illusion', 'immunity', 'imposter', 'infiltrator', 'innards-out', 'inner-focus', 'insomnia', 'justified', 'keen-eye', 'klutz', 'leaf-guard', 'levitate', 'light-metal', 'limber', 'liquid-ooze', 'long-reach', 'magic-bounce', 'magic-guard', 'magician', 'magma-armor', 'minus', 'mirror-armor', 'mold-breaker', 'moody', 'mummy', 'natural-cure', 'no-guard', 'oblivious', 'overcoat', 'own-tempo', 'pickpocket', 'pickup', 'poison-heal', 'poison-point', 'poison-touch', 'prankster', 'pressure', 'purifying-salt', 'queenly-majesty', 'quick-draw', 'quick-feet', 'rain-dish', 'receiver', 'regenerator', 'ripen', 'rock-head', 'rough-skin', 'run-away', 'sand-rush', 'sand-spit', 'sand-veil', 'scrappy', 'screen-cleaner', 'seed-sower', 'shadow-tag', 'shed-skin', 'shield-dust', 'slush-rush', 'snow-cloak', 'soundproof', 'spicy-spray', 'stall', 'stalwart', 'static', 'steadfast', 'stench', 'sticky-hold', 'sturdy', 'suction-cups', 'super-luck', 'supersweet-syrup', 'surge-surfer', 'sweet-veil', 'swift-swim', 'symbiosis', 'synchronize', 'tangled-feet', 'telepathy', 'toxic-debris', 'trace', 'unburden', 'unnerve', 'unseen-fist', 'vital-spirit', 'wandering-spirit', 'white-smoke', 'zero-to-hero'
])
const defenderDamageRelevant = new Set([
  'aura-guard', 'dry-skin', 'earth-eater', 'fairy-aura', 'filter', 'flash-fire', 'friend-guard', 'fur-coat', 'heatproof', 'ice-scales', 'levitate', 'lightning-rod', 'motor-drive', 'multiscale', 'prism-armor', 'purifying-salt', 'sap-sipper', 'shadow-shield', 'solid-rock', 'soundproof', 'thick-fat', 'volt-absorb', 'water-absorb', 'water-bubble'
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
  calculationFunctions: extractedFunctions.map(({ sourceName, functionName, source }) => ({
    source: `src/domain/battle/${sourceName}.ts`,
    functionName,
    found: Boolean(source),
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
if (missingFunctions.length || categories.uncategorized.length || damageRelevantMissing.length) {
  if (missingFunctions.length) {
    console.error(`missing calculation functions: ${missingFunctions.map(({ sourceName, functionName }) => `${sourceName}.${functionName}`).join(', ')}`)
  }
  process.exitCode = 1
}
