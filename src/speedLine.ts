import { actualStat } from './statMechanics.ts'

export type SpeedNature = 'boost' | 'neutral' | 'lower'
export type SpeedLineOptions = { effort: number; nature: SpeedNature; query: string; forms: 'all' | 'nonMega' | 'mega' }
export type SpeedLineSpecies = { key: string; name_ko: string; name_en: string; name_ja?: string; speed: number }

export function buildSpeedLine<T extends SpeedLineSpecies>(rows: readonly T[], options: SpeedLineOptions) {
  const query = options.query.trim().toLocaleLowerCase()
  const multiplier = options.nature === 'boost' ? 1.1 : options.nature === 'lower' ? 0.9 : 1
  return rows.filter((row) => {
    const mega = row.key.startsWith('mega-')
    return (options.forms === 'all' || (options.forms === 'mega') === mega) &&
      (!query || [row.key, row.name_ko, row.name_en, row.name_ja].some((name) => name?.toLocaleLowerCase().includes(query)))
  }).map((row) => ({ row, speed: actualStat(row.speed, options.effort, multiplier) }))
    .sort((a, b) => b.speed - a.speed || a.row.key.localeCompare(b.row.key))
}
