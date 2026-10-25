import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const speed = readFileSync(new URL('../src/SpeedLinePanel.tsx', import.meta.url), 'utf8')
const region = (begin, end) => app.slice(app.indexOf(begin), app.indexOf(end, app.indexOf(begin)))
const party = region('className="party-preset-board"', 'className="entry-grid manage-entry-grid"')
const lab = app.slice(app.indexOf('className="sample-builder-action-card"'), app.indexOf('id="sample-saved-card"') + 6000)

test('saved party card selects directly, while distinct actions remain separate', () => {
  assert.match(party, /<button type="button" aria-pressed=\{activePartyPresetId === preset.id\} className="party-preset-card-main" onClick=\{\(\) => applyPartyPreset\(preset.id\)\}>/)
  assert.doesNotMatch(party, /confirmAndApplyPartyPreset|파티 불러오기|저장 파티 덮어쓰기|lt\('파티 저장'\)/)
  for (const text of ['새 파티', '저장 파티 이름 변경', '저장 파티 삭제', '현재 파티 비우기', '이미지에서 파티 가져오기']) assert.ok(app.includes(`lt('${text}')`), text)
  for (const handler of ['createNewParty', 'renamePartyPreset', 'resetPartyForFreshEntry']) assert.ok(party.includes(handler) || app.includes(`onClick={${handler}}`), handler)
})

test('builder removes only secondary build echoes and keeps tuning, calculation and saved-card identity', () => {
  for (const obsolete of ['sample-current-build-summary', 'sample-current-build-badges', 'sample-current-build-copy', 'sample-current-build-label', 'sample-saved-slot-badge', 'saved-sample-latest-badge']) assert.doesNotMatch(lab, new RegExp(obsolete))
  const actionHead = region('className="sample-builder-action-head"', 'className="sample-builder-save-row"')
  assert.doesNotMatch(actionHead, /sampleConfirmedMoves\.length|savedSamples\.length/)
  for (const retained of ["renderSampleForgeEffortGrid('speed')", "renderSampleForgeEffortGrid('damage')", 'combat-index-strip', 'sample-speed-stage-inline-card', 'sampleDecisionPowerIndices', 'sample-damage-section', 'sample-saved-move-row', 'savedSampleCountLabel(savedSamples.length', 'className="sample-meta-grid"', 'sample-saved-actions']) assert.ok(app.includes(retained), retained)
  assert.match(lab, /onClick=\{saveCurrentSample\}>\{lt\('샘플 저장'\)\}/)
  assert.match(lab, /onClick=\{\(\) => applySampleToPartySlot\(selectedMy\)\}>\{putInPartySlotLabel\(selectedMy, siteLanguage\)\}/)
  assert.match(lab, /onClick=\{\(\) => confirmPartySlotReplacement\(entry\.member, selectedMy, entry\.lockedMoves\)\}>\{putInPartySlotLabel\(selectedMy, siteLanguage\)\}/)
  assert.match(app, /function putInPartySlotLabel\(index: number, language: SiteLanguage\)/)
  assert.match(lab, /\{lt\('샘플 불러오기'\)\}/)
  assert.match(lab, /\{lt\('저장 샘플 삭제'\)\}/)
})

test('speed investment retains target and numbers but not duplicated effort/nature; reset wording matches scope', () => {
  const invest = speed.slice(speed.indexOf('className="speed-line-investment card"'))
  const identity = invest.match(/<p><strong>\{displayName\(selectedTarget\.row\)\}<\/strong>[^\n]+<\/p>/)?.[0]
  assert.ok(identity)
  assert.doesNotMatch(identity, /listEffort|listNature/)
  for (const retained of ['selectedTarget.actualSpeed', 'selectedTarget.effectiveSpeed', 'investment.currentSpeed', 'investment.maxSpeed', 'investment.tieEffort', 'investment.passEffort', 'investment.previousPassSpeed', 'targetUnavailable']) assert.ok(invest.includes(retained), retained)
  for (const label of ["clear: '기준 포켓몬 해제'", "reset: '검색·폼·비교·범위 초기화'", "share: '스피드라인 링크 복사'"]) assert.ok(speed.includes(label), label)
})

test('distinct import and export destinations have scoped Korean keys and EN/JA translations', () => {
  for (const label of ['전체 데이터 내보내기', '전체 데이터 불러오기', '저장 파티에 추가', '샘플 편집기에 가져오기', '출처 링크 저장', '저장 링크 삭제', '샘플 편집기로 보내기', '파티 슬롯 선택', '선택 슬롯에 넣기', '공격측·방어측 바꾸기']) {
    assert.ok(app.includes(`lt('${label}')`), label)
    const translations = app.slice(app.indexOf('const UI_TRANSLATIONS:'), app.indexOf('function translateText('))
    assert.equal((translations.match(new RegExp(`'${label}':`, 'g')) ?? []).length, 2, label)
  }
  assert.match(app, /onClick=\{\(\) => \{ exportState\(\); setSettingsMenuOpen\(false\) \}\}>\s*<strong>\{lt\('전체 데이터 내보내기'\)\}/)
  assert.match(app, /onClick=\{\(\) => importCreatorParty\(librarySource\)\}>\{lt\('저장 파티에 추가'\)\}/)
})

test('entry actions identify which master record is changed, not temporary assumptions', () => {
  const quick = region('function QuickDamagePanel(', 'function LanguageIcon(')
  assert.match(quick, /side === 'attacker' \? '내 파티 기록에 반영' : '상대 엔트리 기록에 반영'/)
  assert.match(quick, /title=\{lt\('상대 엔트리·비교 초안 초기화'\)\}>\{lt\('상대 초기화'\)\}/)
  assert.match(quick, /onSaveEntry\?\.\(side, entry, dirty\[side\]\)/)
  assert.match(quick, /onResetOpponents\?\.\(defenderSearch\)/)
})
