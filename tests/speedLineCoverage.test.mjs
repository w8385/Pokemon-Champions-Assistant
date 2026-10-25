import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSpeedCoverage, speedCoverageAt } from '../src/speedLineCoverage.ts'
import { calculateSpeed } from '../src/speedLine.ts'

const rows = [
  { key: 'starmie', name_ko: '스타미', name_en: 'Starmie', speed: 115 },
  { key: 'venusaur', name_ko: '이상해꽃', name_en: 'Venusaur', speed: 80 },
  { key: 'garchomp', name_ko: '한카리아스', name_en: 'Garchomp', speed: 102 },
  { key: 'mega-garchomp-z', name_ko: '메가한카리아스Z', name_en: 'Mega Garchomp Z', speed: 151 },
]
const cut = (projection, key, variant, nature) => projection.targets.find(t => t.row.key === key && t.variant === variant && t.nature === nature)

test('canonical actual-Speed inversion preserves ties, strict minimum and impossible cuts', () => {
  const p = buildSpeedCoverage(rows, 'starmie', 'boost')
  assert.deepEqual([0, 5, 6, 19, 20, 32].map(e => p.speeds[e]), [148, 154, 155, 169, 170, 183])
  assert.deepEqual([cut(p,'venusaur','normal','neutral'),cut(p,'venusaur','normal','boost')].map(t => [t.speed,t.passEffort,t.tieEffort]), [[132,0,null],[145,0,null]])
  assert.deepEqual([cut(p,'garchomp','normal','neutral'),cut(p,'garchomp','normal','boost')].map(t => [t.speed,t.passEffort,t.tieEffort,t.previousPassSpeed,t.passSpeed]), [[154,6,5,154,155],[169,20,19,169,170]])
  assert.deepEqual([cut(p,'venusaur','scarf','neutral').speed,cut(p,'venusaur','scarf','neutral').passEffort], [198,null])
  assert.deepEqual([cut(p,'starmie','normal','boost').passEffort,cut(p,'starmie','normal','boost').tieEffort], [null,32])
  assert.ok(!p.targets.some(t => t.row.key === 'mega-garchomp-z' && t.variant === 'scarf'))
  assert.equal(p.targets.length, 14)
})

test('all 33 efforts partition into unchanged-pass-set groups with monotonic counts and first-opening targets', () => {
  const p = buildSpeedCoverage(rows, 'starmie', 'boost')
  assert.deepEqual(p.groups.flatMap(g => Array.from({length:g.end-g.start+1},(_,i)=>g.start+i)), Array.from({length:33},(_,i)=>i))
  for (let e=0;e<=32;e++) {
    const c = speedCoverageAt(p,e)
    assert.equal(c.total, p.targets.length)
    assert.equal(Object.values(c.categories).reduce((s,x)=>s+x.total,0), c.total)
    assert.equal(Object.values(c.categories).reduce((s,x)=>s+x.passed,0), c.passed)
    assert.equal(c.ties, p.targets.filter(t=>p.speeds[e]===t.speed).length)
    assert.equal(c.passed, p.targets.filter(t=>p.speeds[e]>t.speed).length)
    assert.ok(c.passed+c.ties<=c.total)
    if (e) assert.ok(c.passed>=speedCoverageAt(p,e-1).passed)
  }
  for (const t of p.targets) if (t.passEffort !== null) {
    assert.ok(p.speeds[t.passEffort]>t.speed)
    if (t.passEffort) assert.ok(p.speeds[t.passEffort-1]<=t.speed)
    assert.equal(p.groups.filter(g=>g.newTargets.includes(t)).length,1)
    assert.equal(p.groups.find(g=>g.newTargets.includes(t)).start,t.passEffort)
  }
  assert.ok(p.groups.some(g=>g.start<g.end && g.firstSpeed!==g.lastSpeed))
  assert.equal(speedCoverageAt(p,5).next?.passEffort,6)
  assert.equal(speedCoverageAt(p,5).next?.additionalEffort,1)
})

test('same-speed scenarios remain separate identities and changing nature recomputes actual values', () => {
  const duplicates=[{key:'a',name_ko:'A',name_en:'A',speed:80},{key:'b',name_ko:'B',name_en:'B',speed:80}]
  const p=buildSpeedCoverage(duplicates,'a','neutral')
  assert.equal(p.targets.length,8)
  assert.equal(new Set(p.targets.map(t=>`${t.row.key}:${t.variant}:${t.nature}`)).size,8)
  assert.equal(p.targets.filter(t=>t.speed===calculateSpeed(80,32,'neutral')).length,2)
  assert.equal(speedCoverageAt(p,32).ties,2)
  assert.equal(speedCoverageAt(p,32).categories['normal-neutral'].passed,0)
  assert.notDeepEqual(buildSpeedCoverage(duplicates,'a','boost').speeds,p.speeds)
  assert.equal(buildSpeedCoverage(rows,'unknown','boost').reference,null)
})
