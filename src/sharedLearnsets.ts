import type { MoveOption } from './app/types'
import { getDexGameMoveIdentity } from './dexGameMoveIndex'

/** One dated, exact-form authority for both battle choices and Dex relationships. */
export const LEARNSET_SOURCE = {
  kind: 'game-snapshot' as const,
  date: '2026-09-09' as const,
  commit: '50e7233b78c3b81df29563f9695386c28e77fc95' as const,
}
export type LearnsetProvenance = typeof LEARNSET_SOURCE & {
  reason?: 'ambiguous-form' | 'not-recorded'
  message?: string
}
export type FormLearnset = {
  status: 'ready-verified' | 'legacy-unverified' | 'missing' | 'load-error'
  primaryId?: string
  moveIds: number[]
  moves: MoveOption[]
  provenance: LearnsetProvenance
}
export type MoveLearners = { status: 'ready-verified' | 'missing' | 'load-error'; keys: string[]; provenance: LearnsetProvenance }

// The 2 MB source remains behind a dynamic-import boundary, never in startup chunks.
async function snapshot() { return (await import('./dexGameLearnsets.json')).default }

export async function loadFormLearnset(key: string): Promise<FormLearnset> {
  const data = await snapshot()
  const form = Object.prototype.hasOwnProperty.call(data.forms, key) ? data.forms[key as keyof typeof data.forms] : undefined
  if (form) return {
    status: 'ready-verified', primaryId: form.primaryId, moveIds: form.moves,
    moves: form.moves.map(id => ({ name: data.moves[String(id) as keyof typeof data.moves].appName, type: data.moves[String(id) as keyof typeof data.moves].type })),
    provenance: LEARNSET_SOURCE,
  }
  const ambiguous = Object.prototype.hasOwnProperty.call(data.unresolved, key)
  return { status: 'missing', moves: [], moveIds: [], provenance: {
    ...LEARNSET_SOURCE, reason: ambiguous ? 'ambiguous-form' : 'not-recorded',
    message: ambiguous ? '성별·품종이 확정되지 않아 습득 기술을 표시하지 않습니다.' : '고정 스냅샷에 검증된 폼이 아닙니다.',
  } }
}

export async function loadMoveLearners(name: string): Promise<MoveLearners> {
  const move = getDexGameMoveIdentity(name)
  if (!move) return { status: 'missing', keys: [], provenance: { ...LEARNSET_SOURCE, reason: 'not-recorded' } }
  const data = await snapshot()
  return { status: 'ready-verified', keys: Object.entries(data.forms).filter(([, form]) => form.moves.includes(move.id)).map(([key]) => key), provenance: LEARNSET_SOURCE }
}

/** Eligibility is only a ready pool; saved/raw moves are never mutated by this projection. */
export function choicesForPool(pool: { status: FormLearnset['status'] | 'loading'; moves: MoveOption[] } | undefined): MoveOption[] {
  return pool?.status === 'ready-verified' || pool?.status === 'legacy-unverified' ? pool.moves : []
}

export function moveInPool(name: string, moves: MoveOption[]): boolean {
  const recorded = getDexGameMoveIdentity(name)
  return moves.some(move => {
    const candidate = getDexGameMoveIdentity(move.name)
    return recorded && candidate ? recorded.id === candidate.id : move.name === name
  })
}

/** Only ready exact-form evidence authorizes a new choice; recommendations are not evidence. */
export function resolveEligibleMoveInput(raw: string, pool: { status: FormLearnset['status'] | 'loading'; moves: MoveOption[] } | undefined): string | null {
  if (pool?.status !== 'ready-verified') return null
  const identity = getDexGameMoveIdentity(raw.trim())
  return identity ? pool.moves.find(move => getDexGameMoveIdentity(move.name)?.id === identity.id)?.name ?? null : null
}

/** Preserve unchanged raw history and permit explicit clearing without source evidence. */
export function commitRecordedMoveInput(raw: string, previous: string, pool: { status: FormLearnset['status'] | 'loading'; moves: MoveOption[] } | undefined): string {
  if (raw === previous) return previous
  if (!raw.trim()) return ''
  return resolveEligibleMoveInput(raw, pool) ?? previous
}

/** A recorded move absent from this pinned snapshot is not declared illegal. */
export function recordedMoveSnapshotState(name: string, pool: { status: FormLearnset['status'] | 'loading'; moves: MoveOption[] } | undefined): 'pending' | 'in-snapshot' | 'outside-snapshot' | 'unverified' {
  if (!pool || pool.status === 'loading') return 'pending'
  if (pool.status !== 'ready-verified') return 'unverified'
  return moveInPool(name, pool.moves) ? 'in-snapshot' : 'outside-snapshot'
}
