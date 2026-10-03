import type { EffortValues } from './myPartyChampionsSamples'
import type { NatureId, EffortStatKey } from './app/types'

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
export type PartialLibraryBuild = Partial<LibraryBuild> & {
  preMegaAbilities?: string[]
  actualStats?: Record<EffortStatKey, number> // Values transcribed from the source image, not inferred from nature.
  actualStatsForm?: string // Distinguishes a pre-Mega party screen from the selected Mega species.
}
export type PartialBuildField = `partialBuild.${keyof PartialLibraryBuild}`
export type CreatorSample = {
  id: string
  contentKind: ContentKind
  /** Whether this individual build is the subject of its source presentation. */
  featuredSample?: boolean
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
  // Descriptions were inspected, but neither exposes an importable four-move/stat build.
  const descriptionNote = id === 'Ix8nrNnmTUk'
    ? 'YouTube 설명: 00:00 인트로/샘플＆파티정보; 02:58/07:01/12:26 경기. 링크된 223849222657 글은 레이팅 경력 목록이며 이 영상의 메가갸라도스 도구·성격·노력치·4기술을 싣지 않음.'
    : id === 'HQDEZg-Zgv8'
      ? 'YouTube 설명: 2300/1자리 승급전, 1위 챌린지; 2339점 파티영상·후반부 렌탈팀을 주장. 설명 텍스트에 여섯 종 또는 완전한 4기술/성격/노력치 구성 없음; 별도 샘플 글 링크 없음.'
      : ''
  return { id: `youtube-${id}`, contentKind: 'unknown', language: 'ko', format: null, platform: 'youtube', pokemonKey, title, creator, rank: null, status: 'partial', build: null,
    provenance: { sourceUrl, canonicalUrl: sourceUrl, sourceId: id, publishedAt: null, collectedAt: '2026-10-03', channelId,
      fields: { creator: evidence, title: evidence, ...(pokemonKey ? { pokemonKey: evidence } : {}) }, verifiedAt: '', evidence: descriptionNote } }
}
const pinsirLead = youtubeLead('ihwnR8FJWtM', '눈파티', 'UCd6CX2LiQE2dEAPXwk2N0jg', '벌레 타입의 왕좌를 노리는 사슴벌레 포켓몬 메가 쁘사이저 사용법을 알아보자! [포켓몬 챔피언스]', 'mega-pinsir')

