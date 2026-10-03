import type { EffortValues } from './myPartyChampionsSamples'
import type { NatureId } from './app/types'

export type LibraryLanguage = 'ko' | 'ja'
export type LibraryFormat = 'singles' | 'doubles'
export type SourcePlatform = 'youtube' | 'blog' | 'x'
export type FieldEvidence = { sourceUrl: string; location: string; checkedAt: string }
export type LibraryBuild = {
  nature: NatureId
  item: string
  ability: string
  evs: EffortValues
  moves: [string, string, string, string]
}
export type CreatorSample = {
  id: string
  language: LibraryLanguage
  format: LibraryFormat | null
  platform: SourcePlatform
  pokemonKey: string
  title: string
  creator: string | null
  rank: string | null
  provenance: {
    sourceUrl: string; canonicalUrl: string; sourceId: string; publishedAt: string | null; collectedAt: string
    channelId?: string; fields: Partial<Record<'creator' | 'title' | 'pokemonKey' | 'format' | 'rank' | 'build', FieldEvidence>>
    verifiedAt: string; evidence: string
  }
  status: 'verified' | 'partial'
  build: LibraryBuild | null
}
export type LinkDraft = {
  sourceUrl: string
  platform: SourcePlatform
  language: LibraryLanguage
  format: LibraryFormat
  status: 'partial'
  creator: null
  rank: null
}

// Original channel uploads verified in YouTube videoDetails on 2026-10-03.
// These are source leads only; no full build, rank or battle format was validated.
const youtubeLead = (id: string, creator: string, channelId: string, title: string, pokemonKey: string): CreatorSample => {
  const sourceUrl = `https://www.youtube.com/watch?v=${id}`
  const evidence = { sourceUrl, location: 'YouTube videoDetails title / author / channelId', checkedAt: '2026-10-03' }
  return { id: `youtube-${id}`, language: 'ko', format: null, platform: 'youtube', pokemonKey, title, creator, rank: null, status: 'partial', build: null,
    provenance: { sourceUrl, canonicalUrl: sourceUrl, sourceId: id, publishedAt: null, collectedAt: '2026-10-03', channelId,
      fields: { creator: evidence, title: evidence, ...(pokemonKey ? { pokemonKey: evidence } : {}) }, verifiedAt: '', evidence: '' } }
}
export const catalog: CreatorSample[] = [
  youtubeLead('Ix8nrNnmTUk', '모노', 'UCfKTcDDUzjMpPmV4KuOhkFg', '노자속기 메갸라. 갸라도스의 새로운 패러다임 "HAS 메가갸라도스 샘플"', 'mega-gyarados'),
  youtubeLead('HQDEZg-Zgv8', '케미쨩', 'UCUBpFJAibM1fmqqDE3FP_tQ', '"세계 1위"', ''),
  youtubeLead('ihwnR8FJWtM', '눈파티', 'UCd6CX2LiQE2dEAPXwk2N0jg', '벌레 타입의 왕좌를 노리는 사슴벌레 포켓몬 메가 쁘사이저 사용법을 알아보자! [포켓몬 챔피언스]', 'mega-pinsir'),
]

export function isVerifiedRankerSample(entry: CreatorSample): boolean {
  const evidence = entry.provenance.fields?.rank
  return Boolean(entry.rank?.trim() && evidence?.location?.trim() && evidence.checkedAt && safeSourceUrl(evidence.sourceUrl))
}

export function safeSourceUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value.trim())
    return (url.protocol === 'https:' || url.protocol === 'http:') && url.hostname && !url.username && !url.password ? url.href : null
  } catch { return null }
}

export function createLinkDraft(url: string, language: LibraryLanguage, format: LibraryFormat): LinkDraft | null {
  const sourceUrl = safeSourceUrl(url)
  if (!sourceUrl) return null
  const hostname = new URL(sourceUrl).hostname.toLowerCase()
  const platform: SourcePlatform = hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtu.be'
    ? 'youtube' : hostname === 'x.com' || hostname === 'twitter.com' ? 'x' : 'blog'
  return { sourceUrl, platform, language, format, status: 'partial', creator: null, rank: null }
}

export function sanitizeLinkDrafts(value: unknown): LinkDraft[] {
  if (!Array.isArray(value)) return []
  return value.slice(0, 100).flatMap((entry): LinkDraft[] => {
    if (!entry || typeof entry !== 'object') return []
    const raw = entry as Partial<LinkDraft>
    if ((raw.language !== 'ko' && raw.language !== 'ja') || (raw.format !== 'singles' && raw.format !== 'doubles')) return []
    const draft = createLinkDraft(raw.sourceUrl ?? '', raw.language, raw.format)
    return draft ? [draft] : []
  })
}

export function filterCreatorSamples<T extends { language: LibraryLanguage; format: LibraryFormat | null; pokemonKey: string; title: string; creator: string | null }>(
  entries: T[], filters: { language: LibraryLanguage; format: LibraryFormat | 'all'; query: string },
): T[] {
  const query = filters.query.trim().toLocaleLowerCase()
  return entries.filter((entry) => entry.language === filters.language && (filters.format === 'all' || entry.format === filters.format) &&
    (!query || [entry.pokemonKey, entry.title, entry.creator ?? ''].some((text) => text.toLocaleLowerCase().includes(query))))
}

const stats = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'] as const
export function canImportCreatorSample(entry: CreatorSample | LinkDraft): entry is CreatorSample & { build: LibraryBuild } {
  if (!('build' in entry) || entry.status !== 'verified' || !entry.build || !entry.pokemonKey || !entry.creator ||
    !entry.provenance.verifiedAt || !entry.provenance.evidence || !safeSourceUrl(entry.provenance.sourceUrl)) return false
  const build = entry.build
  if (!build.nature || !build.item?.trim() || !build.ability?.trim() || !Array.isArray(build.moves) ||
    build.moves.length !== 4 || build.moves.some((move) => typeof move !== 'string' || !move.trim()) ||
    new Set(build.moves.map((move) => move.trim())).size !== 4 || !build.evs) return false
  return stats.every((stat) => Number.isInteger(build.evs[stat]) && build.evs[stat] >= 0 && build.evs[stat] <= 32) &&
    stats.reduce((sum, stat) => sum + build.evs[stat], 0) <= 66
}
