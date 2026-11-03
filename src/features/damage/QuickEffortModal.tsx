import { QuickSide, quickMagicProjection, quickStat } from './quickModel.ts'
import { applyChampionsEffort } from '../../domain/champions/effortProjection'
import { statThemeClass, natureLabel, displayName } from '../../shared/display/formatters.ts'
import { indexByKey } from '../../adapters/catalog/roster.ts'
import { translateText } from '../../shared/display/translation.ts'
import { quickStatNature } from '../../domain/battle/quickDamageState'
import { natureMultiplier } from '../../domain/champions/buildRules'
import { NATURES } from '../../domain/champions/natures'
import { EffortTuningModal } from '../../shared/display/EffortTuningModal'
import { actualStat } from '../../domain/champions/statMechanics'
import { SiteLanguage } from '../../app/types'
import type { useQuickDamageState } from './useQuickDamageState'
export function QuickEffortModal({ language, modalSide, modalKey, attacker, defender, setSide, markDirty, setModalSide, opener }: {
  language: SiteLanguage; modalSide: 'attacker' | 'defender' | null; modalKey: string;
  attacker: QuickSide; defender: QuickSide;
  setSide: ReturnType<typeof useQuickDamageState>['commands']['setSide']; markDirty: ReturnType<typeof useQuickDamageState>['commands']['markDirty'];
  setModalSide: ReturnType<typeof useQuickDamageState>['commands']['setModalSide']; opener: ReturnType<typeof useQuickDamageState>['commands']['opener'];
}) {
  const lt = (text: string) => translateText(language, text)
  return <>
    {modalSide && modalKey === (modalSide === 'attacker' ? attacker : defender).key && indexByKey.get(modalKey) ? (() => {
      const entry = modalSide === 'attacker' ? attacker : defender
      const row = indexByKey.get(entry.key)!
      const magic = quickMagicProjection(entry, row)
      return <EffortTuningModal evs={entry.evs} nature={entry.nature} magicCandidate={magic.candidate} magicPoints={magic.points} natureOptions={NATURES.map(nature => ({ id: nature.id, label: natureLabel(nature.id, language) }))} actualValue={(key, effort) => effort === undefined ? quickStat(entry, row, key) : actualStat(row[key], effort, quickStatNature(entry, key, key === 'hp' ? 1 : natureMultiplier(entry.nature, key)), key === 'hp')} onEffort={(key, value) => { markDirty(modalSide, key); setSide(modalSide, prev => ({ ...prev, evs: applyChampionsEffort(prev.evs, key, value) })) }} onNature={nature => { markDirty(modalSide, 'nature'); setSide(modalSide, prev => ({ ...prev, nature, statNatureMultipliers: {}, speedNatureKnown: true })) }} override={entry.actual} onOverride={(key, value) => setSide(modalSide, prev => { const actual = { ...prev.actual }; if (value === '') delete actual[key]; else actual[key] = value; return { ...prev, actual } })} onClose={() => setModalSide(null)} translate={lt} statTheme={statThemeClass} title={`${displayName(row, language)} · ${lt('노력치 보정')}`} opener={opener.current} />
    })() : null}
  </>
}