// The two adjacent party screenshots belong to the same June 18 source. The stat screen
// shows pre-Mega actual stats/abilities, while the stones and post title identify Mega choices.
const monoAbilityImage = 'https://mblogthumb-phinf.pstatic.net/MjAyNjA2MThfMjk2/MDAxNzgxNzU2MDU1NDc0.IoTF0od7Y1UuSXs4t9RQe0R6wAhuqz38lAZEuFRqaZMg.WfcaIiuXWPfAYCyel-HiJqxEE5ITvSkHtD2iB_AAeZwg.JPEG/%ED%8C%8C%ED%8B%B0_1.jpg?type=w800'
const monoStatImage = 'https://mblogthumb-phinf.pstatic.net/MjAyNjA2MThfMTU2/MDAxNzgxNzU2MDU1NDc1.6eoq1V8VxWiVh4OjCl_z24IFYZsOa3dStFUaPw3DQGgg.CP20xlnDNXYPDKTZMvnLqpik5phS0U04oqSTfizSXqog.JPEG/%ED%8C%8C%ED%8B%B0_2.jpg?type=w800'
type MonoMember = { pokemonKey: string; label: string; arrows: string; build: LibraryBuild; actualStats: Record<EffortStatKey, number>; actualStatsForm: string; preMegaAbility?: boolean }
const monoSeasonTwoMembers: MonoMember[] = [
  { pokemonKey: 'mega-scizor', label: '핫삼', arrows: '공격↑ 특수공격↓', actualStatsForm: 'scizor',
    build: { nature: 'adamant', item: '핫삼나이트', ability: '테크니션', evs: { hp: 32, attack: 24, defense: 10, spAttack: 0, spDefense: 0, speed: 0 }, moves: ['칼춤', '불릿펀치', '탁쳐서떨구기', '인파이트'] },
    actualStats: { hp: 177, attack: 191, defense: 130, spAttack: 67, spDefense: 100, speed: 85 }, preMegaAbility: true },
  { pokemonKey: 'ceruledge', label: '파라블레이즈', arrows: '공격↑ 특수공격↓', actualStatsForm: 'ceruledge',
    build: { nature: 'adamant', item: '기합의띠', ability: '깨어진갑옷', evs: { hp: 1, attack: 32, defense: 0, spAttack: 0, spDefense: 1, speed: 32 }, moves: ['인파이트', '폴터가이스트', '야습', '칼춤'] },
    actualStats: { hp: 151, attack: 194, defense: 100, spAttack: 72, spDefense: 121, speed: 137 } },
  { pokemonKey: 'garchomp', label: '한카리아스', arrows: '방어↑ 특수공격↓', actualStatsForm: 'garchomp',
    build: { nature: 'impish', item: '자뭉열매', ability: '까칠한피부', evs: { hp: 32, attack: 0, defense: 30, spAttack: 0, spDefense: 0, speed: 4 }, moves: ['지진', '드래곤테일', '압정뿌리기', '스텔스록'] },
    actualStats: { hp: 215, attack: 150, defense: 159, spAttack: 90, spDefense: 105, speed: 126 } },
  { pokemonKey: 'mega-floette', label: '플라엣테', arrows: '스피드↑ 공격↓', actualStatsForm: 'floette-eternal-flower',
    build: { nature: 'timid', item: '플라엣테나이트', ability: '플라워베일', evs: { hp: 0, attack: 0, defense: 6, spAttack: 28, spDefense: 0, speed: 32 }, moves: ['문포스', '드레인키스', '파멸의빛', '명상'] },
    actualStats: { hp: 149, attack: 76, defense: 93, spAttack: 173, spDefense: 148, speed: 158 }, preMegaAbility: true },
  { pokemonKey: 'rotom-wash', label: '로토무', arrows: '스피드↑ 공격↓', actualStatsForm: 'rotom-wash',
    build: { nature: 'timid', item: '구애스카프', ability: '부유', evs: { hp: 6, attack: 0, defense: 0, spAttack: 32, spDefense: 0, speed: 28 }, moves: ['하이드로펌프', '10만볼트', '볼트체인지', '트릭'] },
    actualStats: { hp: 131, attack: 76, defense: 127, spAttack: 157, spDefense: 127, speed: 147 } },
  { pokemonKey: 'mega-starmie', label: '아쿠스타', arrows: '공격↑ 특수공격↓', actualStatsForm: 'starmie',
    build: { nature: 'adamant', item: '아쿠스타나이트', ability: '자연회복', evs: { hp: 2, attack: 32, defense: 0, spAttack: 0, spDefense: 0, speed: 32 }, moves: ['아쿠아브레이크', '아이스스피너', '사이코커터', '아쿠아제트'] },
    actualStats: { hp: 137, attack: 139, defense: 105, spAttack: 108, spDefense: 105, speed: 167 }, preMegaAbility: true },
]

