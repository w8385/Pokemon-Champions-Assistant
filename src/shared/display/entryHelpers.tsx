import React from 'react'
import type { SiteLanguage, NatureId, PartyMember, Row, MoveFieldTarget } from '../../app/types'
import type { EffortValues } from '../../domain/samples/myPartyChampionsSamples'
import { translateText } from './translation'
import { natureById } from './naturePresentation'
import { classifyHeldItem } from '../../domain/champions/itemIdentity'
import { actualStat } from '../../domain/champions/statMechanics'
import { natureMultiplier } from '../../domain/champions/buildRules'
import { localizedAbilityLabel } from '../../domain/champions/abilityIdentity'
import { abilityDescriptionFor } from '../../adapters/catalog/data'
import { getTypeBadgeLabel, getTypeBadgeSrc } from './typeBadges'

export function emptySlotLabel(index: number, language: SiteLanguage) {
  return `${translateText(language, '빈 슬롯')} ${index + 1}`
}

export function savedSampleCountLabel(count: number, language: SiteLanguage) {
  return language === 'en' ? String(count) : language === 'ja' ? `${count}件` : `${count}개`
}

export function natureChipLabel(natureId: NatureId, language: SiteLanguage = 'ko') {
  return translateText(language, natureById.get(natureId)?.label ?? natureId)
}

export function resolveItemInput(key: string, raw: string, _language: SiteLanguage = 'ko') {
  const identity = classifyHeldItem(key, raw)
  return identity.status === 'allowed' || identity.status === 'required-stone' ? identity.canonical! : raw
}

export function partyStatValue(row: Row, member: PartyMember, field: keyof EffortValues) {
  switch (field) {
    case 'hp':
      return actualStat(row.hp, member.evs.hp, 1, true)
    case 'attack':
      return actualStat(row.attack, member.evs.attack, natureMultiplier(member.config.nature, 'attack'))
    case 'defense':
      return actualStat(row.defense, member.evs.defense, natureMultiplier(member.config.nature, 'defense'))
    case 'spAttack':
      return actualStat(row.spAttack, member.evs.spAttack, natureMultiplier(member.config.nature, 'spAttack'))
    case 'spDefense':
      return actualStat(row.spDefense, member.evs.spDefense, natureMultiplier(member.config.nature, 'spDefense'))
    case 'speed':
      return actualStat(row.speed, member.evs.speed, natureMultiplier(member.config.nature, 'speed'))
  }
}

export function displayAbilities(row: Row, language: SiteLanguage) {
  return row.abilities.map(slug => localizedAbilityLabel(row, slug, language, abilityDescriptionFor))
}

export function sameMoveField(a: MoveFieldTarget, key: string, slotIdx: number, scope: 'party' | 'sample' | 'opponent') {
  return a?.key === key && a?.slotIdx === slotIdx && a?.scope === scope
}

export function SmallTypeBadgeImage({ type }: { type: string }) {
  const label = getTypeBadgeLabel(type)
  return <img src={getTypeBadgeSrc(type)} alt={label} className="move-autocomplete-type-icon" title={label} />
}
