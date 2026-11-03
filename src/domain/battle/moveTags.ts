import { normalizeSearchText } from './moveKey.ts'
import { moveNameCandidates } from './moveAliases.ts'

export const PUNCH_MOVE_NAMES = new Set([
  '그로우펀치', '냉동펀치', '드레인펀치', '마하펀치', '메가톤펀치', '번개펀치',
  '불꽃펀치', '불릿펀치', '섀도펀치', '연속펀치', '잼잼펀치', '제트펀치', '코멧펀치', '폭발펀치', '힘껏펀치',
].map(normalizeSearchText))

export const BITE_MOVE_NAMES = new Set([
  '물기', '깨물어부수기', '번개엄니', '불꽃엄니', '얼음엄니', '독엄니', '사이코팽', '아쿠아팽',
].map(normalizeSearchText))

export const PULSE_MOVE_NAMES = new Set([
  '대지의파동', '물의파동', '악의파동', '용의파동', '치유파동', '파동탄',
].map(normalizeSearchText))

export const SOUND_MOVE_NAMES = new Set([
  '매혹의보이스', '에코보이스', '차밍보이스', '하이퍼보이스', '노래하기', '돌림노래', '멸망의노래', '폭음파',
].map(normalizeSearchText))

export const SLICING_MOVE_NAMES = new Set([
  '사이코커터', '아쿠아커터', '에어슬래시', '리프블레이드', '셸블레이드', '솔라블레이드',
  '깜짝베기', '찍찍베기', '풀베기', '성스러운칼', '원념의칼', '시저크로스', '크로스포이즌', '연속자르기', '베어가르기',
].map(normalizeSearchText))

export const CONTACT_MOVE_NAMES = new Set([
  '아쿠아브레이크', '애크러뱃', '엄청난힘', '원념의칼', '치근거리기', '용의클로', '플레어드라이브', '인파이트',
].map(normalizeSearchText))

export const RECKLESS_MOVE_NAMES = new Set([
  '브레이브버드', '플레어드라이브', '이판사판태클', '볼트태클', '양날박치기', '와일드볼트', '점프킥', '무릎차기', '웨이브태클',
].map(normalizeSearchText))

export const SHEER_FORCE_MOVE_NAMES = new Set([
  '10만볼트', '냉동빔', '화염방사', '문포스', '대지의힘', '러스터캐논', '에어슬래시', '오물폭탄', '아쿠아브레이크', '사이코키네시스',
  '섀도볼', '번개', '불대문자', '폭포오르기', '아이언헤드', '스톤에지', '깨물어부수기', '열탕',
].map(normalizeSearchText))

export const DOUBLE_SPREAD_MOVE_NAMES = new Set([
  '방전', '열풍', '탁류', '눈보라', '파도타기', '지진', '스톤샤워', '매지컬샤인', '오물웨이브', '하이퍼보이스', '폭음파', '흙탕물', '분연', '이붕',
].map(normalizeSearchText))

export function moveMatchesTaggedSet(moveName: string, taggedMoves: Set<string>) {
  return moveNameCandidates(moveName).some((candidate) => taggedMoves.has(normalizeSearchText(candidate)))
}

export function protectionDamageMultiplier(attackerAbility: string, moveName: string, protectionActive: boolean) {
  if (!protectionActive) return 1
  return attackerAbility === 'piercing-drill' && moveMatchesTaggedSet(moveName, CONTACT_MOVE_NAMES) ? 0.25 : 0
}
