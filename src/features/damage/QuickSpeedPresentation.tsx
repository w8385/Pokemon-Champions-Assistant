import { conciseSpeedLabels } from './quickPresentation.ts'
import { QuickSide } from './quickModel.ts'
import { displayName } from '../../shared/display/formatters.ts'
import { translateText } from '../../shared/display/translation.ts'
import { UiIcon } from '../../shared/display/UiIcon'
import { natureMultiplier } from '../../domain/champions/buildRules'
import { Row, SiteLanguage } from '../../app/types'
import type { useQuickDamageState } from './useQuickDamageState'
export function QuickSpeedPresentation({ language, attacker, defender, attackingRow, defendingRow, speedVisual, mySpeedResult, oppSpeedResult, scarfFor, abilityFor, abilityPermitted, setSide }: {
  language: SiteLanguage;
  attacker: QuickSide; defender: QuickSide; attackingRow: Row | undefined; defendingRow: Row | undefined;
  speedVisual: ReturnType<typeof useQuickDamageState>['model']['speedVisual'];
  mySpeedResult: ReturnType<typeof useQuickDamageState>['model']['mySpeedResult']; oppSpeedResult: ReturnType<typeof useQuickDamageState>['model']['oppSpeedResult'];
  scarfFor: ReturnType<typeof useQuickDamageState>['model']['scarfFor']; abilityFor: ReturnType<typeof useQuickDamageState>['model']['abilityFor']; abilityPermitted: ReturnType<typeof useQuickDamageState>['model']['abilityPermitted'];
  setSide: ReturnType<typeof useQuickDamageState>['commands']['setSide'];
}) {
  const lt = (text: string) => translateText(language, text)
  const speedLabels = conciseSpeedLabels[language]
  const speedCard = (side: 'attacker' | 'defender', entry: QuickSide, row: Row | undefined) => {
    if (!row) return null
    const scarf = scarfFor(entry), ability = abilityFor(entry, row)
    return <div className="quick-speed-card">
      <div className="quick-speed-card-heading"><strong><UiIcon name="speed" size={17} />{lt(side === 'attacker' ? '내 포켓몬' : '상대 포켓몬')} · {displayName(row, language)}</strong><span className="quick-speed-base-badge">{lt('스피드 종족값')} {row.speed}</span></div>
      <div className="quick-speed-details"><div className="quick-speed-assumptions"><label>{speedLabels.nature}<select value={entry.speedNatureKnown ? natureMultiplier(entry.nature, 'speed') : entry.speedNatureMultiplier} onChange={event => setSide(side, prev => ({ ...prev, speedNatureKnown: false, speedNatureMultiplier: Number(event.target.value) }))}><option value={0.9}>{lt('스피드')} -10%</option><option value={1}>{lt('무보정')}</option><option value={1.1}>{lt('스피드 +10%')}</option></select></label><label>{lt('스피드 랭크')}<select value={entry.speedStage} onChange={event => setSide(side, prev => ({ ...prev, speedStage: Number(event.target.value) }))}>{Array.from({ length: 13 }, (_, index) => index - 6).map(stage => <option key={stage} value={stage}>{stage > 0 ? `+${stage}` : stage}</option>)}</select></label><label>{speedLabels.scarf}<select value={scarf ? 'scarf' : 'normal'} onChange={event => setSide(side, prev => ({ ...prev, speedScarfOverride: event.target.value === 'scarf' }))}><option value="normal">{speedLabels.off}</option><option value="scarf">{speedLabels.on}</option></select></label>{ability ? <label className="quick-check"><input type="checkbox" checked={entry.speedAbilityActive} onChange={event => setSide(side, prev => ({ ...prev, speedAbilityActive: event.target.checked }))} />{lt(ability.labelKo)} · {lt(ability.conditionKo)} ×{ability.multiplier}</label> : null}{entry.speedAbilityActive && !abilityPermitted(entry, row) ? <small role="alert">{lt('(전제 조건 미충족 · 미적용)')}</small> : null}</div></div>
    </div>
  }
  const speedStrip = <div className="quick-speed-summary" aria-label={lt('스피드 비교')}>
    <strong>{lt('스피드 비교')} · {speedVisual.valid ? `${speedVisual.delta! > 0 ? lt('내가 빠름') : speedVisual.delta! < 0 ? lt('내가 느림') : lt('동속')} ${speedVisual.delta! > 0 ? '+' : ''}${speedVisual.delta}` : lt('비교 불가')}</strong>
    {speedVisual.valid ? <div className="quick-speed-overview-bars">{(['attacker', 'defender'] as const).map((side, index) => { const fraction = index === 0 ? speedVisual.ownFraction : speedVisual.opponentFraction; const row = index === 0 ? attackingRow : defendingRow; const label = `${lt(index === 0 ? '내 포켓몬' : '상대 포켓몬')} · ${row ? displayName(row, language) : '—'}`; const value = index === 0 ? mySpeedResult?.value : oppSpeedResult?.value; return <div key={side}><span>{label}</span><div className="quick-speed-track" role="img" aria-label={`${label} ${lt('최종 스피드')} ${value} / ${speedVisual.maximum}`}><span className={`quick-speed-bar quick-speed-bar-${side}`} style={{ width: `${(fraction ?? 0) * 100}%` }} /></div><strong>{value}</strong></div> })}</div> : null}
    {([mySpeedResult, oppSpeedResult] as const).map((speed, index) => speed?.reason ? <small key={index} role="alert">{lt(index === 0 ? '내 포켓몬' : '상대 포켓몬')} · {lt(speed.reason)}</small> : null)}
  </div>
  return <><div className="quick-speed-settings" aria-label={lt('스피드 조건')}>{speedCard('attacker', attacker, attackingRow)}{speedCard('defender', defender, defendingRow)}</div>{speedStrip}</>
}
