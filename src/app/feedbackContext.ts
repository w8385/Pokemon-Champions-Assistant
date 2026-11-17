import type { DexSearchMode, MainSection, MainTab, SampleWorkbenchTab, SiteLanguage } from './types'

export type FeedbackPointer = 'coarse' | 'fine' | 'unknown'

export type FeedbackViewInput = {
  mainSection: MainSection
  activeTab: MainTab
  sampleWorkbenchTab: SampleWorkbenchTab
  sampleLibraryDetailOpen: boolean
  dexSearchMode: DexSearchMode
  dexDetailOpen: boolean
}

export type FeedbackScreenContext = {
  id: string
  section: MainSection
  view: string
  depth: 'root' | 'list' | 'detail'
  canonicalRoute: string
}

export type FeedbackContextV1 = {
  schemaVersion: 1
  screen: FeedbackScreenContext
  locale: SiteLanguage
  viewport: {
    width: number
    height: number
    pointer: FeedbackPointer
  }
  app: {
    version: string
    revision: string
  }
}

const singleTabs = new Set<MainTab>(['party', 'pick', 'speed', 'power'])

function normalizedBattleTab(section: 'single' | 'double', tab: MainTab): MainTab {
  if (!singleTabs.has(tab)) return 'party'
  if (section === 'double' && tab === 'speed') return 'power'
  return tab
}

export function resolveFeedbackScreen(input: FeedbackViewInput): FeedbackScreenContext {
  const { mainSection } = input
  if (mainSection === 'home') return { id: 'home', section: mainSection, view: 'root', depth: 'root', canonicalRoute: '#/' }
  if (mainSection === 'party') return { id: 'party', section: mainSection, view: 'root', depth: 'root', canonicalRoute: '#/party' }
  if (mainSection === 'quickDamage') return { id: 'damage', section: mainSection, view: 'root', depth: 'root', canonicalRoute: '#/damage' }
  if (mainSection === 'speedLine') return { id: 'speed-line', section: mainSection, view: 'root', depth: 'root', canonicalRoute: '#/speed-line' }
  if (mainSection === 'single' || mainSection === 'double') {
    const tab = normalizedBattleTab(mainSection, input.activeTab)
    return {
      id: `${mainSection}.${tab}`,
      section: mainSection,
      view: tab,
      depth: 'root',
      canonicalRoute: `#/${mainSection}?tab=${tab}`,
    }
  }
  if (mainSection === 'sample') {
    const tab = input.sampleWorkbenchTab
    const depth = tab === 'library' ? input.sampleLibraryDetailOpen ? 'detail' : 'list' : 'root'
    return {
      id: `sample.${tab}${depth === 'root' ? '' : `.${depth}`}`,
      section: mainSection,
      view: tab,
      depth,
      canonicalRoute: `#/sample-builder?sampleTab=${tab}${depth === 'detail' ? '&detail=1' : ''}`,
    }
  }
  const mode = input.dexSearchMode
  const depth = input.dexDetailOpen ? 'detail' : 'list'
  return {
    id: `dex.${mode}.${depth}`,
    section: mainSection,
    view: mode,
    depth,
    canonicalRoute: `#/dex?dexTab=${mode}&detail=${depth === 'detail' ? '1' : '0'}`,
  }
}

function dimension(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 1
  return Math.min(10_000, Math.max(1, Math.round(value)))
}

function safeBuildToken(value: string, fallback: string) {
  const normalized = value.trim().replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 40)
  return normalized || fallback
}

export function createFeedbackContext(input: {
  view: FeedbackViewInput
  locale: SiteLanguage
  viewport: { width: number; height: number; pointer: FeedbackPointer }
  app: { version: string; revision: string }
}): FeedbackContextV1 {
  return {
    schemaVersion: 1,
    screen: resolveFeedbackScreen(input.view),
    locale: input.locale,
    viewport: {
      width: dimension(input.viewport.width),
      height: dimension(input.viewport.height),
      pointer: input.viewport.pointer === 'coarse' || input.viewport.pointer === 'fine' ? input.viewport.pointer : 'unknown',
    },
    app: {
      version: safeBuildToken(input.app.version, 'unknown'),
      revision: safeBuildToken(input.app.revision, 'dev'),
    },
  }
}

const screenLabels = {
  ko: {
    home: '홈', party: '내 파티', damage: '계산기', 'speed-line': '스피드라인', single: '대면', double: '더블배틀',
    sample: '샘플 연구소', sampleDamage: '대미지', 'sample-library': '샘플 라이브러리', dex: '도감', root: '',
    pick: '상대 엔트리', speed: '스피드', power: '대미지', builder: '빌드', library: '라이브러리',
    pokemon: '포켓몬', move: '기술', ability: '특성', item: '도구', list: '목록', detail: '상세',
  },
  en: {
    home: 'Home', party: 'My Party', damage: 'Calculator', 'speed-line': 'Speed Line', single: 'Matchup', double: 'Doubles',
    sample: 'Sample Lab', sampleDamage: 'Damage', 'sample-library': 'Sample Library', dex: 'Dex', root: '',
    pick: 'Opponent Entry', speed: 'Speed', power: 'Damage', builder: 'Build', library: 'Library',
    pokemon: 'Pokémon', move: 'Move', ability: 'Ability', item: 'Item', list: 'List', detail: 'Detail',
  },
  ja: {
    home: 'ホーム', party: '自分のパーティ', damage: '計算機', 'speed-line': '素早さライン', single: '対面', double: 'ダブルバトル',
    sample: 'サンプル研究所', sampleDamage: 'ダメージ', 'sample-library': 'サンプルライブラリ', dex: '図鑑', root: '',
    pick: '相手エントリー', speed: '素早さ', power: 'ダメージ', builder: 'ビルド', library: 'ライブラリ',
    pokemon: 'ポケモン', move: '技', ability: '特性', item: '道具', list: '一覧', detail: '詳細',
  },
} satisfies Record<SiteLanguage, Record<string, string>>

export function feedbackScreenLabel(screen: FeedbackScreenContext, language: SiteLanguage) {
  const labels: Record<string, string> = screenLabels[language]
  if (screen.id === 'home' || screen.id === 'party' || screen.id === 'damage' || screen.id === 'speed-line') return labels[screen.id]
  if (screen.section === 'sample') {
    if (screen.view === 'library') return [labels['sample-library'], labels[screen.depth]].filter(Boolean).join(' · ')
    return [labels.sample, labels[screen.view === 'damage' ? 'sampleDamage' : screen.view]].filter(Boolean).join(' · ')
  }
  if (screen.section === 'dex') return [labels.dex, labels[screen.view], labels[screen.depth]].filter(Boolean).join(' · ')
  return [labels[screen.section], labels[screen.view]].filter(Boolean).join(' · ')
}
