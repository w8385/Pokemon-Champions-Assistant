import { normalizeSearchText } from './moveKey.ts'

export const MOVE_NAME_ALIASES: Record<string, string> = {
  '회복': 'HP회복',
  '섀도클로': '섀도크루',
}

export const MOVE_NAME_ALIASES_BY_NORMALIZED = new Map(
  Object.entries(MOVE_NAME_ALIASES).map(([name, alias]) => [normalizeSearchText(name), alias] as const),
)

export function moveNameCandidates(name: string) {
  const base = name.trim()
  const alias = MOVE_NAME_ALIASES[base] ?? MOVE_NAME_ALIASES_BY_NORMALIZED.get(normalizeSearchText(base))
  return Array.from(new Set([base, alias].filter(Boolean).flatMap((entry) => [entry as string, normalizeSearchText(entry as string)])))
}
