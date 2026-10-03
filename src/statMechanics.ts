// Champions calculators use level 50, a fixed perfect IV (31), and 0–32
// effort points added to the pre-nature stat (not conventional 0–252 EVs).
export function actualStat(base: number, ev: number, natureMultiplierValue = 1, hp = false) {
  const evContribution = Math.max(0, Math.trunc(ev))
  if (hp) return Math.floor((((2 * base + 31) * 50) / 100) + 60) + evContribution
  const raw = Math.floor((((2 * base + 31) * 50) / 100) + 5) + evContribution
  return Math.floor(raw * natureMultiplierValue)
}
