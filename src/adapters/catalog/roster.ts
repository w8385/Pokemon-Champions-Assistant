import { actualStat } from '../../domain/champions/statMechanics'
import { CHAMPIONS_EFFORT_PER_STAT_CAP } from '../../domain/champions/buildRules'
import { applyChoiceScarf } from '../../domain/battle/speed/speedModifiers'
import { Row } from '../../app/types'
import { TYPE_KO_BY_KEY } from '../../shared/display/formatters.ts'
import { championsData, additionalFormSpecs } from '../../domain/champions/effectiveRoster'
export function speedTemplate(base: number, boosted: boolean, scarf: boolean) {
  let value = actualStat(base, CHAMPIONS_EFFORT_PER_STAT_CAP, boosted ? 1.1 : 1)
  if (scarf) value = applyChoiceScarf(value)
  return value
}

export function makeFormRow(base: Row, form: {
  id: number
  key: string
  name_ko: string
  name_en: string
  name_ja: string
  types: string[]
  hp: number
  attack: number
  defense: number
  spAttack: number
  spDefense: number
  speed: number
  spriteId: number
}) {
  return {
    ...base,
    id: form.id,
    key: form.key,
    name_ko: form.name_ko,
    name_en: form.name_en,
    name_ja: form.name_ja,
    types: form.types,
    types_ko: form.types.map((type) => TYPE_KO_BY_KEY[type] ?? type),
    hp: form.hp,
    attack: form.attack,
    defense: form.defense,
    spAttack: form.spAttack,
    spDefense: form.spDefense,
    speed: form.speed,
    fast: speedTemplate(form.speed, true, false),
    neutral: speedTemplate(form.speed, false, false),
    uninvested: actualStat(form.speed, 0, 1),
    scarf_fast: speedTemplate(form.speed, true, true),
    scarf_neutral: speedTemplate(form.speed, false, true),
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${form.spriteId}.png`,
  } satisfies Row
}

export const baseRows = ((championsData.rows as Row[]) ?? []).filter((row): row is Row => typeof row?.key === 'string' && !!row.key)

export const baseIndexByKey = new Map(baseRows.map((row) => [row.key, row]))

export const extraFormRows: Row[] = additionalFormSpecs.map(form => makeFormRow(baseIndexByKey.get(form.key.split('-')[0])!, form))

export const rows = [...baseRows, ...extraFormRows]

export const indexByKey = new Map(rows.map((row) => [row.key, row]))

export const speciesOptions = rows.map((row) => ({
  key: row.key,
  label: `${row.name_ko} (${row.name_en})`,
}))
