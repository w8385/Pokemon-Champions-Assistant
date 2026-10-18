import { MOVE_SEARCH_ALIASES } from './searchAliases.ts'
import { rankedSearch } from './searchMatching.ts'

export type MoveSearchLabels = { nameEn?: string; nameJa?: string; aliases?: readonly string[] }
/** Search only the supplied pool; callers own learnability/eligibility and optional lazy label metadata. */
export function searchMoves<T extends { name: string }>(pool: readonly T[], query: string, options?: {
  limit?: number
  names?: (move: T) => MoveSearchLabels | undefined
  allowLoose?: boolean
}): T[] {
  return rankedSearch(pool, query, move => {
    const labels = options?.names?.(move)
    return {
      official: [move.name, labels?.nameEn, labels?.nameJa],
      aliases: [...(MOVE_SEARCH_ALIASES[move.name] ?? []), ...(labels?.aliases ?? [])],
    }
  }, options)
}
