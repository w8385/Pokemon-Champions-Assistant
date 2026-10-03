import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { validateBackup } from '../src/backupValidation.ts'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

test('backup rejects unsupported version and malformed top-level shape', () => {
  for (const input of [null, [], {}, { version: 999, party: [], opponents: [] }, { version: 1, party: {}, opponents: [] }, { version: 1, party: [], opponents: 'bad' }, { version: 1, party: [null], opponents: [] }, { version: 1, party: [], opponents: [], savedSamples: {} }, { version: 1, party: [], opponents: [], sampleForge: [] }, { version: 1, party: [], opponents: [], mainSection: 'garbage' }, { version: 1, party: [], opponents: [], savedSamples: [null] }]) {
    assert.throws(() => validateBackup(input), /backup/i)
  }
  assert.deepEqual(validateBackup({ version: 1, party: [], opponents: [] }), { version: 1, party: [], opponents: [] })
})

const member = (key, picked = false) => ({ key, config: { nature: 'jolly', scarf: false, speedStage: 0 }, picked, evs: { hp: 0, attack: 32, defense: 0, spAttack: 0, spDefense: 0, speed: 32 }, tuning: { magicNumber: 0, maxValue: 0 }, item: '', ability: '' })
const opponent = (key, picked = false) => ({ key, item: '', ability: '', notes: '', revealedMoves: [], natureBoost: false, scarf: false, speedStage: 0, picked, hpEv: 0, defenseEv: 0, spDefenseEv: 0, speedEv: 32, defenseNature: 1, spDefenseNature: 1 })
const backup = (patch = {}) => ({ version: 1, party: [member('pikachu')], opponents: [opponent('pikachu')], ...patch })

test('backup rejects malformed nested roster primitives and shapes before mutation', () => {
  for (const input of [
    backup({ opponents: [opponent('pikachu'), { ...opponent('pikachu'), hpEv: { toString: null } }] }),
    backup({ party: [{ ...member('pikachu'), evs: { speed: { toString: null } } }] }),
    backup({ party: [{ ...member('pikachu'), config: [] }] }),
    backup({ opponents: [{ ...opponent('pikachu'), revealedMoves: [null] }] }),
    backup({ sampleForge: { ...member('pikachu'), tuning: { maxValue: {} } } }),
    backup({ sampleDamageTargets: [{ ...opponent('pikachu'), hpEv: [] }] }),
    backup({ calcHitCount: { toString: null } }),
    backup({ confirmedMovesByKey: { pikachu: [null] } }),
    backup({ calcConditionalPowerValues: { power: {} } }),
  ]) assert.throws(() => validateBackup(input), /backup/i)
})

test('backup rejects malformed nested saved entries instead of manufacturing defaults', () => {
  for (const input of [
    backup({ savedSamples: [{}] }),
    backup({ savedSamples: [{ id: 'a', label: 'A', member: { key: 5 }, lockedMoves: [] }] }),
    backup({ savedSamples: [{ id: 'a', label: 'A', member: member('pikachu'), lockedMoves: [{}] }] }),
    backup({ savedPartyPresets: [{}] }),
    backup({ savedPartyPresets: [{ id: 'a', label: 'A', party: [null], lockedMovesBySlot: [] }] }),
    backup({ savedPartyPresets: [{ id: 'a', label: 'A', party: [member('pikachu')], lockedMovesBySlot: [[null]] }] }),
  ]) assert.throws(() => validateBackup(input), /backup/i)
})

