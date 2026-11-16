import React from 'react'
import { conciseSpeedLabels } from './quickPresentation.ts'
import type { QuickSide } from './quickModel.ts'
import { displayName } from '../../shared/display/formatters.ts'
import { translateText } from '../../shared/display/translation.ts'
import { UiIcon } from '../../shared/display/UiIcon'
import { natureMultiplier } from '../../domain/champions/buildRules'
import { isChoiceScarfItem } from '../../domain/battle/statProjection'
import type { Row, SiteLanguage } from '../../app/types'
import type { useQuickDamageState } from './useQuickDamageState'

export function QuickSpeedPresentation({ language, comparisonMode, attacker, defender, attackingRow, defendingRow, speedVisual, mySpeedResult, oppSpeedResult, abilityFor, abilityPermitted, setSide }: {
  language: SiteLanguage
  comparisonMode: boolean
  attacker: QuickSide
  defender: QuickSide
  attackingRow: Row | undefined
  defendingRow: Row | undefined
  speedVisual: ReturnType<typeof useQuickDamageState>['model']['speedVisual']
  mySpeedResult: ReturnType<typeof useQuickDamageState>['model']['mySpeedResult']
  oppSpeedResult: ReturnType<typeof useQuickDamageState>['model']['oppSpeedResult']
  abilityFor: ReturnType<typeof useQuickDamageState>['model']['abilityFor']
  abilityPermitted: ReturnType<typeof useQuickDamageState>['model']['abilityPermitted']
  setSide: ReturnType<typeof useQuickDamageState>['commands']['setSide']
}) {
  const lt = (text: string) => translateText(language, text)
  const speedLabels = conciseSpeedLabels[language]
  const speedId = `quick-speed-${React.useId().replace(/:/g, '')}`
  const firstAhead = comparisonMode ? lt('내가 빠름') : ({ ko: '포켓몬 1이 빠름', en: 'Pokémon 1 is faster', ja: 'ポケモン1が速い' } as const)[language]
  const secondAhead = comparisonMode ? lt('내가 느림') : ({ ko: '포켓몬 2가 빠름', en: 'Pokémon 2 is faster', ja: 'ポケモン2が速い' } as const)[language]
  const verdict = speedVisual.valid
    ? `${speedVisual.delta! > 0 ? firstAhead : speedVisual.delta! < 0 ? secondAhead : lt('동속')}${speedVisual.delta ? ` ${speedVisual.delta > 0 ? '+' : ''}${speedVisual.delta}` : ''}`
    : lt('비교 불가')

  const speedLane = (side: 'attacker' | 'defender', entry: QuickSide, row: Row | undefined) => {
    if (!row) return null
    const own = side === 'attacker'
    const sideLabel = lt(comparisonMode ? own ? '내 포켓몬' : '상대 포켓몬' : own ? '포켓몬 1' : '포켓몬 2')
    const label = `${sideLabel} · ${displayName(row, language)}`
    const result = own ? mySpeedResult : oppSpeedResult
    const fraction = own ? speedVisual.ownFraction : speedVisual.opponentFraction
    const ability = abilityFor(entry, row)
    const abilityAllowed = ability ? abilityPermitted(entry, row) : false
    const abilityApplied = Boolean(ability && abilityAllowed && entry.speedAbilityActive)
    const reasonId = `${speedId}-${side}-reason`
    const modifiersId = `${speedId}-${side}-modifiers`
    const outputDescription = [
      isChoiceScarfItem(entry.item) ? `${speedLabels.scarf} ×1.5` : '',
      abilityApplied && ability ? `${lt(ability.labelKo)} ×${ability.multiplier}` : '',
    ].filter(Boolean).join(' · ')

    return <fieldset className={`quick-speed-lane quick-speed-lane-${side}`}>
      <legend>{label}</legend>
      <div className="quick-speed-lane-result">
        <span>{lt('최종 스피드')}</span>
        <output aria-label={`${sideLabel} ${lt('최종 스피드')}`} aria-describedby={outputDescription ? modifiersId : undefined}>{result?.value ?? '—'}</output>
      </div>
      <div className="quick-speed-track" aria-hidden="true"><span className={`quick-speed-bar quick-speed-bar-${side}`} style={{ width: `${speedVisual.valid ? (fraction ?? 0) * 100 : 0}%` }} /></div>
      {outputDescription ? <span id={modifiersId} className="visually-hidden">{outputDescription}</span> : null}
      <div className="quick-speed-lane-controls">
        <label><span>{speedLabels.nature}</span><select aria-label={`${sideLabel} ${speedLabels.nature}`} value={entry.speedNatureOverride ?? (entry.speedNatureKnown ? natureMultiplier(entry.nature, 'speed') : entry.speedNatureMultiplier)} onChange={event => setSide(side, previous => ({ ...previous, speedNatureOverride: Number(event.target.value) }))}><option value={0.9}>{lt('스피드')} −10%</option><option value={1}>{lt('무보정')} ×1.0</option><option value={1.1}>{lt('스피드')} +10%</option></select></label>
        <label><span>{lt('스피드 랭크')}</span><select aria-label={`${sideLabel} ${lt('스피드 랭크')}`} value={entry.speedStage} onChange={event => setSide(side, previous => ({ ...previous, speedStage: Number(event.target.value) }))}>{Array.from({ length: 13 }, (_, index) => index - 6).map(stage => <option key={stage} value={stage}>{stage > 0 ? `+${stage}` : stage}</option>)}</select></label>
      </div>
      {ability ? <label className="quick-check quick-speed-ability"><input type="checkbox" checked={entry.speedAbilityActive} disabled={!abilityAllowed && !entry.speedAbilityActive} aria-describedby={!abilityAllowed ? reasonId : undefined} onChange={event => setSide(side, previous => ({ ...previous, speedAbilityActive: event.target.checked }))} />{lt(ability.labelKo)} · {lt(ability.conditionKo)} ×{ability.multiplier}</label> : null}
      {!abilityAllowed && ability ? <small id={reasonId}>{lt('(전제 조건 미충족 · 미적용)')}</small> : null}
      {result?.reason ? <small>{lt(result.reason)}</small> : null}
    </fieldset>
  }

  const firstLabel = lt(comparisonMode ? '내 포켓몬' : '포켓몬 1')
  const secondLabel = lt(comparisonMode ? '상대 포켓몬' : '포켓몬 2')
  const statusLabel = speedVisual.valid
    ? `${lt('스피드 비교')} · ${verdict} · ${firstLabel} ${mySpeedResult?.value} · ${secondLabel} ${oppSpeedResult?.value}`
    : `${lt('스피드 비교')} · ${verdict}`

  return <section className="quick-speed-comparison-card" aria-labelledby={`${speedId}-title`}>
    <header className="quick-speed-comparison-head">
      <strong id={`${speedId}-title`}><UiIcon name="speed" size={17} />{lt('스피드 비교')}</strong>
      <output className="quick-speed-verdict" aria-live="polite" aria-atomic="true" aria-label={statusLabel}>{verdict}</output>
    </header>
    <div className="quick-speed-lanes">
      {speedLane('attacker', attacker, attackingRow)}
      {speedLane('defender', defender, defendingRow)}
    </div>
  </section>
}
