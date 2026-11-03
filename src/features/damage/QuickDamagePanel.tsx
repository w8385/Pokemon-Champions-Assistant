import React from 'react'
import type { SiteLanguage } from '../../app/types'
import type { ComparisonSeed } from '../../domain/party/unifiedComparisonAdapter'
import type { QuickSide } from './quickModel'
import { useQuickDamageState } from './useQuickDamageState'
import { QuickDamageView } from './QuickDamageView'
export type QuickDamageProps = { language: SiteLanguage; tooltipForMove: (name: string) => Pick<React.HTMLAttributes<HTMLElement>, 'onFocus' | 'onBlur' | 'onMouseEnter' | 'onMouseLeave'>; initialSides?: [ComparisonSeed, ComparisonSeed]; comparisonSlots?: [number, number]; comparisonMode?: boolean; entrySelectors?: (opponentSearch: React.ReactNode, reset: React.ReactNode) => React.ReactNode; onSaveEntry?: (side: 'attacker' | 'defender', draft: QuickSide, dirty: ReadonlySet<string>) => void; onDraftIdentity?: (side: 'attacker' | 'defender', key: string) => void; onOpponentSpecies?: (key: string) => void; onResetOpponents?: (search: string) => boolean; opponentResetRevision?: number; movesForSpecies?: (key: string) => string[]; sharedMoveSpecies?: (key: string) => boolean }
export function QuickDamagePanel(props: QuickDamageProps) {
  const state = useQuickDamageState(props)
  return <QuickDamageView {...props} {...state} />
}