test('saved entries require exported metadata and complete member fields', () => {
  const sample = { id: 's1', label: 'Sample', member: member('pikachu'), lockedMoves: [] }
  const preset = { id: 'p1', label: 'Party', party: [member('pikachu')], lockedMovesBySlot: [[]] }
  for (const field of ['id', 'label', 'lockedMoves']) {
    const { [field]: removed, ...incomplete } = sample
    assert.throws(() => validateBackup(backup({ savedSamples: [incomplete] })), /backup savedSamples/i, `sample missing ${field}`)
  }
  for (const field of ['id', 'label', 'lockedMovesBySlot']) {
    const { [field]: removed, ...incomplete } = preset
    assert.throws(() => validateBackup(backup({ savedPartyPresets: [incomplete] })), /backup savedPartyPresets/i, `preset missing ${field}`)
  }
  for (const field of ['config', 'evs', 'tuning', 'picked', 'item', 'ability']) {
    const { [field]: removed, ...incomplete } = sample.member
    assert.throws(() => validateBackup(backup({ savedSamples: [{ ...sample, member: incomplete }] })), /backup savedSamples/i, `member missing ${field}`)
  }
  for (const [field, keys] of [['config', ['nature', 'scarf', 'speedStage']], ['evs', ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed']], ['tuning', ['magicNumber', 'maxValue']]]) {
    for (const key of keys) {
      const { [key]: removed, ...incomplete } = sample.member[field]
      assert.throws(() => validateBackup(backup({ savedSamples: [{ ...sample, member: { ...sample.member, [field]: incomplete } }] })), /backup savedSamples/i, `member missing ${field}.${key}`)
    }
  }
  assert.throws(() => validateBackup(backup({ savedPartyPresets: [{ ...preset, party: [{ key: 'pikachu' }] }] })), /backup savedPartyPresets/i)
  assert.throws(() => validateBackup(backup({ savedSamples: [{ ...sample, member: member('') }] })), /backup savedSamples/i)
  assert.throws(() => validateBackup(backup({ savedPartyPresets: [{ ...preset, party: [] }] })), /backup savedPartyPresets/i)
  assert.throws(() => validateBackup(backup({ savedPartyPresets: [{ ...preset, party: [member('')] }] })), /backup savedPartyPresets/i)
})

test('unsupported species are rejected rather than silently replaced; intentional blanks and extra forms survive', () => {
  const bad = member('invalid-species')
  for (const patch of [
    { party: [bad] }, { opponents: [opponent('invalid-species')] },
    { sampleForge: bad }, { savedSamples: [{ id: 's', label: 'S', member: bad, lockedMoves: [] }] },
    { savedPartyPresets: [{ id: 'p', label: 'P', party: [bad], lockedMovesBySlot: [[]] }] },
  ]) assert.throws(() => validateBackup(backup(patch)), /backup/i)
  assert.doesNotThrow(() => validateBackup(backup({ party: [member(''), member('rotom-heat')], savedPartyPresets: [{ id: 'p', label: 'P', party: [member(''), member('gourgeist-super')], lockedMovesBySlot: [[], []] }] })))
})

test('actual UI-exported backup JSON passes validation and JSON roundtrip', () => {
  const raw = readFileSync(new URL('./fixtures/real-ui-export.json', import.meta.url), 'utf8')
  const exported = JSON.parse(raw)
  assert.ok(exported.party.length > 0)
  assert.equal(exported.savedSamples.length, 1)
  assert.equal(exported.savedPartyPresets.length, 1)
  assert.deepEqual(validateBackup(JSON.parse(JSON.stringify(exported))), exported)
})

test('backup rejects more than three picked members on either side', () => {
  for (const field of ['party', 'opponents']) {
    const factory = field === 'party' ? member : opponent
    assert.throws(() => validateBackup(backup({ [field]: ['pikachu', 'raichu', 'eevee', 'vaporeon'].map(key => factory(key, true)) })), /backup/i)
  }
})

test('version 1 exported shape roundtrips without mutating source or nested values', () => {
  const exported = backup({ savedSamples: [{ id: 's1', label: 'Sample', member: member('pikachu'), lockedMoves: ['Thunderbolt'] }], savedPartyPresets: [{ id: 'p1', label: 'Party', party: [member('pikachu')], lockedMovesBySlot: [['Thunderbolt']] }], sampleForge: member('pikachu'), sampleLockedMoves: ['Thunderbolt'], confirmedMovesByKey: { pikachu: ['Thunderbolt'] }, sampleSpeedTargets: [opponent('raichu')], sampleDamageTargets: [{ ...opponent('raichu'), moveName: 'Thunderbolt' }], calcConditionalPowerValues: { power: 80, boosted: true }, mainSection: 'double', sampleWorkbenchTab: 'builder' })
  const original = JSON.stringify(exported)
  assert.deepEqual(validateBackup(JSON.parse(original)), exported)
  assert.equal(JSON.stringify(exported), original)
})

test('import validates before its first state write', () => {
  const importBody = app.split('  const importState = async ')[1]?.split('  const applyOcrImportedParty')[0]
  assert.ok(importBody)
  assert.match(importBody, /validateBackup\(JSON\.parse\(text\)\)/)
  assert.ok(importBody.indexOf('validateBackup(JSON.parse(text))') < importBody.indexOf('setParty('))
  const firstSetter = importBody.search(/\bset[A-Z]\w*\(/)
  for (const preparation of ['sanitizeParty(parsed.party)', 'sanitizeOpponents(parsed.opponents)', 'sanitizeSavedSamples(parsed.savedSamples)', 'sanitizeSavedPartyPresets(parsed.savedPartyPresets)', 'sanitizeSampleDamageTargets(parsed.sampleDamageTargets)']) {
    assert.ok(importBody.indexOf(preparation) >= 0 && importBody.indexOf(preparation) < firstSetter, `${preparation} must precede every setter`)
  }
})

test('double speed deep link resolves to planner power before rendering', () => {
  assert.match(app, /mainSection === 'double' && activeTabParam === 'speed' \? 'power'/)
  assert.match(app, /\(viewState\?\.mainSection \?\? persisted\?\.mainSection\) === 'double' && resolvedTab === 'speed' \? 'power'/)
})

test('picked toggles for both rosters use three-pick limiter and disallow empty entries', () => {
  assert.match(app, /setParty\(\(prev\) => togglePicked\(prev, idx\)\)/)
  assert.match(app, /setOpponents\(\(prev\) => togglePicked\(prev, selectedOpp\)\)/)
  assert.match(app, /if \(!current \|\| !current\.key\) return list/)
})
