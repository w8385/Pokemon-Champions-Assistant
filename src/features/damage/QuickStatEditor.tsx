import React from 'react'
import type { EffortStatKey, Row, SiteLanguage } from '../../app/types'
import { natureMultiplier } from '../../domain/champions/buildRules'
import { actualStat } from '../../domain/champions/statMechanics'
import { quickStatNature } from '../../domain/battle/quickDamageState'
import { battleFormRow } from '../../domain/battle/statProjection'
import { applyChampionsEffort } from '../../domain/champions/effortProjection'
import { CompactStatEditor } from '../../shared/display/CompactStatEditor'
import type { CardStat } from '../../shared/display/PokemonCardOverview'
import { STAT_PRESENTATION } from '../../shared/display/statPresentation'
import { QuickSide, quickMagicProjection, quickStat } from './quickModel'

export function QuickStatEditor({ side, identity, entry, row, stats, language, showPresets = true, setEntry, onDirty }: {
  side: 'attacker' | 'defender'
  identity: string
  entry: QuickSide
  row: Row
  stats: CardStat[]
  language: SiteLanguage
  showPresets?: boolean
  setEntry: React.Dispatch<React.SetStateAction<QuickSide>>
  onDirty: (field: string) => void
}) {
  const projectedRow = battleFormRow(row, entry.ability, entry.actualForm ?? 'shield')
  const magic = quickMagicProjection(entry, projectedRow)
  const actualValue = (key: EffortStatKey, effort?: number) => {
    if (effort === undefined) return quickStat(entry, projectedRow, key)
    const namedMultiplier = key === 'hp' ? 1 : natureMultiplier(entry.nature, key)
    return actualStat(projectedRow[key], effort, quickStatNature(entry, key, namedMultiplier), key === 'hp')
  }
  return <CompactStatEditor
    identity={identity}
    stats={stats}
    evs={entry.evs}
    nature={entry.nature}
    language={language}
    showPresets={showPresets}
    actualValue={actualValue}
    effectiveNatureMultiplier={key => quickStatNature(entry, key, key === 'hp' ? 1 : natureMultiplier(entry.nature, key))}
    onEffort={(key, value) => {
      onDirty(key)
      setEntry(previous => {
        const actual = { ...previous.actual }
        delete actual[key]
        return { ...previous, actual, evs: applyChampionsEffort(previous.evs, key, value) }
      })
    }}
    onSpread={next => {
      for (const stat of STAT_PRESENTATION) if (entry.evs[stat.key] !== next[stat.key]) onDirty(stat.key)
      setEntry(previous => ({ ...previous, actual: {}, evs: next }))
    }}
    onNature={nature => {
      onDirty('nature')
      setEntry(previous => ({ ...previous, actual: {}, nature, statNatureMultipliers: {}, speedNatureKnown: true, speedNatureOverride: null }))
    }}
    magicScale={magic.scale}
  />
}
