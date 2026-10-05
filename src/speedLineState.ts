import type { SpeedNature } from './speedLine.ts'

export interface SpeedLineState {
  referenceKey: string | null
  referenceEffort: number
  referenceNature: SpeedNature
  listEffort: number
  listNature: SpeedNature
  query: string
  forms: 'all' | 'nonMega' | 'mega'
  comparison: 'all' | 'faster' | 'equal' | 'slower'
  sort: 'desc' | 'asc'
  rangeMode: 'all' | 'around'
  gap: number
}

export const defaultSpeedLineState: SpeedLineState = {
  referenceKey: null,
  referenceEffort: 32,
  referenceNature: 'boost',
  listEffort: 32,
  listNature: 'boost',
  query: '',
  forms: 'all',
  comparison: 'all',
  sort: 'desc',
  rangeMode: 'all',
  gap: 10,
}

type EnumField = 'refNature' | 'listNature' | 'forms' | 'cmp' | 'sort' | 'range'
const allowed: Record<EnumField, readonly string[]> = {
  refNature: ['boost', 'neutral', 'lower'],
  listNature: ['boost', 'neutral', 'lower'],
  forms: ['all', 'nonMega', 'mega'],
  cmp: ['all', 'faster', 'equal', 'slower'],
  sort: ['desc', 'asc'],
  range: ['all', 'around'],
}

export function parseSpeedLineState(params: URLSearchParams): { state: SpeedLineState; warnings: string[] } {
  const state = { ...defaultSpeedLineState }
  const warnings: string[] = []
  const version = params.get('slv')
  if (version !== null && version !== '1') return { state, warnings: ['slv'] }

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
  state.referenceNature = select('refNature', state.referenceNature)
  state.listEffort = numeric('listEp', state.listEffort)
  state.listNature = select('listNature', state.listNature)
  state.query = params.get('q') ?? state.query
  state.forms = select('forms', state.forms)
  state.comparison = select('cmp', state.comparison)
  state.sort = select('sort', state.sort)
  state.rangeMode = select('range', state.rangeMode)
  state.gap = numeric('gap', state.gap)
  return { state, warnings }
}

export function writeSpeedLineState(params: URLSearchParams, state: SpeedLineState): void {
  params.set('slv', '1')
  if (state.referenceKey === null) params.delete('ref')
  else params.set('ref', state.referenceKey)
  params.set('refEp', String(state.referenceEffort))
  params.set('refNature', state.referenceNature)
  params.set('listEp', String(state.listEffort))
  params.set('listNature', state.listNature)
  params.set('q', state.query)
  params.set('forms', state.forms)
  params.set('cmp', state.comparison)
  params.set('sort', state.sort)
  params.set('range', state.rangeMode)
  params.set('gap', String(state.gap))
}
