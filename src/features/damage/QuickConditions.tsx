import { QuickBattle, QuickSide, QuickConditions, quickHpFacts } from './quickModel.ts'
import { translateText } from '../../shared/display/translation.ts'
import { UiIcon } from '../../shared/display/UiIcon'
import { DamageTerrain, DamageWeather, SiteLanguage } from '../../app/types'
import type { useQuickDamageState } from './useQuickDamageState'
export function QuickConditionsView({ language, comparisonMode, conditions, manualFields, attacker, defender, setSide, setConditions, setManualFields }: {
  language: SiteLanguage; comparisonMode: boolean; conditions: QuickConditions; manualFields: { weather: boolean; terrain: boolean }; attacker: QuickSide; defender: QuickSide;
  setSide: ReturnType<typeof useQuickDamageState>['commands']['setSide'];
  setConditions: ReturnType<typeof useQuickDamageState>['commands']['setConditions'];
  setManualFields: ReturnType<typeof useQuickDamageState>['commands']['setManualFields'];
}) {
  const lt = (text: string) => translateText(language, text)
  const autoLabel = language === 'ko' ? '자동' : language === 'ja' ? '自動' : 'Auto'
  const weatherOptions = [['none','없음'],['sun','쾌청'],['rain','비'],['sand','모래바람'],['snow','싸라기눈']] as const
  const terrainOptions = [['none','없음'],['electric','일렉트릭필드'],['grassy','그래스필드'],['psychic','사이코필드'],['misty','미스트필드']] as const
  const sourceLabels = {
    ko: { condition: '계산 조건 · 이 대면만', battle: '전투 조건' },
    en: { condition: 'Calculation conditions · this matchup only', battle: 'Battle conditions' },
    ja: { condition: '計算条件 · この対面のみ', battle: '戦闘条件' },
  }[language]
  const conditionLabel = comparisonMode ? sourceLabels.condition : ({ ko: '계산 조건 · 현재 계산만', en: 'Calculation conditions · this calculation only', ja: '計算条件 · この計算のみ' } as const)[language]
  const toggle = (key: 'critical' | 'typeChangeStab' | 'gravity', label: string) => <label className="quick-check"><input type="checkbox" checked={conditions[key]} onChange={event => setConditions(prev => ({ ...prev, [key]: event.target.checked }))} />{lt(label)}</label>

  const sideBattleControls = (side: 'attacker' | 'defender') => {
    const entry = side === 'attacker' ? attacker : defender
    const battle = entry.battle
    const setBattle = (patch: Partial<QuickBattle>) => setSide(side, prev => ({ ...prev, battle: { ...prev.battle, ...patch } }))
    const setHpPercent = (value: number) => setBattle(quickHpFacts(value))
    return <fieldset className="quick-side-battle"><legend>{lt(comparisonMode ? side === 'attacker' ? '내 포켓몬' : '상대 포켓몬' : side === 'attacker' ? '포켓몬 1' : '포켓몬 2')} · {sourceLabels.battle}</legend>
      {([['attackStage','공격 랭크'], ['spAttackStage','특수공격 랭크'], ['defenseStage','방어 랭크'], ['spDefenseStage','특수방어 랭크']] as const).map(([key,label]) => <label key={key}>{lt(label)}<select value={battle[key]} onChange={event => setBattle({ [key]: Number(event.target.value) })}>{Array.from({ length: 13 }, (_, idx) => idx - 6).map(value => <option key={value} value={value}>{value > 0 ? `+${value}` : value}</option>)}</select></label>)}
      {([['burned','화상'],['poisoned','독/맹독'],['statused','기타 상태이상'],['movedAfterTarget','상대보다 늦게 행동'],['reflect','리플렉터'],['lightScreen','빛의장막'],['auroraVeil','오로라베일']] as const).map(([key, label]) => <label key={key} className="quick-check"><input type="checkbox" checked={battle[key]} onChange={event => setBattle({ [key]: event.target.checked })} />{lt(label)}</label>)}
      <label className="quick-check"><input type="checkbox" checked={battle.lowHp} onChange={event => setHpPercent(event.target.checked ? Math.min(33, battle.hpPercent) : Math.max(34, battle.hpPercent))} />{lt('HP 1/3 이하')}</label>
      <label className="quick-check"><input type="checkbox" checked={battle.fullHp} onChange={event => setHpPercent(event.target.checked ? 100 : Math.min(99, battle.hpPercent))} />{lt('HP 100%')}</label>
      {entry.ability === 'supreme-overlord' ? <label>{lt('기절한 아군 수')}<select value={battle.faintedAllies} onChange={event => setBattle({ faintedAllies: Number(event.target.value) })}>{Array.from({ length: 6 }, (_, value) => <option key={value} value={value}>{value}</option>)}</select></label> : null}
    </fieldset>
  }
  return <>
    <div className="quick-conditions"><strong className="ui-section-label"><UiIcon name="settings" size={17} />{conditionLabel}</strong><div className="quick-condition-grid"><div className="quick-common-conditions">
      <label>{lt('날씨')}<select value={manualFields.weather ? conditions.weather : 'auto'} data-effective-value={conditions.weather} onChange={event => { const value = event.target.value; if (value === 'auto') { setManualFields(prev => ({ ...prev, weather: false })); return } setManualFields(prev => ({ ...prev, weather: true })); setConditions(prev => ({ ...prev, weather: value as DamageWeather })) }}><option value="auto">{autoLabel} · {lt(weatherOptions.find(([value]) => value === conditions.weather)?.[1] ?? '없음')}</option>{weatherOptions.map(([value, label]) => <option key={value} value={value}>{lt(label)}</option>)}</select></label>
      <label>{lt('필드')}<select value={manualFields.terrain ? conditions.terrain : 'auto'} data-effective-value={conditions.terrain} onChange={event => { const value = event.target.value; if (value === 'auto') { setManualFields(prev => ({ ...prev, terrain: false })); return } setManualFields(prev => ({ ...prev, terrain: true })); setConditions(prev => ({ ...prev, terrain: value as DamageTerrain })) }}><option value="auto">{autoLabel} · {lt(terrainOptions.find(([value]) => value === conditions.terrain)?.[1] ?? '없음')}</option>{terrainOptions.map(([value, label]) => <option key={value} value={value}>{lt(label)}</option>)}</select></label>
      {toggle('critical','급소')}{toggle('typeChangeStab','타입변환 자속')}{toggle('gravity','중력')}
    </div>{sideBattleControls('attacker')}{sideBattleControls('defender')}
    </div></div>
  </>
}
