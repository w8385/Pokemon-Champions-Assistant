import type { SourcePlacement } from './creatorSourcePlacement.ts'
import { formatSourcePlacement } from './creatorSourcePlacement.ts'

type Language = 'ko' | 'en' | 'ja'

/** Presentation-only author claim; never used by ranker/import eligibility. */
export function SourcePlacementBadge({ placement, language }: { placement?: SourcePlacement; language: Language }) {
  if (!placement) return null
  const labels = formatSourcePlacement(placement, language)
  const evidence = placement.placementEvidence
  const explanation = `${labels.evidence}${placement.placementScope === 'world_unspecified' ? ({ ko: ' · 최종 순위 미확인', en: ' · final rank unknown', ja: ' · 最終順位未確認' } as const)[language] : ''}${placement.note ? ` · ${placement.note}` : ''} · ${({ ko: '독립 검증 없음', en: 'Not independently verified', ja: '独立検証なし' } as const)[language]}`
  return <div className="creator-library-placement" aria-label={`${labels.season} · ${labels.placement}`}>
    <span className="creator-library-placement-chip" title={placement.seasonEvidence?.location ?? placement.note ?? explanation}>{labels.season}</span>
    <span className="creator-library-placement-chip" title={explanation}>{labels.placement}</span>
    {evidence ? <a className="creator-library-placement-evidence" href={evidence.sourceUrl} target="_blank" rel="noopener noreferrer" title={`${explanation} · ${evidence.location} · ${evidence.checkedAt}`}>{labels.evidence}</a> : <small title={explanation}>{labels.evidence}</small>}
  </div>
}
