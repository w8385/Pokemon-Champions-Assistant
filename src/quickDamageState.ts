export function readQuickSaved(raw: string | null): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(raw || '{}')
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {}
  } catch { return {} }
}

export function quickMoveSupported(name: string, meta: { category?: string | null; power?: number | null; variablePower?: boolean } | null, unresolvedConditionalPower = false): boolean {
  if (unresolvedConditionalPower) return false
  if (!meta || (meta.category !== 'physical' && meta.category !== 'special')) return false
  const targetWeight = ['로우킥', '풀묶기', '안다리걸기', '안다리 걸기'].includes(name)
  const supportedHits = ['스케일샷', '트리플악셀'].includes(name)
  return (targetWeight || (typeof meta.power === 'number' && meta.power > 0)) && (!meta.variablePower || targetWeight || supportedHits)
}

export function quickItem(item: unknown, requiredStone: string | null, options: readonly string[]): string {
  if (requiredStone) return requiredStone
  return typeof item === 'string' && (item === '' || options.includes(item)) ? item : ''
}
