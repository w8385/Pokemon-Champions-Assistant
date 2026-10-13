import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const route = readFileSync(new URL('../src/navigation.ts', import.meta.url), 'utf8')
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const types = readFileSync(new URL('../src/app/types.ts', import.meta.url), 'utf8')
assert.match(route, /path === '\/damage'/, 'standalone deep link must normalize')
assert.match(types, /'quickDamage'/, 'standalone section must have its own identity')
assert.match(app, /mainSection === 'quickDamage' \? '\/damage'/, 'state synchronization must preserve route on refresh')
assert.match(app, /<PokemonSearchField id=\{`quick-\$\{side\}`\}/, 'reuse real search control for both sides')
assert.match(app, /sideCard\('attacker'/, 'render attacker picker')
assert.match(app, /sideCard\('defender'/, 'render defender picker')
assert.match(app, /calcDamage\(attackStats, defenseStats/, 'use canonical damage engine')
console.log('Quick damage route and engine contract passed')
