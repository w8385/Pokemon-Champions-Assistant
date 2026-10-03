import type { EffortValues } from './myPartyChampionsSamples'
import type { NatureId } from './app/types'

export type LibraryLanguage = 'ko' | 'ja'
export type LibraryFormat = 'singles' | 'doubles'
export type SourcePlatform = 'youtube' | 'blog' | 'x'
export type ContentKind = 'party' | 'pokemon' | 'unknown'
export type FieldEvidence = { sourceUrl: string; location: string; checkedAt: string }
export type LibraryBuild = {
  nature: NatureId
  item: string
  ability: string
  evs: EffortValues
  moves: [string, string, string, string]
}
// Display-only evidence: never use this as an importable LibraryBuild.
export type PartialLibraryBuild = Partial<LibraryBuild> & { preMegaAbilities?: string[] }
export type PartialBuildField = `partialBuild.${keyof PartialLibraryBuild}`
export type CreatorSample = {
  id: string
  contentKind: ContentKind
  language: LibraryLanguage
  format: LibraryFormat | null
  platform: SourcePlatform
  pokemonKey: string
  title: string
  creator: string | null
  rank: string | null
  provenance: {
    sourceUrl: string; canonicalUrl: string; sourceId: string; publishedAt: string | null; collectedAt: string
    channelId?: string; fields: Partial<Record<'creator' | 'title' | 'pokemonKey' | 'format' | 'rank' | 'build' | PartialBuildField, FieldEvidence>>
    verifiedAt: string; evidence: string
  }
  status: 'verified' | 'partial'
  build: LibraryBuild | null
  partialBuild?: PartialLibraryBuild
}
export type LinkDraft = {
  sourceUrl: string
  contentKind: 'unknown'
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
  return { id: `youtube-${id}`, contentKind: 'unknown', language: 'ko', format: null, platform: 'youtube', pokemonKey, title, creator, rank: null, status: 'partial', build: null,
    provenance: { sourceUrl, canonicalUrl: sourceUrl, sourceId: id, publishedAt: null, collectedAt: '2026-10-03', channelId,
      fields: { creator: evidence, title: evidence, ...(pokemonKey ? { pokemonKey: evidence } : {}) }, verifiedAt: '', evidence: '' } }
}
const pinsirLead = youtubeLead('ihwnR8FJWtM', '눈파티', 'UCd6CX2LiQE2dEAPXwk2N0jg', '벌레 타입의 왕좌를 노리는 사슴벌레 포켓몬 메가 쁘사이저 사용법을 알아보자! [포켓몬 챔피언스]', 'mega-pinsir')
export const catalog: CreatorSample[] = [
  youtubeLead('Ix8nrNnmTUk', '모노', 'UCfKTcDDUzjMpPmV4KuOhkFg', '노자속기 메갸라. 갸라도스의 새로운 패러다임 "HAS 메가갸라도스 샘플"', 'mega-gyarados'),
  youtubeLead('HQDEZg-Zgv8', '케미쨩', 'UCUBpFJAibM1fmqqDE3FP_tQ', '"세계 1위"', ''),
  {
    ...pinsirLead,
    contentKind: 'pokemon',
    // The linked blog embeds a sample image. The video itself is still only a source lead.
    partialBuild: {
      nature: 'adamant', item: '쁘사이저나이트', ability: '스카이스킨',
      preMegaAbilities: ['자기과신', '괴력집게'],
      evs: { hp: 19, attack: 32, defense: 0, spAttack: 0, spDefense: 1, speed: 14 },
      moves: ['전광석화', '누르기', '칼춤', '업어후리기'],
    },
    provenance: {
      ...pinsirLead.provenance,
      fields: {
        ...pinsirLead.provenance.fields,
        ...Object.fromEntries(['nature', 'item', 'ability', 'preMegaAbilities', 'evs', 'moves'].map(field => [
          `partialBuild.${field}`, {
            sourceUrl: 'https://mblogthumb-phinf.pstatic.net/MjAyNjA0MzBfMjM2/MDAxNzc3NDkzMzA0NjE1.J_lacZxX9NonBt_qclnxEDjYQ4I2_bfeuoO8h58cDVcg.Roz1gjc1I4YP455znmaHfIxrtH04aT1Kdjyr-xTPMR0g.JPEG/%EB%A9%94%EA%B0%80_%EC%81%98%EC%82%AC%EC%9D%B4%EC%A0%80_%ED%98%95%ED%83%9C.jpg?type=w800',
            location: `눈파티 블로그 (https://m.blog.naver.com/1209sung/224269941061) 메가 쁘사이저 형태 이미지, ${field}`,
            checkedAt: '2026-10-03',
          },
        ])),
      },
    },
  },
  ...([
    {
      pokemonKey: 'rotom-wash', title: '시즌2 싱글 파티 — 워시로토무', image: 'https://mblogthumb-phinf.pstatic.net/MjAyNjA2MThfMjk2/MDAxNzgxNzU2MDU1NDc0.IoTF0od7Y1UuSXs4t9RQe0R6wAhuqz38lAZEuFRqaZMg.WfcaIiuXWPfAYCyel-HiJqxEE5ITvSkHtD2iB_AAeZwg.JPEG/%ED%8C%8C%ED%8B%B0_1.jpg?type=w800', label: '로토무',
      partialBuild: { item: '구애스카프', ability: '부유', evs: { hp: 6, attack: 0, defense: 0, spAttack: 32, spDefense: 0, speed: 28 }, moves: ['하이드로펌프', '10만볼트', '볼트체인지', '트릭'] },
    },
    {
      pokemonKey: 'mega-scizor', title: '시즌2 싱글 파티 — 메가핫삼', image: 'https://mblogthumb-phinf.pstatic.net/MjAyNjA2MThfMjk2/MDAxNzgxNzU2MDU1NDc0.IoTF0od7Y1UuSXs4t9RQe0R6wAhuqz38lAZEuFRqaZMg.WfcaIiuXWPfAYCyel-HiJqxEE5ITvSkHtD2iB_AAeZwg.JPEG/%ED%8C%8C%ED%8B%B0_1.jpg?type=w800', label: '핫삼',
      partialBuild: { item: '핫삼나이트', ability: '테크니션', evs: { hp: 32, attack: 24, defense: 10, spAttack: 0, spDefense: 0, speed: 0 }, moves: ['칼춤', '불릿펀치', '탁쳐서떨구기', '인파이트'] },
    },
  ] as const).map(({ pokemonKey, title, image, label, partialBuild }): CreatorSample => {
    const sourceUrl = 'https://m.blog.naver.com/2tjqja/224319761655'
    const postEvidence: FieldEvidence = { sourceUrl, location: '모노 블로그 게시물 제목: 시즌2 싱글 파티', checkedAt: '2026-10-03' }
    return {
      id: `blog-224319761655-${pokemonKey}`, contentKind: 'party', language: 'ko', format: 'singles', platform: 'blog', pokemonKey,
      title, creator: '모노', rank: null, status: 'partial', build: null,
      partialBuild: { ...partialBuild, moves: [...partialBuild.moves] as [string, string, string, string] },
      provenance: {
        sourceUrl, canonicalUrl: sourceUrl, sourceId: '224319761655', publishedAt: null, collectedAt: '2026-10-03',
        verifiedAt: '', evidence: '', fields: {
          creator: postEvidence, title: postEvidence, pokemonKey: { sourceUrl: image, location: `파티 이미지의 ${label} 항목`, checkedAt: '2026-10-03' }, format: postEvidence,
          ...Object.fromEntries(['item', 'ability', 'evs', 'moves'].map(field => [`partialBuild.${field}`, {
            sourceUrl: field === 'evs'
              ? 'https://mblogthumb-phinf.pstatic.net/MjAyNjA2MThfMTU2/MDAxNzgxNzU2MDU1NDc1.6eoq1V8VxWiVh4OjCl_z24IFYZsOa3dStFUaPw3DQGgg.CP20xlnDNXYPDKTZMvnLqpik5phS0U04oqSTfizSXqog.JPEG/%ED%8C%8C%ED%8B%B0_2.jpg?type=w800'
              : image,
            location: `모노 블로그 ${label} ${field === 'evs' ? '스테이터스' : '능력'} 이미지, ${field}`, checkedAt: '2026-10-03',
          }])),
        },
      },
    }
  }),
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
  return { sourceUrl, platform, language, format, contentKind: 'unknown', status: 'partial', creator: null, rank: null }
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

// Document-level identity keeps a party post as one source with distinct member builds.
export type CreatorSource = {
  id: string; platform: SourcePlatform; sourceId: string; canonicalUrl: string
  title: string; creator: string | null; language: LibraryLanguage; format: LibraryFormat | null
  contentKind: ContentKind; partySize: number | null
  members: CreatorSample[]; confirmedMemberCount: number; completeMemberCount: number
}

export function groupCreatorSources(entries: CreatorSample[]): CreatorSource[] {
  const sources = new Map<string, CreatorSource>()
  for (const entry of entries) {
    const { sourceId, canonicalUrl } = entry.provenance
    const id = `${entry.platform}:${canonicalUrl}`
    let source = sources.get(id)
    if (!source) {
      source = { id, platform: entry.platform, sourceId, canonicalUrl,
        title: entry.contentKind === 'party' ? entry.title.split(' — ')[0] : entry.title,
        creator: entry.creator, language: entry.language, format: entry.format, contentKind: entry.contentKind,
        partySize: null, members: [], confirmedMemberCount: 0, completeMemberCount: 0 }
      sources.set(id, source)
    }
    if (source.contentKind !== entry.contentKind) throw new Error(`Conflicting source content kinds: ${id}`)
    source.members.push(entry)
    if (entry.partialBuild || entry.build) source.confirmedMemberCount += 1
    if (canImportCreatorSample(entry)) source.completeMemberCount += 1
  }
  return [...sources.values()]
}

export function filterCreatorSources(sources: CreatorSource[], filters: {
  language: LibraryLanguage; format: LibraryFormat | 'all'; query: string; contentKind: ContentKind | 'all'
}): CreatorSource[] {
  const query = filters.query.trim().toLocaleLowerCase()
  return sources.filter(source => (filters.contentKind === 'all' || source.contentKind === filters.contentKind) && source.language === filters.language &&
    (filters.format === 'all' || source.format === filters.format) &&
    (!query || [source.title, source.creator ?? '', ...source.members.flatMap(member => [member.pokemonKey, member.title])]
      .some(text => text.toLocaleLowerCase().includes(query))))
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
    (entry.format !== 'singles' && entry.format !== 'doubles') ||
    !entry.provenance.verifiedAt || !entry.provenance.evidence || !safeSourceUrl(entry.provenance.sourceUrl)) return false
  const build = entry.build
  if (!build.nature || !build.item?.trim() || !build.ability?.trim() || !Array.isArray(build.moves) ||
    build.moves.length !== 4 || build.moves.some((move) => typeof move !== 'string' || !move.trim()) ||
    new Set(build.moves.map((move) => move.trim())).size !== 4 || !build.evs) return false
  return stats.every((stat) => Number.isInteger(build.evs[stat]) && build.evs[stat] >= 0 && build.evs[stat] <= 32) &&
    stats.reduce((sum, stat) => sum + build.evs[stat], 0) <= 66
}
