import React from 'react'
import championsData from './pokemon_champions_verified_data.json'
import { sampleMoves } from './sampleMoves'
import { dataSourcePolicy } from './dataSources'
import { defaultEvs, type EffortValues } from './myPartyChampionsSamples'
import { getTypeBadgeLabel, getTypeBadgeSrc } from './typeBadges'
import { getJaName, getJaTypes } from './jaLabels'

type Row = {
  id: number
  key: string
  name_ko: string
  name_en: string
  name_ja?: string
  hp: number
  attack: number
  defense: number
  spAttack: number
  spDefense: number
  speed: number
  fast: number
  neutral: number
  scarf_fast: number
  scarf_neutral: number
  types: string[]
  types_ko: string[]
  abilities: string[]
  abilities_ko: string[]
}

type StatKey = 'attack' | 'defense' | 'spAttack' | 'spDefense' | 'speed'
type EffortStatKey = keyof EffortValues
type NatureId =
  | 'hardy' | 'lonely' | 'brave' | 'adamant' | 'naughty'
  | 'bold' | 'docile' | 'relaxed' | 'impish' | 'lax'
  | 'timid' | 'hasty' | 'serious' | 'jolly' | 'naive'
  | 'modest' | 'mild' | 'quiet' | 'bashful' | 'rash'
  | 'calm' | 'gentle' | 'sassy' | 'careful' | 'quirky'

type MemberConfig = {
  nature: NatureId
  scarf: boolean
  speedStage: number
}

type PartyTuning = {
  magicNumber: number
  maxValue: number
}

type PartyMember = {
  key: string
  config: MemberConfig
  picked: boolean
  evs: EffortValues
  tuning: PartyTuning
  item: string
  ability: string
}

type OpponentState = {
  key: string
  item: string
  ability: string
  notes: string
  revealedMoves: string[]
  natureBoost: boolean
  scarf: boolean
  speedStage: number
  picked: boolean
}

type SavedSample = {
  id: string
  label: string
  member: PartyMember
}

type CalcMode = 'physical' | 'special'

type PersistedState = {
  party?: PartyMember[]
  opponents?: OpponentState[]
  selectedMy?: number
  selectedOpp?: number
  battleNote?: string
  confirmedMovesByKey?: Record<string, string[]>
  mainSection?: MainSection
  sampleForge?: PartyMember
  savedSamples?: SavedSample[]
}

type ImportExportPayload = PersistedState & {
  version: 1
}

type MoveFilter = 'all' | 'core' | 'options' | 'utility'
type SampleCandidateFilter = 'all' | 'remaining' | 'locked'
type MainSection = 'single' | 'sample'
type MainTab = 'party' | 'pick' | 'speed' | 'power'
type SearchFieldTarget = { side: 'party' | 'opponent'; idx: number } | { side: 'sample' | 'opponentQuick'; idx: 0 } | null
type MoveFieldTarget = { key: string; slotIdx: number; scope: 'party' | 'sample' } | null
type ItemFieldTarget = { scope: 'party'; idx: number } | { scope: 'sample'; idx: 0 } | { scope: 'opponent'; idx: number } | null
type MetaListField = { scope: 'party'; idx: number; field: 'ability' | 'nature' } | { scope: 'sample'; field: 'ability' | 'nature' } | null
type SiteLanguage = 'ko' | 'en' | 'ja'
type MoveOption = { name: string; type: string | null }
type MovePoolState = { status: 'idle' | 'loading' | 'ready' | 'error'; moves: MoveOption[] }
type DamageMoveSelection = { key: string; move: string }
type ViewState = {
  mainSection?: MainSection
  activeTab?: MainTab
  selectedMy?: number
  selectedOpp?: number
}

const UI_TRANSLATIONS: Record<'en' | 'ja', Record<string, string>> = {
  en: {
    '공격': 'Attack', '방어': 'Defense', '특공': 'Sp. Atk', '특방': 'Sp. Def', '스피드': 'Speed', '특수공격': 'Sp. Atk', '특수방어': 'Sp. Def',
    '내 파티 관리': 'My Party', '상대 엔트리': 'Opponent Entry', '스피드 계산': 'Speed Calc', '결정력 계산': 'Damage Calc',
    '싱글배틀 메뉴': 'Singles Menu', '포켓몬 샘플 깎기': 'Sample Builder', '포켓몬 하나 집중 조정': 'Tune one Pokémon',
    '파티 저장, 스피드 비교, 상대 도구 기록, 간단 데미지 계산, 단일 샘플 깎기까지.': 'Party save, speed checks, opponent item notes, quick damage calc, and single sample building.',
    '상태 내보내기': 'Export State', '상태 불러오기': 'Import State', '전체 초기화': 'Reset All', '노력치 보정': 'Effort Adjustment', '닫기': 'Close', '성격': 'Nature',
    '최소': 'Min', '최대': 'Max', '무보정': 'Neutral', '목표': 'Target', '11배수 달성': '11x reached',
    '기존 파티 관리/상대 엔트리/계산기를 한 메뉴로 묶었습니다.': 'Party management, opponent entry, and calculators are grouped into one menu.',
    '포켓몬 하나만 잡고 성격/능력 포인트/샘플 기술을 빠르게 깎는 전용 화면입니다.': 'A dedicated screen for tuning one Pokémon fast with nature, stat points, and sample moves.',
    '파티 한눈 요약': 'Party Overview', '내 파티': 'My Party', '상대 파티': 'Opponent Party',
    '포켓몬별 기술배치 / 노력치보정': 'Per-Pokémon move setup / effort tuning', '내 파티 초기화': 'Reset My Party', '포켓몬을 검색해서 추가하세요.': 'Search a Pokémon to add it.',
    '특성': 'Ability', '미선택': 'Unselected', '특성 검색': 'Search ability', '도구': 'Item', '메가스톤 고정': 'Mega Stone locked', '사용 가능 도구 선택': 'Choose allowed item',
    '종 선택': 'Species', '포켓몬 검색': 'Search Pokémon', '기술 배치': 'Move Set', '기술풀 불러오는 중…': 'Loading move pool…', '사용 가능 기술 검색': 'Search legal moves', '기술 입력': 'Enter move',
    '시드': 'Seeded', '검증중': 'Verifying',
    '기술 데이터가 없는 포켓몬만 직접 입력합니다.': 'Only Pokémon without move data need manual input.',
    '상대 엔트리 초기화': 'Reset Opponent Entry', '검색창 하나에서 `검색 → 엔터` 반복으로 순서대로 채웁니다.': 'Fill slots in order by repeating `search → Enter` in one box.',
    '상대 엔트리 빠른 입력': 'Quick Opponent Entry', '현재 입력 슬롯': 'Current Slot', '추정 체크됨': 'Picked', '미체크': 'Unchecked', '도구 없음': 'No item', '포켓몬 미입력': 'No Pokémon', '특성 미기입': 'No ability', '도구 미기입': 'No item', '선출 추정': 'Picked guess', '상세 패널에서 공개 정보를 바로 갱신합니다.': 'Update revealed info directly in the detail panel.',
    '공개 기술': 'Revealed moves', '메모': 'Notes', '최속 가정': 'Max Speed', '스카프': 'Scarf', '랭크': 'Stage', '선출 추정 해제': 'Unmark picked', '선출 추정 체크': 'Mark picked',
    '상대 엔트리 메모': 'Opponent Notes', '단일 샘플 빌더': 'Single Sample Builder', '포켓몬 선택': 'Choose Pokémon', '도구 미선택': 'No item selected', '실수치 스피드': 'Actual Speed',
    '샘플 기술': 'Sample Moves', '코어 1번 체크': 'Check Core #1', '샘플 이름': 'Sample Name', '현재 샘플 저장': 'Save Current Sample', '파티 슬롯에 적용': 'Apply to Party Slot', '확정': 'Confirmed', '확정 기술': 'Locked Moves', '코어': 'Core', '선택': 'Options', '유틸': 'Utility', '코어 라인': 'Core Line', '세부 편집': 'Detail Edit', '샘플 메모': 'Sample Notes', '전체': 'All', '미확정': 'Open', '확정만': 'Locked only', '아직 없음': 'None yet', '매직넘버': 'Magic number', '최대치': 'Max value', '미지정': 'Unset', '저장한 샘플': 'Saved Samples', '불러오기': 'Load', '삭제': 'Delete', '슬롯 비우기': 'Clear slot', '아직 저장한 샘플이 없습니다.': 'No saved samples yet.',
    '엔트리': 'Entry', '초기화 후 슬롯별 검색창에 한 마리씩 빠르게 채우는 흐름으로 정리했습니다.': 'Designed for fast one-by-one slot entry after reset.',
    '간단 데미지 계산': 'Quick Damage Calc', '상대 엔트리에서 고른 포켓몬의 도구/특성/공개 기술 메모와 같은 슬롯을 계산기가 그대로 따라갑니다.': 'The calculator mirrors the same slot and revealed info from opponent entry.', '내 기술': 'My Move', '등록 기술 없음': 'No registered moves', '수동 위력': 'Manual Power', '수동 분류': 'Manual Category', '자동 타입': 'Auto Type',
    '내 파티 추월컷': 'My Team Speed Cutoffs', '상대 기준': 'Opponent Target', '기준 속도': 'Target Speed', '추월컷': 'Pass', '동속컷': 'Tie', '이미 추월': 'Already ahead', '불가': 'No line', '실전 상태': 'Battle State', '내가 앞섬': 'Ahead', '상대가 앞섬': 'Behind', '동속': 'Tie', '일반': 'Base', '메가': 'Mega', '내 포켓몬': 'My Pokémon', '상대 포켓몬': 'Opponent Pokémon', '기준선': 'Baseline',
    '준속': 'Neutral', '최속': 'Fast', '준속 스카프': 'Neutral Scarf', '최속 스카프': 'Fast Scarf', '선택한 상대 없음': 'No opponent selected',
    '위력': 'Power', '공격분류': 'Category', '물리': 'Physical', '특수': 'Special', '없음': 'None', '상성': 'Effectiveness', '확정 1타 가능성 있음': 'Possible OHKO', '유리한 2타권': 'Favorable 2HKO', '즉시 마무리 어려움': 'Hard to finish immediately', '상대 엔트리에서 계산 대상 포켓몬을 먼저 채워 주세요.': 'Fill an opponent target first.',
    '빈 슬롯': 'Empty Slot', '현재': 'Current', '추가 가능': 'Available', '파티 관리': 'Party',
    '노력': 'Hardy', '외로움': 'Lonely', '용감': 'Brave', '고집': 'Adamant', '개구쟁이': 'Naughty', '대담': 'Bold', '온순': 'Docile', '무사태평': 'Relaxed', '장난꾸러기': 'Impish', '촐랑': 'Lax', '겁쟁이': 'Timid', '성급': 'Hasty', '성실': 'Serious', '명랑': 'Jolly', '천진난만': 'Naive', '조심': 'Modest', '의젓': 'Mild', '냉정': 'Quiet', '수줍음': 'Bashful', '덜렁': 'Rash', '차분': 'Calm', '얌전': 'Gentle', '건방': 'Sassy', '신중': 'Careful', '변덕': 'Quirky',
    '기합의띠': 'Focus Sash', '구애스카프': 'Choice Scarf', '구애안경': 'Choice Specs', '구애머리띠': 'Choice Band', '생명의구슬': 'Life Orb', '먹다남은음식': 'Leftovers', '돌격조끼': 'Assault Vest', '약점보험': 'Weakness Policy', '자뭉열매': 'Figy Berry', '오카열매': 'Occa Berry', '유루열매': 'Yache Berry', '리샘열매': 'Roseli Berry', '반짝가루': 'Bright Powder', '고스트메모리': 'Ghost Memory', '금속코트': 'Metal Coat', '검은진흙': 'Black Sludge', '부스트에너지': 'Booster Energy', '클리어참': 'Clear Amulet', '풍선': 'Air Balloon', '빛의점토': 'Light Clay',
  },
  ja: {
    '공격': '攻撃', '방어': '防御', '특공': '特攻', '특방': '特防', '스피드': '素早さ', '특수공격': '特攻', '특수방어': '特防',
    '내 파티 관리': '自分のパーティ', '상대 엔트리': '相手エントリー', '스피드 계산': '素早さ計算', '결정력 계산': '火力計算',
    '싱글배틀 메뉴': 'シングルバトルメニュー', '포켓몬 샘플 깎기': 'ポケモンサンプル調整', '포켓몬 하나 집중 조정': '1匹を集中調整',
    '파티 저장, 스피드 비교, 상대 도구 기록, 간단 데미지 계산, 단일 샘플 깎기까지.': 'パーティ保存、素早さ比較、相手持ち物記録、簡易ダメ計、単体サンプル調整まで対応。',
    '상태 내보내기': '状態を書き出し', '상태 불러오기': '状態を読み込み', '전체 초기화': '全体リセット', '노력치 보정': '努力値補正', '닫기': '閉じる', '성격': '性格',
    '최소': '最小', '최대': '最大', '무보정': '補正なし', '목표': '目標', '11배수 달성': '11倍数達成',
    '기존 파티 관리/상대 엔트리/계산기를 한 메뉴로 묶었습니다.': 'パーティ管理・相手エントリー・計算機を1つのメニューにまとめました。',
    '포켓몬 하나만 잡고 성격/능력 포인트/샘플 기술을 빠르게 깎는 전용 화면입니다.': '1匹だけを対象に、性格・能力ポイント・サンプル技を素早く調整する専用画面です。',
    '파티 한눈 요약': 'パーティ一覧', '내 파티': '自分のパーティ', '상대 파티': '相手パーティ',
    '포켓몬별 기술배치 / 노력치보정': 'ポケモンごとの技構成 / 努力値調整', '내 파티 초기화': '自分のパーティを初期化', '포켓몬을 검색해서 추가하세요.': 'ポケモンを検索して追加してください。',
    '특성': '特性', '미선택': '未選択', '특성 검색': '特性検索', '도구': '持ち物', '메가스톤 고정': 'メガストーン固定', '사용 가능 도구 선택': '使用可能な持ち物を選択',
    '종 선택': 'ポケモン', '포켓몬 검색': 'ポケモン検索', '기술 배치': '技構成', '기술풀 불러오는 중…': '技プール読み込み中…', '사용 가능 기술 검색': '使用可能な技を検索', '기술 입력': '技入力',
    '시드': 'シード', '검증중': '検証中',
    '기술 데이터가 없는 포켓몬만 직접 입력합니다.': '技データのないポケモンだけ手入力します。',
    '상대 엔트리 초기화': '相手エントリー初期化', '검색창 하나에서 `검색 → 엔터` 반복으로 순서대로 채웁니다.': '1つの検索欄で `検索 → Enter` を繰り返して順番に埋めます。',
    '상대 엔트리 빠른 입력': '相手エントリー高速入力', '현재 입력 슬롯': '現在の入力スロット', '추정 체크됨': '選出想定', '미체크': '未チェック', '도구 없음': '持ち物なし', '포켓몬 미입력': 'ポケモン未入力', '특성 미기입': '特性未入力', '도구 미기입': '持ち物未入力', '선출 추정': '選出想定', '상세 패널에서 공개 정보를 바로 갱신합니다.': '詳細パネルで公開情報をすぐ更新できます。',
    '공개 기술': '公開技', '메모': 'メモ', '최속 가정': '最速想定', '스카프': 'スカーフ', '랭크': 'ランク', '선출 추정 해제': '選出想定を解除', '선출 추정 체크': '選出想定をチェック',
    '상대 엔트리 메모': '相手エントリーメモ', '단일 샘플 빌더': '単体サンプルビルダー', '포켓몬 선택': 'ポケモン選択', '도구 미선택': '持ち物未選択', '실수치 스피드': '実数値素早さ',
    '샘플 기술': 'サンプル技', '코어 1번 체크': 'コア1をチェック', '샘플 이름': 'サンプル名', '현재 샘플 저장': '現在のサンプルを保存', '파티 슬롯에 적용': 'パーティスロットに適用', '확정': '確定', '확정 기술': '確定技', '코어': 'コア', '선택': '候補', '유틸': '補助', '코어 라인': 'コアライン', '세부 편집': '詳細編集', '샘플 메모': 'サンプルメモ', '전체': '全部', '미확정': '未確定', '확정만': '確定のみ', '아직 없음': 'まだなし', '매직넘버': 'マジックナンバー', '최대치': '最大値', '미지정': '未指定', '저장한 샘플': '保存したサンプル', '불러오기': '読み込み', '삭제': '削除', '슬롯 비우기': 'スロットを空にする', '아직 저장한 샘플이 없습니다.': '保存したサンプルがまだありません。',
    '엔트리': 'エントリー', '초기화 후 슬롯별 검색창에 한 마리씩 빠르게 채우는 흐름으로 정리했습니다.': '初期化後、スロットごとの検索で1匹ずつ素早く埋める流れに整理しました。',
    '간단 데미지 계산': '簡易ダメージ計算', '상대 엔트리에서 고른 포켓몬의 도구/특성/공개 기술 메모와 같은 슬롯을 계산기가 그대로 따라갑니다.': '相手エントリーで選んだポケモンの持ち物・特性・公開技メモと同じスロットを計算機がそのまま追従します。', '내 기술': '自分の技', '등록 기술 없음': '登録技なし', '수동 위력': '手動威力', '수동 분류': '手動分類', '자동 타입': '自動タイプ',
    '내 파티 추월컷': '自分の抜きライン', '상대 기준': '相手基準', '기준 속도': '基準素早さ', '추월컷': '抜き', '동속컷': '同速', '이미 추월': 'すでに上', '불가': '不可', '실전 상태': '対面状態', '내가 앞섬': '上', '상대가 앞섬': '下', '동속': '同速', '일반': '通常', '메가': 'メガ', '내 포켓몬': '自分のポケモン', '상대 포켓몬': '相手ポケモン', '기준선': '基準線',
    '준속': '準速', '최속': '最速', '준속 스카프': '準速スカーフ', '최속 스카프': '最速スカーフ', '선택한 상대 없음': '相手未選択',
    '위력': '威力', '공격분류': '攻撃分類', '물리': '物理', '특수': '特殊', '없음': 'なし', '상성': '相性', '확정 1타 가능성 있음': '一撃圏の可能性あり', '유리한 2타권': '有利な2発圏内', '즉시 마무리 어려움': '即処理は難しい', '상대 엔트리에서 계산 대상 포켓몬을 먼저 채워 주세요.': '先に相手エントリーへ計算対象のポケモンを入れてください。',
    '빈 슬롯': '空きスロット', '현재': '現在', '추가 가능': '追加可能',
    '노력': 'がんばりや', '외로움': 'さみしがり', '용감': 'ゆうかん', '고집': 'いじっぱり', '개구쟁이': 'やんちゃ', '대담': 'ずぶとい', '온순': 'すなお', '무사태평': 'のんき', '장난꾸러기': 'わんぱく', '촐랑': 'のうてんき', '겁쟁이': 'おくびょう', '성급': 'せっかち', '성실': 'まじめ', '명랑': 'ようき', '천진난만': 'むじゃき', '조심': 'ひかえめ', '의젓': 'おっとり', '냉정': 'れいせい', '수줍음': 'てれや', '덜렁': 'うっかりや', '차분': 'おだやか', '얌전': 'おとなしい', '건방': 'なまいき', '신중': 'しんちょう', '변덕': 'きまぐれ',
    '기합의띠': 'きあいのタスキ', '구애스카프': 'こだわりスカーフ', '구애안경': 'こだわりメガネ', '구애머리띠': 'こだわりハチマキ', '생명의구슬': 'いのちのたま', '먹다남은음식': 'たべのこし', '돌격조끼': 'とつげきチョッキ', '약점보험': 'じゃくてんほけん', '자뭉열매': 'フィラのみ', '오카열매': 'オッカのみ', '유루열매': 'ヤチェのみ', '리샘열매': 'ロゼルのみ', '반짝가루': 'ひかりのこな', '고스트메모리': 'ゴーストメモリ', '금속코트': 'メタルコート', '검은진흙': 'くろいヘドロ', '부스트에너지': 'ブーストエナジー', '클리어참': 'クリアチャーム', '풍선': 'ふうせん', '빛의점토': 'ひかりのねんど',
  },
}

function translateText(language: SiteLanguage, text: string) {
  if (language === 'ko') return text
  return UI_TRANSLATIONS[language][text] ?? text
}

function titleCaseSlug(value: string) {
  return value.split('-').map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1)).join(' ')
}

function emptySlotLabel(index: number, language: SiteLanguage) {
  return `${translateText(language, '빈 슬롯')} ${index + 1}`
}

const STORAGE_KEY = 'pokemon-champions-assistant-demo:v1'
const SPEED_STAGE_OPTIONS = [-2, -1, 0, 1, 2] as const
const MAX_OPPONENTS = 6
const CHAMPIONS_EFFORT_CAP = 66
const CHAMPIONS_EFFORT_PER_STAT_CAP = 32
const EFFORT_CHECKPOINTS = [11, 22, 32] as const
const STAT_GAUGE_MAX = 255
const ITEM_OPTIONS = ['기합의띠', '구애스카프', '구애안경', '구애머리띠', '생명의구슬', '먹다남은음식', '돌격조끼', '약점보험', '자뭉열매', '오카열매', '유루열매', '리샘열매', '반짝가루', '고스트메모리', '금속코트', '검은진흙', '부스트에너지', '클리어참', '풍선', '빛의점토'] as const
const ITEM_ALIASES: Partial<Record<typeof ITEM_OPTIONS[number], string[]>> = {
  '기합의띠': ['기띠', '띠'],
  '구애스카프': ['스카프'],
  '구애안경': ['안경'],
  '구애머리띠': ['머리띠'],
  '생명의구슬': ['생구'],
  '먹다남은음식': ['먹밥', '남은음식'],
  '돌격조끼': ['조끼'],
  '약점보험': ['약보'],
  '부스트에너지': ['부에'],
  '클리어참': ['클참'],
  '빛의점토': ['빛점토'],
}
const ITEM_SPRITE_MAP: Record<string, string> = {
  '기합의띠': 'focus-sash',
  '구애스카프': 'choice-scarf',
  '구애안경': 'choice-specs',
  '구애머리띠': 'choice-band',
  '생명의구슬': 'life-orb',
  '먹다남은음식': 'leftovers',
  '돌격조끼': 'assault-vest',
  '약점보험': 'weakness-policy',
  '자뭉열매': 'figy-berry',
  '오카열매': 'occa-berry',
  '유루열매': 'yache-berry',
  '리샘열매': 'roseli-berry',
  '반짝가루': 'bright-powder',
  '고스트메모리': 'ghost-memory',
  '금속코트': 'metal-coat',
  '검은진흙': 'black-sludge',
  '부스트에너지': 'booster-energy',
  '클리어참': 'clear-amulet',
  '풍선': 'air-balloon',
  '빛의점토': 'light-clay',
}
const MEGA_STONE_SPRITE_BY_KEY: Partial<Record<string, string>> = {
  'mega-abomasnow': 'abomasite',
  'mega-absol': 'absolite',
  'mega-aerodactyl': 'aerodactylite',
  'mega-aggron': 'aggronite',
  'mega-alakazam': 'alakazite',
  'mega-altaria': 'altarianite',
  'mega-ampharos': 'ampharosite',
  'mega-audino': 'audinite',
  'mega-banette': 'banettite',
  'mega-beedrill': 'beedrillite',
  'mega-blastoise': 'blastoisinite',
  'mega-camerupt': 'cameruptite',
  'mega-charizard-x': 'charizardite-x',
  'mega-charizard-y': 'charizardite-y',
  'mega-gallade': 'galladite',
  'mega-garchomp': 'garchompite',
  'mega-gardevoir': 'gardevoirite',
  'mega-gengar': 'gengarite',
  'mega-glalie': 'glalitite',
  'mega-gyarados': 'gyaradosite',
  'mega-heracross': 'heracronite',
  'mega-houndoom': 'houndoominite',
  'mega-kangaskhan': 'kangaskhanite',
  'mega-lopunny': 'lopunnite',
  'mega-lucario': 'lucarionite',
  'mega-manectric': 'manectite',
  'mega-medicham': 'medichamite',
  'mega-pidgeot': 'pidgeotite',
  'mega-pinsir': 'pinsirite',
  'mega-sableye': 'sablenite',
  'mega-scizor': 'scizorite',
  'mega-sharpedo': 'sharpedonite',
  'mega-slowbro': 'slowbronite',
  'mega-steelix': 'steelixite',
  'mega-tyranitar': 'tyranitarite',
  'mega-venusaur': 'venusaurite',
}

