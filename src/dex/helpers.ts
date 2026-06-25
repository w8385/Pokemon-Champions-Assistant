import type { DexResultItem, SiteLanguage } from '../app/types'

export type DexTextEntry = {
  text: Record<SiteLanguage, { summary: string; detail: string }>
  effectChance?: number | null
}

function applyEffectChanceText(text: string, effectChance?: number | null) {
  if (!text) return ''
  if (typeof effectChance !== 'number') return text.replace(/\$effect_chance%/g, '')
  return text.replace(/\$effect_chance%/g, `${effectChance}%`)
}

export function localizedDexText(
  description: DexTextEntry | null | undefined,
  language: SiteLanguage,
) {
  if (!description) return null
  const selected = description.text[language] ?? description.text.ko ?? description.text.en
  return {
    summary: applyEffectChanceText(selected?.summary ?? '', description.effectChance),
    detail: applyEffectChanceText(selected?.detail ?? '', description.effectChance),
  }
}

export function dexSelectionId(kind: DexResultItem['kind'], key: string) {
  return `${kind}:${key}`
}

export function parseDexSelectionId(value: string | null | undefined) {
  if (!value) return null
  const separatorIdx = value.indexOf(':')
  if (separatorIdx <= 0) return null
  const kind = value.slice(0, separatorIdx)
  const key = value.slice(separatorIdx + 1)
  if ((kind === 'pokemon' || kind === 'move' || kind === 'ability' || kind === 'item') && key) {
    return { kind, key } as const
  }
  return null
}
