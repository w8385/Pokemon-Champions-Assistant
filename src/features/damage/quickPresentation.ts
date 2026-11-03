import { FormLearnset, LEARNSET_SOURCE, recordedMoveSnapshotState } from '../../domain/champions/sharedLearnsets'
import { MoveOption, SiteLanguage } from '../../app/types'
export type MovePoolState = { status: 'idle' | 'loading' | 'ready' | 'error' | FormLearnset['status']; moves: MoveOption[] }

export type SharedPoolState = FormLearnset | { status: 'loading' | 'load-error'; moves: MoveOption[]; moveIds: number[]; provenance: typeof LEARNSET_SOURCE }

export function learnsetStatusText(pool: SharedPoolState | undefined, language: SiteLanguage) {
  const messages = {
    ko: { loading: '폼별 기술 스냅샷 로딩 중', ready: '', missing: '폼별 기술 출처 미확인 · 기존 기록 유지', error: '폼별 기술 로딩 실패 · 기존 기록 유지', legacy: '폼별 기술 출처 미검증' },
    en: { loading: 'Loading form learnset', ready: '', missing: 'Form learnset unknown · records retained', error: 'Learnset load failed · records retained', legacy: 'Form learnset unverified' },
    ja: { loading: 'フォルム別わざを読込中', ready: '', missing: 'フォルム別わざ未確認 · 記録は保持', error: 'わざの読込失敗 · 記録は保持', legacy: 'フォルム別わざ未検証' },
  }[language]
  switch (pool?.status) {
    case 'ready-verified': return messages.ready
    case 'legacy-unverified': return messages.legacy
    case 'missing': return messages.missing
    case 'load-error': return messages.error
    default: return messages.loading
  }
}

export function recordedLearnsetText(name: string, pool: SharedPoolState | undefined, language: SiteLanguage): string | null {
  if (!name) return null
  const state = recordedMoveSnapshotState(name, pool)
  if (state === 'in-snapshot' || state === 'pending') return null
  const labels = {
    ko: { outside: '기존 기록 · 2026-09-09 스냅샷 밖 (현행 적격성 미확인)', unverified: '기존 기록 · 폼별 습득 여부 미확인' },
    en: { outside: 'Saved move · outside 2026-09-09 snapshot (current eligibility unknown)', unverified: 'Saved move · exact-form eligibility unknown' },
    ja: { outside: '保存済み · 2026-09-09 スナップショット外 (現行の適格性未確認)', unverified: '保存済み · フォルム別の習得未確認' },
  }[language]
  return state === 'outside-snapshot' ? labels.outside : labels.unverified
}

export function quickKoVerdict(result: { damage: { min: number; max: number }; targetHp: number; hits: number; effectiveness: number } | null): 'certain' | 'possible' | null {
  if (!result || result.hits !== 1 || result.effectiveness <= 0 || !Number.isFinite(result.targetHp) || result.targetHp <= 0 || !Number.isFinite(result.damage.min) || !Number.isFinite(result.damage.max) || result.damage.min <= 0 || result.damage.max < result.damage.min) return null
  return result.damage.min >= result.targetHp ? 'certain' : result.damage.max >= result.targetHp ? 'possible' : null
}

export const quickKoLabels = {
  ko: { certain: '확정 1타', possible: '난수 1타' },
  en: { certain: 'Guaranteed OHKO', possible: 'Possible OHKO' },
  ja: { certain: '確定1発', possible: '乱数1発' },
} as const

export const conciseSpeedLabels = {
  ko: { nature: '성격 보정', scarf: '구애스카프', off: '미적용', on: '적용', partyNote: '파티 도구 변경 없음', entryNote: '엔트리 변경 없음', opponentSpeed: '상대 스피드', item: '상대 도구', ability: '상대 특성 발동', active: '발동', battle: '전투 조건', lab: '비교용 설정 · 원본 빌드 아님' },
  en: { nature: 'Nature modifier', scarf: 'Choice Scarf', off: 'Off', on: 'On', partyNote: 'Party item unchanged', entryNote: 'Entry unchanged', opponentSpeed: 'Opponent Speed', item: 'Opponent item', ability: 'Opponent ability activation', active: 'Active', battle: 'Battle conditions', lab: 'Comparison settings · not the original build' },
  ja: { nature: '性格補正', scarf: 'こだわりスカーフ', off: '未適用', on: '適用', partyNote: 'パーティの持ち物は変更なし', entryNote: 'エントリーは変更なし', opponentSpeed: '相手の素早さ', item: '相手の持ち物', ability: '相手の特性発動', active: '発動', battle: '戦闘条件', lab: '比較用設定 · 元のビルドではありません' },
} as const
