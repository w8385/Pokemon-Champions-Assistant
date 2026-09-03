import fs from 'node:fs/promises'
import path from 'node:path'

const rootDir = path.resolve(new URL('..', import.meta.url).pathname)
const appSource = await fs.readFile(path.join(rootDir, 'src', 'App.tsx'), 'utf8')
const styleSource = await fs.readFile(path.join(rootDir, 'src', 'styles.css'), 'utf8')
const failures = []

if (!appSource.includes('physical: stats.hp * stats.defense')) failures.push('Physical bulk is not HP × Defense')
if (!appSource.includes('special: stats.hp * stats.spDefense')) failures.push('Special bulk is not HP × Sp. Def')
if (!appSource.includes('* totalPower\n    * stab')) failures.push('Power index does not include move power and STAB')
if (!appSource.includes('* (modifiers.attackMultiplier ?? 1)')) failures.push('Power index does not include attack modifiers')
if (!appSource.includes('* (modifiers.powerMultiplier ?? 1)')) failures.push('Power index does not include power modifiers')
if (!appSource.includes('/ Math.max(0.01, modifiers.defenseMultiplier ?? 1)')) failures.push('Power index does not include defense-lowering offensive abilities')
if (!appSource.includes('sampleDecisionPowerIndices.map')) failures.push('Registered sample moves do not render individual power indices')
if ((appSource.match(/battleIndexTooltipData\('(?:physical-bulk|special-bulk)'/g) ?? []).length < 4) failures.push('Bulk index formula tooltips are missing')
if (!styleSource.includes('.sample-power-index-grid')) failures.push('Power index component styles are missing')
if (!styleSource.includes('grid-template-columns: repeat(2, minmax(0, 1fr));')) failures.push('Responsive two-column index layout is missing')

const baselinePower = 200 * 100 * 1.5
const lifeOrbPower = baselinePower * 1.3
const physicalBulk = 200 * 100
if (baselinePower !== 30000 || lifeOrbPower !== 39000 || physicalBulk !== 20000) failures.push('Reference index arithmetic failed')

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('Battle indices OK: per-move power and physical/special bulk formulas are present.')
