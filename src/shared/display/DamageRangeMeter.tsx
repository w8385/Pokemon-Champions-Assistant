import type { SiteLanguage } from '../../app/types'

type DamageNumbers = { min: number; max: number; minPct: string | number; maxPct: string | number }

/** Presentation only: percentages and target HP come from the caller's validated calculation. */
export function DamageRangeMeter({ damage, targetHp, language, compact = false }: {
  damage: DamageNumbers | null; targetHp: number; language: SiteLanguage; compact?: boolean
}) {
  if (!damage) return null
  const { min, max, minPct, maxPct } = damage
  const percent = (value: string | number) => typeof value === 'string' && !value.trim() ? NaN : Number(value)
  const low = percent(minPct), high = percent(maxPct)
  const valid = Number.isFinite(min) && Number.isFinite(max) && min >= 0 && max >= min &&
    Number.isFinite(targetHp) && targetHp > 0 && Number.isFinite(low) && Number.isFinite(high) &&
    low >= 0 && high >= low
  if (!valid) return null
  const axis = max > 0
  const label = language === 'en' ? `Damage ${min}–${max}, ${minPct}–${maxPct}% of target HP ${targetHp}`
    : language === 'ja' ? `ダメージ ${min}–${max}、対象HP ${targetHp} の ${minPct}–${maxPct}%`
      : `대미지 ${min}–${max}, 대상 HP ${targetHp}의 ${minPct}–${maxPct}%`
  const clamp = (value: number) => `${Math.min(100, Math.max(0, value))}%`
  return <span className={`damage-range-meter${compact ? ' compact' : ''}`} aria-label={label}>
    <span className="damage-range-values"><strong>{min}–{max}</strong><span> ({minPct}–{maxPct}%)</span></span>
    {axis ? <span className="damage-range-axis" aria-hidden="true"><span className="damage-range-remainder" style={{ width: clamp(high) }} /><span className="damage-range-solid" style={{ width: clamp(low) }} /></span> : null}
  </span>
}
