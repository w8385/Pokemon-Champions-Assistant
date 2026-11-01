import type { FieldEvidence } from './creatorSampleLibrary.ts'

export type SourcePlacement = {
  seasonId: string | null
  placement: number | null
  placementScope: 'final' | 'peak' | 'world_unspecified' | null
  claimEvidence: 'author_result_image' | 'title_claim' | null
  independentlyVerified: false
  seasonEvidence: FieldEvidence | null
  placementEvidence: FieldEvidence | null
  note?: string
}

// Document-level claims transcribed from the pinned source review. These are NOT verified leaderboard results.
// The URL guard prevents a reused sourceId from inheriting another document's claim.
export const partyPlacementClaims: Record<string, { url: string; seasonId: string | null; placement: number | null; placementScope: SourcePlacement['placementScope']; claimEvidence: SourcePlacement['claimEvidence']; independentlyVerified: false }> = {
  "HQDEZg-Zgv8": {
    "url": "https://www.youtube.com/watch?v=HQDEZg-Zgv8",
    "seasonId": null,
    "placement": 1,
    "placementScope": "world_unspecified",
    "claimEvidence": "title_claim",
    "independentlyVerified": false
  },
  "224319761655": {
    "url": "https://m.blog.naver.com/2tjqja/224319761655",
    "seasonId": "시즌 2",
    "placement": 1,
    "placementScope": "final",
    "claimEvidence": "title_claim",
    "independentlyVerified": false
  },
  "y2c5sLKYr7s": {
    "url": "https://www.youtube.com/watch?v=y2c5sLKYr7s",
    "seasonId": null,
    "placement": 53,
    "placementScope": "world_unspecified",
    "claimEvidence": "title_claim",
    "independentlyVerified": false
  },
  "blog-eFF4DcKeQM1cwSf-20261010-081058": {
    "url": "https://eff4dckeqm1cwsf.hatenablog.com/entry/2026/10/10/081058",
    "seasonId": "M-6",
    "placement": 2,
    "placementScope": "final",
    "claimEvidence": "author_result_image",
    "independentlyVerified": false
  },
  "blog-ebapoke-20261008-223301": {
    "url": "https://ebapoke.hatenablog.com/entry/2026/10/08/223301",
    "seasonId": "M-6",
    "placement": 41,
    "placementScope": "final",
    "claimEvidence": "author_result_image",
    "independentlyVerified": false
  },
  "blog-pkmn-ys1224-20261008-180309": {
    "url": "https://pkmn-ys1224.hatenablog.com/entry/2026/10/08/180309",
    "seasonId": "M-6",
    "placement": 71,
    "placementScope": "final",
    "claimEvidence": "author_result_image",
    "independentlyVerified": false
  },
  "blog-m6-1-n68915c0c22e4": {
    "url": "https://note.com/abclil/n/n68915c0c22e4",
    "seasonId": "M-6",
    "placement": 1,
    "placementScope": "final",
    "claimEvidence": "author_result_image",
    "independentlyVerified": false
  },
  "blog-m6-3-2026-10-08-115914": {
    "url": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
    "seasonId": "M-6",
    "placement": 3,
    "placementScope": "final",
    "claimEvidence": "author_result_image",
    "independentlyVerified": false
  },
  "blog-m6-4-2026-10-09-232857": {
    "url": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
    "seasonId": "M-6",
    "placement": 4,
    "placementScope": "final",
    "claimEvidence": "author_result_image",
    "independentlyVerified": false
  },
  "blog-m6-5-n6d45e911cbd1": {
    "url": "https://note.com/rokuromu/n/n6d45e911cbd1",
    "seasonId": "M-6",
    "placement": 5,
    "placementScope": "final",
    "claimEvidence": "title_claim",
    "independentlyVerified": false
  },
  "blog-m6-6-Claris_bradbury:2026-10-07:M-6-6": {
    "url": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
    "seasonId": "M-6",
    "placement": 6,
    "placementScope": "final",
    "claimEvidence": "author_result_image",
    "independentlyVerified": false
  },
  "blog-m6-7-Muu_poke:2026-10-08:204225": {
    "url": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
    "seasonId": null,
    "placement": 7,
    "placementScope": "final",
    "claimEvidence": "author_result_image",
    "independentlyVerified": false
  },
  "blog-m6-9-tixyoca-2026-10-08-163644": {
    "url": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
    "seasonId": "M-6",
    "placement": 9,
    "placementScope": "final",
    "claimEvidence": "author_result_image",
    "independentlyVerified": false
  }
}

export function formatSourcePlacement(meta: SourcePlacement, language: 'ko' | 'en' | 'ja'): { season: string; placement: string; evidence: string } {
  const n = meta.placement
  const season = meta.seasonId === null
    ? { ko: '시즌 미확인', en: 'Season unknown', ja: 'シーズン未確認' }[language]
    : language === 'ko' ? `시즌 ${meta.seasonId.replace(/^시즌\s*/, '')}`
      : language === 'en' ? `Season ${meta.seasonId.replace(/^시즌\s*/, '')}`
      : `シーズン ${meta.seasonId.replace(/^시즌\s*/, '')}`
  const placement = n === null ? { ko: '순위 미확인', en: 'Rank unknown', ja: '順位未確認' }[language]
    : meta.placementScope === 'final' ? { ko: `최종 ${n}위`, en: `Final #${n}`, ja: `最終${n}位` }[language]
    : meta.placementScope === 'peak' ? { ko: `최고 ${n}위`, en: `Peak #${n}`, ja: `最高${n}位` }[language]
    : meta.placementScope === 'world_unspecified' ? { ko: `세계 ${n}위`, en: `World #${n}`, ja: `世界${n}位` }[language]
    : { ko: '순위 미확인', en: 'Rank unknown', ja: '順位未確認' }[language]
  const evidence = meta.claimEvidence === 'author_result_image'
    ? { ko: '작성자 결과 화면', en: 'Author-posted result', ja: '投稿者の結果画面' }[language]
    : { ko: '제목 주장', en: 'Title claim', ja: 'タイトルでの主張' }[language]
  return { season, placement, evidence }
}
