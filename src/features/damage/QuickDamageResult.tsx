import { DamageRangeMeter } from '../../shared/display/DamageRangeMeter'
import { displayName } from '../../shared/display/formatters'
import { quickKoLabels } from './quickPresentation'
import type { SiteLanguage } from '../../app/types'
import type { useQuickDamageState } from './useQuickDamageState'

type Model = ReturnType<typeof useQuickDamageState>['model']
type ResultModel = Pick<Model, 'selectedVerdict' | 'selectedMove' | 'selectedSource' | 'selectedTarget' | 'result' | 'selectedReason' | 'moveLabel'>

export function QuickDamageResult({ model, language, comparisonMode, lt }: { model: ResultModel; language: SiteLanguage; comparisonMode: boolean; lt: (text: string) => string }) {
  const { selectedVerdict, selectedMove, selectedSource, selectedTarget, result, selectedReason, moveLabel } = model
  return <div className={`quick-result${selectedVerdict ? ` quick-ko-${selectedVerdict}` : ''}`} aria-live="polite" aria-label={lt('대미지 결과')}><div className="quick-result-head"><strong>{moveLabel(selectedMove) || lt('기술 선택')}</strong><span>{selectedSource ? displayName(selectedSource, language) : lt(comparisonMode ? '내 포켓몬' : '공격측')} → {selectedTarget ? displayName(selectedTarget, language) : lt(comparisonMode ? '상대 포켓몬' : '방어측')}</span></div>{result ? <><h3><DamageRangeMeter damage={result.damage} targetHp={result.targetHp} language={language} />{selectedVerdict ? <strong className="quick-ko-verdict">{quickKoLabels[language][selectedVerdict]}</strong> : null}</h3><p>{lt('상대 체력')} {result.targetHp}{result.effectiveness !== 1 ? ` · ${lt('상성')} ×${result.effectiveness}` : null}{result.hits === 1 && result.effectiveness > 0 && Number.isFinite(result.targetHp) && result.targetHp > 0 && Number.isFinite(result.damage.max) && result.damage.max < result.targetHp ? <> · {({ ko: '1타 불가', en: 'No OHKO', ja: '1発不可' } as const)[language]}</> : null}{selectedVerdict === 'possible' ? <span className="quick-ko-chance"> · {(result.damage.rolls.filter(roll => roll >= result.targetHp).length / result.damage.rolls.length * 100).toFixed(1)}%</span> : null}</p>{result.hits > 1 ? <p>{lt('연속기는 기절 확률 계산 제외')}</p> : null}</> : <p role="status">{selectedReason}</p>}</div>
}
