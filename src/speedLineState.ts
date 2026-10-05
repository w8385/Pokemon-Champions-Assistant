import type { SpeedNature } from './speedLine.ts'
import { getSpeedAbility } from './speedAbilities.ts'

// URL selections may be untrusted; the eligible ability registry stays strictly typed.
export type SpeedAbilitySelection = string | null

export interface SpeedLineState {
  referenceKey: string | null
  referenceEffort: number
  referenceStage: number
  referenceNature: SpeedNature
  listEffort: number
  listNature: SpeedNature
  query: string
  forms: 'all' | 'nonMega' | 'mega'
  comparison: 'all' | 'faster' | 'equal' | 'slower'
  sort: 'desc' | 'asc'
  rangeMode: 'all' | 'around'
  gap: number
  items: 'both' | 'normal' | 'scarf'
  targetKey: string | null
  targetItem: 'normal' | 'scarf'
  abilityMode: 'off' | 'conditions'
  referenceAbility: SpeedAbilitySelection
  targetAbility: SpeedAbilitySelection
}

export const defaultSpeedLineState: SpeedLineState = {
  referenceKey: null,
  referenceEffort: 32,
  referenceStage: 0,
  referenceNature: 'boost',
  listEffort: 32,
  listNature: 'boost',
  query: '',
  forms: 'all',
  comparison: 'all',
  sort: 'desc',
  rangeMode: 'all',
  gap: 10,
  items: 'both',
  targetKey: null,
  targetItem: 'normal',
  abilityMode: 'conditions',
  referenceAbility: null,
  targetAbility: null,
}

type EnumField = 'refNature' | 'listNature' | 'forms' | 'cmp' | 'sort' | 'range' | 'items' | 'targetItem' | 'abilities'
const allowed: Record<EnumField, readonly string[]> = {
  refNature: ['boost', 'neutral', 'lower'],
  listNature: ['boost', 'neutral', 'lower'],
  forms: ['all', 'nonMega', 'mega'],
  cmp: ['all', 'faster', 'equal', 'slower'],
  sort: ['desc', 'asc'],
  range: ['all', 'around'],
  items: ['both', 'normal', 'scarf'],
  targetItem: ['normal', 'scarf'],
  abilities: ['off', 'conditions'],
}

export function parseSpeedLineState(params: URLSearchParams): { state: SpeedLineState; warnings: string[] } {
  const state = { ...defaultSpeedLineState }
  const warnings: string[] = []
  const version = params.get('slv')
  if (version !== null && version !== '1' && version !== '2' && version !== '3') return { state, warnings: ['slv'] }
  if (version === '1' && !params.has('items')) state.items = 'normal'
  if (version === '1' || version === '2') state.abilityMode = 'off'

  state.referenceKey = params.get('ref') || null
  const numeric = (field: string, fallback: number): number => {
    const raw = params.get(field)
    if (raw === null) return fallback
    if (!/^(?:0|[1-9]\d*)$/.test(raw)) {
      warnings.push(field)
      return fallback
    }
    const value = Number(raw)
    if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0 || value > 32) {
      warnings.push(field)
      return fallback
    }
    return value
  }
  const select = <T extends string>(field: EnumField, fallback: T): T => {
    const value = params.get(field)
    if (value === null) return fallback
    if (allowed[field].includes(value)) return value as T
    warnings.push(field)
    return fallback
  }
  state.referenceEffort = numeric('refEp', state.referenceEffort)
  const rawStage = params.get('refStage')
  if (rawStage !== null) {
    if (/^(?:0|[1-6]|-[1-6])$/.test(rawStage)) state.referenceStage = Number(rawStage)
    else warnings.push('refStage')
  }
  state.referenceNature = select('refNature', state.referenceNature)
  state.listEffort = numeric('listEp', state.listEffort)
  state.listNature = select('listNature', state.listNature)
  state.query = params.get('q') ?? state.query
  state.forms = select('forms', state.forms)
  state.comparison = select('cmp', state.comparison)
  state.sort = select('sort', state.sort)
  state.rangeMode = select('range', state.rangeMode)
  state.gap = numeric('gap', state.gap)
  state.items = select('items', state.items)
  state.abilityMode = select('abilities', state.abilityMode)
  const ability = (field: 'refAbility' | 'targetAbility'): SpeedAbilitySelection => {
    const raw = params.get(field)
    if (raw === null) return null
    const descriptor = getSpeedAbility(raw)
    if (descriptor) return descriptor.slug
    warnings.push(field)
    return raw
  }
  state.referenceAbility = ability('refAbility')
  if (state.referenceKey === null) state.referenceAbility = null
  state.targetKey = params.get('target') || null
  state.targetItem = select('targetItem', state.targetItem)
  state.targetAbility = ability('targetAbility')
  if (state.targetKey === null) {
    state.targetItem = 'normal'
    state.targetAbility = null
  }
  return { state, warnings }
}

export function writeSpeedLineState(params: URLSearchParams, state: SpeedLineState): void {
  params.set('slv', '3')
  if (state.referenceKey === null) params.delete('ref')
  else params.set('ref', state.referenceKey)
  params.set('refEp', String(state.referenceEffort))
  params.set('refStage', String(state.referenceStage ?? 0))
  params.set('refNature', state.referenceNature)
  params.set('listEp', String(state.listEffort))
  params.set('listNature', state.listNature)
  params.set('q', state.query)
  params.set('forms', state.forms)
  params.set('cmp', state.comparison)
  params.set('sort', state.sort)
  params.set('range', state.rangeMode)
  params.set('gap', String(state.gap))
  params.set('items', state.items)
  params.set('abilities', state.abilityMode ?? 'off')
  if (state.referenceKey !== null && state.referenceAbility !== null) params.set('refAbility', state.referenceAbility)
  else params.delete('refAbility')
  if (state.targetKey === null) {
    params.delete('target')
    params.delete('targetItem')
    params.delete('targetAbility')
  } else {
    params.set('target', state.targetKey)
    params.set('targetItem', state.targetItem)
    if (state.targetAbility !== null) params.set('targetAbility', state.targetAbility)
    else params.delete('targetAbility')
  }
}