// Mono focuses on Mega Gyarados; all six recorded slots remain individual samples.
// Investment figures are Champions screen units (0–32), not conventional 252-point EVs.
type VideoMember = { pokemonKey: string; label: string; ability: string; item: string; moves: [string, string, string, string]; preMegaForm?: string }
type CompleteVideoMember = VideoMember & { nature: NatureId; arrows: string; evs: EffortValues; actualStats: Record<EffortStatKey, number> }
const monoVideoMembers: CompleteVideoMember[] = [
  { pokemonKey: 'hydreigon', label: '삼삼드래', ability: '부유', item: '구애스카프', moves: ['용성군', '악의파동', '불대문자', '유턴'], nature: 'modest', arrows: '특수공격↑ 공격↓', evs: { hp: 2, attack: 0, defense: 0, spAttack: 32, spDefense: 0, speed: 32 }, actualStats: { hp: 169, attack: 112, defense: 110, spAttack: 194, spDefense: 110, speed: 150 } },
  { pokemonKey: 'mega-gyarados', label: '가라도스', preMegaForm: 'gyarados', ability: '위협', item: '갸라도스나이트', moves: ['얼음엄니', '지진', '파워휩', '용의춤'], nature: 'adamant', arrows: '공격↑ 특수공격↓', evs: { hp: 5, attack: 32, defense: 10, spAttack: 0, spDefense: 0, speed: 19 }, actualStats: { hp: 175, attack: 194, defense: 109, spAttack: 72, spDefense: 120, speed: 120 } },
  { pokemonKey: 'archaludon', label: '브리두라스', ability: '지구력', item: '자몽열매', moves: ['스텔스록', '드래곤테일', '아이언헤드', '전기자석파'], nature: 'careful', arrows: '특수방어↑ 특수공격↓', evs: { hp: 32, attack: 0, defense: 5, spAttack: 0, spDefense: 25, speed: 4 }, actualStats: { hp: 197, attack: 125, defense: 155, spAttack: 130, spDefense: 121, speed: 109 } },
  { pokemonKey: 'mega-lopunny', label: '이어롭', preMegaForm: 'lopunny', ability: '유연', item: '이어롭나이트', moves: ['칼춤', '마하펀치', '인파이트', '트리플악셀'], nature: 'adamant', arrows: '공격↑ 특수공격↓', evs: { hp: 1, attack: 32, defense: 1, spAttack: 0, spDefense: 0, speed: 32 }, actualStats: { hp: 141, attack: 140, defense: 105, spAttack: 66, spDefense: 116, speed: 157 } },
  { pokemonKey: 'hippowdon', label: '하마돈', ability: '모래날림', item: '먹다남은음식', moves: ['지진', '방어', '하품', '게으름피우기'], nature: 'impish', arrows: '방어↑ 특수공격↓', evs: { hp: 32, attack: 0, defense: 32, spAttack: 0, spDefense: 2, speed: 0 }, actualStats: { hp: 215, attack: 132, defense: 187, spAttack: 79, spDefense: 94, speed: 67 } },
  { pokemonKey: 'gholdengo', label: '타부자고', ability: '황금몸', item: '생명의구슬', moves: ['골드러시', '섀도볼', '나쁜음모', 'HP회복'], nature: 'modest', arrows: '특수공격↑ 공격↓', evs: { hp: 25, attack: 0, defense: 0, spAttack: 30, spDefense: 0, speed: 11 }, actualStats: { hp: 187, attack: 72, defense: 115, spAttack: 201, spDefense: 111, speed: 115 } },
]
const chemieVideoMembers: VideoMember[] = [
  { pokemonKey: 'greninja', label: '개굴닌자', ability: '급류', item: '기합의띠', moves: ['파도타기', '물수리검', '악의파동', '도발'] },
  { pokemonKey: 'mimikyu', label: '따라큐', ability: '탈', item: '리샘열매', moves: ['치근거리기', '드레인펀치', '야습', '칼춤'] },
  { pokemonKey: 'mega-charizard-x', label: '리자몽', preMegaForm: 'charizard', ability: '맹화', item: '리자몽나이트X', moves: ['플레어드라이브', '역린', '니트로차지', '칼춤'] },
  { pokemonKey: 'gyarados', label: '가라도스', ability: '위협', item: '먹다남은음식', moves: ['폭포오르기', '지진', '도발', '용의춤'] },
  { pokemonKey: 'mega-kangaskhan', label: '캥카', preMegaForm: 'kangaskhan', ability: '배짱', item: '캥카나이트', moves: ['이판사판태클', '지진', '냉동펀치', '불꽃펀치'] },
  { pokemonKey: 'aegislash', label: '킬가르도', ability: '배틀스위치', item: '유루열매', moves: ['성스러운칼', '야습', '대타출동', '칼춤'] },
]

