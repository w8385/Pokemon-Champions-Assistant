import test from 'node:test'
import { execFileSync } from 'node:child_process'

test('party analysis runs registered-move, six-slot and canonical-chart fixture assertions in CI', () => {
  execFileSync(process.execPath, ['--experimental-strip-types', 'scripts/check-party-analysis.mjs'], {
    cwd: new URL('..', import.meta.url),
    stdio: 'pipe',
  })
})
