// Presentation only: calculated Speed and priority come from the existing Double board.
export function presentDoubleActionOrder<T extends { idx: number, occupied: boolean, priority: number | null, speed: number | null }>(entries: T[], trickRoom: boolean): (T & { rank: number | null })[] {
  // Any occupied unknown can fall anywhere: show board positions rather than a guessed order.
  const uncertain = entries.some(entry => entry.occupied && (entry.speed === null || entry.priority === null))
  const ordered = entries.slice().sort((a, b) => {
    if (uncertain) return a.idx - b.idx
    if (a.occupied !== b.occupied) return a.occupied ? -1 : 1
    if (a.priority !== b.priority) return (b.priority ?? 0) - (a.priority ?? 0)
    const aSpeed = a.speed ?? (trickRoom ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY)
    const bSpeed = b.speed ?? (trickRoom ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY)
    if (aSpeed !== bSpeed) return trickRoom ? aSpeed - bSpeed : bSpeed - aSpeed
    return a.idx - b.idx
  })
  return ordered.map((entry, idx) => ({ ...entry, rank: !uncertain && entry.occupied ? idx + 1 : null }))
}