function videoPartyMembers(id: 'Ix8nrNnmTUk' | 'HQDEZg-Zgv8'): CreatorSample[] {
  const mono = id === 'Ix8nrNnmTUk'
  const lead = mono
    ? youtubeLead(id, '모노', 'UCfKTcDDUzjMpPmV4KuOhkFg', '노자속기 메갸라. 갸라도스의 새로운 패러다임 "HAS 메가갸라도스 샘플"', 'mega-gyarados')
    : youtubeLead(id, '케미쨩', 'UCUBpFJAibM1fmqqDE3FP_tQ', '"세계 1위"', '')
  const members = mono ? monoVideoMembers : chemieVideoMembers
  const time = mono ? '02:52' : '10:42'
  const image = mono ? 'mono-t172.png' : 'chemie-t642.png'
  const rentalCode = mono ? '9YGJB9NFJL' : 'ABADTP47YC'
  return members.map((member, index): CreatorSample => {
    const complete = mono ? member as CompleteVideoMember : null
    const actualStatsForm = member.preMegaForm ?? member.pokemonKey
    const build: LibraryBuild | null = complete ? { nature: complete.nature, item: member.item, ability: member.ability, evs: complete.evs, moves: member.moves } : null
    const partialBuild: PartialLibraryBuild = { item: member.item, ability: member.ability, moves: member.moves,
      ...(member.preMegaForm ? { preMegaAbilities: [member.ability] } : {}),
      ...(complete ? { nature: complete.nature, evs: complete.evs, actualStats: complete.actualStats, actualStatsForm } : {}),
    }
    const evidenceAt = (field: string, statScreen = false): FieldEvidence => ({
      sourceUrl: lead.provenance.sourceUrl,
      location: `${statScreen ? '02:55 mono-t175.png' : `${time} ${image}`} 슬롯 ${index + 1} ${member.label}: ${field}${field === 'nature' && complete ? ` (${complete.arrows}; 이름은 화살표에서 추론)` : ''}${member.preMegaForm && ['ability', 'preMegaAbilities', 'actualStats', 'actualStatsForm'].includes(field) ? ` (메가진화 전 ${member.preMegaForm} 화면; 메가 특성/실능 아님)` : ''}`,
      checkedAt: '2026-10-03',
    })
    const fields: CreatorSample['provenance']['fields'] = {
      ...lead.provenance.fields,
      pokemonKey: evidenceAt('종/폼 및 도구'),
      ...Object.fromEntries(['item', 'ability', 'moves', ...(member.preMegaForm ? ['preMegaAbilities'] : []), ...(complete ? ['nature', 'evs', 'actualStats', 'actualStatsForm'] : [])].map(field => [
        `partialBuild.${field}`, evidenceAt(field, ['nature', 'evs', 'actualStats', 'actualStatsForm'].includes(field)),
      ])),
      ...(complete ? { build: evidenceAt('능력/도구/기술; 스테이터스 화면 02:55 mono-t175.png 에 성격 화살표/노력치') } : {}),
    }
    return {
      ...lead,
      id: `youtube-${id}-${member.pokemonKey}`, contentKind: mono ? 'pokemon' : 'party',
      ...(mono ? { featuredSample: member.pokemonKey === 'mega-gyarados' } : {}), pokemonKey: member.pokemonKey,
      title: `${lead.title} — ${member.label}`, format: mono ? 'singles' : null,
      status: complete ? 'verified' : 'partial', build, partialBuild,
      provenance: { ...lead.provenance, verifiedAt: '2026-10-03', fields,
        evidence: mono
          ? `02:52 mono-t172.png 슬롯 ${index + 1} ${member.label} 도구·화면 표시 특성·기술; 02:55 mono-t175.png 슬롯 ${index + 1} 실수치/노력치와 ↑↓ 성격 추론. 영상은 메가갸라도스 개별 샘플 소개이며 ${member.pokemonKey === 'mega-gyarados' ? '주인공 샘플' : '동반 렌탈 슬롯에서 추출한 개별 샘플'}; 여섯 슬롯의 보조 렌탈 파티는 주 파티소개 출처와 별도로 제공. 렌탈 코드 ${rentalCode} (현재 사용 가능 여부 미확인). 싱글 분류는 영상 맥락의 추정으로 렌탈 화면에 모드 표기 없음. ${member.pokemonKey === 'archaludon' ? '브리두라스 도구는 화면 표기 자몽열매 그대로 기록하며 목록 표기 자뭉열매로 자동 교정하지 않음. ' : ''}${member.preMegaForm ? `표시 특성은 메가진화 전 ${member.preMegaForm}의 특성.` : ''}`
          : `${time} ${image} 원본 영상 여섯 슬롯, 렌탈 코드 ${rentalCode} (현재 사용 가능 여부 미확인). 스테이터스 탭 미표시: 성격/노력치/실수치 불명, 완성형 가져오기 불가. 영상 제목의 1위 주장은 별도 랭킹 검증으로 취급하지 않음. ${member.preMegaForm ? `표시 특성은 메가진화 전 ${member.preMegaForm}의 특성.` : ''}`,
      },
    }
  })
}
export const catalog: CreatorSample[] = [
  ...videoPartyMembers('Ix8nrNnmTUk'),
  ...videoPartyMembers('HQDEZg-Zgv8'),
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
  ...monoSeasonTwoMembers.map(({ pokemonKey, label, arrows, build, actualStats, actualStatsForm, preMegaAbility }): CreatorSample => {
    const sourceUrl = 'https://m.blog.naver.com/2tjqja/224319761655'
    const postEvidence: FieldEvidence = { sourceUrl, location: '모노 원문 제목: 포켓몬 챔피언스 싱글 시즌2 레이팅 2564 최종 1위 파티소개; 게시물 2026. 6. 18.', checkedAt: '2026-10-03' }
    const formNote = actualStatsForm !== pokemonKey ? ` (메가진화 전 ${label} 화면; 메가 실능 아님)` : ''
    const imageEvidence = (field: string, statScreen = false): FieldEvidence => ({
      sourceUrl: statScreen ? monoStatImage : monoAbilityImage,
      location: `모노 원문 파티 슬롯 ${label} ${statScreen ? '스테이터스' : '능력'} 이미지: ${field}${field === 'nature' ? ` (${arrows})` : ''}${field === 'actualStats' || field === 'actualStatsForm' ? formNote : ''}${field === 'ability' && preMegaAbility ? ' (메가진화 전 화면의 특성; 메가 특성을 주장하지 않음)' : ''}`,
      checkedAt: '2026-10-03',
    })
    return {
      id: `blog-224319761655-${pokemonKey}`, contentKind: 'party', language: 'ko', format: 'singles', platform: 'blog', pokemonKey,
      title: `시즌2 싱글 파티 — ${label}`, creator: '모노', rank: null, status: 'verified', build,
      partialBuild: { ...build, actualStats, actualStatsForm, ...(preMegaAbility ? { preMegaAbilities: [build.ability] } : {}) },
      provenance: {
        sourceUrl, canonicalUrl: sourceUrl, sourceId: '224319761655', publishedAt: '2026-06-18', collectedAt: '2026-10-03',
        verifiedAt: '2026-10-03', evidence: `원문 여섯 슬롯의 능력/스테이터스 이미지에서 도구·화면 표시 특성·기술 4개·노력치·성격 화살표·실수치를 직접 대조. ${formNote || '비메가 폼 화면.'} 메가 폼 키는 원문의 메가 채용 설명과 메가스톤으로 확인; 실능은 표시된 변신 전 폼만 기록.`,
        fields: {
          creator: postEvidence, title: postEvidence, pokemonKey: imageEvidence('종/폼과 메가스톤'), format: postEvidence,
          build: imageEvidence('완전한 4기술/도구/특성; 성격 및 노력치/실수치는 스테이터스 이미지 참조'),
          ...Object.fromEntries(['item', 'ability', 'moves', 'preMegaAbilities', 'evs', 'nature', 'actualStats', 'actualStatsForm'].filter(field => field !== 'preMegaAbilities' || preMegaAbility).map(field => [
            `partialBuild.${field}`, imageEvidence(field, ['evs', 'nature', 'actualStats', 'actualStatsForm'].includes(field)),
          ])),
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
    if (entry.contentKind === 'pokemon' && entry.featuredSample === false) continue
    const { sourceId, canonicalUrl } = entry.provenance
    const id = `${entry.platform}:${canonicalUrl}`
    let source = sources.get(id)
    if (!source) {
      source = { id, platform: entry.platform, sourceId, canonicalUrl,
        title: entry.contentKind === 'party' ? entry.title.split(' — ')[0] : entry.title,
        creator: entry.creator, language: entry.language, format: entry.format, contentKind: entry.contentKind,
        partySize: entry.contentKind === 'party' && (sourceId === '224319761655' || sourceId === 'HQDEZg-Zgv8') ? 6 : null, members: [], confirmedMemberCount: 0, completeMemberCount: 0 }
      sources.set(id, source)
    }
    if (source.contentKind !== entry.contentKind) throw new Error(`Conflicting source content kinds: ${id}`)
    source.members.push(entry)
    if (entry.partialBuild || entry.build) source.confirmedMemberCount += 1
    if (canImportCreatorSample(entry)) source.completeMemberCount += 1
  }
  return [...sources.values()]
}

/** Member-level index, independent of whether the source introduces a whole party. */
export function individualCreatorSources(entries: CreatorSample[]): CreatorSource[] {
  return entries.filter(entry => entry.partialBuild || entry.build)
    .sort((a, b) => Number(b.featuredSample === true) - Number(a.featuredSample === true))
    .map(entry => ({
    id: `individual:${entry.id}`, platform: entry.platform, sourceId: entry.provenance.sourceId,
    canonicalUrl: entry.provenance.canonicalUrl, title: entry.title, creator: entry.creator,
    language: entry.language, format: entry.format, contentKind: 'pokemon' as const, partySize: null,
    members: [entry], confirmedMemberCount: 1, completeMemberCount: Number(canImportCreatorSample(entry)),
  }))
}

const stats = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'] as const

/** Optional supporting rental composition, not part of the party-introduction index. */
export const relatedCreatorParties: Record<string, CreatorSource> = {
  Ix8nrNnmTUk: (() => {
    const members = catalog.filter(entry => entry.provenance.sourceId === 'Ix8nrNnmTUk').map(entry => ({ ...entry, contentKind: 'party' as const }))
    const featured = members.find(entry => entry.featuredSample)
    if (!featured) throw new Error('Missing featured Mono sample')
    return {
      id: `related-party:${featured.id}`, platform: featured.platform, sourceId: featured.provenance.sourceId,
      canonicalUrl: featured.provenance.canonicalUrl, title: `${featured.title.split(' — ')[0]} — 영상 속 보조 렌탈 파티`,
      creator: featured.creator, language: featured.language, format: featured.format, contentKind: 'party',
      partySize: 6, members, confirmedMemberCount: members.filter(entry => entry.partialBuild || entry.build).length,
      completeMemberCount: members.filter(canImportCreatorSample).length,
    }
  })(),
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