const TYPE_KO_BY_KEY: Record<string, string> = {
  normal: '노말', fire: '불꽃', water: '물', electric: '전기', grass: '풀', ice: '얼음',
  fighting: '격투', poison: '독', ground: '땅', flying: '비행', psychic: '에스퍼', bug: '벌레',
  rock: '바위', ghost: '고스트', dragon: '드래곤', dark: '악', steel: '강철', fairy: '페어리',
}

function speedTemplate(base: number, boosted: boolean, scarf: boolean) {
  let value = actualStat(base, CHAMPIONS_EFFORT_PER_STAT_CAP, boosted ? 1.1 : 1)
  if (scarf) value = Math.floor(value * 1.5)
  return value
}

function makeFormRow(base: Row, form: {
  id: number
  key: string
  name_ko: string
  name_en: string
  name_ja: string
  types: string[]
  hp: number
  attack: number
  defense: number
  spAttack: number
  spDefense: number
  speed: number
  spriteId: number
}) {
  return {
    ...base,
    id: form.id,
    key: form.key,
    name_ko: form.name_ko,
    name_en: form.name_en,
    name_ja: form.name_ja,
    types: form.types,
    types_ko: form.types.map((type) => TYPE_KO_BY_KEY[type] ?? type),
    hp: form.hp,
    attack: form.attack,
    defense: form.defense,
    spAttack: form.spAttack,
    spDefense: form.spDefense,
    speed: form.speed,
    fast: speedTemplate(form.speed, true, false),
    neutral: speedTemplate(form.speed, false, false),
    uninvested: actualStat(form.speed, 0, 1),
    scarf_fast: speedTemplate(form.speed, true, true),
    scarf_neutral: speedTemplate(form.speed, false, true),
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${form.spriteId}.png`,
  } satisfies Row
}

const baseRows = ((championsData.rows as Row[]) ?? []).filter((row): row is Row => typeof row?.key === 'string' && !!row.key)
const baseIndexByKey = new Map(baseRows.map((row) => [row.key, row]))
const extraFormRows: Row[] = [
  makeFormRow(baseIndexByKey.get('rotom')!, { id: 10008, key: 'rotom-heat', name_ko: '히트로토무', name_en: 'Rotom Heat', name_ja: 'ヒートロトム', types: ['electric', 'fire'], hp: 50, attack: 65, defense: 107, spAttack: 105, spDefense: 107, speed: 86, spriteId: 10008 }),
  makeFormRow(baseIndexByKey.get('rotom')!, { id: 10009, key: 'rotom-wash', name_ko: '워시로토무', name_en: 'Rotom Wash', name_ja: 'ウォッシュロトム', types: ['electric', 'water'], hp: 50, attack: 65, defense: 107, spAttack: 105, spDefense: 107, speed: 86, spriteId: 10009 }),
  makeFormRow(baseIndexByKey.get('rotom')!, { id: 10010, key: 'rotom-frost', name_ko: '프로스트로토무', name_en: 'Rotom Frost', name_ja: 'フロストロトム', types: ['electric', 'ice'], hp: 50, attack: 65, defense: 107, spAttack: 105, spDefense: 107, speed: 86, spriteId: 10010 }),
  makeFormRow(baseIndexByKey.get('rotom')!, { id: 10011, key: 'rotom-fan', name_ko: '스핀로토무', name_en: 'Rotom Fan', name_ja: 'スピンロトム', types: ['electric', 'flying'], hp: 50, attack: 65, defense: 107, spAttack: 105, spDefense: 107, speed: 86, spriteId: 10011 }),
  makeFormRow(baseIndexByKey.get('rotom')!, { id: 10012, key: 'rotom-mow', name_ko: '커트로토무', name_en: 'Rotom Mow', name_ja: 'カットロトム', types: ['electric', 'grass'], hp: 50, attack: 65, defense: 107, spAttack: 105, spDefense: 107, speed: 86, spriteId: 10012 }),
  makeFormRow(baseIndexByKey.get('gourgeist')!, { id: 10030, key: 'gourgeist-small', name_ko: '소형 호바귀', name_en: 'Gourgeist Small', name_ja: 'パンプジン(スモール)', types: ['ghost', 'grass'], hp: 55, attack: 85, defense: 122, spAttack: 58, spDefense: 75, speed: 99, spriteId: 10030 }),
  makeFormRow(baseIndexByKey.get('gourgeist')!, { id: 711, key: 'gourgeist-average', name_ko: '보통 호바귀', name_en: 'Gourgeist Average', name_ja: 'パンプジン', types: ['ghost', 'grass'], hp: 65, attack: 90, defense: 122, spAttack: 58, spDefense: 75, speed: 84, spriteId: 711 }),
  makeFormRow(baseIndexByKey.get('gourgeist')!, { id: 10031, key: 'gourgeist-large', name_ko: '대형 호바귀', name_en: 'Gourgeist Large', name_ja: 'パンプジン(ラージ)', types: ['ghost', 'grass'], hp: 75, attack: 95, defense: 122, spAttack: 58, spDefense: 75, speed: 69, spriteId: 10031 }),
  makeFormRow(baseIndexByKey.get('gourgeist')!, { id: 10032, key: 'gourgeist-super', name_ko: '특대형 호바귀', name_en: 'Gourgeist Super', name_ja: 'パンプジン(スーパー)', types: ['ghost', 'grass'], hp: 85, attack: 100, defense: 122, spAttack: 58, spDefense: 75, speed: 54, spriteId: 10032 }),
]

const rows = [...baseRows, ...extraFormRows]
const indexByKey = new Map(rows.map((row) => [row.key, row]))
const speciesOptions = rows.map((row) => ({
  key: row.key,
  label: `${row.name_ko} (${row.name_en})`,
}))
const starterKeys = ['mega-lopunny', 'mega-delphox', 'garchomp', 'toxapex', 'corviknight', 'kingambit']

function megaStoneForKey(key: string) {
  if (!key.startsWith('mega-')) return null
  const row = indexByKey.get(key)
  if (!row) return null
  const koName = row.name_ko.replace(/^메가/, '').trim()
  const suffixMatch = koName.match(/\s*([XY])$/i)
  if (suffixMatch) {
    const suffix = suffixMatch[1].toUpperCase()
    const baseName = koName.replace(/\s*[XY]$/i, '').trim()
    return `${baseName}나이트${suffix}`
  }
  return `${koName}나이트`
}

function normalizeItemForKey(key: string, item: string) {
  return megaStoneForKey(key) ?? item
}

function isAllowedChampionsItem(key: string, item: string) {
  const normalized = normalizeItemForKey(key, item).trim()
  if (!normalized) return true
  return normalized === megaStoneForKey(key) || ITEM_OPTIONS.includes(normalized as typeof ITEM_OPTIONS[number])
}

function visibleChampionsItem(key: string, item: string) {
  const normalized = normalizeItemForKey(key, item).trim()
  return isAllowedChampionsItem(key, normalized) ? normalized : ''
}

function itemSpriteSrc(key: string, item: string) {
  const normalized = normalizeItemForKey(key, item).trim()
  const megaSlug = MEGA_STONE_SPRITE_BY_KEY[key]
  if (megaSlug) return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${megaSlug}.png`
  const spriteSlug = ITEM_SPRITE_MAP[normalized]
  if (spriteSlug) return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${spriteSlug}.png`
  if (megaStoneForKey(key)) return `${import.meta.env.BASE_URL}item-generic.svg`
  return `${import.meta.env.BASE_URL}item-generic.svg`
}

const defaultPartyTuning = (): PartyTuning => ({ magicNumber: 0, maxValue: 0 })
const blankPartyMember = (): PartyMember => ({ key: '', config: { nature: 'jolly', scarf: false, speedStage: 0 }, picked: false, evs: { ...defaultEvs }, tuning: defaultPartyTuning(), item: '', ability: '' })
const defaultParty: PartyMember[] = starterKeys.map((key) => ({ key, config: { nature: 'jolly', scarf: false, speedStage: 0 }, picked: false, evs: { ...defaultEvs }, tuning: defaultPartyTuning(), item: normalizeItemForKey(key, ''), ability: defaultAbilityForKey(key) }))
const emptyParty: PartyMember[] = Array.from({ length: defaultParty.length }, () => blankPartyMember())
const defaultSampleForge = (): PartyMember => ({ key: starterKeys[0], config: { nature: 'jolly', scarf: false, speedStage: 0 }, picked: false, evs: { ...defaultEvs }, tuning: defaultPartyTuning(), item: normalizeItemForKey(starterKeys[0], ''), ability: defaultAbilityForKey(starterKeys[0]) })
const blankOpponent = (): OpponentState => ({
  key: '',
  item: '',
  ability: '',
  notes: '',
  revealedMoves: [],
  natureBoost: true,
  scarf: false,
  speedStage: 0,
  picked: false,
})
const defaultOpponentKeys = ['rotom', 'garchomp', 'primarina', 'dragapult', 'mimikyu', 'meowscarada'].filter((key) => indexByKey.has(key))
const defaultOpponents: OpponentState[] = defaultOpponentKeys.map((key) => ({
  key,
  item: '',
  ability: '',
  notes: '',
  revealedMoves: [],
  natureBoost: true,
  scarf: false,
  speedStage: 0,
  picked: false,
}))
const emptyOpponents = Array.from({ length: MAX_OPPONENTS }, () => blankOpponent())

const movePowerPresets = [
  { label: '40 선공기', value: 40 },
  { label: '55 약한 견제기', value: 55 },
  { label: '75 기본기', value: 75 },
  { label: '90 주력기', value: 90 },
  { label: '100 고위력', value: 100 },
  { label: '120 대기술', value: 120 },
  { label: '130 초고위력', value: 130 },
]

const EFFORT_STAT_OPTIONS: { key: EffortStatKey; short: string; label: string }[] = [
  { key: 'hp', short: 'HP', label: 'HP' },
  { key: 'attack', short: 'Atk', label: '공격' },
  { key: 'defense', short: 'Def', label: '방어' },
  { key: 'spAttack', short: 'SpA', label: '특수공격' },
  { key: 'spDefense', short: 'SpD', label: '특수방어' },
  { key: 'speed', short: 'Spe', label: '스피드' },
]

const typeChart: Record<string, Partial<Record<string, number>>> = {
  Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5, Ice: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying: { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Fairy: { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 },
}

function clampSpeedStage(value: unknown) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 0
  return Math.max(-2, Math.min(2, Math.trunc(num)))
}

const NATURES: { id: NatureId; label: string; up?: StatKey; down?: StatKey }[] = [
  { id: 'hardy', label: '노력', },
  { id: 'lonely', label: '외로움', up: 'attack', down: 'defense' },
  { id: 'brave', label: '용감', up: 'attack', down: 'speed' },
  { id: 'adamant', label: '고집', up: 'attack', down: 'spAttack' },
  { id: 'naughty', label: '개구쟁이', up: 'attack', down: 'spDefense' },
  { id: 'bold', label: '대담', up: 'defense', down: 'attack' },
  { id: 'docile', label: '온순', },
  { id: 'relaxed', label: '무사태평', up: 'defense', down: 'speed' },
  { id: 'impish', label: '장난꾸러기', up: 'defense', down: 'spAttack' },
  { id: 'lax', label: '촐랑', up: 'defense', down: 'spDefense' },
  { id: 'timid', label: '겁쟁이', up: 'speed', down: 'attack' },
  { id: 'hasty', label: '성급', up: 'speed', down: 'defense' },
  { id: 'serious', label: '성실', },
  { id: 'jolly', label: '명랑', up: 'speed', down: 'spAttack' },
  { id: 'naive', label: '천진난만', up: 'speed', down: 'spDefense' },
  { id: 'modest', label: '조심', up: 'spAttack', down: 'attack' },
  { id: 'mild', label: '의젓', up: 'spAttack', down: 'defense' },
  { id: 'quiet', label: '냉정', up: 'spAttack', down: 'speed' },
  { id: 'bashful', label: '수줍음', },
  { id: 'rash', label: '덜렁', up: 'spAttack', down: 'spDefense' },
  { id: 'calm', label: '차분', up: 'spDefense', down: 'attack' },
  { id: 'gentle', label: '얌전', up: 'spDefense', down: 'defense' },
  { id: 'sassy', label: '건방', up: 'spDefense', down: 'speed' },
  { id: 'careful', label: '신중', up: 'spDefense', down: 'spAttack' },
  { id: 'quirky', label: '변덕', },
]

const natureById = new Map(NATURES.map((nature) => [nature.id, nature]))

function legacyNatureFromBoostStat(stat?: unknown): NatureId {
  switch (stat) {
    case 'attack': return 'adamant'
    case 'defense': return 'impish'
    case 'spAttack': return 'modest'
    case 'spDefense': return 'careful'
    case 'speed': return 'jolly'
    default: return 'hardy'
  }
}

function natureMultiplier(natureId: NatureId, stat: StatKey) {
  const nature = natureById.get(natureId)
  if (!nature) return 1
  if (nature.up === stat) return 1.1
  if (nature.down === stat) return 0.9
  return 1
}

function statLabel(stat: StatKey, language: SiteLanguage = 'ko') {
  switch (stat) {
    case 'attack': return translateText(language, '공격')
    case 'defense': return translateText(language, '방어')
    case 'spAttack': return translateText(language, '특공')
    case 'spDefense': return translateText(language, '특방')
    case 'speed': return translateText(language, '스피드')
  }
}

function statThemeClass(stat: EffortStatKey) {
  switch (stat) {
    case 'hp': return 'stat-theme-hp'
    case 'attack': return 'stat-theme-attack'
    case 'defense': return 'stat-theme-defense'
    case 'spAttack': return 'stat-theme-sp-attack'
    case 'spDefense': return 'stat-theme-sp-defense'
    case 'speed': return 'stat-theme-speed'
  }
}

function statGaugePercent(value: number) {
  return `${Math.max(0, Math.min(100, (value / STAT_GAUGE_MAX) * 100))}%`
}

function moveTypeThemeClass(type: string | null | undefined) {
  switch (type) {
    case 'normal': return 'move-type-normal'
    case 'fire': return 'move-type-fire'
    case 'water': return 'move-type-water'
    case 'electric': return 'move-type-electric'
    case 'grass': return 'move-type-grass'
    case 'ice': return 'move-type-ice'
    case 'fighting': return 'move-type-fighting'
    case 'poison': return 'move-type-poison'
    case 'ground': return 'move-type-ground'
    case 'flying': return 'move-type-flying'
    case 'psychic': return 'move-type-psychic'
    case 'bug': return 'move-type-bug'
    case 'rock': return 'move-type-rock'
    case 'ghost': return 'move-type-ghost'
    case 'dragon': return 'move-type-dragon'
    case 'dark': return 'move-type-dark'
    case 'steel': return 'move-type-steel'
    case 'fairy': return 'move-type-fairy'
    default: return 'move-type-unknown'
  }
}

function moveOptionsForEntry(entry?: typeof sampleMoves[number] | null) {
  if (!entry) return [] as MoveOption[]
  return Array.from(new Set([...(entry.core ?? []), ...(entry.options ?? []), ...(entry.utility ?? [])])).map((name) => ({ name, type: null }))
}

const MOVE_NAME_ALIASES: Record<string, string> = {
  '회복': 'HP회복',
}

function moveNameCandidates(name: string) {
  const base = name.trim()
  const alias = MOVE_NAME_ALIASES[base]
  return Array.from(new Set([base, alias].filter(Boolean).flatMap((entry) => [entry as string, normalizeSearchText(entry as string)])))
}

function findMatchingMoveOption(name: string, options: MoveOption[]) {
  if (!name || !options.length) return null
  const candidates = moveNameCandidates(name)
  return options.find((option) => candidates.includes(option.name) || candidates.includes(normalizeSearchText(option.name))) ?? null
}

function resolveMoveType(name: string, preferredOptions: MoveOption[], movePools: Record<string, MovePoolState>) {
  const direct = findMatchingMoveOption(name, preferredOptions)
  if (direct?.type) return direct.type
  for (const pool of Object.values(movePools)) {
    const matched = findMatchingMoveOption(name, pool.moves)
    if (matched?.type) return matched.type
  }
  return null
}

const moveMetaCache = new Map<string, Promise<MoveOption>>()
let embeddedMovePoolsPromise: Promise<Record<string, MoveOption[]>> | null = null

function normalizeMoveSlots(moves: string[]) {
  const normalized = moves.slice(0, 4).map((entry) => entry.trim())
  while (normalized.length && !normalized[normalized.length - 1]) normalized.pop()
  return normalized
}

function pokemonApiCandidates(key: string) {
  const candidates = [key]
  if (key.startsWith('mega-')) {
    const base = key.slice(5)
    candidates.push(`${base}-mega`, base)
  }
  const regionalPrefixes: Record<string, string> = {
    alolan: 'alola',
    galarian: 'galar',
    hisuian: 'hisui',
    paldean: 'paldea',
  }
  const [first, ...rest] = key.split('-')
  if (regionalPrefixes[first] && rest.length) {
    const base = rest.join('-')
    candidates.push(`${base}-${regionalPrefixes[first]}`, base)
  }
  return Array.from(new Set(candidates))
}

function relatedMovePoolKeys(key: string) {
  const keys = [key]
  if (key.startsWith('mega-')) keys.push(key.slice(5))
  const [first, ...rest] = key.split('-')
  if (['alolan', 'galarian', 'hisuian', 'paldean'].includes(first) && rest.length) keys.push(rest.join('-'))
  return Array.from(new Set(keys))
}

function megaBaseKey(key: string) {
  if (!key.startsWith('mega-')) return key
  const raw = key.slice(5)
  if (raw.endsWith('-x') || raw.endsWith('-y')) return raw.slice(0, -2)
  return raw
}

function megaCandidateKeysForBase(baseKey: string) {
  return rows
    .filter((row) => row.key.startsWith('mega-') && megaBaseKey(row.key) === baseKey)
    .map((row) => row.key)
    .sort((a, b) => a.localeCompare(b, 'en'))
}

function resolveCalcKeyWithMega(key: string, megaOn: boolean) {
  const baseKey = megaBaseKey(key)
  const megaCandidates = megaCandidateKeysForBase(baseKey)
  if (!megaCandidates.length) return key
  if (megaOn) return megaCandidates[0]
  return baseKey
}

async function loadEmbeddedMovePools() {
  if (!embeddedMovePoolsPromise) {
    embeddedMovePoolsPromise = import('./championsMovePools.json').then((module) => module.default as Record<string, MoveOption[]>)
  }
  return embeddedMovePoolsPromise
}

async function embeddedMovePoolForKey(key: string) {
  const embeddedMovePools = await loadEmbeddedMovePools()
  const merged = new Map<string, MoveOption>()
  for (const poolKey of relatedMovePoolKeys(key)) {
    for (const move of embeddedMovePools[poolKey] ?? []) {
      if (!merged.has(move.name)) merged.set(move.name, move)
    }
  }
  return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name, 'ko'))
}

async function fetchMoveMeta(url: string) {
  if (!moveMetaCache.has(url)) {
    moveMetaCache.set(url, fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`move ${res.status}`)
        return res.json()
      })
      .then((json) => {
        const ko = json.names?.find((entry: any) => entry.language?.name === 'ko')?.name
        return {
          name: ko || json.names?.find((entry: any) => entry.language?.name === 'en')?.name || json.name,
          type: typeof json.type?.name === 'string' ? json.type.name : null,
        }
      })
      .catch(() => {
        const slug = url.split('/').filter(Boolean).pop() || ''
        return {
          name: slug.split('-').map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1)).join(' '),
          type: null,
        }
      }))
  }
  return moveMetaCache.get(url)!
}

async function fetchPokemonMovePool(key: string) {
  let pokemonJson: any = null
  for (const candidate of pokemonApiCandidates(key)) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${candidate}`)
    if (res.ok) {
      pokemonJson = await res.json()
      break
    }
  }
  if (!pokemonJson) throw new Error(`move pool not found for ${key}`)

  const moveUrls = Array.from(new Set((pokemonJson.moves ?? []).map((entry: any) => entry.move?.url).filter(Boolean))) as string[]
  const moves = await Promise.all(moveUrls.map((url) => fetchMoveMeta(url)))
  const byName = new Map<string, MoveOption>()
  for (const move of moves) {
    if (!byName.has(move.name)) byName.set(move.name, move)
  }
  return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name, 'ko'))
}

function natureLabel(natureId: NatureId, language: SiteLanguage = 'ko') {
  const nature = natureById.get(natureId)
  if (!nature) return natureId
  const localized = translateText(language, nature.label)
  if (!nature.up || !nature.down) return `${localized} (${translateText(language, '무보정')})`
  return `${localized} (${statLabel(nature.up, language)}↑ ${statLabel(nature.down, language)}↓)`
}

function natureChipLabel(natureId: NatureId, language: SiteLanguage = 'ko') {
  return translateText(language, natureById.get(natureId)?.label ?? natureId)
}

function focusAndOpenPicker(el: HTMLInputElement | HTMLSelectElement | null) {
  if (!el) return
  el.focus()
  if ('showPicker' in el && typeof el.showPicker === 'function') {
    try {
      el.showPicker()
    } catch {
      // browser may reject programmatic picker open
    }
  }
}

function boostedStatForNature(natureId: NatureId): StatKey | null {
  return natureById.get(natureId)?.up ?? null
}

function sanitizeMemberConfig(input: unknown): MemberConfig {
  const config = input && typeof input === 'object' ? (input as Partial<MemberConfig>) : {}
  const rawNature = typeof (config as { nature?: unknown }).nature === 'string' ? (config as { nature: NatureId }).nature : null
  return {
    nature: rawNature && natureById.has(rawNature) ? rawNature : legacyNatureFromBoostStat((config as { natureBoostStat?: unknown }).natureBoostStat),
    scarf: Boolean(config.scarf),
    speedStage: clampSpeedStage(config.speedStage),
  }
}

function sanitizePartyTuning(input: unknown): PartyTuning {
  const tuning = input && typeof input === 'object' ? (input as Partial<PartyTuning>) : {}
  return {
    magicNumber: clampNonNegativeInt(tuning.magicNumber, 255),
    maxValue: clampNonNegativeInt(tuning.maxValue, 255),
  }
}

function clampEv(value: unknown, max = CHAMPIONS_EFFORT_PER_STAT_CAP) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 0
  return Math.max(0, Math.min(max, Math.trunc(num)))
}

function clampNonNegativeInt(value: unknown, max = 999) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 0
  return Math.max(0, Math.min(max, Math.trunc(num)))
}

function totalEffortPoints(evs: EffortValues) {
  return evs.hp + evs.attack + evs.defense + evs.spAttack + evs.spDefense + evs.speed
}

function remainingEffortPoints(evs: EffortValues, field?: EffortStatKey) {
  if (!field) return CHAMPIONS_EFFORT_CAP - totalEffortPoints(evs)
  return CHAMPIONS_EFFORT_CAP - (totalEffortPoints(evs) - evs[field])
}

function applyChampionsEffort(evs: EffortValues, field: keyof EffortValues, nextValue: unknown) {
  const clamped = clampEv(nextValue, CHAMPIONS_EFFORT_PER_STAT_CAP)
  const remainder = remainingEffortPoints(evs, field)
  return {
    ...evs,
    [field]: Math.max(0, Math.min(clamped, remainder)),
  }
}

function sanitizeEvs(input: unknown): EffortValues {
  const evs = input && typeof input === 'object' ? (input as Partial<EffortValues>) : {}
  return {
    hp: clampEv(evs.hp, CHAMPIONS_EFFORT_PER_STAT_CAP),
    attack: clampEv(evs.attack, CHAMPIONS_EFFORT_PER_STAT_CAP),
    defense: clampEv(evs.defense, CHAMPIONS_EFFORT_PER_STAT_CAP),
    spAttack: clampEv(evs.spAttack, CHAMPIONS_EFFORT_PER_STAT_CAP),
    spDefense: clampEv(evs.spDefense, CHAMPIONS_EFFORT_PER_STAT_CAP),
    speed: clampEv(evs.speed, CHAMPIONS_EFFORT_PER_STAT_CAP),
  }
}

