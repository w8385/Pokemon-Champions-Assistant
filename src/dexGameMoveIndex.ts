import type { MoveMeta } from './app/types'
import index from './dexGameMoveIndex.json'
import aliases from './championsMoveMetaNameAliases.json'

type DexGameMove = { id: number; sourceKo: string; type: string }

/** Canonical Dex identities; historical-only metadata is merged by the browse caller. */
export function getDexGameMoveNames(): string[] {
  return Object.keys(index)
}

/** Small synchronous identity index for fresh Dex URLs; never a battle eligibility source. */
export function getDexGameMove(name: string): DexGameMove | null {
  return Object.prototype.hasOwnProperty.call(index, name)
    ? index[name as keyof typeof index] : null
}

/** Build identity from evidenced aliases in either direction, never from guessed labels. */
const aliasedIdentities = (() => {
  const neighbors = new Map<string, Set<string>>()
  for (const [left, right] of Object.entries(aliases)) {
    if (!neighbors.has(left)) neighbors.set(left, new Set())
    if (!neighbors.has(right)) neighbors.set(right, new Set())
    neighbors.get(left)!.add(right)
    neighbors.get(right)!.add(left)
  }
  const resolved = new Map<string, DexGameMove>()
  const visited = new Set<string>()
  for (const root of neighbors.keys()) {
    if (visited.has(root)) continue
    const component = [root]
    const identities = new Map<number, DexGameMove>()
    visited.add(root)
    for (let cursor = 0; cursor < component.length; cursor++) {
      const name = component[cursor]
      const source = getDexGameMove(name)
      if (source) identities.set(source.id, source)
      for (const neighbor of neighbors.get(name) ?? []) {
        if (!visited.has(neighbor)) { visited.add(neighbor); component.push(neighbor) }
      }
    }
    // A conflicting or source-less component must not manufacture an identity.
    if (identities.size === 1) {
      const identity = identities.values().next().value!
      for (const name of component) resolved.set(name, identity)
    }
  }
  return resolved
})()

/** Recognized historical names share a source ID, never eligibility by themselves. */
export function getDexGameMoveIdentity(name: string): DexGameMove | null {
  return getDexGameMove(name) ?? aliasedIdentities.get(name) ?? null
}

/** Dex display only: the source owns type; other known stats remain legacy metadata. */
export function dexDisplayMoveMeta(name: string, legacy: MoveMeta | null | undefined): MoveMeta | null {
  const source = getDexGameMove(name)
  if (source) return legacy ? { ...legacy, type: source.type }
    : { type: source.type, category: null, power: null, accuracy: null, pp: null }
  return legacy ?? null
}
