import fs from 'node:fs/promises'
import path from 'node:path'

const rootDir = path.resolve(new URL('..', import.meta.url).pathname)
const appSource = await fs.readFile(path.join(rootDir, 'src', 'App.tsx'), 'utf8')
const failures = []

for (const target of ['SampleSpeed', 'SampleDamage']) {
  if (!appSource.includes(`set${target}Targets([{ ...blank${target}Target(), key`)) {
    failures.push(`${target} selection does not replace the current opponent`)
  }
}

const cappedSanitizers = [...appSource.matchAll(/function sanitizeSample(?:Speed|Damage)Targets[\s\S]*?\.filter\([\s\S]*?\.slice\(0, 1\)/g)]
if (cappedSanitizers.length !== 2) failures.push('Saved sample target lists are not capped to one opponent')
if (!appSource.includes("const defaultSampleSpeedTargets: SampleSpeedTarget[] = ['garchomp']")) failures.push('Sample speed defaults contain multiple opponents')
if (!appSource.includes("const defaultSampleDamageTargets: SampleDamageTarget[] = ['garchomp']")) failures.push('Sample damage defaults contain multiple opponents')
if (!appSource.includes("lt(sampleSpeedCalcs.length ? '비교 상대 교체' : '비교 상대 선택')")) failures.push('Sample speed UI does not expose replace semantics')
if (!appSource.includes("lt(sampleDamageCalcs.length ? '비교 상대 교체' : '비교 상대 선택')")) failures.push('Sample damage UI does not expose replace semantics')

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('Sample speed and damage calculators use one replaceable opponent.')