function sanitizeParty(input: unknown): PartyMember[] {
  if (!Array.isArray(input)) return defaultParty
  const cleaned = input
    .map((member) => {
      if (!member || typeof member !== 'object') return null
      const raw = member as Partial<PartyMember>
      if (typeof raw.key !== 'string') return null
      if (raw.key && !indexByKey.has(raw.key)) return null
      return {
        key: raw.key,
        config: sanitizeMemberConfig(raw.config),
        picked: typeof raw.picked === 'boolean' ? raw.picked : false,
        evs: sanitizeEvs(raw.evs),
        tuning: sanitizePartyTuning(raw.tuning),
        item: normalizeItemForKey(raw.key, typeof raw.item === 'string' ? raw.item : ''),
        ability: typeof raw.ability === 'string' ? raw.ability : defaultAbilityForKey(raw.key),
      }
    })
    .filter((member): member is PartyMember => Boolean(member))

  return cleaned.length ? cleaned : defaultParty
}

function sanitizeOpponents(input: unknown): OpponentState[] {
  if (!Array.isArray(input)) return defaultOpponents
  const cleaned = input
    .map((opponent) => {
      if (!opponent || typeof opponent !== 'object') return null
      const raw = opponent as Partial<OpponentState>
      if (typeof raw.key !== 'string') return null
      if (raw.key && !indexByKey.has(raw.key)) return null
      return {
        key: raw.key,
        item: typeof raw.item === 'string' ? raw.item : '',
        ability: typeof raw.ability === 'string' ? raw.ability : '',
        notes: typeof raw.notes === 'string' ? raw.notes : '',
        revealedMoves: Array.isArray(raw.revealedMoves)
          ? raw.revealedMoves.filter((move): move is string => typeof move === 'string')
          : [],
        natureBoost: typeof raw.natureBoost === 'boolean' ? raw.natureBoost : true,
        scarf: typeof raw.scarf === 'boolean' ? raw.scarf : false,
        speedStage: clampSpeedStage(raw.speedStage),
        picked: typeof raw.picked === 'boolean' ? raw.picked : false,
      }
    })
    .filter((opponent): opponent is OpponentState => Boolean(opponent))
    .slice(0, MAX_OPPONENTS)

  return cleaned.length ? cleaned : defaultOpponents
}

function sanitizeSavedSamples(input: unknown): SavedSample[] {
  if (!Array.isArray(input)) return []
  return input
    .map((entry, idx) => {
      if (!entry || typeof entry !== 'object') return null
      const raw = entry as Partial<SavedSample>
      const member = sanitizeParty([raw.member])[0]
      if (!member) return null
      return {
        id: typeof raw.id === 'string' ? raw.id : `sample-${idx}`,
        label: typeof raw.label === 'string' && raw.label.trim() ? raw.label : `${member.key}-${idx + 1}`,
        member,
      }
    })
    .filter((entry): entry is SavedSample => Boolean(entry))
}

function sanitizeSelectedIndex(value: unknown, listLength: number) {
  const num = Number(value)
  if (!Number.isInteger(num) || num < 0 || num >= listLength) return 0
  return num
}

function loadPersistedState(): PersistedState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedState
  } catch {
    return null
  }
}

function parseViewStateFromUrl(): ViewState | null {
  if (typeof window === 'undefined') return null
  try {
    const rawHash = window.location.hash.replace(/^#/, '').trim()
    if (!rawHash) return null
    const params = new URLSearchParams(rawHash)
    const mainSection = params.get('section') === 'sample' ? 'sample' : params.get('section') === 'single' ? 'single' : undefined
    const activeTabParam = params.get('tab')
    const activeTab = activeTabParam === 'party' || activeTabParam === 'pick' || activeTabParam === 'speed' || activeTabParam === 'power'
      ? activeTabParam
      : undefined
    const selectedMy = params.get('my') !== null ? Number(params.get('my')) : undefined
    const selectedOpp = params.get('opp') !== null ? Number(params.get('opp')) : undefined
    return { mainSection, activeTab, selectedMy, selectedOpp }
  } catch {
    return null
  }
}

function syncViewStateToUrl(viewState: ViewState) {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams()
  params.set('section', viewState.mainSection === 'sample' ? 'sample' : 'single')
  if (viewState.mainSection !== 'sample' && viewState.activeTab) params.set('tab', viewState.activeTab)
  if (typeof viewState.selectedMy === 'number') params.set('my', String(viewState.selectedMy))
  if (typeof viewState.selectedOpp === 'number') params.set('opp', String(viewState.selectedOpp))
  const nextHash = params.toString()
  if (window.location.hash.replace(/^#/, '') === nextHash) return
  const url = new URL(window.location.href)
  url.hash = nextHash
  window.history.replaceState(null, '', url)
}

function actualStat(base: number, ev: number, natureMultiplierValue = 1, hp = false) {
  if (hp) return Math.floor((((2 * base + 31) * 50) / 100) + 60) + ev
  const raw = Math.floor((((2 * base + 31) * 50) / 100) + 5) + ev
  return Math.floor(raw * natureMultiplierValue)
}

function speedValue(row: Row, config: MemberConfig) {
  let value = natureMultiplier(config.nature, 'speed') > 1 ? row.fast : row.neutral
  if (config.speedStage > 0) {
    value = Math.floor(value * ((2 + config.speedStage) / 2))
  } else if (config.speedStage < 0) {
    value = Math.floor(value * (2 / (2 + Math.abs(config.speedStage))))
  }
  if (config.scarf) value = Math.floor(value * 1.5)
  return value
}

function partySpeedValue(row: Row, member: PartyMember) {
  let value = actualStat(row.speed, member.evs.speed, natureMultiplier(member.config.nature, 'speed'))
  if (member.config.speedStage > 0) value = Math.floor(value * ((2 + member.config.speedStage) / 2))
  else if (member.config.speedStage < 0) value = Math.floor(value * (2 / (2 + Math.abs(member.config.speedStage))))
  if (member.config.scarf || member.item.includes('스카프')) value = Math.floor(value * 1.5)
  return value
}

function applySpeedStage(value: number, speedStage: number) {
  if (speedStage > 0) return Math.floor(value * ((2 + speedStage) / 2))
  if (speedStage < 0) return Math.floor(value * (2 / (2 + Math.abs(speedStage))))
  return value
}

function opponentScenarioSpeed(row: Row, speedPoints: number, boosted: boolean, scarf: boolean, speedStage: number) {
  let value = actualStat(row.speed, speedPoints, boosted ? 1.1 : 1)
  value = applySpeedStage(value, speedStage)
  if (scarf) value = Math.floor(value * 1.5)
  return value
}

function opponentScenarioNeeds(row: Row, mySpeed: number, boosted: boolean, scarf: boolean, speedStage: number) {
  let tieEffort: number | null = null
  let passEffort: number | null = null

  for (let points = 0; points <= CHAMPIONS_EFFORT_PER_STAT_CAP; points += 1) {
    const speed = opponentScenarioSpeed(row, points, boosted, scarf, speedStage)
    if (tieEffort === null && speed === mySpeed) tieEffort = points
    if (passEffort === null && speed > mySpeed) passEffort = points
    if (tieEffort !== null && passEffort !== null) break
  }

  return { tieEffort, passEffort }
}

const DOUBLE_SPEED_ABILITY_SLUGS = ['swift-swim', 'sand-rush', 'chlorophyll', 'slush-rush', 'surge-surfer', 'unburden'] as const

const MY_SPEED_ABILITY_MARKERS: Record<string, { type: 'stage' | 'multiplier', value: number }> = {
  'weak-armor': { type: 'stage', value: 2 },
  'speed-boost': { type: 'stage', value: 1 },
  'motor-drive': { type: 'stage', value: 1 },
  'quick-feet': { type: 'multiplier', value: 1.5 },
  'swift-swim': { type: 'multiplier', value: 2 },
  'sand-rush': { type: 'multiplier', value: 2 },
  'chlorophyll': { type: 'multiplier', value: 2 },
  'slush-rush': { type: 'multiplier', value: 2 },
  'surge-surfer': { type: 'multiplier', value: 2 },
  'unburden': { type: 'multiplier', value: 2 },
}

function resolveSelectedAbility(row: Row, selectedAbility: string, language: SiteLanguage) {
  const normalized = selectedAbility.trim().toLowerCase()
  const abilityLabels = displayAbilities(row, language)
  const idx = row.abilities.findIndex((slug, abilityIdx) => {
    const ko = (row.abilities_ko[abilityIdx] ?? '').trim().toLowerCase()
    const en = titleCaseSlug(slug).trim().toLowerCase()
    const shown = (abilityLabels[abilityIdx] ?? '').trim().toLowerCase()
    return normalized === ko || normalized === en || normalized === shown || normalized === slug.trim().toLowerCase()
  })
  if (idx < 0) return null
  return {
    slug: row.abilities[idx],
    label: row.abilities_ko[idx] ?? titleCaseSlug(row.abilities[idx]),
  }
}

function mySpeedAbilityMarker(row: Row, member: PartyMember, language: SiteLanguage) {
  const ability = resolveSelectedAbility(row, member.ability, language)
  if (!ability) return null
  const effect = MY_SPEED_ABILITY_MARKERS[ability.slug]
  if (!effect) return null
  const baseSpeed = actualStat(row.speed, member.evs.speed, natureMultiplier(member.config.nature, 'speed'))
  const totalStage = effect.type === 'stage' ? member.config.speedStage + effect.value : member.config.speedStage
  let speed = applySpeedStage(baseSpeed, totalStage)
  if (member.config.scarf || member.item.includes('스카프')) speed = Math.floor(speed * 1.5)
  if (effect.type === 'multiplier') speed = Math.floor(speed * effect.value)
  return {
    label: ability.label,
    speed,
  }
}

function speedAbilityCandidate(row: Row, language: SiteLanguage) {
  const idx = row.abilities.findIndex((ability) => DOUBLE_SPEED_ABILITY_SLUGS.includes(ability as typeof DOUBLE_SPEED_ABILITY_SLUGS[number]))
  if (idx < 0) return null
  const slug = row.abilities[idx]
  const koLabel = row.abilities_ko[idx] ?? titleCaseSlug(slug)
  const label = language === 'en' ? titleCaseSlug(slug) : language === 'ja' ? titleCaseSlug(slug) : koLabel
  return { slug, label }
}

function mySpeedNeeds(row: Row, config: MemberConfig, targetSpeed: number) {
  let tieEffort: number | null = null
  let passEffort: number | null = null

  for (let points = 0; points <= CHAMPIONS_EFFORT_PER_STAT_CAP; points += 1) {
    let speed = actualStat(row.speed, points, natureMultiplier(config.nature, 'speed'))
    speed = applySpeedStage(speed, config.speedStage)
    if (config.scarf) speed = Math.floor(speed * 1.5)
    if (tieEffort === null && speed === targetSpeed) tieEffort = points
    if (passEffort === null && speed > targetSpeed) passEffort = points
    if (tieEffort !== null && passEffort !== null) break
  }

  return { tieEffort, passEffort }
}

function partyStatValue(row: Row, member: PartyMember, field: keyof EffortValues) {
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

function findMagicNumberCandidate(row: Row, member: PartyMember) {
  const boostedStat = boostedStatForNature(member.config.nature)
  if (!boostedStat) return null

  const currentActual = partyStatValue(row, member, boostedStat)
  const currentEffort = member.evs[boostedStat]
  const availableCap = Math.min(CHAMPIONS_EFFORT_PER_STAT_CAP, remainingEffortPoints(member.evs, boostedStat))
  const currentHit = currentActual % 11 === 0

  let nextEffort = currentEffort
  let nextActual = currentActual
  if (!currentHit) {
    let found = false
    for (let effort = currentEffort; effort <= availableCap; effort += 1) {
      const candidateMember = { ...member, evs: { ...member.evs, [boostedStat]: effort } }
      const actual = partyStatValue(row, candidateMember, boostedStat)
      if (actual % 11 === 0) {
        nextEffort = effort
        nextActual = actual
        found = true
        break
      }
    }
    if (!found) return {
      stat: boostedStat,
      reached: false,
      currentActual,
      currentEffort,
      nextEffort: null,
      nextActual: null,
    }
  }

  return {
    stat: boostedStat,
    reached: currentHit,
    currentActual,
    currentEffort,
    nextEffort,
    nextActual,
  }
}

function magicEffortPoints(row: Row, member: PartyMember, stat: EffortStatKey) {
  const boostedStat = boostedStatForNature(member.config.nature)
  if (boostedStat !== stat) return [] as number[]

  const points: number[] = []
  for (let effort = 1; effort <= CHAMPIONS_EFFORT_PER_STAT_CAP; effort += 1) {
    const candidateMember = { ...member, evs: { ...member.evs, [stat]: effort } }
    const actual = partyStatValue(row, candidateMember, stat)
    if (actual % 11 === 0) points.push(effort)
  }
  return points
}

function typeEffectiveness(attackType: string, defendTypes: string[]) {
  return defendTypes.reduce((acc, defendType) => acc * (typeChart[attackType]?.[defendType] ?? 1), 1)
}

function matchupHints(attacker: Row, defender: Row) {
  const attackOptions = attacker.types.map((type, idx) => ({
    type,
    typeKo: attacker.types_ko[idx] ?? type,
    multiplier: typeEffectiveness(type, defender.types),
  }))
  const defenseOptions = defender.types.map((type, idx) => ({
    type,
    typeKo: defender.types_ko[idx] ?? type,
    multiplier: typeEffectiveness(type, attacker.types),
  }))

  const bestAttack = [...attackOptions].sort((a, b) => b.multiplier - a.multiplier)[0]
  const worstDefense = [...defenseOptions].sort((a, b) => b.multiplier - a.multiplier)[0]
  const resistAttack = [...attackOptions].sort((a, b) => a.multiplier - b.multiplier)[0]

  return { bestAttack, worstDefense, resistAttack }
}

function togglePicked<T extends { picked: boolean }>(list: T[], idx: number, maxPicks = 3) {
  const next = [...list]
  const current = next[idx]
  if (!current) return list
  const pickedCount = next.filter((item) => item.picked).length
  if (!current.picked && pickedCount >= maxPicks) return list
  next[idx] = { ...current, picked: !current.picked }
  return next
}

function calcDamage(attacker: Row, defender: Row, movePower: number, mode: CalcMode, stab = 1.5, effectiveness = 1) {
  const attackStat = mode === 'physical' ? attacker.attack : attacker.spAttack
  const defenseStat = mode === 'physical' ? defender.defense : defender.spDefense
  const base = (((22 * movePower * attackStat) / Math.max(1, defenseStat)) / 50) + 2
  const min = Math.floor(base * stab * effectiveness * 0.85)
  const max = Math.floor(base * stab * effectiveness)
  return {
    min,
    max,
    minPct: ((min / defender.hp) * 100).toFixed(1),
    maxPct: ((max / defender.hp) * 100).toFixed(1),
  }
}

function matchesLooseQuery(source: string, query: string) {
  if (!query) return true
  if (source.includes(query)) return true
  let cursor = 0
  for (const char of source) {
    if (char === query[cursor]) cursor += 1
    if (cursor >= query.length) return true
  }
  return false
}

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[\s'’._-]+/g, '')
}

function speciesSearchCandidates(row: Row) {
  const base = [row.name_ko, row.name_en, row.name_ja, row.key].filter(Boolean) as string[]
  const extra: string[] = []
  if (row.name_ko.startsWith('메가')) extra.push(row.name_ko.replace(/^메가/, ''))
  if (row.name_en.toLowerCase().startsWith('mega ')) extra.push(row.name_en.replace(/^Mega\s+/i, ''))
  if (row.key.startsWith('mega-')) extra.push(row.key.slice(5))
  if (row.key.startsWith('rotom-')) extra.push(`로토무${row.name_ko.replace(/로토무$/, '')}`)
  if (row.key.startsWith('gourgeist-')) extra.push(row.name_ko.replace(/^보통\s*/, ''), row.name_en.replace(/^Gourgeist\s*/, 'Gourgeist '))
  return Array.from(new Set([...base, ...extra].flatMap((entry) => [entry, normalizeSearchText(entry)])))
}

function filterSpeciesOptions(query: string, options?: { includeMega?: boolean }) {
  const includeMega = options?.includeMega ?? true
  const normalized = normalizeSearchText(query.trim())
  const candidateRows = includeMega ? rows : rows.filter((row) => !row.key.startsWith('mega-'))
  if (!normalized) return candidateRows.map((row) => ({ key: row.key, label: `${row.name_ko} (${row.name_en})` }))
  return candidateRows
    .map((row) => {
      const candidates = speciesSearchCandidates(row)
      const score = candidates.reduce((best, candidate) => {
        if (candidate === normalized) return Math.min(best, 0)
        if (candidate.startsWith(normalized)) return Math.min(best, 1)
        if (candidate.includes(normalized)) return Math.min(best, 2)
        if (matchesLooseQuery(candidate, normalized)) return Math.min(best, 3)
        return best
      }, Number.POSITIVE_INFINITY)
      return Number.isFinite(score) ? { row, score } : null
    })
    .filter((entry): entry is { row: Row; score: number } => Boolean(entry))
    .sort((a, b) => a.score - b.score || a.row.name_ko.localeCompare(b.row.name_ko, 'ko'))
    .map((entry) => ({ key: entry.row.key, label: `${entry.row.name_ko} (${entry.row.name_en})` }))
}

function displayItemLabel(item: string, language: SiteLanguage) {
  return translateText(language, item)
}

function filterItemOptions(query: string, language: SiteLanguage = 'ko') {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return [...ITEM_OPTIONS]
  return [...ITEM_OPTIONS]
    .map((item) => {
      const aliases = ITEM_ALIASES[item] ?? []
      const candidates = [item, displayItemLabel(item, 'en'), displayItemLabel(item, 'ja'), ...aliases].map((entry) => entry.toLowerCase())
      const score = candidates.reduce((best, candidate) => {
        if (candidate === normalized) return Math.min(best, 0)
        if (candidate.startsWith(normalized)) return Math.min(best, 1)
        if (candidate.includes(normalized)) return Math.min(best, 2)
        if (matchesLooseQuery(candidate, normalized)) return Math.min(best, 3)
        return best
      }, Number.POSITIVE_INFINITY)
      return Number.isFinite(score) ? { item, score } : null
    })
    .filter((entry): entry is { item: typeof ITEM_OPTIONS[number]; score: number } => Boolean(entry))
    .sort((a, b) => a.score - b.score || a.item.localeCompare(b.item, 'ko'))
    .map((entry) => entry.item)
}

function resolveItemInput(key: string, raw: string, language: SiteLanguage = 'ko') {
  const fixed = megaStoneForKey(key)
  if (fixed) return fixed
  const top = filterItemOptions(raw, language)[0]
  return top && isAllowedChampionsItem(key, top) ? top : ''
}

function filterAbilityOptions(options: string[], query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return options
  return options
    .map((ability) => {
      const lower = ability.toLowerCase()
      if (lower === normalized) return { ability, score: 0 }
      if (lower.startsWith(normalized)) return { ability, score: 1 }
      if (lower.includes(normalized)) return { ability, score: 2 }
      if (matchesLooseQuery(lower, normalized)) return { ability, score: 3 }
      return null
    })
    .filter((entry): entry is { ability: string; score: number } => Boolean(entry))
    .sort((a, b) => a.score - b.score || a.ability.localeCompare(b.ability, 'ko'))
    .map((entry) => entry.ability)
}

function resolveAbilityInput(options: string[], raw: string) {
  return filterAbilityOptions(options, raw)[0] ?? options[0] ?? ''
}

function filterNatureOptions(query: string, language: SiteLanguage = 'ko') {
  const normalized = query.trim().toLowerCase()
  const options = NATURES.map((nature) => ({
    id: nature.id,
    shortLabel: natureChipLabel(nature.id, language),
    fullLabel: natureLabel(nature.id, language),
  }))
  if (!normalized) return options
  return options
    .map((option) => {
      const candidates = [option.id, option.shortLabel, option.fullLabel].map((entry) => entry.toLowerCase())
      const score = candidates.reduce<number>((best, candidate) => {
        if (candidate === normalized) return Math.min(best, 0)
        if (candidate.startsWith(normalized)) return Math.min(best, 1)
        if (candidate.includes(normalized)) return Math.min(best, 2)
        if (matchesLooseQuery(candidate, normalized)) return Math.min(best, 3)
        return best
      }, Number.POSITIVE_INFINITY)
      return Number.isFinite(score) ? { ...option, score } : null
    })
    .filter((entry): entry is { id: NatureId; shortLabel: string; fullLabel: string; score: number } => Boolean(entry))
    .sort((a, b) => a.score - b.score || a.shortLabel.localeCompare(b.shortLabel, 'ko'))
}

function resolveNatureInput(raw: string, language: SiteLanguage = 'ko') {
  return filterNatureOptions(raw, language)[0]?.id ?? 'hardy'
}

function filterMoveOptions(query: string, options: MoveOption[]) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return options
  const scored = options
    .map((option) => {
      const name = option.name.toLowerCase()
      if (name === normalized) return { option, score: 0 }
      if (name.startsWith(normalized)) return { option, score: 1 }
      if (name.includes(normalized)) return { option, score: 2 }
      if (matchesLooseQuery(name, normalized)) return { option, score: 3 }
      return null
    })
    .filter((entry): entry is { option: MoveOption; score: number } => Boolean(entry))
    .sort((a, b) => a.score - b.score || a.option.name.localeCompare(b.option.name, 'ko'))
  return scored.map((entry) => entry.option)
}

function resolveSpeciesKey(raw: string, options?: { includeMega?: boolean }) {
  const normalized = normalizeSearchText(raw.trim())
  if (!normalized) return null
  return filterSpeciesOptions(normalized, options)[0]?.key ?? null
}

function displayName(row: Row, language: SiteLanguage) {
  if (language === 'en') return row.name_en
  if (language === 'ja') return row.name_ja || getJaName(row.key, row.name_ko, row.name_en)
  return row.name_ko
}

function displayTypes(row: Row, language: SiteLanguage) {
  if (language === 'en') return row.types
  if (language === 'ja') return getJaTypes(row.types)
  return row.types_ko
}

function displayAbilities(row: Row, language: SiteLanguage) {
  if (language === 'en') return row.abilities.map(titleCaseSlug)
  if (language === 'ja') return row.abilities.map(titleCaseSlug)
  return row.abilities_ko
}

function defaultAbilityForKey(key: string) {
  const row = indexByKey.get(key)
  if (!row) return ''
  return row.abilities_ko[0] || row.abilities[0] || ''
}

function searchDisplayLabel(key: string, language: SiteLanguage) {
  const row = indexByKey.get(key)
  if (!row) return key
  return displayName(row, language)
}

function sameSearchTarget(a: SearchFieldTarget, side: 'party' | 'opponent' | 'sample' | 'opponentQuick', idx: number) {
  return a?.side === side && a?.idx === idx
}

function sameMoveField(a: MoveFieldTarget, key: string, slotIdx: number, scope: 'party' | 'sample') {
  return a?.key === key && a?.slotIdx === slotIdx && a?.scope === scope
}

function sameItemField(a: ItemFieldTarget, scope: 'party' | 'sample' | 'opponent', idx: number) {
  return a?.scope === scope && a?.idx === idx
}

function sameMetaListField(a: MetaListField, scope: 'party' | 'sample', field: 'ability' | 'nature', idx = 0) {
  if (!a || a.scope !== scope || a.field !== field) return false
  return scope === 'party' ? a.idx === idx : true
}

function menuLabelForTab(tab: MainTab, language: SiteLanguage = 'ko') {
  switch (tab) {
    case 'party': return translateText(language, '내 파티 관리')
    case 'pick': return translateText(language, '상대 엔트리')
    case 'speed': return translateText(language, '스피드 계산')
    case 'power': return translateText(language, '결정력 계산')
  }
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="language-icon-svg">
      <path fill="currentColor" d="M4 7h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
    </svg>
  )
}

function TypeBadgeImage({ type }: { type: string }) {
  const label = getTypeBadgeLabel(type)
  return <img src={getTypeBadgeSrc(type)} alt={label} className="type-badge-image" title={label} />
}

function SmallTypeBadgeImage({ type }: { type: string }) {
  const label = getTypeBadgeLabel(type)
  return <img src={getTypeBadgeSrc(type)} alt={label} className="move-autocomplete-type-icon" title={label} />
}

function itemAutocompleteSecondaryLabel(item: string, language: SiteLanguage) {
  if (language === 'ko') return ''
  return item
}

function itemAutocompletePrimaryLabel(item: string, language: SiteLanguage) {
  const localized = displayItemLabel(item, language)
  return localized && localized.trim() ? localized : item
}

function LanguageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="language-icon-svg">
      <path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm6.93 9h-3.14a15.4 15.4 0 0 0-1.38-5.03A8.03 8.03 0 0 1 18.93 11ZM12 4.07c.78.95 1.86 3.15 2.31 6.93H9.69C10.14 7.22 11.22 5.02 12 4.07ZM4.07 13h3.14a15.4 15.4 0 0 0 1.38 5.03A8.03 8.03 0 0 1 4.07 13Zm3.14-2H4.07a8.03 8.03 0 0 1 4.52-5.03A15.4 15.4 0 0 0 7.21 11Zm4.79 8.93c-.78-.95-1.86-3.15-2.31-6.93h4.62c-.45 3.78-1.53 5.98-2.31 6.93ZM14.41 18.03A15.4 15.4 0 0 0 15.79 13h3.14a8.03 8.03 0 0 1-4.52 5.03Z"/>
    </svg>
  )
}

