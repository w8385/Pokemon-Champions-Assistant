import { QuickBattle, QuickSide, QuickConditions } from './quickModel.ts'
import { translateText } from '../../shared/display/translation.ts'
import { UiIcon } from '../../shared/display/UiIcon'
import { DamageTerrain, DamageWeather, SiteLanguage } from '../../app/types'
import type { useQuickDamageState } from './useQuickDamageState'
export function QuickConditionsView({ language, conditions, hits, attacker, defender, setSide, setConditions, setManualFields }: {
  language: SiteLanguage; conditions: QuickConditions; hits: number[] | null; attacker: QuickSide; defender: QuickSide;
  setSide: ReturnType<typeof useQuickDamageState>['commands']['setSide'];
  setConditions: ReturnType<typeof useQuickDamageState>['commands']['setConditions'];
  setManualFields: ReturnType<typeof useQuickDamageState>['commands']['setManualFields'];
}) {
  const lt = (text: string) => translateText(language, text)
const sourceLabels = {
    ko: { shared: '같은 종 슬롯과 기술 공유 · 변경 시 모두 적용', condition: '계산 조건 · 이 대면만', battle: '전투 조건', draft: '비교 초안', unknown: '미확인 · 계산값 0', natureUnknown: '성격 미확인', modifier: '기록 보정' },
    en: { shared: 'Moves shared by same-species slots · edits apply to all', condition: 'Calculation conditions · this matchup only', battle: 'Battle conditions', draft: 'Comparison draft', unknown: 'Unknown · calculated as 0', natureUnknown: 'Nature unknown', modifier: 'Recorded modifier' },
    ja: { shared: '同じ種の枠で技を共有 · 変更は全枠に反映', condition: '計算条件 · この対面のみ', battle: '戦闘条件', draft: '比較下書き', unknown: '未確認 · 計算値0', natureUnknown: '性格未確認', modifier: '記録補正' },
  }[language]
  const toggle = (key: 'critical' | 'typeChangeStab', label: string) => <label className="quick-check"><input type="checkbox" checked={conditions[key]} onChange={event => setConditions(prev => ({ ...prev, [key]: event.target.checked }))} />{lt(label)}</label>

  const sideBattleControls = (side: 'attacker' | 'defender') => {
    const battle = (side === 'attacker' ? attacker : defender).battle
    const setBattle = (patch: Partial<QuickBattle>) => setSide(side, prev => ({ ...prev, battle: { ...prev.battle, ...patch } }))
    return <fieldset className="quick-side-battle"><legend>{lt(side === 'attacker' ? '내 포켓몬' : '상대 포켓몬')} · {sourceLabels.battle}</legend>
      {([['attackStage','공격 랭크'], ['spAttackStage','특수공격 랭크'], ['defenseStage','방어 랭크'], ['spDefenseStage','특수방어 랭크']] as const).map(([key,label]) => <label key={key}>{lt(label)}<select value={battle[key]} onChange={event => setBattle({ [key]: Number(event.target.value) })}>{Array.from({ length: 13 }, (_, idx) => idx - 6).map(value => <option key={value} value={value}>{value > 0 ? `+${value}` : value}</option>)}</select></label>)}
      {([['burned','화상'],['lowHp','HP 1/3 이하'],['poisoned','독/맹독'],['fullHp','HP 100%'],['reflect','리플렉터'],['lightScreen','빛의장막'],['auroraVeil','오로라베일']] as const).map(([key, label]) => <label key={key} className="quick-check"><input type="checkbox" checked={battle[key]} onChange={event => setBattle({ [key]: event.target.checked })} />{lt(label)}</label>)}
    </fieldset>
  }
  return <>
    <div className="quick-conditions"><strong className="ui-section-label"><UiIcon name="settings" size={17} />{sourceLabels.condition}</strong><div className="quick-condition-grid"><div className="quick-common-conditions">
      <label>{lt('날씨')}<select value={conditions.weather} onChange={event => { setManualFields(prev => ({ ...prev, weather: true })); setConditions(prev => ({ ...prev, weather: event.target.value as DamageWeather })) }}>{(['none','sun','rain','sand','snow'] as const).map((value, idx) => <option key={value} value={value}>{lt(['없음','쾌청','비','모래바람','싸라기눈'][idx])}</option>)}</select></label>
      <label>{lt('필드')}<select value={conditions.terrain} onChange={event => { setManualFields(prev => ({ ...prev, terrain: true })); setConditions(prev => ({ ...prev, terrain: event.target.value as DamageTerrain })) }}>{(['none','electric','grassy','psychic','misty'] as const).map((value, idx) => <option key={value} value={value}>{lt(['없음','일렉트릭필드','그래스필드','사이코필드','미스트필드'][idx])}</option>)}</select></label>
      {toggle('critical','급소')}{toggle('typeChangeStab','타입변환 자속')}
      {hits?.length && hits.length > 1 ? <label>{lt('타수')}<select value={hits.includes(conditions.hits) ? conditions.hits : hits[0]} onChange={event => setConditions(prev => ({ ...prev, hits: Number(event.target.value) }))}>{hits.map(hit => <option key={hit} value={hit}>{hit}</option>)}</select></label> : null}
    </div>{sideBattleControls('attacker')}{sideBattleControls('defender')}
    </div></div>
  </>
}
