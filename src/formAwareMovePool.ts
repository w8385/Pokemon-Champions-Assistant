import type { MoveOption } from './app/types'

// PokeAPI /pokemon/rotom-{wash,heat,frost,fan,mow} each lists the shared
// Rotom moves plus exactly its appliance move. Labels/types match local move metadata.
const ROTOM_SIGNATURES: Record<string, MoveOption> = {
  'rotom-wash': { name: '하이드로펌프', type: 'water' },
  'rotom-heat': { name: '오버히트', type: 'fire' },
  'rotom-frost': { name: '눈보라', type: 'ice' },
  'rotom-fan': { name: '에어슬래시', type: 'flying' },
  'rotom-mow': { name: '리프스톰', type: 'grass' },
}
const rotomSignatureNames = new Set(Object.values(ROTOM_SIGNATURES).map(move => move.name))

/** Combine only explicitly related pools. Appliances inherit Rotom's common moves,
 * but never a different appliance's exclusive move, even if a source pool changes. */
export function resolveFormAwareMovePool(key: string, relatedKeys: string[], pools: Record<string, MoveOption[]>): MoveOption[] {
  const signature = ROTOM_SIGNATURES[key]
  const keys = signature ? [...relatedKeys, 'rotom'] : relatedKeys
  const merged = new Map<string, MoveOption>()
  for (const poolKey of keys) {
    for (const move of pools[poolKey] ?? []) {
      if (rotomSignatureNames.has(move.name) && (key === 'rotom' || signature) && move.name !== signature?.name) continue
      if (!merged.has(move.name)) merged.set(move.name, move)
    }
  }
  // The canonical embedded pool stores only the base Rotom's common moves.
  // A signature is added only for its verified appliance, never the base or siblings.
  if (signature && merged.size && !merged.has(signature.name)) merged.set(signature.name, signature)
  return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name, 'ko'))
}
