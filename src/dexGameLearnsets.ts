import type { MoveOption } from './app/types'
import { getDexGameMove } from './dexGameMoveIndex'

export type DexLearnsetProvenance = {
  kind: 'game-snapshot'
  date: '2026-09-09'
  commit: '50e7233b78c3b81df29563f9695386c28e77fc95'
  reason?: 'ambiguous-form' | 'not-recorded'
  message?: string
}

export type DexGameLearnsetResult = {
  status: 'ready' | 'missing'
  moves: MoveOption[]
  provenance: DexLearnsetProvenance
}

export type DexGameMoveLearnersResult = {
  status: 'ready' | 'missing'
  keys: string[]
  provenance: DexLearnsetProvenance
}

export const DEX_GAME_LEARNSET_SOURCE: DexLearnsetProvenance = {
  kind: 'game-snapshot', date: '2026-09-09', commit: '50e7233b78c3b81df29563f9695386c28e77fc95',
}

/** Only this async boundary imports the complete Dex snapshot. Never feed it to battle move eligibility. */
export async function loadDexGameLearnset(key: string): Promise<DexGameLearnsetResult> {
  const { default: data } = await import('./dexGameLearnsets.json')
  const provenance: DexLearnsetProvenance = { ...DEX_GAME_LEARNSET_SOURCE }
  const form = Object.prototype.hasOwnProperty.call(data.forms, key)
    ? data.forms[key as keyof typeof data.forms] : undefined
  if (form) {
    return {
      status: 'ready',
      moves: form.moves.map(id => {
        const move = data.moves[String(id) as keyof typeof data.moves]
        return { name: move.appName, type: move.type }
      }),
      provenance,
    }
  }
  if (Object.prototype.hasOwnProperty.call(data.unresolved, key)) {
    return { status: 'missing', moves: [], provenance: {
      ...provenance, reason: 'ambiguous-form',
      message: '성별·품종을 확정할 수 없어 기술 목록을 표시하지 않습니다.',
    } }
  }
  return { status: 'missing', moves: [], provenance: {
    ...provenance, reason: 'not-recorded', message: '이 폼은 고정 게임 덤프에 검증 대응되지 않았습니다.',
  } }
}

/** Reverse the same exact-form snapshot without adding the full JSON to startup. */
export async function loadDexGameMoveLearners(name: string): Promise<DexGameMoveLearnersResult> {
  const move = getDexGameMove(name)
  const provenance: DexLearnsetProvenance = { ...DEX_GAME_LEARNSET_SOURCE }
  if (!move) return { status: 'missing', keys: [], provenance: {
    ...provenance, reason: 'not-recorded', message: '이 기술은 고정 게임 덤프에 수록되지 않았습니다.',
  } }
  const { default: data } = await import('./dexGameLearnsets.json')
  return {
    status: 'ready',
    keys: Object.entries(data.forms).filter(([, form]) => form.moves.includes(move.id)).map(([key]) => key),
    provenance,
  }
}