export default function App() {
  const persisted = React.useMemo(() => loadPersistedState(), [])
  const viewState = React.useMemo(() => parseViewStateFromUrl(), [])
  const [party, setParty] = React.useState<PartyMember[]>(() => sanitizeParty(persisted?.party))
  const [opponents, setOpponents] = React.useState<OpponentState[]>(() => sanitizeOpponents(persisted?.opponents))
  const [selectedMy, setSelectedMy] = React.useState(() => sanitizeSelectedIndex(viewState?.selectedMy ?? persisted?.selectedMy, sanitizeParty(persisted?.party).length))
  const [selectedOpp, setSelectedOpp] = React.useState(() => sanitizeSelectedIndex(viewState?.selectedOpp ?? persisted?.selectedOpp, sanitizeOpponents(persisted?.opponents).length))
  const [movePower, setMovePower] = React.useState(90)
  const [calcMode, setCalcMode] = React.useState<CalcMode>('special')
  const [stab, setStab] = React.useState(1.5)
  const [effectiveness, setEffectiveness] = React.useState(1)
  const [battleNote, setBattleNote] = React.useState(() => typeof persisted?.battleNote === 'string' ? persisted.battleNote : '')
  const [mainSection, setMainSection] = React.useState<MainSection>(() => viewState?.mainSection === 'sample' ? 'sample' : persisted?.mainSection === 'sample' ? 'sample' : 'single')
  const [activeTab, setActiveTab] = React.useState<MainTab>(() => viewState?.activeTab ?? 'party')
  const [selectedDamageMove, setSelectedDamageMove] = React.useState<DamageMoveSelection | null>(null)
  const [calcMyMegaOn, setCalcMyMegaOn] = React.useState(false)
  const [calcOppMegaOn, setCalcOppMegaOn] = React.useState(false)
  const [siteLanguage, setSiteLanguage] = React.useState<SiteLanguage>('ko')
  const [moveFilter, setMoveFilter] = React.useState<MoveFilter>('all')
  const [moveSearch, setMoveSearch] = React.useState('')
  const [confirmedMovesByKey, setConfirmedMovesByKey] = React.useState<Record<string, string[]>>(() => persisted?.confirmedMovesByKey ?? {})
  const [partySearch, setPartySearch] = React.useState<string[]>(() => sanitizeParty(persisted?.party).map((member) => searchDisplayLabel(member.key, 'ko')))
  const [opponentSearch, setOpponentSearch] = React.useState<string[]>(() => sanitizeOpponents(persisted?.opponents).map((member) => searchDisplayLabel(member.key, 'ko')))
  const [opponentItemDrafts, setOpponentItemDrafts] = React.useState<string[]>(() => sanitizeOpponents(persisted?.opponents).map((member) => visibleChampionsItem(member.key, member.item)))
  const [activeSearchField, setActiveSearchField] = React.useState<SearchFieldTarget>(null)
  const [activeMoveField, setActiveMoveField] = React.useState<MoveFieldTarget>(null)
  const [activeItemField, setActiveItemField] = React.useState<ItemFieldTarget>(null)
  const [activeMetaListField, setActiveMetaListField] = React.useState<MetaListField>(null)
  const [languageMenuOpen, setLanguageMenuOpen] = React.useState(false)
  const [navMenuOpen, setNavMenuOpen] = React.useState(false)
  const [tuningModalIndex, setTuningModalIndex] = React.useState<number | null>(null)
  const [sampleForge, setSampleForge] = React.useState<PartyMember>(() => persisted?.sampleForge ? sanitizeParty([persisted.sampleForge])[0] ?? defaultSampleForge() : defaultSampleForge())
  const [sampleSearch, setSampleSearch] = React.useState(() => searchDisplayLabel((persisted?.sampleForge ? sanitizeParty([persisted.sampleForge])[0] : defaultSampleForge()).key, 'ko'))
  const [savedSamples, setSavedSamples] = React.useState<SavedSample[]>(() => sanitizeSavedSamples(persisted?.savedSamples))
  const [sampleCandidateFilter, setSampleCandidateFilter] = React.useState<SampleCandidateFilter>('all')
  const [sampleLabelDraft, setSampleLabelDraft] = React.useState('')
  const [opponentQuickSearch, setOpponentQuickSearch] = React.useState('')
  const [partyItemDrafts, setPartyItemDrafts] = React.useState<string[]>(() => sanitizeParty(persisted?.party).map((member) => visibleChampionsItem(member.key, member.item)))
  const [sampleItemDraft, setSampleItemDraft] = React.useState(() => visibleChampionsItem((persisted?.sampleForge ? sanitizeParty([persisted.sampleForge])[0] : defaultSampleForge()).key, (persisted?.sampleForge ? sanitizeParty([persisted.sampleForge])[0] : defaultSampleForge()).item))
  const [movePoolByKey, setMovePoolByKey] = React.useState<Record<string, MovePoolState>>({})
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const opponentQuickInputRef = React.useRef<HTMLInputElement | null>(null)
  const [activePartyMetaEditor, setActivePartyMetaEditor] = React.useState<{ idx: number; field: 'ability' | 'nature' | 'item' } | null>(null)
  const [activeSampleMetaEditor, setActiveSampleMetaEditor] = React.useState<'ability' | 'nature' | 'item' | null>(null)
  const partyAbilityEditorRefs = React.useRef<((HTMLInputElement | HTMLSelectElement) | null)[]>([])
  const partyNatureEditorRefs = React.useRef<((HTMLInputElement | HTMLSelectElement) | null)[]>([])
  const partyItemEditorRefs = React.useRef<(HTMLInputElement | null)[]>([])
  const sampleAbilityEditorRef = React.useRef<HTMLSelectElement | null>(null)
  const sampleNatureEditorRef = React.useRef<HTMLSelectElement | null>(null)
  const sampleItemEditorRef = React.useRef<HTMLInputElement | null>(null)
  const tuningMember = tuningModalIndex !== null ? party[tuningModalIndex] : null
  const tuningRow = tuningMember?.key ? (indexByKey.get(tuningMember.key) ?? rows[0]) : null
  const magicCandidate = tuningMember && tuningRow ? findMagicNumberCandidate(tuningRow, tuningMember) : null
  const lt = React.useCallback((text: string) => translateText(siteLanguage, text), [siteLanguage])

  React.useEffect(() => {
    const safeSelectedMy = sanitizeSelectedIndex(selectedMy, party.length)
    const safeSelectedOpp = sanitizeSelectedIndex(selectedOpp, opponents.length)
    if (safeSelectedMy !== selectedMy) setSelectedMy(safeSelectedMy)
    if (safeSelectedOpp !== selectedOpp) setSelectedOpp(safeSelectedOpp)
    setPartySearch((prev) => party.map((member, idx) => prev[idx] ?? searchDisplayLabel(member.key, siteLanguage)))
    setOpponentSearch((prev) => opponents.map((member, idx) => prev[idx] ?? searchDisplayLabel(member.key, siteLanguage)))
    setPartyItemDrafts((prev) => party.map((member, idx) => prev[idx] ?? displayItemLabel(visibleChampionsItem(member.key, member.item), siteLanguage)))
    setOpponentItemDrafts((prev) => opponents.map((member, idx) => prev[idx] ?? displayItemLabel(visibleChampionsItem(member.key, member.item), siteLanguage)))
  }, [party, opponents, selectedMy, selectedOpp, siteLanguage])

  React.useEffect(() => {
    setSampleItemDraft(displayItemLabel(visibleChampionsItem(sampleForge.key, sampleForge.item), siteLanguage))
  }, [sampleForge.key, sampleForge.item, siteLanguage])

  React.useEffect(() => {
    if (!activePartyMetaEditor) return
    const { idx, field } = activePartyMetaEditor
    const el = field === 'ability'
      ? partyAbilityEditorRefs.current[idx]
      : field === 'nature'
        ? partyNatureEditorRefs.current[idx]
        : partyItemEditorRefs.current[idx]
    const timer = window.setTimeout(() => focusAndOpenPicker(el ?? null), 0)
    return () => window.clearTimeout(timer)
  }, [activePartyMetaEditor])

  React.useEffect(() => {
    if (!activeSampleMetaEditor) return
    const el = activeSampleMetaEditor === 'ability'
      ? sampleAbilityEditorRef.current
      : activeSampleMetaEditor === 'nature'
        ? sampleNatureEditorRef.current
        : sampleItemEditorRef.current
    const timer = window.setTimeout(() => focusAndOpenPicker(el ?? null), 0)
    return () => window.clearTimeout(timer)
  }, [activeSampleMetaEditor])

  React.useEffect(() => {
    const targetKeys = Array.from(new Set([...party.map((member) => member.key), sampleForge.key].filter(Boolean)))
    targetKeys.forEach((key) => {
      if (movePoolByKey[key]?.status === 'loading' || movePoolByKey[key]?.status === 'ready') return
      setMovePoolByKey((prev) => ({ ...prev, [key]: { status: 'loading', moves: prev[key]?.moves ?? [] } }))
      embeddedMovePoolForKey(key)
        .then((embedded) => {
          if (embedded.length) {
            setMovePoolByKey((prev) => ({ ...prev, [key]: { status: 'ready', moves: embedded } }))
            return
          }
          return fetchPokemonMovePool(key)
            .then((moves) => setMovePoolByKey((prev) => ({ ...prev, [key]: { status: 'ready', moves } })))
        })
        .catch(() => {
          const fallback = moveOptionsForEntry(sampleMoves.find((entry) => entry.key === key))
          setMovePoolByKey((prev) => ({ ...prev, [key]: { status: fallback.length ? 'ready' : 'error', moves: fallback } }))
        })
    })
  }, [party, sampleForge.key, movePoolByKey])

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const payload: PersistedState = {
      party,
      opponents,
      selectedMy,
      selectedOpp,
      battleNote,
      confirmedMovesByKey,
      mainSection,
      sampleForge,
      savedSamples,
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [party, opponents, selectedMy, selectedOpp, battleNote, confirmedMovesByKey, mainSection, sampleForge, savedSamples])

  React.useEffect(() => {
    syncViewStateToUrl({
      mainSection,
      activeTab: mainSection === 'single' ? activeTab : undefined,
      selectedMy,
      selectedOpp,
    })
  }, [mainSection, activeTab, selectedMy, selectedOpp])

  const myMember = party[selectedMy] ?? party[0]
  const oppMember = opponents[selectedOpp] ?? opponents[0]
  const sampleRow = indexByKey.get(sampleForge.key) ?? rows[0]
  const calcMyKey = resolveCalcKeyWithMega(myMember.key, calcMyMegaOn)
  const calcOppKey = oppMember.key ? resolveCalcKeyWithMega(oppMember.key, calcOppMegaOn) : ''
  const myRow = indexByKey.get(calcMyKey) ?? rows[0]
  const oppRow = calcOppKey ? (indexByKey.get(calcOppKey) ?? rows[0]) : null
  const myMegaCandidates = megaCandidateKeysForBase(megaBaseKey(myMember.key))
  const oppMegaCandidates = megaCandidateKeysForBase(megaBaseKey(oppMember.key))

  React.useEffect(() => {
    const megaCandidates = megaCandidateKeysForBase(megaBaseKey(myMember.key))
    setCalcMyMegaOn(myMember.key.startsWith('mega-') ? true : (megaCandidates.length ? false : false))
  }, [myMember.key])

  React.useEffect(() => {
    const megaCandidates = megaCandidateKeysForBase(megaBaseKey(oppMember.key))
    setCalcOppMegaOn(oppMember.key.startsWith('mega-') ? true : (megaCandidates.length ? false : false))
  }, [oppMember.key])

  React.useEffect(() => {
    const moves = (confirmedMovesByKey[myMember.key] ?? []).filter(Boolean)
    if (!moves.length) {
      if (selectedDamageMove !== null) setSelectedDamageMove(null)
      return
    }
    if (!selectedDamageMove || selectedDamageMove.key !== myMember.key || !moves.includes(selectedDamageMove.move)) {
      setSelectedDamageMove({ key: myMember.key, move: moves[0] })
    }
  }, [confirmedMovesByKey, myMember.key, selectedDamageMove])

  const mySpeed = partySpeedValue(myRow, myMember)
  const mySpeedAbilityLine = myRow ? mySpeedAbilityMarker(myRow, myMember, siteLanguage) : null
  const oppSpeed = oppRow ? speedValue(oppRow, {
    nature: oppMember.natureBoost ? 'jolly' : 'hardy',
    scarf: oppMember.scarf || oppMember.item.includes('스카프'),
    speedStage: oppMember.speedStage,
  }) : null
  const pickedParty = party.filter((member) => member.picked)
  const pickedOpponents = opponents.filter((member) => member.picked)
  const opponentSpeedScenarios = oppRow ? [
    { id: 'neutral', label: '준속', boosted: false, scarf: false },
    { id: 'fast', label: '최속', boosted: true, scarf: false },
    { id: 'neutral-scarf', label: '준속 스카프', boosted: false, scarf: true },
    { id: 'fast-scarf', label: '최속 스카프', boosted: true, scarf: true },
  ].map((scenario) => {
    const speedAtMax = opponentScenarioSpeed(oppRow, CHAMPIONS_EFFORT_PER_STAT_CAP, scenario.boosted, scenario.scarf, oppMember.speedStage)
    const needs = opponentScenarioNeeds(oppRow, mySpeed, scenario.boosted, scenario.scarf, oppMember.speedStage)
    return {
      ...scenario,
      speedAtMax,
      result: mySpeed > speedAtMax ? '내가 앞섬' : mySpeed < speedAtMax ? '상대가 앞섬' : '동속',
      ...needs,
    }
  }) : []
  const opponentDoubleSpeedAbility = oppRow ? speedAbilityCandidate(oppRow, siteLanguage) : null
  const opponentSpeedBands = oppRow ? [
    {
      id: 'no-scarf',
      scarf: false,
      minScenario: opponentSpeedScenarios.find((scenario) => scenario.id === 'neutral'),
      maxScenario: opponentSpeedScenarios.find((scenario) => scenario.id === 'fast'),
    },
    {
      id: 'scarf',
      scarf: true,
      minScenario: opponentSpeedScenarios.find((scenario) => scenario.id === 'neutral-scarf'),
      maxScenario: opponentSpeedScenarios.find((scenario) => scenario.id === 'fast-scarf'),
    },
    ...(opponentDoubleSpeedAbility ? [{
      id: 'ability-double',
      scarf: false,
      abilityLabel: opponentDoubleSpeedAbility.label,
      minScenario: (() => {
        const speedAtMax = opponentScenarioSpeed(oppRow, CHAMPIONS_EFFORT_PER_STAT_CAP, false, false, oppMember.speedStage) * 2
        const tieEffort = opponentScenarioNeeds(oppRow, mySpeed / 2, false, false, oppMember.speedStage).tieEffort
        const passEffort = opponentScenarioNeeds(oppRow, mySpeed / 2, false, false, oppMember.speedStage).passEffort
        return { id: 'neutral-double', label: '준속', speedAtMax, tieEffort, passEffort }
      })(),
      maxScenario: (() => {
        const speedAtMax = opponentScenarioSpeed(oppRow, CHAMPIONS_EFFORT_PER_STAT_CAP, true, false, oppMember.speedStage) * 2
        const tieEffort = opponentScenarioNeeds(oppRow, mySpeed / 2, true, false, oppMember.speedStage).tieEffort
        const passEffort = opponentScenarioNeeds(oppRow, mySpeed / 2, true, false, oppMember.speedStage).passEffort
        return { id: 'fast-double', label: '최속', speedAtMax, tieEffort, passEffort }
      })(),
    }] : []),
  ].filter((band) => band.minScenario && band.maxScenario) : []
  const speedAxisMin = 40
  const speedAxisMax = 340
  const speedAxisTicks = [40, 100, 160, 220, 280, 340]
  const speedAxisTop = (speed: number) => {
    const clamped = Math.max(speedAxisMin, Math.min(speedAxisMax, speed))
    const ratio = (clamped - speedAxisMin) / (speedAxisMax - speedAxisMin)
    return 100 - (ratio * 100)
  }
  const myMoveSet = sampleMoves.find((entry) => entry.key === myMember.key)
  const myMovePool = movePoolByKey[myMember.key]
  const myMoveOptions = myMovePool?.moves?.length ? myMovePool.moves : moveOptionsForEntry(myMoveSet)
  const registeredDamageMoves = (confirmedMovesByKey[myMember.key] ?? []).filter(Boolean)
  const activeDamageMove = registeredDamageMoves.find((move) => move === selectedDamageMove?.move && myMember.key === selectedDamageMove?.key) ?? registeredDamageMoves[0] ?? ''
  const activeDamageMoveType = resolveMoveType(activeDamageMove, myMoveOptions, movePoolByKey)
  const autoStab = activeDamageMoveType && myRow.types.includes(activeDamageMoveType) ? 1.5 : 1
  const autoEffectiveness = activeDamageMoveType && oppRow ? typeEffectiveness(activeDamageMoveType, oppRow.types) : 1
  const toggleConfirmedMove = (key: string, move: string) => {
    setConfirmedMovesByKey((prev) => {
      const current = prev[key] ?? []
      const next = current.includes(move) ? current.filter((item) => item !== move) : [...current, move]
      return { ...prev, [key]: next }
    })
  }
  const setConfirmedMoveSlot = (key: string, slotIdx: number, move: string) => {
    setConfirmedMovesByKey((prev) => {
      const current = [...(prev[key] ?? [])]
      while (current.length < 4) current.push('')
      current[slotIdx] = move
      return { ...prev, [key]: normalizeMoveSlots(current) }
    })
  }
  const clearConfirmedMoveSlot = (key: string, slotIdx: number) => {
    setConfirmedMovesByKey((prev) => {
      const current = [...(prev[key] ?? [])]
      while (current.length < 4) current.push('')
      current[slotIdx] = ''
      return { ...prev, [key]: normalizeMoveSlots(current) }
    })
  }
  const shiftConfirmedMoveSlot = (key: string, slotIdx: number, direction: -1 | 1) => {
    setConfirmedMovesByKey((prev) => {
      const current = [...(prev[key] ?? [])]
      while (current.length < 4) current.push('')
      const targetIdx = slotIdx + direction
      if (targetIdx < 0 || targetIdx >= 4) return prev
      ;[current[slotIdx], current[targetIdx]] = [current[targetIdx], current[slotIdx]]
      return { ...prev, [key]: normalizeMoveSlots(current) }
    })
    const targetIdx = slotIdx + direction
    if (targetIdx >= 0 && targetIdx < 4) setActiveMoveField({ key, slotIdx: targetIdx, scope: 'sample' })
  }
  const commitTopMoveOption = (key: string, slotIdx: number, rawQuery: string, options: MoveOption[]) => {
    const top = filterMoveOptions(rawQuery, options)[0]
    if (!top) return false
    setConfirmedMoveSlot(key, slotIdx, top.name)
    return true
  }
  const applyMoveToSlot = (key: string, move: string, preferredSlotIdx?: number) => {
    setConfirmedMovesByKey((prev) => {
      const current = [...(prev[key] ?? [])]
      const existingIdx = current.indexOf(move)
      if (existingIdx >= 0 && preferredSlotIdx === undefined) {
        current.splice(existingIdx, 1)
        return { ...prev, [key]: current }
      }
      if (preferredSlotIdx !== undefined) {
        while (current.length < 4) current.push('')
        if (existingIdx >= 0) current[existingIdx] = ''
        current[preferredSlotIdx] = move
        return { ...prev, [key]: normalizeMoveSlots(current) }
      }
      if (current.length < 4) return { ...prev, [key]: [...current, move] }
      current[3] = move
      return { ...prev, [key]: current }
    })
  }
  const selectMoveOption = (key: string, slotIdx: number, moveName: string) => {
    setConfirmedMoveSlot(key, slotIdx, moveName)
    setActiveMoveField(null)
  }
  const selectPartyItemOption = (idx: number, member: PartyMember, itemName: string) => {
    const resolved = resolveItemInput(member.key, itemName, siteLanguage)
    const next = [...party]
    next[idx] = { ...member, item: resolved }
    setParty(next)
    setPartyItemDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[idx] = displayItemLabel(resolved, siteLanguage)
      return nextDrafts
    })
    setActiveItemField(null)
  }
  const selectSampleItemOption = (itemName: string) => {
    const resolved = resolveItemInput(sampleForge.key, itemName, siteLanguage)
    setSampleForge((prev) => ({ ...prev, item: resolved }))
    setSampleItemDraft(displayItemLabel(resolved, siteLanguage))
    setActiveItemField(null)
  }
  const selectOpponentItemOption = (idx: number, itemName: string) => {
    const member = opponents[idx]
    if (!member) return
    const resolved = resolveItemInput(member.key, itemName, siteLanguage)
    const next = [...opponents]
    next[idx] = { ...member, item: resolved }
    setOpponents(next)
    setOpponentItemDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[idx] = displayItemLabel(resolved, siteLanguage)
      return nextDrafts
    })
    setActiveItemField(null)
  }
  const clearPartyItemInput = (idx: number, member: PartyMember) => {
    if (megaStoneForKey(member.key)) return
    const next = [...party]
    next[idx] = { ...member, item: '' }
    setParty(next)
    setPartyItemDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[idx] = ''
      return nextDrafts
    })
    setActiveItemField({ scope: 'party', idx })
    setTimeout(() => partyItemEditorRefs.current[idx]?.focus(), 0)
  }
  const clearOpponentItemInput = (idx: number) => {
    const member = opponents[idx]
    if (!member) return
    const next = [...opponents]
    next[idx] = { ...member, item: '' }
    setOpponents(next)
    setOpponentItemDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[idx] = ''
      return nextDrafts
    })
    setActiveItemField({ scope: 'opponent', idx })
  }
  const clearSampleItemInput = () => {
    if (megaStoneForKey(sampleForge.key)) return
    setSampleForge((prev) => ({ ...prev, item: '' }))
    setSampleItemDraft('')
    setActiveItemField({ scope: 'sample', idx: 0 })
    setTimeout(() => sampleItemEditorRef.current?.focus(), 0)
  }
  const commitTopSpeciesOption = (side: 'party' | 'opponent' | 'sample', idx: number, rawQuery: string) => {
    const top = filterSpeciesOptions(rawQuery, { includeMega: side !== 'opponent' })[0]
    if (!top) return false
    selectSpecies(side, idx, top.key)
    return true
  }
  const selectSpecies = (side: 'party' | 'opponent' | 'sample', idx: number, key: string) => {
    if (side === 'party') {
      const member = party[idx]
      if (!member) return
      const next = [...party]
      next[idx] = { ...member, key, ability: defaultAbilityForKey(key), item: normalizeItemForKey(key, member.item) }
      setParty(next)
      setPartyItemDrafts((prev) => {
        const nextDrafts = [...prev]
        nextDrafts[idx] = visibleChampionsItem(key, next[idx].item)
        return nextDrafts
      })
      const nextSearch = [...partySearch]
      nextSearch[idx] = searchDisplayLabel(key, siteLanguage)
      setPartySearch(nextSearch)
    } else if (side === 'opponent') {
      const member = opponents[idx]
      if (!member) return
      const next = [...opponents]
      next[idx] = { ...member, key, item: normalizeItemForKey(key, member.item) }
      setOpponents(next)
      setOpponentItemDrafts((prev) => {
        const nextDrafts = [...prev]
        nextDrafts[idx] = displayItemLabel(visibleChampionsItem(key, next[idx].item), siteLanguage)
        return nextDrafts
      })
      const nextSearch = [...opponentSearch]
      nextSearch[idx] = searchDisplayLabel(key, siteLanguage)
      setOpponentSearch(nextSearch)
    } else {
      setSampleForge((prev) => ({ ...prev, key, ability: defaultAbilityForKey(key), item: normalizeItemForKey(key, prev.item) }))
      setSampleItemDraft(visibleChampionsItem(key, normalizeItemForKey(key, sampleForge.item)))
      setSampleSearch(searchDisplayLabel(key, siteLanguage))
      setActiveSampleMetaEditor(null)
    }
    setActiveSearchField(null)
  }
  const trackedKeys = Array.from(new Set([...party.map((member) => member.key), ...opponents.map((member) => member.key)]))
  const moveCards = trackedKeys
    .map((key) => {
      const moveSet = sampleMoves.find((entry) => entry.key === key)
      const row = indexByKey.get(key)
      if (!moveSet || !row) return null
      const buckets = [
        moveFilter === 'all' || moveFilter === 'core' ? moveSet.core.map((move) => ({ move, kind: 'core' as const })) : [],
        moveFilter === 'all' || moveFilter === 'options' ? (moveSet.options ?? []).map((move) => ({ move, kind: 'options' as const })) : [],
        moveFilter === 'all' || moveFilter === 'utility' ? (moveSet.utility ?? []).map((move) => ({ move, kind: 'utility' as const })) : [],
      ].flat().filter((entry) => !moveSearch || entry.move.includes(moveSearch))
      if (!buckets.length && moveSearch) return null
      return { key, row, moveSet, buckets, confirmed: confirmedMovesByKey[key] ?? [] }
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
  const damage = oppRow ? calcDamage(myRow, oppRow, movePower, calcMode, activeDamageMoveType ? autoStab : stab, activeDamageMoveType ? autoEffectiveness : effectiveness) : null
  const sampleMoveSet = sampleMoves.find((entry) => entry.key === sampleForge.key)
  const sampleMovePool = movePoolByKey[sampleForge.key]
  const sampleMoveOptions = sampleMovePool?.moves?.length ? sampleMovePool.moves : moveOptionsForEntry(sampleMoveSet)
  const sampleMoveType = (moveName: string) => resolveMoveType(moveName, sampleMoveOptions, movePoolByKey)
  const sampleRegisteredMoves = [...(confirmedMovesByKey[sampleForge.key] ?? [])]
  while (sampleRegisteredMoves.length < 4) sampleRegisteredMoves.push('')
  const sampleConfirmedMoves = sampleRegisteredMoves.filter(Boolean).slice(0, 4)
  const nextOpenSampleSlot = (moves: string[], fromIdx: number) => {
    for (let idx = fromIdx + 1; idx < 4; idx += 1) {
      if (!moves[idx]?.trim()) return idx
    }
    for (let idx = 0; idx < fromIdx; idx += 1) {
      if (!moves[idx]?.trim()) return idx
    }
    return null
  }
  const focusSampleSlot = (slotIdx: number | null) => {
    if (slotIdx === null) {
      setActiveMoveField(null)
      return
    }
    setActiveMoveField({ key: sampleForge.key, slotIdx, scope: 'sample' })
  }
  const commitSampleMoveOption = (slotIdx: number, rawQuery: string) => {
    const top = filterMoveOptions(rawQuery, sampleMoveOptions)[0]
    if (!top) return false
    const nextMoves = [...sampleRegisteredMoves]
    nextMoves[slotIdx] = top.name
    setConfirmedMoveSlot(sampleForge.key, slotIdx, top.name)
    focusSampleSlot(nextOpenSampleSlot(nextMoves, slotIdx))
    return true
  }
  const selectSampleMoveOption = (slotIdx: number, moveName: string) => {
    const nextMoves = [...sampleRegisteredMoves]
    nextMoves[slotIdx] = moveName
    setConfirmedMoveSlot(sampleForge.key, slotIdx, moveName)
    focusSampleSlot(nextOpenSampleSlot(nextMoves, slotIdx))
  }
  const applySampleCandidateMove = (move: string, preferredSlotIdx: number) => {
    const nextMoves = [...sampleRegisteredMoves]
    const existingIdx = nextMoves.indexOf(move)
    if (existingIdx >= 0) nextMoves[existingIdx] = ''
    nextMoves[preferredSlotIdx] = move
    applyMoveToSlot(sampleForge.key, move, preferredSlotIdx)
    focusSampleSlot(nextOpenSampleSlot(nextMoves, preferredSlotIdx))
  }
  const sampleBaseMoveGroups = sampleMoveSet ? [
    { key: 'core', label: lt('코어'), moves: sampleMoveSet.core, tone: 'core' },
    { key: 'options', label: lt('선택'), moves: sampleMoveSet.options ?? [], tone: 'options' },
    { key: 'utility', label: lt('유틸'), moves: sampleMoveSet.utility ?? [], tone: 'utility' },
  ] : []
  const sampleFilterCounts = {
    all: sampleBaseMoveGroups.reduce((sum, group) => sum + group.moves.length, 0),
    remaining: sampleBaseMoveGroups.reduce((sum, group) => sum + group.moves.filter((move) => !sampleConfirmedMoves.includes(move)).length, 0),
    locked: sampleConfirmedMoves.length,
  }
  const sampleMoveGroups = sampleBaseMoveGroups.map((group) => ({
    ...group,
    moves: group.moves.filter((move) => {
      const locked = sampleConfirmedMoves.includes(move)
      if (sampleCandidateFilter === 'remaining') return !locked
      if (sampleCandidateFilter === 'locked') return locked
      return true
    }),
  })).filter((group) => group.moves.length > 0)
  while (sampleRegisteredMoves.length < 4) sampleRegisteredMoves.push('')
  const activeSampleMoveSlotIdx = activeMoveField?.scope === 'sample' && activeMoveField.key === sampleForge.key
    ? activeMoveField.slotIdx
    : Math.min(sampleConfirmedMoves.length, 3)
  const sampleAbilityOptions = displayAbilities(sampleRow, siteLanguage)
  const sampleAbility = sampleForge.ability || sampleAbilityOptions[0] || defaultAbilityForKey(sampleForge.key)
  const sampleFixedMegaStone = megaStoneForKey(sampleForge.key)
  const sampleCurrentItem = visibleChampionsItem(sampleForge.key, sampleForge.item)
  const sampleTuningFocus = [...EFFORT_STAT_OPTIONS]
    .map((stat) => ({ key: stat.key, value: sampleForge.evs[stat.key], label: translateText(siteLanguage, stat.label) }))
    .sort((a, b) => b.value - a.value)[0]

  const saveCurrentSample = () => {
    const label = sampleLabelDraft.trim() || `${displayName(sampleRow, siteLanguage)} · ${natureLabel(sampleForge.config.nature, siteLanguage)}`
    const saved: SavedSample = {
      id: `sample-${Date.now()}`,
      label,
      member: { ...sampleForge, evs: { ...sampleForge.evs }, config: { ...sampleForge.config }, tuning: { ...sampleForge.tuning } },
    }
    setSavedSamples((prev) => [saved, ...prev])
    setSampleLabelDraft('')
  }

  const applySampleToPartySlot = (slotIdx: number) => {
    const target = party[slotIdx]
    if (!target) return
    const next = [...party]
    next[slotIdx] = {
      ...sampleForge,
      picked: target.picked,
      key: sampleForge.key,
      evs: { ...sampleForge.evs },
      config: { ...sampleForge.config },
      tuning: { ...sampleForge.tuning },
      item: sampleForge.item,
    }
    setParty(next)
    setPartyItemDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[slotIdx] = visibleChampionsItem(sampleForge.key, sampleForge.item)
      return nextDrafts
    })
    const nextSearch = [...partySearch]
    nextSearch[slotIdx] = searchDisplayLabel(sampleForge.key, siteLanguage)
    setPartySearch(nextSearch)
    setSelectedMy(slotIdx)
    setMainSection('single')
    setActiveTab('party')
  }

  const updateTuningEffortFromPointer = (slotIdx: number, stat: EffortStatKey, availableCap: number, clientX: number, element: HTMLDivElement) => {
    const rect = element.getBoundingClientRect()
    if (rect.width <= 0) return
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const nextValue = Math.round(ratio * availableCap)
    const next = [...party]
    next[slotIdx] = { ...next[slotIdx], evs: applyChampionsEffort(next[slotIdx].evs, stat, nextValue) }
    setParty(next)
  }

  const nextOpponentSlotIndex = (fromIdx: number) => {
    const emptyAfter = opponents.findIndex((member, idx) => idx > fromIdx && !member.key)
    if (emptyAfter >= 0) return emptyAfter
    if (fromIdx + 1 < MAX_OPPONENTS) return fromIdx + 1
    return fromIdx
  }

  const commitOpponentQuickSearch = (forcedKey?: string) => {
    const resolvedKey = forcedKey ?? resolveSpeciesKey(opponentQuickSearch, { includeMega: false }) ?? filterSpeciesOptions(opponentQuickSearch, { includeMega: false })[0]?.key
    if (!resolvedKey) return
    const slotIdx = selectedOpp
    const next = [...opponents]
    next[slotIdx] = { ...next[slotIdx], key: resolvedKey, item: normalizeItemForKey(resolvedKey, next[slotIdx].item) }
    setOpponents(next)
    setOpponentItemDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[slotIdx] = displayItemLabel(visibleChampionsItem(resolvedKey, next[slotIdx].item), siteLanguage)
      return nextDrafts
    })
    const nextSearch = [...opponentSearch]
    nextSearch[slotIdx] = searchDisplayLabel(resolvedKey, siteLanguage)
    setOpponentSearch(nextSearch)
    const nextIdx = nextOpponentSlotIndex(slotIdx)
    setSelectedOpp(nextIdx)
    setOpponentQuickSearch('')
    setActiveSearchField({ side: 'opponentQuick', idx: 0 })
    setTimeout(() => opponentQuickInputRef.current?.focus(), 0)
  }

  const resetOpponentsForFreshEntry = () => {
    const next = emptyOpponents.map((entry) => ({ ...entry, revealedMoves: [...entry.revealedMoves] }))
    setOpponents(next)
    setOpponentSearch(next.map(() => ''))
    setOpponentItemDrafts(next.map(() => ''))
    setSelectedOpp(0)
    setOpponentQuickSearch('')
    setTimeout(() => opponentQuickInputRef.current?.focus(), 0)
  }

  const resetPartyForFreshEntry = () => {
    setParty(emptyParty.map((member) => ({ ...member, evs: { ...member.evs }, config: { ...member.config }, tuning: { ...member.tuning } })))
    setPartySearch(emptyParty.map(() => ''))
    setPartyItemDrafts(emptyParty.map(() => ''))
    setSelectedMy(0)
    setActivePartyMetaEditor(null)
    setTuningModalIndex(null)
  }

  const clearPartySlot = (idx: number) => {
    setParty((prev) => prev.map((member, memberIdx) => memberIdx === idx ? { ...emptyParty[idx], evs: { ...emptyParty[idx].evs }, config: { ...emptyParty[idx].config }, tuning: { ...emptyParty[idx].tuning } } : member))
    setPartySearch((prev) => prev.map((value, valueIdx) => valueIdx === idx ? '' : value))
    setPartyItemDrafts((prev) => prev.map((value, valueIdx) => valueIdx === idx ? '' : value))
    setActivePartyMetaEditor((prev) => prev?.idx === idx ? null : prev)
    setActiveMetaListField((prev) => prev && 'idx' in prev && prev.scope === 'party' && prev.idx === idx ? null : prev)
    setActiveItemField((prev) => sameItemField(prev, 'party', idx) ? null : prev)
    setActiveMoveField((prev) => prev?.scope === 'party' && prev.key === party[idx]?.key ? null : prev)
    if (tuningModalIndex === idx) setTuningModalIndex(null)
    if (selectedMy === idx) setSelectedMy(0)
  }

  const resetAll = () => {
    setParty(emptyParty.map((member) => ({ ...member, evs: { ...member.evs }, config: { ...member.config }, tuning: { ...member.tuning } })))
    setPartyItemDrafts(emptyParty.map(() => ''))
    setOpponents(emptyOpponents.map((entry) => ({ ...entry, revealedMoves: [...entry.revealedMoves] })))
    setPartySearch(emptyParty.map(() => ''))
    setOpponentSearch(emptyOpponents.map(() => ''))
    setOpponentItemDrafts(emptyOpponents.map(() => ''))
    setSelectedMy(0)
    setSelectedOpp(0)
    setOpponentQuickSearch('')
    setActivePartyMetaEditor(null)
    setActiveSampleMetaEditor(null)
    setTuningModalIndex(null)
    setMovePower(90)
    setCalcMode('special')
    setStab(1.5)
    setEffectiveness(1)
    setBattleNote('')
    setConfirmedMovesByKey({})
    setMainSection('single')
    setSampleForge(defaultSampleForge())
    setSampleItemDraft(visibleChampionsItem(defaultSampleForge().key, defaultSampleForge().item))
    setSampleSearch(searchDisplayLabel(defaultSampleForge().key, siteLanguage))
    setSavedSamples([])
    setSampleLabelDraft('')
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY)
  }

  const exportState = () => {
    if (typeof window === 'undefined') return
    const payload: ImportExportPayload = {
      version: 1,
      party,
      opponents,
      selectedMy,
      selectedOpp,
      battleNote,
      confirmedMovesByKey,
      mainSection,
      sampleForge,
      savedSamples,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pokemon-champions-state.json'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const importState = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as ImportExportPayload
      const nextParty = sanitizeParty(parsed.party)
      setParty(nextParty)
      setPartyItemDrafts(nextParty.map((member) => displayItemLabel(visibleChampionsItem(member.key, member.item), siteLanguage)))
      const nextOpponents = sanitizeOpponents(parsed.opponents)
      setOpponents(nextOpponents)
      setOpponentItemDrafts(nextOpponents.map((member) => displayItemLabel(visibleChampionsItem(member.key, member.item), siteLanguage)))
      setPartySearch(nextParty.map((member) => searchDisplayLabel(member.key, siteLanguage)))
      setOpponentSearch(nextOpponents.map((member) => searchDisplayLabel(member.key, siteLanguage)))
      setSelectedMy(sanitizeSelectedIndex(parsed.selectedMy, nextParty.length))
      setSelectedOpp(sanitizeSelectedIndex(parsed.selectedOpp, nextOpponents.length))
      setBattleNote(typeof parsed.battleNote === 'string' ? parsed.battleNote : '')
      setConfirmedMovesByKey(parsed.confirmedMovesByKey ?? {})
      setMainSection(parsed.mainSection === 'sample' ? 'sample' : 'single')
      const nextSampleForge = parsed.sampleForge ? sanitizeParty([parsed.sampleForge])[0] ?? defaultSampleForge() : defaultSampleForge()
      setSampleForge(nextSampleForge)
      setSampleItemDraft(displayItemLabel(visibleChampionsItem(nextSampleForge.key, nextSampleForge.item), siteLanguage))
      setSampleSearch(searchDisplayLabel(nextSampleForge.key, siteLanguage))
      setSavedSamples(sanitizeSavedSamples(parsed.savedSamples))
      setSampleLabelDraft('')
    } catch {
      if (typeof window !== 'undefined') window.alert(siteLanguage === 'en' ? 'Import failed: please check the JSON format.' : siteLanguage === 'ja' ? '読み込みに失敗しました。JSON形式を確認してください。' : '불러오기 실패: JSON 형식을 확인하세요.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className="app-shell">
      <header>
        <div className="header-top-row">
          <div className="header-title-row">
            <div className="nav-menu-wrap">
              <button type="button" className="icon-button" aria-label={siteLanguage === 'en' ? 'Menu' : siteLanguage === 'ja' ? 'メニュー' : '메뉴'} title={siteLanguage === 'en' ? 'Menu' : siteLanguage === 'ja' ? 'メニュー' : '메뉴'} onClick={() => setNavMenuOpen((prev) => !prev)}>
                <HamburgerIcon />
              </button>
              {navMenuOpen ? (
                <div className="nav-drawer">
                  <button type="button" className={`nav-item ${mainSection === 'single' ? 'active' : ''}`} onClick={() => { setMainSection('single'); setNavMenuOpen(false) }}>
                    {lt('싱글배틀 메뉴')}
                    <span>{menuLabelForTab(activeTab, siteLanguage)}</span>
                  </button>
                  <button type="button" className={`nav-item ${mainSection === 'sample' ? 'active' : ''}`} onClick={() => { setMainSection('sample'); setNavMenuOpen(false) }}>
                    {lt('포켓몬 샘플 깎기')}
                    <span>{lt('포켓몬 하나 집중 조정')}</span>
                  </button>
                </div>
              ) : null}
            </div>
            <div>
              <h1>Pokemon Champions Battle Assistant Demo</h1>
              <p>{lt('파티 저장, 스피드 비교, 상대 도구 기록, 간단 데미지 계산, 단일 샘플 깎기까지.')}</p>
            </div>
          </div>
          <div className="language-menu-wrap header-language-wrap">
            <button type="button" className="icon-button" aria-label={siteLanguage === 'en' ? 'Choose language' : siteLanguage === 'ja' ? '言語選択' : '언어 선택'} title={siteLanguage === 'en' ? 'Language' : siteLanguage === 'ja' ? '言語' : '언어'} onClick={() => setLanguageMenuOpen((prev) => !prev)}>
              <LanguageIcon />
            </button>
            {languageMenuOpen ? (
              <div className="language-menu">
                <button type="button" className={`language-menu-item ${siteLanguage === 'ko' ? 'active' : ''}`} onClick={() => { setSiteLanguage('ko'); setLanguageMenuOpen(false) }}>한국어</button>
                <button type="button" className={`language-menu-item ${siteLanguage === 'ja' ? 'active' : ''}`} onClick={() => { setSiteLanguage('ja'); setLanguageMenuOpen(false) }}>日本語</button>
                <button type="button" className={`language-menu-item ${siteLanguage === 'en' ? 'active' : ''}`} onClick={() => { setSiteLanguage('en'); setLanguageMenuOpen(false) }}>English</button>
              </div>
            ) : null}
          </div>
        </div>
        <div className="top-actions">
          <button type="button" className="action-button" onClick={exportState}>{lt('상태 내보내기')}</button>
          <button type="button" className="action-button" onClick={() => fileInputRef.current?.click()}>{lt('상태 불러오기')}</button>
          <button type="button" className="action-button danger" onClick={resetAll}>{lt('전체 초기화')}</button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden-file" onChange={importState} />
        </div>
      </header>

      {tuningModalIndex !== null && tuningMember && tuningRow ? (
        <div className="modal-backdrop" onClick={() => setTuningModalIndex(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="row-between modal-header">
              <h2>{lt('노력치 보정')}</h2>
              <button type="button" className="action-button" onClick={() => setTuningModalIndex(null)}>{lt('닫기')}</button>
            </div>
            <div className="modal-grid">
              <label>
                {lt('성격')}
                <select
                  value={tuningMember.config.nature}
                  onChange={(e) => {
                    const next = [...party]
                    next[tuningModalIndex] = {
                      ...next[tuningModalIndex],
                      config: { ...next[tuningModalIndex].config, nature: e.target.value as NatureId },
                    }
                    setParty(next)
                  }}
                >
                  {NATURES.map((nature) => <option key={nature.id} value={nature.id}>{natureLabel(nature.id, siteLanguage)}</option>)}
                </select>
              </label>
            </div>
            <div className="drag-stat-list">
              {EFFORT_STAT_OPTIONS.map((stat) => {
                const currentEffort = tuningMember.evs[stat.key]
                const availableCap = Math.min(CHAMPIONS_EFFORT_PER_STAT_CAP, remainingEffortPoints(tuningMember.evs, stat.key))
                const additionalAvailable = Math.max(0, availableCap - currentEffort)
                const actualValue = partyStatValue(tuningRow, tuningMember, stat.key)
                const isMagicStat = magicCandidate?.stat === stat.key && actualValue % 11 === 0
                const targetEffort = magicCandidate?.stat === stat.key ? magicCandidate.nextEffort : null
                const magicPoints = magicEffortPoints(tuningRow, tuningMember, stat.key)
                return (
                  <div key={`drag-stat-${stat.key}`} className={`drag-stat-card ${statThemeClass(stat.key)} ${isMagicStat ? 'magic' : ''}`}>
                    <div className="row-between">
                      <strong>{lt(stat.label)}</strong>
                      <span>{actualValue}</span>
                    </div>
                    <div className="effort-gauge-wrap" role="group" aria-label={`${lt(stat.label)} effort points`}>
                      <div
                        className={`effort-gauge-track ${statThemeClass(stat.key)}`}
                        onPointerDown={(e) => {
                          e.preventDefault()
                          e.currentTarget.setPointerCapture(e.pointerId)
                          updateTuningEffortFromPointer(tuningModalIndex, stat.key, availableCap, e.clientX, e.currentTarget)
                        }}
                        onPointerMove={(e) => {
                          if ((e.buttons & 1) !== 1) return
                          updateTuningEffortFromPointer(tuningModalIndex, stat.key, availableCap, e.clientX, e.currentTarget)
                        }}
                        onPointerUp={(e) => {
                          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
                        }}
                      >
                        <div className={`effort-gauge-cells ${statThemeClass(stat.key)}`} aria-hidden="true">
                          {Array.from({ length: CHAMPIONS_EFFORT_PER_STAT_CAP }, (_, cellIdx) => {
                            const point = cellIdx + 1
                            const reachable = point <= availableCap
                            const filled = point <= currentEffort
                            const magicPoint = magicPoints.includes(point)
                            const currentPoint = point === currentEffort && currentEffort > 0
                            const checkpointPoint = EFFORT_CHECKPOINTS.includes(point as 11 | 22 | 32)
                            const targetPoint = point === targetEffort
                            return (
                              <span
                                key={`effort-cell-${stat.key}-${point}`}
                                className={[
                                  'effort-gauge-cell',
                                  reachable ? 'reachable' : 'locked',
                                  filled ? 'filled' : '',
                                  magicPoint ? 'magic' : '',
                                  currentPoint ? 'current' : '',
                                  checkpointPoint ? 'checkpoint' : '',
                                  targetPoint ? 'target' : '',
                                ].filter(Boolean).join(' ')}
                                title={`${lt(stat.label)} ${point}pt`}
                              />
                            )
                          })}
                        </div>
                        <input
                          type="range"
                          className="effort-gauge-range"
                          min={0}
                          max={CHAMPIONS_EFFORT_PER_STAT_CAP}
                          step={1}
                          value={currentEffort}
                          onChange={(e) => {
                            const next = [...party]
                            next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, e.target.value) }
                            setParty(next)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                              e.preventDefault()
                              const next = [...party]
                              next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, Math.max(0, currentEffort - 1)) }
                              setParty(next)
                            }
                            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                              e.preventDefault()
                              const next = [...party]
                              next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, Math.min(availableCap, currentEffort + 1)) }
                              setParty(next)
                            }
                          }}
                        />
                        <div className="effort-gauge-hitboxes">
                          {Array.from({ length: CHAMPIONS_EFFORT_PER_STAT_CAP }, (_, cellIdx) => {
                            const point = cellIdx + 1
                            const reachable = point <= availableCap
                            return (
                              <button
                                key={`effort-hitbox-${stat.key}-${point}`}
                                type="button"
                                className="effort-gauge-hitbox"
                                tabIndex={-1}
                                aria-hidden="true"
                                disabled={!reachable}
                                onClick={() => {
                                  const next = [...party]
                                  next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, point) }
                                  setParty(next)
                                }}
                                title={`${lt(stat.label)} ${point}pt`}
                              />
                            )
                          })}
                        </div>
                      </div>
                        <div className={`effort-gauge-scale ${statThemeClass(stat.key)}`}>
                        {EFFORT_CHECKPOINTS.map((checkpoint) => {
                          const checkpointValue = partyStatValue(tuningRow, { ...tuningMember, evs: { ...tuningMember.evs, [stat.key]: checkpoint } }, stat.key)
                          return (
                            <div key={`effort-scale-${stat.key}-${checkpoint}`} className="effort-gauge-scale-item">
                              <span>{checkpoint}pt</span>
                              <small>{stat.key === magicCandidate?.stat ? checkpointValue : ''}</small>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="effort-cell-toolbar">
                      <button
                        type="button"
                        className="mini-action"
                        onClick={() => {
                          const next = [...party]
                          next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, Math.max(0, currentEffort - 1)) }
                          setParty(next)
                        }}
                        disabled={currentEffort <= 0}
                      >-1</button>
                      <button
                        type="button"
                        className="mini-action"
                        onClick={() => {
                          const next = [...party]
                          next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, 0) }
                          setParty(next)
                        }}
                        disabled={currentEffort <= 0}
                      >{lt('최소')}</button>
                      <button
                        type="button"
                        className="mini-action"
                        onClick={() => {
                          const next = [...party]
                          next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, availableCap) }
                          setParty(next)
                        }}
                        disabled={currentEffort >= availableCap}
                      >{lt('최대')}</button>
                      <button
                        type="button"
                        className="mini-action"
                        onClick={() => {
                          const next = [...party]
                          next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, Math.min(availableCap, currentEffort + 1)) }
                          setParty(next)
                        }}
                        disabled={currentEffort >= availableCap}
                      >+1</button>
                    </div>
                    <div className="row-between effort-cell-meta">
                      <span className="muted-inline">{lt('현재')} {currentEffort}pt · {lt('추가 가능')} {additionalAvailable}pt</span>
                      {magicCandidate?.stat === stat.key && targetEffort ? <span className="magic-inline">{lt('목표')} {targetEffort}칸</span> : isMagicStat ? <span className="magic-inline">{lt('11배수 달성')}</span> : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}

      <main className="grid">
        <section className="panel wide">
          <div className="row-between section-head">
            <div>
              <h2>{mainSection === 'single' ? lt('싱글배틀 메뉴') : lt('포켓몬 샘플 깎기')}</h2>
              <p className="muted">{mainSection === 'single' ? lt('기존 파티 관리/상대 엔트리/계산기를 한 메뉴로 묶었습니다.') : lt('포켓몬 하나만 잡고 성격/능력 포인트/샘플 기술을 빠르게 깎는 전용 화면입니다.')}</p>
            </div>
            {mainSection === 'single' ? (
              <div className="battle-flow-nav">
                <div className="battle-flow-diagram">
                  <button type="button" className={`flow-node ${activeTab === 'party' ? 'active' : ''}`} onClick={() => setActiveTab('party')}>{lt('내 파티 관리')}</button>
                  <span className="flow-arrow" aria-hidden="true">→</span>
                  <button type="button" className={`flow-node ${activeTab === 'pick' ? 'active' : ''}`} onClick={() => setActiveTab('pick')}>{lt('상대 엔트리')}</button>
                  <span className="flow-arrow" aria-hidden="true">→</span>
                  <div className="flow-branch-group">
                    <button type="button" className={`flow-node ${activeTab === 'speed' ? 'active' : ''}`} onClick={() => setActiveTab('speed')}>{lt('스피드 계산')}</button>
                    <span className="flow-or">or</span>
                    <button type="button" className={`flow-node ${activeTab === 'power' ? 'active' : ''}`} onClick={() => setActiveTab('power')}>{lt('결정력 계산')}</button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {mainSection === 'single' && (activeTab === 'speed' || activeTab === 'power') ? (
          <section className="panel wide">
            <h2>{lt('파티 한눈 요약')}</h2>
            <div className="team-strip-grid">
              <div>
                <p className="muted">{lt('내 파티')}</p>
                <div className="team-strip">
                  {party.map((member, idx) => {
                    const row = member.key ? (indexByKey.get(member.key) ?? rows[0]) : null
                    return <button key={`team-my-${idx}`} type="button" className={`team-pill ${selectedMy === idx ? 'active' : ''}`} onClick={() => setSelectedMy(idx)}>{row ? displayName(row, siteLanguage) : emptySlotLabel(idx, siteLanguage)}</button>
                  })}
                </div>
              </div>
              <div>
                <p className="muted">{lt('상대 파티')}</p>
                <div className="team-strip">
                  {opponents.map((member, idx) => {
                    const row = member.key ? (indexByKey.get(member.key) ?? rows[0]) : null
                    const label = opponentSearch[idx] || (row ? displayName(row, siteLanguage) : emptySlotLabel(idx, siteLanguage))
                    return <button key={`team-opp-${idx}`} type="button" className={`team-pill enemy ${selectedOpp === idx ? 'active' : ''}`} onClick={() => setSelectedOpp(idx)}>{label}</button>
                  })}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {mainSection === 'single' && activeTab === 'party' ? <section className="panel wide">
          <div className="party-columns party-manage-columns">
            <div className="section-head row-between">
              <h2>{lt('내 파티 관리')}</h2>
              <div className="inline-controls compact-actions">
                <span className="muted-inline">{lt('포켓몬별 기술배치 / 노력치보정')}</span>
                <button type="button" className="action-button danger" onClick={resetPartyForFreshEntry}>{lt('내 파티 초기화')}</button>
              </div>
            </div>
            <div className="entry-grid manage-entry-grid">
              {party.map((member, idx) => {
                const row = member.key ? (indexByKey.get(member.key) ?? rows[0]) : null
                const fixedMegaStone = megaStoneForKey(member.key)
                const currentItem = visibleChampionsItem(member.key, member.item)
                const abilityOptions = row ? displayAbilities(row, siteLanguage) : []
                const activeAbility = member.ability || abilityOptions[0] || defaultAbilityForKey(member.key)
                const memberMoveSet = sampleMoves.find((entry) => entry.key === member.key)
                const memberMovePool = movePoolByKey[member.key]
                const memberMoveOptions = memberMovePool?.moves?.length ? memberMovePool.moves : moveOptionsForEntry(memberMoveSet)
                const findMoveType = (moveName: string) => resolveMoveType(moveName, memberMoveOptions, movePoolByKey)
                const registeredMoves = [...(confirmedMovesByKey[member.key] ?? [])]
                while (registeredMoves.length < 4) registeredMoves.push('')
                return (
                  <div key={`${member.key}-${idx}`} className="card entry-card">
                    <div className="entry-card-top">
                      {row ? <button type="button" className="entry-card-clear-button" aria-label={lt('슬롯 비우기')} onClick={() => clearPartySlot(idx)}>×</button> : null}
                      {row?.sprite ? <img src={row.sprite} alt={displayName(row, siteLanguage)} className="entry-sprite" /> : null}
                      <div className="entry-card-head">
                        <div className="party-card-header">
                          <div className="party-card-title-block">
                            <strong>{row ? displayName(row, siteLanguage) : emptySlotLabel(idx, siteLanguage)}</strong>
                            {row ? <div className="type-line">
                              <span className="type-badge-wrap">{row.types.map((type) => <TypeBadgeImage key={type} type={type} />)}</span>
                            </div> : <p className="muted">{lt('포켓몬을 검색해서 추가하세요.')}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                    {row ? <div className="party-meta-grid" onClick={(e) => e.stopPropagation()}>
                      <div className="party-meta-chip party-meta-chip-editor">
                        <button type="button" className="party-meta-chip-button" onClick={() => setActivePartyMetaEditor((prev) => prev?.idx === idx && prev.field === 'ability' ? null : { idx, field: 'ability' })}>
                          <span>{lt('특성')}</span>
                          <strong>{activeAbility || lt('미선택')}</strong>
                        </button>
                        {activePartyMetaEditor?.idx === idx && activePartyMetaEditor.field === 'ability' ? <div className="party-meta-popover party-meta-option-list" onBlurCapture={(e) => {
                          const nextFocus = e.relatedTarget as Node | null
                          if (!e.currentTarget.contains(nextFocus)) {
                            setActivePartyMetaEditor((prev) => prev?.idx === idx && prev.field === 'ability' ? null : prev)
                            setActiveMetaListField(null)
                          }
                        }}>
                          {abilityOptions.map((ability, optionIdx) => <button
                            key={`party-ability-${member.key}-${ability}`}
                            type="button"
                            ref={optionIdx === 0 ? (el) => { partyAbilityEditorRefs.current[idx] = el as HTMLSelectElement | null } : undefined}
                            autoFocus={optionIdx === 0}
                            className={`party-meta-option ${activeAbility === ability ? 'active' : ''}`}
                            onFocus={() => setActiveMetaListField({ scope: 'party', idx, field: 'ability' })}
                            onMouseDown={() => {
                              const next = [...party]
                              next[idx] = { ...member, ability }
                              setParty(next)
                              setActiveMetaListField(null)
                              setActivePartyMetaEditor(null)
                            }}
                          >{ability}</button>)}
                        </div> : null}
                      </div>
                      <div className="party-meta-chip party-meta-chip-editor wide">
                        <button type="button" className="party-meta-chip-button" onClick={() => setActivePartyMetaEditor((prev) => prev?.idx === idx && prev.field === 'nature' ? null : { idx, field: 'nature' })}>
                          <span>{lt('성격')}</span>
                          <strong>{natureChipLabel(member.config.nature, siteLanguage)}</strong>
                        </button>
                        {activePartyMetaEditor?.idx === idx && activePartyMetaEditor.field === 'nature' ? <div className="party-meta-popover party-meta-option-list" onBlurCapture={(e) => {
                          const nextFocus = e.relatedTarget as Node | null
                          if (!e.currentTarget.contains(nextFocus)) {
                            setActivePartyMetaEditor((prev) => prev?.idx === idx && prev.field === 'nature' ? null : prev)
                            setActiveMetaListField(null)
                          }
                        }}>
                          {NATURES.map((nature, optionIdx) => <button
                            key={nature.id}
                            type="button"
                            ref={optionIdx === 0 ? (el) => { partyNatureEditorRefs.current[idx] = el as HTMLSelectElement | null } : undefined}
                            autoFocus={optionIdx === 0}
                            className={`party-meta-option ${member.config.nature === nature.id ? 'active' : ''}`}
                            onFocus={() => setActiveMetaListField({ scope: 'party', idx, field: 'nature' })}
                            onMouseDown={() => {
                              const next = [...party]
                              next[idx] = { ...member, config: { ...member.config, nature: nature.id as NatureId } }
                              setParty(next)
                              setActiveMetaListField(null)
                              setActivePartyMetaEditor(null)
                            }}
                          >{natureChipLabel(nature.id, siteLanguage)}</button>)}
                        </div> : null}
                      </div>
                      <div className="party-meta-chip party-meta-chip-editor item-meta-chip">
                        <button type="button" className="party-meta-chip-button" onClick={() => setActivePartyMetaEditor((prev) => prev?.idx === idx && prev.field === 'item' ? null : { idx, field: 'item' })}>
                          <span>{lt('도구')}</span>
                          <div className="item-meta-row">
                            <img src={itemSpriteSrc(member.key, currentItem)} alt={displayItemLabel(currentItem || '도구', siteLanguage)} className="item-sprite" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} />
                            <strong>{currentItem ? displayItemLabel(currentItem, siteLanguage) : lt('미선택')}</strong>
                          </div>
                        </button>
                        {activePartyMetaEditor?.idx === idx && activePartyMetaEditor.field === 'item' ? <div className="party-meta-popover">
                          <div className="meta-item-input-row">
                          <input ref={(el) => { partyItemEditorRefs.current[idx] = el }} autoFocus value={fixedMegaStone ? displayItemLabel(fixedMegaStone, siteLanguage) : partyItemDrafts[idx] || ''} placeholder={fixedMegaStone ? lt('메가스톤 고정') : lt('사용 가능 도구 선택')} disabled={Boolean(fixedMegaStone)} onFocus={() => !fixedMegaStone && setActiveItemField({ scope: 'party', idx })} onBlur={() => {
                            setTimeout(() => setActiveItemField((prev) => sameItemField(prev, 'party', idx) ? null : prev), 120)
                            const resolved = resolveItemInput(member.key, partyItemDrafts[idx] || '', siteLanguage)
                            const next = [...party]
                            next[idx] = { ...member, item: resolved }
                            setParty(next)
                            setPartyItemDrafts((prev) => {
                              const nextDrafts = [...prev]
                              nextDrafts[idx] = displayItemLabel(resolved, siteLanguage)
                              return nextDrafts
                            })
                            setTimeout(() => setActivePartyMetaEditor((prev) => prev?.idx === idx && prev.field === 'item' ? null : prev), 120)
                          }} onChange={(e) => {
                            const nextDrafts = [...partyItemDrafts]
                            nextDrafts[idx] = e.target.value
                            setPartyItemDrafts(nextDrafts)
                            setActiveItemField({ scope: 'party', idx })
                          }} onKeyDown={(e) => {
                            if (e.key !== 'Enter') return
                            e.preventDefault()
                            const resolved = resolveItemInput(member.key, partyItemDrafts[idx] || '', siteLanguage)
                            const next = [...party]
                            next[idx] = { ...member, item: resolved }
                            setParty(next)
                            setPartyItemDrafts((prev) => {
                              const nextDrafts = [...prev]
                              nextDrafts[idx] = displayItemLabel(resolved, siteLanguage)
                              return nextDrafts
                            })
                            setActiveItemField(null)
                            setActivePartyMetaEditor(null)
                          }} />
                          {!fixedMegaStone && (partyItemDrafts[idx] || currentItem) ? <button type="button" className="meta-item-clear-button" aria-label="clear item" onMouseDown={(e) => {
                            e.preventDefault()
                            clearPartyItemInput(idx, member)
                          }}>×</button> : null}
                          </div>
                          {!fixedMegaStone && sameItemField(activeItemField, 'party', idx) ? <div className="move-autocomplete-menu">
                            {filterItemOptions(partyItemDrafts[idx] || '', siteLanguage).slice(0, 8).map((item) => (
                              <button key={`party-item-suggest-${idx}-${item}`} type="button" className="move-autocomplete-item item-autocomplete-item" onMouseDown={() => selectPartyItemOption(idx, member, item)}>
                                <span className="move-autocomplete-main">
                                  <img src={itemSpriteSrc(member.key, item)} alt={itemAutocompletePrimaryLabel(item, siteLanguage)} className="item-autocomplete-sprite" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} />
                                  <span className="item-autocomplete-copy">
                                    <strong className="item-autocomplete-title">{itemAutocompletePrimaryLabel(item, siteLanguage)}</strong>
                                    {itemAutocompleteSecondaryLabel(item, siteLanguage) ? <span className="item-autocomplete-sub">{itemAutocompleteSecondaryLabel(item, siteLanguage)}</span> : null}
                                  </span>
                                </span>
                              </button>
                            ))}
                          </div> : null}
                        </div> : null}
                      </div>
                      {memberMovePool?.status === 'loading' ? <div className="move-pool-helper">{lt('기술풀 불러오는 중…')}</div> : null}
                    </div> : null}
                    <label className="species-picker">
                      {lt('종 선택')}
                      <div className="autocomplete" onClick={(e) => e.stopPropagation()}>
                        <input
                          value={partySearch[idx] ?? ''}
                          placeholder={lt('포켓몬 검색')}
                          onFocus={() => setActiveSearchField({ side: 'party', idx })}
                          onBlur={() => setTimeout(() => setActiveSearchField((prev) => sameSearchTarget(prev, 'party', idx) ? null : prev), 120)}
                          onChange={(e) => {
                            const next = [...partySearch]
                            next[idx] = e.target.value
                            setPartySearch(next)
                            setActiveSearchField({ side: 'party', idx })
                          }}
                          onKeyDown={(e) => {
                            if (e.key !== 'Enter') return
                            const committed = commitTopSpeciesOption('party', idx, partySearch[idx] ?? '')
                            if (committed) e.preventDefault()
                          }}
                        />
                        {sameSearchTarget(activeSearchField, 'party', idx) ? (
                          <div className="autocomplete-menu">
                            {filterSpeciesOptions(partySearch[idx] ?? '').slice(0, 8).map((option) => (
                              <button key={option.key} type="button" className="autocomplete-item" onMouseDown={() => selectSpecies('party', idx, option.key)}>
                                {searchDisplayLabel(option.key, siteLanguage)}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </label>
                    {row ? <div className="stat-preview-list">
                      {([
                        ['hp', 'HP'],
                        ['attack', '공격'],
                        ['defense', '방어'],
                        ['spAttack', '특수공격'],
                        ['spDefense', '특수방어'],
                        ['speed', '스피드'],
                      ] as const).map(([field, label]) => (
                        <button key={field} type="button" className={`stat-preview-row stat-preview-button ${statThemeClass(field)}`} onClick={(e) => {
                          e.stopPropagation()
                          setTuningModalIndex(idx)
                        }}>
                          <div className="stat-preview-bar"><span style={{ width: statGaugePercent(partyStatValue(row, member, field)) }} /></div>
                          <span>{lt(label)}</span>
                          <strong>{partyStatValue(row, member, field)}</strong>
                          <span>+{member.evs[field]}</span>
                        </button>
                      ))}
                    </div> : null}
                    {row ? <div className="move-card inline-move-card" onClick={(e) => e.stopPropagation()}>
                      <div className="row-between">
                        <strong>{lt('기술 배치')}</strong>
                        {memberMovePool?.status === 'loading' ? <span className="pick-badge move-pool-status-badge loading">{lt('기술풀 불러오는 중…')}</span> : null}
                      </div>
                      <div className="registered-move-grid">
                        {registeredMoves.map((move, moveIdx) => (
                          <label key={`registered-move-${member.key}-${moveIdx}`} className={`registered-move-slot ${moveTypeThemeClass(findMoveType(move))} ${memberMovePool?.status === 'loading' ? 'move-pool-loading' : ''}`}>
                            <span>{moveIdx + 1}번</span>
                            <input
                              value={move}
                              placeholder={memberMovePool?.status === 'loading' ? lt('기술풀 불러오는 중…') : memberMoveOptions.length ? lt('사용 가능 기술 검색') : lt('기술 입력')}
                              onFocus={() => setActiveMoveField({ key: member.key, slotIdx: moveIdx, scope: 'party' })}
                              onBlur={() => setTimeout(() => setActiveMoveField((prev) => sameMoveField(prev, member.key, moveIdx, 'party') ? null : prev), 120)}
                              onChange={(e) => {
                                setConfirmedMoveSlot(member.key, moveIdx, e.target.value)
                                setActiveMoveField({ key: member.key, slotIdx: moveIdx, scope: 'party' })
                              }}
                              onKeyDown={(e) => {
                                if (e.key !== 'Enter') return
                                const committed = commitTopMoveOption(member.key, moveIdx, move, memberMoveOptions)
                                if (committed) {
                                  e.preventDefault()
                                  setActiveMoveField(null)
                                }
                              }}
                            />
                            {sameMoveField(activeMoveField, member.key, moveIdx, 'party') && memberMoveOptions.length ? (
                              <div className="move-autocomplete-menu">
                                {filterMoveOptions(move, memberMoveOptions).slice(0, 8).map((option) => (
                                  <button key={`party-move-suggest-${member.key}-${moveIdx}-${option.name}`} type="button" className={`move-autocomplete-item ${moveTypeThemeClass(option.type)}`} onMouseDown={() => selectMoveOption(member.key, moveIdx, option.name)}>
                                    <span className="move-autocomplete-main">
                                      {option.type ? <SmallTypeBadgeImage type={option.type} /> : null}
                                      <span>{option.name}</span>
                                    </span>
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </label>
                        ))}
                      </div>
                      {memberMoveSet ? <>
                        <div className="move-chip-wrap">
                          {memberMoveSet.core.map((move) => (
                            <button key={`party-core-${member.key}-${move}`} type="button" className={`move-chip core ${moveTypeThemeClass(findMoveType(move))} ${(confirmedMovesByKey[member.key] ?? []).includes(move) ? 'confirmed' : ''}`} onClick={() => applyMoveToSlot(member.key, move)}>{move}</button>
                          ))}
                          {(memberMoveSet.options ?? []).map((move) => (
                            <button key={`party-opt-${member.key}-${move}`} type="button" className={`move-chip options ${moveTypeThemeClass(findMoveType(move))} ${(confirmedMovesByKey[member.key] ?? []).includes(move) ? 'confirmed' : ''}`} onClick={() => applyMoveToSlot(member.key, move)}>{move}</button>
                          ))}
                          {(memberMoveSet.utility ?? []).map((move) => (
                            <button key={`party-util-${member.key}-${move}`} type="button" className={`move-chip utility ${moveTypeThemeClass(findMoveType(move))} ${(confirmedMovesByKey[member.key] ?? []).includes(move) ? 'confirmed' : ''}`} onClick={() => applyMoveToSlot(member.key, move)}>{move}</button>
                          ))}
                        </div>
                      </> : <p className="muted">{lt('기술 데이터가 없는 포켓몬만 직접 입력합니다.')}</p>}
                    </div> : null}
                  </div>
                )
              })}
            </div>
          </div>
        </section> : null}

        {mainSection === 'single' && activeTab === 'pick' ? <>
        <section className="panel wide">
          <div className="row-between section-head">
            <div>
              <h2>{lt('상대 엔트리')}</h2>
              <p className="muted">{lt('초기화 후 슬롯별 검색창에 한 마리씩 빠르게 채우는 흐름으로 정리했습니다.')}</p>
            </div>
            <div className="pick-summary-badges">
              <span className="pick-badge">{lt('엔트리')} {opponents.length}/6</span>
              <span className="pick-badge enemy">{lt('선출 추정')} {pickedOpponents.length}/3</span>
            </div>
          </div>

          <div className="inline-controls">
            <button type="button" className="action-button danger" onClick={resetOpponentsForFreshEntry}>{lt('상대 엔트리 초기화')}</button>
            <span className="muted-inline">{lt('검색창 하나에서 `검색 → 엔터` 반복으로 순서대로 채웁니다.')}</span>
          </div>

          <div className="quick-opponent-search-bar">
            <label className="species-picker">
              {lt('상대 엔트리 빠른 입력')}
              <div className="autocomplete">
                <input
                  ref={opponentQuickInputRef}
                  value={opponentQuickSearch}
                  placeholder={siteLanguage === 'en' ? `Search slot ${selectedOpp + 1} and press Enter` : siteLanguage === 'ja' ? `${selectedOpp + 1}番スロットを検索してEnter` : `${selectedOpp + 1}번 슬롯 검색 후 엔터`}
                  onFocus={() => setActiveSearchField({ side: 'opponentQuick', idx: 0 })}
                  onBlur={() => setTimeout(() => setActiveSearchField((prev) => sameSearchTarget(prev, 'opponentQuick', 0) ? null : prev), 120)}
                  onChange={(e) => {
                    setOpponentQuickSearch(e.target.value)
                    setActiveSearchField({ side: 'opponentQuick', idx: 0 })
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      commitOpponentQuickSearch()
                    }
                  }}
                />
                {sameSearchTarget(activeSearchField, 'opponentQuick', 0) ? (
                  <div className="autocomplete-menu">
                      {filterSpeciesOptions(opponentQuickSearch, { includeMega: false }).slice(0, 8).map((option) => (
                      <button key={option.key} type="button" className="autocomplete-item" onMouseDown={() => commitOpponentQuickSearch(option.key)}>
                        {searchDisplayLabel(option.key, siteLanguage)}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </label>
            <div className="quick-opponent-hint">
              <strong>{lt('현재 입력 슬롯')}</strong>
              <span>{selectedOpp + 1} / {MAX_OPPONENTS}</span>
            </div>
          </div>

          <div className="pick-slot-row opponent-overview-row">
            {opponents.map((member, idx) => {
              const row = member.key ? (indexByKey.get(member.key) ?? rows[0]) : null
              return (
                <button key={`opp-overview-${member.key}-${idx}`} type="button" className={`pick-slot-card enemy compact ${selectedOpp === idx ? 'active' : ''}`} onClick={() => setSelectedOpp(idx)}>
                  {row?.sprite ? <img src={row.sprite} alt={displayName(row, siteLanguage)} className="pick-slot-sprite" /> : null}
                  <span>{opponentSearch[idx] || (row ? displayName(row, siteLanguage) : emptySlotLabel(idx, siteLanguage))}</span>
                  <small>{member.picked ? lt('추정 체크됨') : lt('미체크')}</small>
                  <small>{member.item ? displayItemLabel(member.item, siteLanguage) : lt('도구 없음')}</small>
                </button>
              )
            })}
          </div>
        </section>

        <section className="panel wide">
          <div className="opponent-detail-layout">
            <div className="opponent-board-grid">
              {opponents.map((member, idx) => {
                const row = member.key ? (indexByKey.get(member.key) ?? rows[0]) : null
                return (
                  <div key={`opp-board-${idx}`} className={`opponent-board-card ${selectedOpp === idx ? 'active' : ''}`} onClick={() => setSelectedOpp(idx)}>
                    {row?.sprite ? <img src={row.sprite} alt={displayName(row, siteLanguage)} className="pick-slot-sprite" /> : null}
                    <strong>{row ? displayName(row, siteLanguage) : emptySlotLabel(idx, siteLanguage)}</strong>
                    <span>{opponentSearch[idx] || lt('포켓몬 미입력')}</span>
                    <span>{member.ability || lt('특성 미기입')}</span>
                    <span>{member.item ? displayItemLabel(member.item, siteLanguage) : lt('도구 미기입')}</span>
                  </div>
                )
              })}
            </div>
            <div className="opponent-detail-panel">
              <div className="entry-card-top">
                {oppMember.key && oppRow.sprite ? <img src={oppRow.sprite} alt={displayName(oppRow, siteLanguage)} className="entry-sprite large" /> : null}
                <div className="entry-card-head">
                  <div className="row-between compact-gap">
                    <strong>{oppMember.key ? displayName(oppRow, siteLanguage) : emptySlotLabel(selectedOpp, siteLanguage)}</strong>
                    <span className={`pick-chip ${oppMember.picked ? 'active' : ''}`}>{oppMember.picked ? lt('선출 추정') : lt('미체크')}</span>
                  </div>
                  {oppMember.key ? <div className="type-badge-wrap">{oppRow.types.map((type) => <TypeBadgeImage key={`${oppRow.key}-${type}`} type={type} />)}</div> : null}
                  <p className="muted">{lt('상세 패널에서 공개 정보를 바로 갱신합니다.')}</p>
                </div>
              </div>
              <div className="opponent-detail-fields">
                <label className="species-picker">
                  {lt('종 선택')}
                  <div className="autocomplete">
                    <input
                      value={opponentSearch[selectedOpp] ?? ''}
                      placeholder={lt('포켓몬 검색')}
                      onFocus={() => setActiveSearchField({ side: 'opponent', idx: selectedOpp })}
                      onBlur={() => setTimeout(() => setActiveSearchField((prev) => sameSearchTarget(prev, 'opponent', selectedOpp) ? null : prev), 120)}
                      onChange={(e) => {
                        const next = [...opponentSearch]
                        next[selectedOpp] = e.target.value
                        setOpponentSearch(next)
                        setActiveSearchField({ side: 'opponent', idx: selectedOpp })
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter') return
                        const committed = commitTopSpeciesOption('opponent', selectedOpp, opponentSearch[selectedOpp] ?? '')
                        if (committed) e.preventDefault()
                      }}
                    />
                    {sameSearchTarget(activeSearchField, 'opponent', selectedOpp) ? (
                      <div className="autocomplete-menu">
                        {filterSpeciesOptions(opponentSearch[selectedOpp] ?? '', { includeMega: false }).slice(0, 8).map((option) => (
                          <button key={option.key} type="button" className="autocomplete-item" onMouseDown={() => selectSpecies('opponent', selectedOpp, option.key)}>
                            {searchDisplayLabel(option.key, siteLanguage)}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </label>
                <label>
                  {lt('도구')}
                  <div className="meta-item-input-row">
                  <input
                    value={opponentItemDrafts[selectedOpp] ?? ''}
                    placeholder={lt('사용 가능 도구 선택')}
                    onFocus={() => setActiveItemField({ scope: 'opponent', idx: selectedOpp })}
                    onChange={(e) => {
                      const nextDrafts = [...opponentItemDrafts]
                      nextDrafts[selectedOpp] = e.target.value
                      setOpponentItemDrafts(nextDrafts)
                      setActiveItemField({ scope: 'opponent', idx: selectedOpp })
                    }}
                    onBlur={() => {
                      setTimeout(() => setActiveItemField((prev) => sameItemField(prev, 'opponent', selectedOpp) ? null : prev), 120)
                      const resolved = resolveItemInput(oppMember.key, opponentItemDrafts[selectedOpp] || '', siteLanguage)
                      const next = [...opponents]
                      next[selectedOpp] = { ...oppMember, item: resolved }
                      setOpponents(next)
                      setOpponentItemDrafts((prev) => {
                        const nextDrafts = [...prev]
                        nextDrafts[selectedOpp] = displayItemLabel(resolved, siteLanguage)
                        return nextDrafts
                      })
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return
                      e.preventDefault()
                      const resolved = resolveItemInput(oppMember.key, opponentItemDrafts[selectedOpp] || '', siteLanguage)
                      const next = [...opponents]
                      next[selectedOpp] = { ...oppMember, item: resolved }
                      setOpponents(next)
                      setOpponentItemDrafts((prev) => {
                        const nextDrafts = [...prev]
                        nextDrafts[selectedOpp] = displayItemLabel(resolved, siteLanguage)
                        return nextDrafts
                      })
                      setActiveItemField(null)
                    }}
                  />
                  {(opponentItemDrafts[selectedOpp] || oppMember.item) ? <button type="button" className="meta-item-clear-button" aria-label="clear item" onMouseDown={(e) => {
                    e.preventDefault()
                    clearOpponentItemInput(selectedOpp)
                  }}>×</button> : null}
                  </div>
                  {sameItemField(activeItemField, 'opponent', selectedOpp) ? <div className="move-autocomplete-menu">
                    {filterItemOptions(opponentItemDrafts[selectedOpp] || '', siteLanguage).slice(0, 8).map((item) => (
                      <button key={`opp-item-suggest-${selectedOpp}-${item}`} type="button" className="move-autocomplete-item item-autocomplete-item" onMouseDown={() => selectOpponentItemOption(selectedOpp, item)}>
                        <span className="move-autocomplete-main">
                          <img src={itemSpriteSrc(oppMember.key, item)} alt={itemAutocompletePrimaryLabel(item, siteLanguage)} className="item-autocomplete-sprite" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} />
                          <span className="item-autocomplete-copy">
                            <strong className="item-autocomplete-title">{itemAutocompletePrimaryLabel(item, siteLanguage)}</strong>
                            {itemAutocompleteSecondaryLabel(item, siteLanguage) ? <span className="item-autocomplete-sub">{itemAutocompleteSecondaryLabel(item, siteLanguage)}</span> : null}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div> : null}
                </label>
                <label>
                  {lt('특성')}
                  <input value={oppMember.ability} placeholder={siteLanguage === 'en' ? 'e.g. Clear Body' : siteLanguage === 'ja' ? '例: クリアボディ' : '예: 클리어바디'} onChange={(e) => {
                    const next = [...opponents]
                    next[selectedOpp] = { ...oppMember, ability: e.target.value }
                    setOpponents(next)
                  }} />
                </label>
                <label>
                  {lt('공개 기술')}
                  <input value={oppMember.revealedMoves.join(', ')} placeholder={siteLanguage === 'en' ? 'e.g. U-turn, Will-O-Wisp' : siteLanguage === 'ja' ? '例: とんぼがえり, おにび' : '예: 유턴, 도깨비불'} onChange={(e) => {
                    const next = [...opponents]
                    next[selectedOpp] = { ...oppMember, revealedMoves: e.target.value.split(',').map((entry) => entry.trim()).filter(Boolean) }
                    setOpponents(next)
                  }} />
                </label>
                <label>
                  {lt('메모')}
                  <textarea value={oppMember.notes} placeholder={siteLanguage === 'en' ? 'e.g. likely physical set' : siteLanguage === 'ja' ? '例: 物理型の可能性高め' : '예: 물리형 가능성 높음'} onChange={(e) => {
                    const next = [...opponents]
                    next[selectedOpp] = { ...oppMember, notes: e.target.value }
                    setOpponents(next)
                  }} />
                </label>
                <div className="inline-controls">
                  <label>
                    {lt('최속 가정')}
                    <input type="checkbox" checked={oppMember.natureBoost} onChange={(e) => {
                      const next = [...opponents]
                      next[selectedOpp] = { ...oppMember, natureBoost: e.target.checked }
                      setOpponents(next)
                    }} />
                  </label>
                  <label>
                    {lt('스카프')}
                    <input type="checkbox" checked={oppMember.scarf} onChange={(e) => {
                      const next = [...opponents]
                      next[selectedOpp] = { ...oppMember, scarf: e.target.checked }
                      setOpponents(next)
                    }} />
                  </label>
                  <label>
                    {lt('랭크')}
                    <select value={oppMember.speedStage} onChange={(e) => {
                      const next = [...opponents]
                      next[selectedOpp] = { ...oppMember, speedStage: clampSpeedStage(e.target.value) }
                      setOpponents(next)
                    }}>
                      {SPEED_STAGE_OPTIONS.map((n) => <option key={n} value={n}>{n >= 0 ? `+${n}` : n}</option>)}
                    </select>
                  </label>
                  <button type="button" className={`pick-chip ${oppMember.picked ? 'active' : ''}`} onClick={() => setOpponents(togglePicked(opponents, selectedOpp))}>
                    {oppMember.picked ? lt('선출 추정 해제') : lt('선출 추정 체크')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel wide">
          <h2>{lt('상대 엔트리 메모')}</h2>
          <textarea
            value={battleNote}
            placeholder={siteLanguage === 'en' ? 'e.g. Dragapult may be Scarf / Rotom revealed Volt Switch / Mimikyu looks like late-game cleaner' : siteLanguage === 'ja' ? '例: ドラパルトはスカーフかも / ロトムはボルチェン公開 / ミミッキュは終盤スイーパー寄り' : '예: 드래펄트 스카프 가능성 높음 / 로토무 볼체 공개 / 미믹큐는 막판 스윕용으로 보임'}
            onChange={(e) => setBattleNote(e.target.value)}
          />
        </section>
        </> : mainSection === 'sample' ? <>
        <section className="panel wide">
          <div className="row-between section-head">
            <h2>{lt('단일 샘플 빌더')}</h2>
            <span className="muted-inline">{displayName(sampleRow, siteLanguage)}</span>
          </div>
          <div className="sample-builder-grid compact-sample-builder-grid">
            <div className="sample-main-card flat-sample-main-card">
              <div className="sample-panel-header sample-panel-header-main">
                <label className="species-picker sample-species-picker">
                {lt('포켓몬 선택')}
                <div className="autocomplete sample-species-search">
                  <input
                    className="sample-species-search-input"
                    value={sampleSearch}
                    placeholder={lt('포켓몬 검색')}
                    onFocus={() => setActiveSearchField({ side: 'sample', idx: 0 })}
                    onBlur={() => setTimeout(() => setActiveSearchField((prev) => sameSearchTarget(prev, 'sample', 0) ? null : prev), 120)}
                    onChange={(e) => {
                      setSampleSearch(e.target.value)
                      setActiveSearchField({ side: 'sample', idx: 0 })
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return
                      const committed = commitTopSpeciesOption('sample', 0, sampleSearch)
                      if (committed) e.preventDefault()
                    }}
                  />
                  {sameSearchTarget(activeSearchField, 'sample', 0) ? (
                    <div className="autocomplete-menu">
                      {filterSpeciesOptions(sampleSearch).slice(0, 8).map((option) => (
                        <button key={option.key} type="button" className="autocomplete-item" onMouseDown={() => selectSpecies('sample', 0, option.key)}>
                          {searchDisplayLabel(option.key, siteLanguage)}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </label>
              <div className="sample-hero sample-hero-attached">
                {sampleRow.sprite ? <img src={sampleRow.sprite} alt={displayName(sampleRow, siteLanguage)} className="entry-sprite large" /> : null}
                <div className="sample-hero-copy">
                  <strong>{displayName(sampleRow, siteLanguage)}</strong>
                  <div className="summary-line">
                    <span className="muted">{displayTypes(sampleRow, siteLanguage).join(' / ')}</span>
                    <span className="type-badge-wrap">{sampleRow.types.map((type) => <TypeBadgeImage key={type} type={type} />)}</span>
                  </div>
                  <div className="pick-summary-badges sample-hero-meta">
                    <span className="pick-badge">{natureChipLabel(sampleForge.config.nature, siteLanguage)}</span>
                    <span className="pick-badge item-badge-inline">
                      <img src={itemSpriteSrc(sampleForge.key, sampleCurrentItem)} alt={displayItemLabel(sampleCurrentItem || '도구', siteLanguage)} className="item-sprite" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} />
                      {sampleCurrentItem ? displayItemLabel(sampleCurrentItem, siteLanguage) : lt('도구 미선택')}
                    </span>
                    <span className="pick-badge">{lt('실수치 스피드')} {partySpeedValue(sampleRow, sampleForge)}</span>
                  </div>
                </div>
              </div>
              </div>
              <details className="sample-drawer sample-meta-drawer">
                <summary className="sample-drawer-summary sample-meta-summary">
                  <span className="sample-meta-summary-label">{lt('세부 편집')}</span>
                  <div className="pick-summary-badges sample-tuning-badges sample-meta-summary-badges">
                    <span className="pick-badge">{sampleAbility || lt('미선택')}</span>
                    <span className="pick-badge">{natureChipLabel(sampleForge.config.nature, siteLanguage)}</span>
                    <span className="pick-badge sample-meta-summary-item">{sampleCurrentItem ? displayItemLabel(sampleCurrentItem, siteLanguage) : lt('도구 미선택')}</span>
                  </div>
                </summary>
              <div className="party-meta-grid sample-meta-grid">
                <div className="party-meta-chip party-meta-chip-editor">
                  <button type="button" className="party-meta-chip-button" onClick={() => setActiveSampleMetaEditor((prev) => prev === 'ability' ? null : 'ability')}>
                    <span>{lt('특성')}</span>
                    <strong>{sampleAbility || lt('미선택')}</strong>
                  </button>
                  {activeSampleMetaEditor === 'ability' ? <div className="party-meta-popover party-meta-option-list" onBlurCapture={(e) => {
                    const nextFocus = e.relatedTarget as Node | null
                    if (!e.currentTarget.contains(nextFocus)) {
                      setActiveSampleMetaEditor((prev) => prev === 'ability' ? null : prev)
                      setActiveMetaListField(null)
                    }
                  }}>
                    {sampleAbilityOptions.map((ability, optionIdx) => <button
                      key={`sample-ability-${sampleForge.key}-${ability}`}
                      type="button"
                      ref={optionIdx === 0 ? (el) => { sampleAbilityEditorRef.current = el as HTMLSelectElement | null } : undefined}
                      autoFocus={optionIdx === 0}
                      className={`party-meta-option ${sampleAbility === ability ? 'active' : ''}`}
                      onFocus={() => setActiveMetaListField({ scope: 'sample', field: 'ability' })}
                      onMouseDown={() => {
                        setSampleForge((prev) => ({ ...prev, ability }))
                        setActiveMetaListField(null)
                        setActiveSampleMetaEditor(null)
                      }}
                    >{ability}</button>)}
                  </div> : null}
                </div>
                <div className="party-meta-chip party-meta-chip-editor wide">
                  <button type="button" className="party-meta-chip-button" onClick={() => setActiveSampleMetaEditor((prev) => prev === 'nature' ? null : 'nature')}>
                    <span>{lt('성격')}</span>
                    <strong>{natureChipLabel(sampleForge.config.nature, siteLanguage)}</strong>
                  </button>
                  {activeSampleMetaEditor === 'nature' ? <div className="party-meta-popover party-meta-option-list" onBlurCapture={(e) => {
                    const nextFocus = e.relatedTarget as Node | null
                    if (!e.currentTarget.contains(nextFocus)) {
                      setActiveSampleMetaEditor((prev) => prev === 'nature' ? null : prev)
                      setActiveMetaListField(null)
                    }
                  }}>
                    {NATURES.map((nature, optionIdx) => <button
                      key={nature.id}
                      type="button"
                      ref={optionIdx === 0 ? (el) => { sampleNatureEditorRef.current = el as HTMLSelectElement | null } : undefined}
                      autoFocus={optionIdx === 0}
                      className={`party-meta-option ${sampleForge.config.nature === nature.id ? 'active' : ''}`}
                      onFocus={() => setActiveMetaListField({ scope: 'sample', field: 'nature' })}
                      onMouseDown={() => {
                        setSampleForge((prev) => ({ ...prev, config: { ...prev.config, nature: nature.id as NatureId } }))
                        setActiveMetaListField(null)
                        setActiveSampleMetaEditor(null)
                      }}
                    >{natureChipLabel(nature.id, siteLanguage)}</button>)}
                  </div> : null}
                </div>
                <div className="party-meta-chip party-meta-chip-editor item-meta-chip">
                  <button type="button" className="party-meta-chip-button" onClick={() => setActiveSampleMetaEditor((prev) => prev === 'item' ? null : 'item')}>
                    <span>{lt('도구')}</span>
                    <div className="item-meta-row">
                      <img src={itemSpriteSrc(sampleForge.key, sampleCurrentItem)} alt={displayItemLabel(sampleCurrentItem || '도구', siteLanguage)} className="item-sprite" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} />
                      <strong>{sampleCurrentItem ? displayItemLabel(sampleCurrentItem, siteLanguage) : lt('미선택')}</strong>
                    </div>
                  </button>
                  {activeSampleMetaEditor === 'item' ? <div className="party-meta-popover">
                    <div className="meta-item-input-row">
                    <input ref={sampleItemEditorRef} autoFocus value={sampleFixedMegaStone ? displayItemLabel(sampleFixedMegaStone, siteLanguage) : sampleItemDraft} placeholder={sampleFixedMegaStone ? lt('메가스톤 고정') : lt('사용 가능 도구 선택')} disabled={Boolean(sampleFixedMegaStone)} onFocus={() => !sampleFixedMegaStone && setActiveItemField({ scope: 'sample', idx: 0 })} onChange={(e) => {
                      setSampleItemDraft(e.target.value)
                      if (!sampleFixedMegaStone) setActiveItemField({ scope: 'sample', idx: 0 })
                    }} onBlur={() => {
                      setTimeout(() => setActiveItemField((prev) => sameItemField(prev, 'sample', 0) ? null : prev), 120)
                      const resolved = resolveItemInput(sampleForge.key, sampleItemDraft, siteLanguage)
                      setSampleForge((prev) => ({ ...prev, item: resolved }))
                      setSampleItemDraft(displayItemLabel(resolved, siteLanguage))
                      setTimeout(() => setActiveSampleMetaEditor((prev) => prev === 'item' ? null : prev), 120)
                    }} onKeyDown={(e) => {
                      if (e.key !== 'Enter') return
                      e.preventDefault()
                      const resolved = resolveItemInput(sampleForge.key, sampleItemDraft, siteLanguage)
                      setSampleForge((prev) => ({ ...prev, item: resolved }))
                      setSampleItemDraft(displayItemLabel(resolved, siteLanguage))
                      setActiveItemField(null)
                      setActiveSampleMetaEditor(null)
                    }} />
                    {!sampleFixedMegaStone && (sampleItemDraft || sampleCurrentItem) ? <button type="button" className="meta-item-clear-button" aria-label="clear item" onMouseDown={(e) => {
                      e.preventDefault()
                      clearSampleItemInput()
                    }}>×</button> : null}
                    </div>
                    {!sampleFixedMegaStone && sameItemField(activeItemField, 'sample', 0) ? <div className="move-autocomplete-menu">
                      {filterItemOptions(sampleItemDraft || '', siteLanguage).slice(0, 8).map((item) => (
                        <button key={`sample-item-suggest-${item}`} type="button" className="move-autocomplete-item item-autocomplete-item" onMouseDown={() => selectSampleItemOption(item)}>
                          <span className="move-autocomplete-main">
                            <img src={itemSpriteSrc(sampleForge.key, item)} alt={itemAutocompletePrimaryLabel(item, siteLanguage)} className="item-autocomplete-sprite" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} />
                            <span className="item-autocomplete-copy">
                              <strong className="item-autocomplete-title">{itemAutocompletePrimaryLabel(item, siteLanguage)}</strong>
                              {itemAutocompleteSecondaryLabel(item, siteLanguage) ? <span className="item-autocomplete-sub">{itemAutocompleteSecondaryLabel(item, siteLanguage)}</span> : null}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div> : null}
                  </div> : null}
                </div>
              </div>
              </details>
              <div className="stat-preview-list sample-stat-preview-list">
                {([
                  ['hp', 'HP'], ['attack', '공격'], ['defense', '방어'], ['spAttack', '특수공격'], ['spDefense', '특수방어'], ['speed', '스피드'],
                ] as const).map(([field, label]) => (
                  <div key={field} className={`stat-preview-row sample-stat-preview-row ${statThemeClass(field)}`}>
                    <div className="sample-stat-topline">
                      <span>{lt(label)}</span>
                      <strong>{partyStatValue(sampleRow, sampleForge, field)}</strong>
                    </div>
                    <div className="stat-preview-bar"><span style={{ width: statGaugePercent(partyStatValue(sampleRow, sampleForge, field)) }} /></div>
                    <span className="sample-stat-ev">+{sampleForge.evs[field]}</span>
                  </div>
                ))}
              </div>
              <details className="sample-drawer sample-tuning-drawer">
                <summary className="sample-drawer-summary sample-tuning-summary">
                  <span className="sample-tuning-summary-label">{lt('노력치 보정')}</span>
                  <div className="pick-summary-badges sample-tuning-badges sample-tuning-summary-badges">
                    <span className="pick-badge">{lt('매직넘버')} {sampleForge.tuning.magicNumber}</span>
                    <span className="pick-badge">{lt('최대치')} {sampleForge.tuning.maxValue}</span>
                    <span className="pick-badge sample-tuning-summary-focus">{sampleTuningFocus.value > 0 ? `${sampleTuningFocus.label} +${sampleTuningFocus.value}` : lt('미지정')}</span>
                  </div>
                </summary>
                <div className="inline-controls sample-tuning-inline sample-tuning-body">
                  <label>
                    {lt('매직넘버')}
                    <input type="number" min={0} max={255} value={sampleForge.tuning.magicNumber} onChange={(e) => setSampleForge((prev) => ({ ...prev, tuning: { ...prev.tuning, magicNumber: clampNonNegativeInt(e.target.value, 255) } }))} />
                  </label>
                  <label>
                    {lt('최대치')}
                    <input type="number" min={0} max={255} value={sampleForge.tuning.maxValue} onChange={(e) => setSampleForge((prev) => ({ ...prev, tuning: { ...prev.tuning, maxValue: clampNonNegativeInt(e.target.value, 255) } }))} />
                  </label>
                </div>
              </details>
            </div>
            <div className="move-card flat-sample-move-card">
              <div className="row-between sample-panel-header sample-panel-header-side">
                <strong>{lt('샘플 기술')}</strong>
                <button type="button" className="action-button sample-quick-button" onClick={() => sampleMoveSet?.core?.[0] && toggleConfirmedMove(sampleForge.key, sampleMoveSet.core[0])}>{lt('코어 1번 체크')}</button>
              </div>
              <div className="sample-save-box flat-sample-save-box">
                <div className="sample-save-head">
                  <div className="sample-save-head-topline">
                    <div className="pick-summary-badges sample-work-badges">
                      <span className="pick-badge">{displayName(sampleRow, siteLanguage)}</span>
                      <span className="pick-badge">{natureChipLabel(sampleForge.config.nature, siteLanguage)}</span>
                    </div>
                    <span className="muted-inline sample-work-draft-label">{sampleLabelDraft.trim() || lt('샘플 이름')}</span>
                  </div>
                  <button type="button" className="action-button sample-flow-button" onClick={() => {
                    applySampleToPartySlot(selectedMy)
                    setTuningModalIndex(selectedMy)
                  }}>{lt('노력치 보정')}</button>
                </div>
                <label className="sample-label-field">
                  <span className="sample-label-caption">{lt('샘플 이름')}</span>
                  <input className="sample-label-input" value={sampleLabelDraft} placeholder={siteLanguage === 'en' ? 'e.g. Jolly Scarf draft' : siteLanguage === 'ja' ? '例: ようきスカーフ案' : '예: 명랑 스카프 정리안'} onChange={(e) => setSampleLabelDraft(e.target.value)} />
                </label>
                <div className="sample-action-row sample-save-action-row">
                  <button type="button" className="action-button sample-save-button" onClick={saveCurrentSample}>{lt('현재 샘플 저장')}</button>
                </div>
                <details className="sample-drawer sample-apply-drawer sample-managed-drawer">
                  <summary className="sample-drawer-summary sample-managed-summary">
                    <span>{lt('파티 슬롯에 적용')}</span>
                    <div className="pick-summary-badges sample-apply-summary-badges">
                      <span className="pick-badge">{siteLanguage === 'en' ? `Slot ${selectedMy + 1}` : siteLanguage === 'ja' ? `${selectedMy + 1}番` : `${selectedMy + 1}번`}</span>
                      <span className="pick-badge sample-apply-current-badge">{displayName(sampleRow, siteLanguage)}</span>
                    </div>
                  </summary>
                  <div className="sample-apply-strip">
                    <div className="team-strip sample-slot-strip">
                      {party.map((member, idx) => {
                        const row = member.key ? (indexByKey.get(member.key) ?? rows[0]) : null
                        return (
                          <button
                            key={`apply-slot-pill-${idx}`}
                            type="button"
                            className={`team-pill ${selectedMy === idx ? 'active' : ''}`}
                            onClick={() => applySampleToPartySlot(idx)}
                          >
                            {siteLanguage === 'en' ? `Slot ${idx + 1}` : siteLanguage === 'ja' ? `${idx + 1}番` : `${idx + 1}번`} · {row ? displayName(row, siteLanguage) : emptySlotLabel(idx, siteLanguage)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </details>
              </div>
              {sampleMoveSet ? (
                <>
                  <div className="sample-tracking-cluster">
                    <div className="sample-track-card sample-track-editor-card">
                      <div className="row-between sample-track-head">
                        <strong>{lt('확정 기술')}</strong>
                        <div className="pick-summary-badges sample-slot-target-badges">
                          {sampleMovePool?.status === 'loading' ? <span className="pick-badge move-pool-status-badge loading">{lt('기술풀 불러오는 중…')}</span> : null}
                          <span className="pick-badge sample-slot-target-badge active">{activeSampleMoveSlotIdx + 1}번 슬롯</span>
                          <span className="pick-badge">{sampleConfirmedMoves.length}/4</span>
                          <button type="button" className="pick-badge sample-slot-clear-badge" onClick={() => clearConfirmedMoveSlot(sampleForge.key, activeSampleMoveSlotIdx)}>{lt('슬롯 비우기')}</button>
                        </div>
                      </div>
                      <div className="registered-move-grid sample-registered-move-grid sample-track-input-grid">
                        {sampleRegisteredMoves.map((move, moveIdx) => (
                          <label key={`sample-registered-move-${sampleForge.key}-${moveIdx}`} className={`registered-move-slot sample-registered-move-slot ${moveTypeThemeClass(sampleMoveType(move))} ${activeSampleMoveSlotIdx === moveIdx ? 'active-target' : ''} ${sampleMovePool?.status === 'loading' ? 'move-pool-loading' : ''}`}>
                            <span>{moveIdx + 1}번</span>
                            <input
                              value={move}
                              placeholder={sampleMovePool?.status === 'loading' ? lt('기술풀 불러오는 중…') : sampleMoveOptions.length ? lt('사용 가능 기술 검색') : lt('기술 입력')}
                              onFocus={() => setActiveMoveField({ key: sampleForge.key, slotIdx: moveIdx, scope: 'sample' })}
                              onBlur={() => setTimeout(() => setActiveMoveField((prev) => sameMoveField(prev, sampleForge.key, moveIdx, 'sample') ? null : prev), 120)}
                              onChange={(e) => {
                                setConfirmedMoveSlot(sampleForge.key, moveIdx, e.target.value)
                                setActiveMoveField({ key: sampleForge.key, slotIdx: moveIdx, scope: 'sample' })
                              }}
                              onKeyDown={(e) => {
                                if (e.key !== 'Enter') return
                                const committed = commitSampleMoveOption(moveIdx, move)
                                if (committed) {
                                  e.preventDefault()
                                }
                              }}
                            />
                            {sameMoveField(activeMoveField, sampleForge.key, moveIdx, 'sample') && sampleMoveOptions.length ? (
                              <div className="move-autocomplete-menu">
                                {filterMoveOptions(move, sampleMoveOptions).slice(0, 8).map((option) => (
                                  <button key={`sample-move-suggest-${sampleForge.key}-${moveIdx}-${option.name}`} type="button" className={`move-autocomplete-item ${moveTypeThemeClass(option.type)}`} onMouseDown={() => selectSampleMoveOption(moveIdx, option.name)}>
                                    <span className="move-autocomplete-main">
                                      {option.type ? <SmallTypeBadgeImage type={option.type} /> : null}
                                      <span>{option.name}</span>
                                    </span>
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </label>
                        ))}
                      </div>
                      {sampleMovePool?.status === 'loading' ? <div className="move-pool-helper sample-move-pool-helper">{lt('기술풀 불러오는 중…')}</div> : null}
                      <div className="sample-confirmed-grid">
                        {Array.from({ length: 4 }).map((_, idx) => {
                          const move = sampleRegisteredMoves[idx]
                          return (
                            <div
                              key={`sample-confirmed-slot-${idx}`}
                              className={`sample-confirmed-slot ${move ? 'filled' : 'empty'} ${move ? moveTypeThemeClass(sampleMoveType(move)) : ''} ${activeSampleMoveSlotIdx === idx ? 'active-target' : ''}`}
                            >
                              <button
                                type="button"
                                className="sample-confirmed-slot-main"
                                onClick={() => setActiveMoveField({ key: sampleForge.key, slotIdx: idx, scope: 'sample' })}
                              >
                                <span className="sample-confirmed-slot-index">{idx + 1}</span>
                                <strong>{move || emptySlotLabel(idx, siteLanguage)}</strong>
                              </button>
                              <div className="sample-confirmed-slot-actions">
                                <button type="button" className="sample-slot-shift-button" onClick={() => shiftConfirmedMoveSlot(sampleForge.key, idx, -1)} disabled={idx === 0}>←</button>
                                <button type="button" className="sample-slot-shift-button" onClick={() => shiftConfirmedMoveSlot(sampleForge.key, idx, 1)} disabled={idx === 3}>→</button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="sample-core-strip">
                      <span className="sample-core-strip-label">{lt('코어 라인')}</span>
                      <div className="pick-summary-badges sample-core-strip-badges">
                        {(sampleMoveSet.core ?? []).map((move) => (
                          <span key={`sample-core-line-${move}`} className={`pick-badge sample-core-line-badge ${moveTypeThemeClass(sampleMoveType(move))} ${sampleConfirmedMoves.includes(move) ? 'confirmed' : ''}`}>{move}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="sample-explorer-cluster">
                    <div className="tab-bar sample-filter-bar">
                      {([
                        ['all', lt('전체')],
                        ['remaining', lt('미확정')],
                        ['locked', lt('확정만')],
                      ] as const).map(([value, label]) => (
                        <button key={`sample-filter-${value}`} type="button" className={`tab-chip sample-filter-chip ${sampleCandidateFilter === value ? 'active' : ''}`} onClick={() => setSampleCandidateFilter(value)}>
                          <span>{label}</span>
                          <strong>{sampleFilterCounts[value]}</strong>
                        </button>
                      ))}
                    </div>
                    <div className="sample-move-bucket-grid">
                      {sampleMoveGroups.length ? sampleMoveGroups.map((group) => {
                      const hasLocked = group.moves.some((move) => sampleConfirmedMoves.includes(move))
                      const shouldOpen = group.key === 'core' || hasLocked || sampleCandidateFilter !== 'all'
                      return (
                        <details key={`sample-group-${group.key}`} className={`sample-move-bucket ${group.tone}`} open={shouldOpen}>
                          <summary className="sample-move-bucket-head sample-move-bucket-summary">
                            <span className={`sample-move-bucket-label ${group.tone}`}>{group.label}</span>
                            <div className="pick-summary-badges sample-group-meta-badges">
                              {group.key === 'core' ? <span className="pick-badge sample-group-meta-accent">HOT</span> : null}
                              <span className="pick-badge sample-group-count-badge">{group.moves.length}</span>
                              <span className="sample-group-open-indicator" aria-hidden="true">⌄</span>
                            </div>
                          </summary>
                          <div className="move-chip-wrap compact sample-bucket-body">
                            {group.moves.map((move) => {
                              const isConfirmed = sampleConfirmedMoves.includes(move)
                              return (
                                <button key={`sample-${group.key}-${move}`} type="button" className={`move-chip sample-candidate-chip ${group.tone} ${moveTypeThemeClass(sampleMoveType(move))} ${isConfirmed ? 'confirmed' : 'open'} ${activeSampleMoveSlotIdx >= 0 ? 'slot-targeted' : ''}`} onClick={() => applySampleCandidateMove(move, activeSampleMoveSlotIdx)}>
                                  <span className={`sample-candidate-status ${isConfirmed ? 'confirmed' : 'open'}`}>{isConfirmed ? '✓' : '○'}</span>
                                  <span className="sample-candidate-name">{move}</span>
                                  {activeSampleMoveSlotIdx >= 0 ? <span className="sample-candidate-target-slot">{activeSampleMoveSlotIdx + 1}</span> : null}
                                </button>
                              )
                            })}
                          </div>
                        </details>
                      )
                      }) : <div className="sample-empty-state">{lt('아직 없음')}</div>}
                    </div>
                  </div>
                  <div className="pick-summary-badges sample-summary-badges compact">
                    <span className="pick-badge">{lt('확정')} {sampleConfirmedMoves.length}/4</span>
                    <span className="pick-badge sample-summary-inline-moves">{sampleConfirmedMoves.join(' · ') || lt('아직 없음')}</span>
                    <span className="pick-badge">{natureLabel(sampleForge.config.nature, siteLanguage)}</span>
                    {sampleForge.item ? <span className="pick-badge summary-item-badge">{displayItemLabel(sampleForge.item, siteLanguage)}</span> : null}
                  </div>
                  {sampleMoveSet.notes?.length ? <details className="sample-drawer sample-notes-drawer">
                    <summary className="sample-drawer-summary sample-notes-summary">
                      <span>{lt('샘플 메모')}</span>
                      <div className="pick-summary-badges sample-notes-summary-badges">
                        <span className="pick-badge sample-notes-latest-badge">{sampleMoveSet.notes[0]}</span>
                        <span className="pick-badge">{sampleMoveSet.notes.length}</span>
                      </div>
                    </summary>
                    <div className="sample-notes-body">
                      <p className="muted sample-notes-copy">{sampleMoveSet.notes.join(' · ')}</p>
                    </div>
                  </details> : null}
                </>
              ) : <p className="muted">{siteLanguage === 'en' ? 'No sample moves are registered for this Pokémon yet.' : siteLanguage === 'ja' ? 'このポケモンにはまだサンプル技が登録されていません。' : '이 포켓몬에 등록된 샘플 기술이 아직 없습니다.'}</p>}
              <details className="saved-sample-list flat-saved-sample-list sample-drawer sample-managed-drawer">
                <summary className="sample-drawer-summary sample-managed-summary">
                  <span>{lt('저장한 샘플')}</span>
                  <div className="pick-summary-badges saved-sample-summary-badges">
                    {savedSamples[0] ? <span className="pick-badge saved-sample-latest-badge">{savedSamples[0].label}</span> : null}
                    <span className="pick-badge">{savedSamples.length}{siteLanguage === 'en' ? '' : siteLanguage === 'ja' ? '件' : '개'}</span>
                  </div>
                </summary>
                <div className="saved-sample-drawer-body">
                {savedSamples.length ? savedSamples.map((entry) => {
                  const savedRow = indexByKey.get(entry.member.key) ?? rows[0]
                  return (
                    <div key={entry.id} className="saved-sample-item">
                      <div>
                        <strong>{entry.label}</strong>
                        <p className="muted">{displayName(savedRow, siteLanguage)} · {natureLabel(entry.member.config.nature, siteLanguage)}{entry.member.item ? ` · ${displayItemLabel(entry.member.item, siteLanguage)}` : ''}</p>
                      </div>
                      <div className="inline-controls">
                        <button type="button" className="pick-chip" onClick={() => {
                          setSampleForge({ ...entry.member, evs: { ...entry.member.evs }, config: { ...entry.member.config }, tuning: { ...entry.member.tuning } })
                          setSampleItemDraft(displayItemLabel(visibleChampionsItem(entry.member.key, entry.member.item), siteLanguage))
                          setSampleSearch(searchDisplayLabel(entry.member.key, siteLanguage))
                          setActiveSampleMetaEditor(null)
                        }}>{lt('불러오기')}</button>
                        <button type="button" className="pick-chip" onClick={() => setSavedSamples((prev) => prev.filter((saved) => saved.id !== entry.id))}>{lt('삭제')}</button>
                      </div>
                    </div>
                  )
                }) : <p className="muted">{lt('아직 저장한 샘플이 없습니다.')}</p>}
                </div>
              </details>
            </div>
          </div>
        </section>
        </> : <>
        {activeTab === 'speed' ? <section className="panel wide">
          <div className="row-between section-head">
            <h2>{lt('내 파티 추월컷')}</h2>
          </div>
          {oppRow ? <>
            <div className="speed-scenario-ladder">
              <div className="speed-compare-head-grid">
                <div className="speed-inline-head">
                  <div className="speed-target-head">
                    {myRow.sprite ? <img src={myRow.sprite} alt={displayName(myRow, siteLanguage)} className="pick-slot-sprite" /> : null}
                    <div>
                      <strong>{displayName(myRow, siteLanguage)}</strong>
                      <div className="pick-summary-badges">
                        <span className="pick-badge">{lt('내 포켓몬')}</span>
                        <span className="pick-badge">{lt('실수치 스피드')} {mySpeed}</span>
                        {myMember.item.includes('스카프') ? <span className="pick-badge icon-badge"><img src={itemSpriteSrc(myMember.key, '구애스카프')} alt={lt('스카프')} className="pick-badge-item-icon" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} /></span> : null}
                        {mySpeedAbilityLine ? <span className="pick-badge subtle">{mySpeedAbilityLine.label} {mySpeedAbilityLine.speed}</span> : null}
                      </div>
                      {myMegaCandidates.length ? <div className="calc-toggle-row">
                        <button type="button" className={`pick-chip ${!calcMyMegaOn ? 'active' : ''}`} onClick={() => setCalcMyMegaOn(false)}>{lt('일반')}</button>
                        <button type="button" className={`pick-chip ${calcMyMegaOn ? 'active' : ''}`} onClick={() => setCalcMyMegaOn(true)}>{lt('메가')}</button>
                      </div> : null}
                    </div>
                  </div>
                </div>
                <div className="speed-ladder-head speed-target-card enemy">
                  <div className="speed-target-head">
                    {oppRow.sprite ? <img src={oppRow.sprite} alt={displayName(oppRow, siteLanguage)} className="pick-slot-sprite" /> : null}
                    <div>
                      <strong>{displayName(oppRow, siteLanguage)}</strong>
                      <div className="pick-summary-badges">
                        <span className="pick-badge enemy">{lt('상대 포켓몬')}</span>
                      </div>
                      {oppMegaCandidates.length ? <div className="calc-toggle-row">
                        <button type="button" className={`pick-chip ${!calcOppMegaOn ? 'active' : ''}`} onClick={() => setCalcOppMegaOn(false)}>{lt('일반')}</button>
                        <button type="button" className={`pick-chip ${calcOppMegaOn ? 'active' : ''}`} onClick={() => setCalcOppMegaOn(true)}>{lt('메가')}</button>
                      </div> : null}
                    </div>
                  </div>
                </div>
              </div>
                <div className="speed-plane-card">
                  <div className="speed-plane-header">
                    <strong>{lt('상대 조건 2차원 비교')}</strong>
                    <span>{lt('기준선')} = {displayName(myRow, siteLanguage)} · {lt('실수치 스피드')} {mySpeed}</span>
                  </div>
                  <div className="speed-plane-board">
                    {speedAxisTicks.map((tick) => (
                      <div key={`speed-tick-${tick}`} className="speed-plane-tick" style={{ top: `${speedAxisTop(tick)}%` }}>
                        <span>{tick}</span>
                      </div>
                    ))}
                    <div className="speed-plane-baseline" style={{ top: `${speedAxisTop(mySpeed)}%` }} />
                    <div className="speed-plane-baseline-label" style={{ top: `${speedAxisTop(mySpeed)}%` }}>{lt('기준선')}</div>
                    {mySpeedAbilityLine ? <>
                      <div className="speed-plane-baseline alt" style={{ top: `${speedAxisTop(mySpeedAbilityLine.speed)}%` }} />
                      <div className="speed-plane-baseline-label alt" style={{ top: `${speedAxisTop(mySpeedAbilityLine.speed)}%` }}>{mySpeedAbilityLine.label}</div>
                    </> : null}
                    {opponentSpeedBands.map((band, idx) => {
                      const minScenario = band.minScenario!
                      const maxScenario = band.maxScenario!
                      const minTop = speedAxisTop(minScenario.speedAtMax)
                      const maxTop = speedAxisTop(maxScenario.speedAtMax)
                      const left = opponentSpeedBands.length === 1 ? 53 : 26 + ((54 / (opponentSpeedBands.length - 1)) * idx)
                      const guideTop = Math.min(maxTop, speedAxisTop(mySpeed))
                      const guideBottom = Math.max(minTop, speedAxisTop(mySpeed))
                      const guideHeight = Math.max(0, guideBottom - guideTop)
                      const rangeClass = maxScenario.speedAtMax < mySpeed ? 'below' : minScenario.speedAtMax > mySpeed ? 'above' : 'cross'
                      return (
                        <div key={`speed-band-${band.id}`} className="speed-plane-band-wrap" style={{ left: `${left}%` }}>
                          {rangeClass !== 'cross' && guideHeight > 0 ? <div className="speed-plane-guide" style={{ top: `${guideTop}%`, height: `${guideHeight}%` }} /> : null}
                          <div className={`speed-plane-range-node ${rangeClass}`} style={{ top: `${maxTop}%`, height: `${Math.max(18, minTop - maxTop)}%` }}>
                            <div className={`speed-plane-range-marker ${band.scarf ? 'item' : band.abilityLabel ? 'ability' : 'base'}`}>
                              {band.scarf ? <img src={itemSpriteSrc('', '구애스카프')} alt={lt('스카프')} className="speed-band-item-icon" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} /> : null}
                              {!band.scarf && !band.abilityLabel ? <span className="speed-plane-range-marker-base-bars" aria-hidden="true"><i /><i /></span> : null}
                              {band.abilityLabel ? <>
                                <span className="speed-plane-range-marker-burst" aria-hidden="true">✦</span>
                                <span>{band.abilityLabel}</span>
                              </> : null}
                            </div>
                            <div className="speed-plane-range-node-head">
                              <span>{lt('최속')}</span>
                              <strong>{maxScenario.speedAtMax}</strong>
                            </div>
                            <div className="speed-plane-range-node-tail">
                              <span>{lt('준속')}</span>
                              <strong>{minScenario.speedAtMax}</strong>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
            </div>
          </> : <div className="speed-empty-box">{lt('선택한 상대 없음')}</div>}
        </section> : null}

        {activeTab === 'power' ? <section className="panel wide">
          <div className="row-between section-head">
            <h2>{lt('간단 데미지 계산')}</h2>
            <div className="pick-summary-badges">
              <span className="pick-badge">{lt('내 기술')}</span>
              <span className="pick-badge enemy">{oppRow ? displayName(oppRow, siteLanguage) : lt('선택한 상대 없음')}</span>
            </div>
          </div>
          <div className="speed-target-panel compare-target-panel damage-compare-panel">
            <div className="speed-target-card">
              <div className="speed-target-head">
                {myRow.sprite ? <img src={myRow.sprite} alt={displayName(myRow, siteLanguage)} className="pick-slot-sprite" /> : null}
                <div>
                  <strong>{displayName(myRow, siteLanguage)}</strong>
                  <div className="pick-summary-badges">
                    <span className="pick-badge">{lt('내 포켓몬')}</span>
                  </div>
                  {myMegaCandidates.length ? <div className="calc-toggle-row">
                    <button type="button" className={`pick-chip ${!calcMyMegaOn ? 'active' : ''}`} onClick={() => setCalcMyMegaOn(false)}>{lt('일반')}</button>
                    <button type="button" className={`pick-chip ${calcMyMegaOn ? 'active' : ''}`} onClick={() => setCalcMyMegaOn(true)}>{lt('메가')}</button>
                  </div> : null}
                </div>
              </div>
            </div>
            <div className="speed-target-card enemy">
              <div className="speed-target-head">
                {oppRow?.sprite ? <img src={oppRow.sprite} alt={displayName(oppRow, siteLanguage)} className="pick-slot-sprite" /> : null}
                <div>
                  <strong>{oppRow ? displayName(oppRow, siteLanguage) : lt('선택한 상대 없음')}</strong>
                  <div className="pick-summary-badges">
                    <span className="pick-badge enemy">{lt('상대 포켓몬')}</span>
                  </div>
                  {oppMegaCandidates.length ? <div className="calc-toggle-row">
                    <button type="button" className={`pick-chip ${!calcOppMegaOn ? 'active' : ''}`} onClick={() => setCalcOppMegaOn(false)}>{lt('일반')}</button>
                    <button type="button" className={`pick-chip ${calcOppMegaOn ? 'active' : ''}`} onClick={() => setCalcOppMegaOn(true)}>{lt('메가')}</button>
                  </div> : null}
                </div>
              </div>
            </div>
          </div>
          <div className="damage-move-panel">
            {registeredDamageMoves.length ? registeredDamageMoves.map((move) => {
              const moveType = resolveMoveType(move, myMoveOptions, movePoolByKey)
              return (
                <button
                  key={`damage-move-${myMember.key}-${move}`}
                  type="button"
                  className={`move-chip core damage-move-chip ${moveTypeThemeClass(moveType)} ${activeDamageMove === move ? 'confirmed' : ''}`}
                  onClick={() => setSelectedDamageMove({ key: myMember.key, move })}
                >
                  {moveType ? <SmallTypeBadgeImage type={moveType} /> : null}
                  <span>{move}</span>
                </button>
              )
            }) : <div className="speed-empty-box">{lt('등록 기술 없음')}</div>}
          </div>
          <div className="pick-summary-badges damage-auto-badges">
            {activeDamageMoveType ? <span className="pick-badge">{lt('자동 타입')} · {TYPE_KO_BY_KEY[activeDamageMoveType] ?? activeDamageMoveType}</span> : null}
            <span className="pick-badge">STAB {activeDamageMoveType ? autoStab : stab}</span>
            <span className="pick-badge">{lt('상성')} {activeDamageMoveType ? autoEffectiveness : effectiveness}x</span>
          </div>
          <div className="preset-row">
            {movePowerPresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className={`preset-chip ${movePower === preset.value ? 'active' : ''}`}
                onClick={() => setMovePower(preset.value)}
              >
                {lt(preset.label)}
              </button>
            ))}
          </div>
          <div className="calc-grid">
            <label>
              {lt('수동 위력')}
              <input type="number" value={movePower} onChange={(e) => setMovePower(Number(e.target.value))} />
            </label>
            <label>
              {lt('수동 분류')}
              <select value={calcMode} onChange={(e) => setCalcMode(e.target.value as CalcMode)}>
                <option value="physical">{lt('물리')}</option>
                <option value="special">{lt('특수')}</option>
              </select>
            </label>
            {!activeDamageMoveType ? <label>
              STAB
              <select value={stab} onChange={(e) => setStab(Number(e.target.value))}>
                <option value={1}>{lt('없음')}</option>
                <option value={1.5}>1.5</option>
                <option value={2}>2.0</option>
              </select>
            </label> : <div className="calc-lock-box">STAB {autoStab}</div>}
            {!activeDamageMoveType ? <label>
              {lt('상성')}
              <select value={effectiveness} onChange={(e) => setEffectiveness(Number(e.target.value))}>
                <option value={0.25}>0.25x</option>
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={4}>4x</option>
              </select>
            </label> : <div className="calc-lock-box">{lt('상성')} {autoEffectiveness}x</div>}
          </div>
          {oppRow && damage ? <div className="damage-box">
            <strong>{displayName(myRow, siteLanguage)}</strong> → <strong>{displayName(oppRow, siteLanguage)}</strong>{activeDamageMove ? ` · ${activeDamageMove}` : ''}
            <p>{damage.min} ~ {damage.max} {siteLanguage === 'en' ? 'damage' : siteLanguage === 'ja' ? 'ダメージ' : '데미지'}</p>
            <p>{damage.minPct}% ~ {damage.maxPct}%</p>
            <p>{Number(damage.maxPct) >= 100 ? lt('확정 1타 가능성 있음') : Number(damage.minPct) >= 50 ? lt('유리한 2타권') : lt('즉시 마무리 어려움')}</p>
          </div> : <div className="damage-box"><p>{lt('상대 엔트리에서 계산 대상 포켓몬을 먼저 채워 주세요.')}</p></div>}
        </section> : null}
        </>}
      </main>
    </div>
  )
}
