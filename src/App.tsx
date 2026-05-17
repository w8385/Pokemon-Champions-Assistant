import React from 'react'
import championsData from './pokemon_champions_verified_data.json'
import championsLearnedMoveMeta from './championsLearnedMoveMeta.json'
import { CHAMPIONS_ITEM_ALIASES, CHAMPIONS_ITEM_OPTIONS, CHAMPIONS_ITEM_SPRITE_MAP, localizedChampionsItemLabel, type ChampionsItem } from './championsItems'
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
  weightKg?: number
  hp: number
  attack: number
  defense: number
  spAttack: number
  spDefense: number
  speed: number
  fast: number
  neutral: number
  uninvested?: number
  scarf_fast: number
  scarf_neutral: number
  types: string[]
  types_ko: string[]
  abilities: string[]
  abilities_ko: string[]
  sprite?: string
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

type SampleSpeedTarget = OpponentState

type SampleDamageTarget = OpponentState & {
  hpEv: number
  defenseEv: number
  spDefenseEv: number
  defenseNature: number
  spDefenseNature: number
  moveName: string
}

type SavedSample = {
  id: string
  label: string
  member: PartyMember
}

type CalcMode = 'physical' | 'special'
type DamageWeather = 'none' | 'sun' | 'rain' | 'sand' | 'snow'
type DamageTerrain = 'none' | 'electric' | 'grassy' | 'psychic' | 'misty'
type OpponentBulkPreset = 'neutral-0' | 'hp-32' | 'phys-32' | 'spdef-32' | 'custom'
type RivalryMode = 'neutral' | 'same' | 'opposite'

type PersistedState = {
  party?: PartyMember[]
  opponents?: OpponentState[]
  selectedMy?: number
  selectedOpp?: number
  calcSwapSides?: boolean
  calcAttackStage?: number
  calcDefenseStage?: number
  calcHitCount?: number
  calcWeather?: DamageWeather
  calcTerrain?: DamageTerrain
  calcBurned?: boolean
  calcCritical?: boolean
  calcAttackerLowHp?: boolean
  calcTargetPoisoned?: boolean
  calcDefenderFullHp?: boolean
  calcMovedAfterTarget?: boolean
  calcFaintedAllies?: number
  calcRivalryMode?: RivalryMode
  calcParentalBond?: boolean
  calcDefenderStatused?: boolean
  calcElectromorphosisCharged?: boolean
  calcReflect?: boolean
  calcLightScreen?: boolean
  calcAuroraVeil?: boolean
  calcFriendGuard?: boolean
  calcTypeChangeStab?: boolean
  calcConditionalPowerValues?: Record<string, ConditionalPowerValue>
  calcOpponentBulkPreset?: OpponentBulkPreset
  calcOpponentHpEv?: number
  calcOpponentDefenseEv?: number
  calcOpponentSpDefenseEv?: number
  calcOpponentDefenseNature?: number
  calcOpponentSpDefenseNature?: number
  battleNote?: string
  confirmedMovesByKey?: Record<string, string[]>
  mainSection?: MainSection
  sampleForge?: PartyMember
  savedSamples?: SavedSample[]
  sampleWorkbenchTab?: SampleWorkbenchTab
  sampleSpeedTargets?: SampleSpeedTarget[]
  sampleDamageTargets?: SampleDamageTarget[]
}

type ImportExportPayload = PersistedState & {
  version: 1
}

type MoveFilter = 'all' | 'core' | 'options' | 'utility'
type SampleCandidateFilter = 'all' | 'remaining' | 'locked'
type MainSection = 'home' | 'single' | 'sample'
type SampleWorkbenchTab = 'builder' | 'speed' | 'damage'
type MainTab = 'party' | 'pick' | 'speed' | 'power'
type SearchFieldTarget = { side: 'party' | 'opponent'; idx: number } | { side: 'sample' | 'opponentQuick'; idx: 0 } | null
type MoveFieldTarget = { key: string; slotIdx: number; scope: 'party' | 'sample' } | null
type ItemFieldTarget = { scope: 'party'; idx: number } | { scope: 'sample'; idx: 0 } | { scope: 'opponent'; idx: number } | null
type MetaListField = { scope: 'party'; idx: number; field: 'ability' | 'nature' } | { scope: 'sample'; field: 'ability' | 'nature' } | null
type SiteLanguage = 'ko' | 'en' | 'ja'
type MoveCategory = CalcMode | 'status'
type MoveOption = { name: string; type: string | null }
type ConditionalPowerValue = number | boolean

type MoveMeta = {
  type: string | null
  category: MoveCategory | null
  power: number | null
  accuracy?: number | null
  hits?: number
  hitPowers?: number[]
  variablePower?: boolean
  usesDefenseAsAttack?: boolean
  targetsDefenseStat?: 'defense' | 'spDefense'
  alwaysCrit?: boolean
  priority?: number
}

const PUNCH_MOVE_NAMES = new Set([
  '그로우펀치', '냉동펀치', '드레인펀치', '마하펀치', '메가톤펀치', '번개펀치',
  '불꽃펀치', '불릿펀치', '섀도펀치', '연속펀치', '잼잼펀치', '제트펀치', '코멧펀치', '폭발펀치', '힘껏펀치',
].map(normalizeSearchText))

const BITE_MOVE_NAMES = new Set([
  '물기', '깨물어부수기', '번개엄니', '불꽃엄니', '얼음엄니', '독엄니', '사이코팽', '아쿠아팽',
].map(normalizeSearchText))

const PULSE_MOVE_NAMES = new Set([
  '대지의파동', '물의파동', '악의파동', '용의파동', '치유파동', '파동탄',
].map(normalizeSearchText))

const SOUND_MOVE_NAMES = new Set([
  '매혹의보이스', '에코보이스', '차밍보이스', '하이퍼보이스', '노래하기', '돌림노래', '멸망의노래', '폭음파',
].map(normalizeSearchText))

const SLICING_MOVE_NAMES = new Set([
  '사이코커터', '아쿠아커터', '에어슬래시', '리프블레이드', '셸블레이드', '솔라블레이드',
  '깜짝베기', '찍찍베기', '풀베기', '성스러운칼', '원념의칼', '시저크로스', '크로스포이즌', '연속자르기', '베어가르기',
].map(normalizeSearchText))

const CONTACT_MOVE_NAMES = new Set([
  '아쿠아브레이크', '애크러뱃', '엄청난힘', '원념의칼', '치근거리기', '용의클로', '플레어드라이브', '인파이트',
].map(normalizeSearchText))

const RECKLESS_MOVE_NAMES = new Set([
  '브레이브버드', '플레어드라이브', '이판사판태클', '볼트태클', '양날박치기', '와일드볼트', '점프킥', '무릎차기', '웨이브태클',
].map(normalizeSearchText))

const SHEER_FORCE_MOVE_NAMES = new Set([
  '10만볼트', '냉동빔', '화염방사', '문포스', '대지의힘', '러스터캐논', '에어슬래시', '오물폭탄', '아쿠아브레이크', '사이코키네시스',
  '섀도볼', '번개', '불대문자', '폭포오르기', '아이언헤드', '스톤에지', '깨물어부수기', '열탕',
].map(normalizeSearchText))
type DamageCalcModifiers = {
  attackMultiplier?: number
  defenseMultiplier?: number
  powerMultiplier?: number
  finalMultiplier?: number
  incomingScreenName?: string | null
  critical?: boolean
  burned?: boolean
}
type BattleStatBlock = {
  hp: number
  attack: number
  defense: number
  spAttack: number
  spDefense: number
}

type OpponentBulkConfig = {
  hpEv: number
  defenseEv: number
  spDefenseEv: number
  defenseNature: number
  spDefenseNature: number
  label: string
}

type OpponentBulkState = {
  hpEv: number
  defenseEv: number
  spDefenseEv: number
  defenseNature: number
  spDefenseNature: number
}
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
    '체력': 'HP', '공격': 'Attack', '방어': 'Defense', '특공': 'Sp. Atk', '특방': 'Sp. Def', '스피드': 'Speed', '특수공격': 'Sp. Atk', '특수방어': 'Sp. Def',
    '내 파티 관리': 'My Party', '상대 엔트리': 'Opponent Entry', '스피드 계산': 'Speed Calc', '결정력 계산': 'Damage Calc',
    '싱글배틀 메뉴': 'Singles Menu', '포켓몬 샘플 깎기': 'Sample Builder', '포켓몬 하나 집중 조정': 'Tune one Pokémon',
    '홈': 'Home', '정식 배포 준비': 'Release Prep', '모드 선택': 'Choose Mode', '홈페이지에서 시작할 메뉴를 고르세요.': 'Choose where to start from the homepage.', '싱글배틀': 'Singles Battle', '샘플 빌더': 'Sample Builder', '파티·상대 엔트리·스피드·결정력까지 한 흐름으로 관리합니다.': 'Manage party, opponent entry, speed, and damage in one flow.', '단일 포켓몬 샘플을 저장 가능한 작업 단위로 정리합니다.': 'Build and save a single Pokémon sample with its full setup.', '포켓몬 챔피언스 싱글 배틀에서 파티·선출·스피드·결정력을 한 번에 정리합니다.': 'Organize party, picks, speed, and damage for Pokémon Champions singles in one place.', '들어가기': 'Open', '현재 화면': 'Current View', '확정 기술 수': 'Locked Moves', '저장 샘플 수': 'Saved Samples', '샘플 개요': 'Sample Overview', '구성': 'Sections', '기본 정보': 'Basics', '기술 구성': 'Moves', '저장/적용': 'Save/Apply', '노력치 합': 'Total EVs', '파티 슬롯': 'Party Slot', '설정': 'Settings', '데이터 관리': 'Manage Data', '기준 빌드': 'Current Build', '샘플 빌드 기준으로 자동 반영': 'Auto-applies from the current sample build', '현재 기술 기준': 'Based on current move', '공격 EV': 'Attack EV', '특공 EV': 'Sp. Atk EV', '언어': 'Language', '프로젝트 링크': 'Project Links', 'GitHub 저장소': 'GitHub Repository', '연락 이메일': 'Contact Email', '버그 제보': 'Report a Bug', '폼으로 제보하기': 'Open Form', '저작권 및 안내': 'Copyright & Notice', '참고 데이터베이스': 'Referenced Databases', '포켓몬 관련 명칭과 이미지에 대한 권리는 각 권리자에게 있으며, 이 프로젝트는 비공식 팬메이드 도구입니다.': 'Rights to Pokémon-related names and images belong to their respective owners. This project is an unofficial fan-made tool.', '포켓몬 및 관련 명칭은 각 권리자에게 귀속됩니다. 이 프로젝트는 비공식 팬메이드 도구입니다.': 'Pokémon and related names belong to their respective rights holders. This project is an unofficial fan-made tool.',
    '파티 저장, 스피드 비교, 상대 도구 기록, 간단 데미지 계산, 단일 샘플 깎기까지.': 'Party save, speed checks, opponent item notes, quick damage calc, and single sample building.',
    '상태 내보내기': 'Export State', '상태 불러오기': 'Import State', '전체 초기화': 'Reset All', '노력치 보정': 'Effort Adjustment', '닫기': 'Close', '성격': 'Nature', '백업 저장': 'Save Backup', '백업 불러오기': 'Load Backup', '전체 데이터 초기화': 'Reset All Data', '현재 작업 상태를 JSON으로 저장': 'Save current workspace as JSON', '저장한 JSON 상태 파일을 불러오기': 'Load a saved JSON state file', '파티·상대·샘플을 전부 초기화': 'Reset party, opponent, and samples',
    '최소': 'Min', '최대': 'Max', '무보정': 'Neutral', '목표': 'Target', '11배수 달성': '11x reached',
    '기존 파티 관리/상대 엔트리/계산기를 한 메뉴로 묶었습니다.': 'Party management, opponent entry, and calculators are grouped into one menu.',
    '포켓몬 하나만 잡고 성격/능력 포인트/샘플 기술을 빠르게 깎는 전용 화면입니다.': 'A dedicated screen for tuning one Pokémon fast with nature, stat points, and sample moves.',
    '파티 한눈 요약': 'Party Overview', '내 파티': 'My Party', '상대 파티': 'Opponent Party',
    '포켓몬별 기술배치 / 노력치보정': 'Per-Pokémon move setup / effort tuning', '내 파티 초기화': 'Reset My Party', '포켓몬을 검색해서 추가하세요.': 'Search a Pokémon to add it.',
    '특성': 'Ability', '미선택': 'Unselected', '특성 검색': 'Search ability', '도구': 'Item', '메가스톤 고정': 'Mega Stone locked', '사용 가능 도구 선택': 'Choose allowed item', '사용 가능 특성 선택': 'Choose listed ability', '포켓몬 먼저 선택': 'Choose Pokémon first',
    '종 선택': 'Species', '포켓몬 검색': 'Search Pokémon', '기술 배치': 'Move Set', '기술풀 불러오는 중…': 'Loading move pool…', '사용 가능 기술 검색': 'Search legal moves', '기술 입력': 'Enter move',
    '시드': 'Seeded', '검증중': 'Verifying',
    '기술 데이터가 없는 포켓몬만 직접 입력합니다.': 'Only Pokémon without move data need manual input.',
    '상대 엔트리 초기화': 'Reset Opponent Entry', '검색창 하나에서 `검색 → 엔터` 반복으로 순서대로 채웁니다.': 'Fill slots in order by repeating `search → Enter` in one box.',
    '상대 엔트리 빠른 입력': 'Quick Opponent Entry', '현재 입력 슬롯': 'Current Slot', '추정 체크됨': 'Picked', '미체크': 'Unchecked', '도구 없음': 'No item', '포켓몬 미입력': 'No Pokémon', '특성 미기입': 'No ability', '도구 미기입': 'No item', '선출 추정': 'Picked guess', '상세 패널에서 공개 정보를 바로 갱신합니다.': 'Update revealed info directly in the detail panel.',
    '공개 기술': 'Revealed moves', '메모': 'Notes', '최속 가정': 'Max Speed', '스카프': 'Scarf', '랭크': 'Stage', '선출 추정 해제': 'Unmark picked', '선출 추정 체크': 'Mark picked',
    '상대 엔트리 메모': 'Opponent Notes', '단일 샘플 빌더': 'Single Sample Builder', '포켓몬 선택': 'Choose Pokémon', '도구 미선택': 'No item selected', '실수치 스피드': 'Actual Speed',
    '샘플 기술': 'Sample Moves', '샘플 빌드': 'Sample Build', '샘플 스피드': 'Sample Speed', '샘플 딜계산': 'Sample Damage', '비교 대상 없음': 'No comparison targets', '선출 추정된 상대를 비교 대상으로 사용': 'Use picked opponents as comparison targets', '내 파티 관리처럼 직접 기술을 등록': 'Register moves directly like party management', '공격 비교': 'Offense Comparison', '내구 비교': 'Bulk Comparison', '상대 첫 공개 기술 기준': 'Uses each target\'s first revealed move', '샘플 현재 속도선': 'Sample speed line', '스피드 조건': 'Speed Conditions', '기본': 'Base', '특성 발동': 'Ability Triggered', '특성+스카프': 'Ability + Scarf', '스피드 EV': 'Speed EV', '속도 구간': 'Speed Range', '실시간 조정': 'Live tuning', '코어 1번 체크': 'Check Core #1', '샘플 이름': 'Sample Name', '현재 샘플 저장': 'Save Current Sample', '파티 슬롯에 적용': 'Apply to Party Slot', '확정': 'Confirmed', '확정 기술': 'Locked Moves', '코어': 'Core', '선택': 'Options', '유틸': 'Utility', '코어 라인': 'Core Line', '세부 편집': 'Detail Edit', '샘플 메모': 'Sample Notes', '전체': 'All', '미확정': 'Open', '확정만': 'Locked only', '아직 없음': 'None yet', '매직넘버': 'Magic number', '최대치': 'Max value', '미지정': 'Unset', '저장한 샘플': 'Saved Samples', '불러오기': 'Load', '삭제': 'Delete', '슬롯 비우기': 'Clear slot', '아직 저장한 샘플이 없습니다.': 'No saved samples yet.',
    '엔트리': 'Entry', '초기화 후 슬롯별 검색창에 한 마리씩 빠르게 채우는 흐름으로 정리했습니다.': 'Designed for fast one-by-one slot entry after reset.',
    '간단 데미지 계산': 'Quick Damage Calc', '상대 엔트리에서 고른 포켓몬의 도구/특성/공개 기술 메모와 같은 슬롯을 계산기가 그대로 따라갑니다.': 'The calculator mirrors the same slot and revealed info from opponent entry.', '내 기술': 'My Move', '등록 기술 없음': 'No registered moves', '수동 위력': 'Manual Power', '수동 분류': 'Manual Category', '자동 타입': 'Auto Type', '자동 위력': 'Auto Power', '자동 분류': 'Auto Category', '상대 무게에 따라 위력이 바뀌는 기술이라 직접 입력이 필요함': 'This move changes power based on target weight, so enter power manually', '상대 무게에 따라 위력이 자동 반영됨': 'Power updates automatically from the target weight', '명중 횟수에 따라 총위력이 바뀌는 기술이라 직접 입력이 필요함': 'This move changes total power based on hit count, so enter power manually', '연속타 누적 위력 기술이라 직접 입력이 필요함': 'This move has escalating multi-hit power, so enter power manually', '특정 조건에 따라 위력이 자동 반영됨': 'Power updates automatically from the selected condition', '위력 조건': 'Power condition', '타입변환 자속': 'Type-change STAB', '공격측 HP 1/3 이하': 'Attacker HP at or below 1/3', '상대 독/맹독': 'Target is poisoned', '상대 HP 만땅': 'Target at full HP', '상대보다 늦게 행동': 'Move after target', '기절한 아군 수': 'Number of fainted allies', '라이벌리 성별 관계': 'Rivalry gender relation', '같은 성별': 'Same gender', '다른 성별': 'Different gender', '부자유친 발동': 'Parental Bond active', '상대 상태이상': 'Target is statused', '일렉트릭 차지됨': 'Electromorphosis charged', '공수전환': 'Swap offense/defense', '공격측': 'Attacker', '방어측': 'Defender', '상대 기술 추가': 'Add opponent move', '추가': 'Add', '공격측 화력 랭크': 'Attacker offense stage', '방어측 내구 랭크': 'Defender bulk stage', '방어측은 내 파티 실수치를 사용함': 'Defender uses exact party battle stats', '내 쓰러진 포켓몬 수': 'Number of my fainted Pokémon', '내 능력 상승 랭크 합': 'Total of my positive stat stages', '내가 상태이상임': 'I am statused', '상대가 상태이상임': 'Target is statused', '이번 턴 먼저 맞음': 'Moved after taking a hit this turn', '타수': 'Hits', '총위력': 'Total Power', '급소': 'Critical Hit', '변화기는 데미지 계산 대상이 아님': 'Status moves do not deal direct damage', '내 화력 랭크': 'My Offensive Stage', '상대 내구 랭크': 'Opponent Defensive Stage', '상대 기본 내구 가정': 'Opponent bulk assumption', '상대 내구 프리셋': 'Opponent bulk preset', '직접 조절': 'Custom', '상대 HP': 'Opponent HP', '상대 물방': 'Opponent Def', '상대 특방': 'Opponent SpD', '+방어 성격': '+Defense nature', '+특방 성격': '+Sp. Def nature', '화력 조건': 'Offense conditions', '전장 조건': 'Field conditions', '상대 내구': 'Opponent bulk', '화상': 'Burn', '날씨': 'Weather', '필드': 'Terrain', '리플렉터': 'Reflect', '빛의장막': 'Light Screen', '오로라베일': 'Aurora Veil', '프렌드가드': 'Friend Guard', '쾌청': 'Sun', '비': 'Rain', '모래바람': 'Sand', '싸라기눈': 'Snow', '일렉트릭필드': 'Electric Terrain', '그래스필드': 'Grassy Terrain', '사이코필드': 'Psychic Terrain', '미스트필드': 'Misty Terrain',
    '내 파티 추월컷': 'My Team Speed Cutoffs', '상대 기준': 'Opponent Target', '기준 속도': 'Target Speed', '추월컷': 'Pass', '동속컷': 'Tie', '이미 추월': 'Already ahead', '불가': 'No line', '실전 상태': 'Battle State', '내가 앞섬': 'Ahead', '상대가 앞섬': 'Behind', '동속': 'Tie', '일반': 'Base', '메가': 'Mega', '내 포켓몬': 'My Pokémon', '상대 포켓몬': 'Opponent Pokémon', '기준선': 'Baseline',
    '준속': 'Neutral', '최속': 'Fast', '상한': 'Upper', '하한': 'Lower', '준속 스카프': 'Neutral Scarf', '최속 스카프': 'Fast Scarf', '선택한 상대 없음': 'No opponent selected',
    '위력': 'Power', '공격분류': 'Category', '물리': 'Physical', '특수': 'Special', '없음': 'None', '상성': 'Effectiveness', '확정 1타 가능성 있음': 'Possible OHKO', '유리한 2타권': 'Favorable 2HKO', '즉시 마무리 어려움': 'Hard to finish immediately', '상대 엔트리에서 계산 대상 포켓몬을 먼저 채워 주세요.': 'Fill an opponent target first.',
    '빈 슬롯': 'Empty Slot', '현재': 'Current', '추가 가능': 'Available', '파티 관리': 'Party',
    '노력': 'Hardy', '외로움': 'Lonely', '용감': 'Brave', '고집': 'Adamant', '개구쟁이': 'Naughty', '대담': 'Bold', '온순': 'Docile', '무사태평': 'Relaxed', '장난꾸러기': 'Impish', '촐랑': 'Lax', '겁쟁이': 'Timid', '성급': 'Hasty', '성실': 'Serious', '명랑': 'Jolly', '천진난만': 'Naive', '조심': 'Modest', '의젓': 'Mild', '냉정': 'Quiet', '수줍음': 'Bashful', '덜렁': 'Rash', '차분': 'Calm', '얌전': 'Gentle', '건방': 'Sassy', '신중': 'Careful', '변덕': 'Quirky',
  },
  ja: {
    '체력': 'HP', '공격': '攻撃', '방어': '防御', '특공': '特攻', '특방': '特防', '스피드': '素早さ', '특수공격': '特攻', '특수방어': '特防',
    '내 파티 관리': '自分のパーティ', '상대 엔트리': '相手エントリー', '스피드 계산': '素早さ計算', '결정력 계산': '火力計算',
    '싱글배틀 메뉴': 'シングルバトルメニュー', '포켓몬 샘플 깎기': 'ポケモンサンプル調整', '포켓몬 하나 집중 조정': '1匹を集中調整',
    '홈': 'ホーム', '정식 배포 준비': '正式リリース準備', '모드 선택': 'モード選択', '홈페이지에서 시작할 메뉴를 고르세요.': 'ホームから始めるメニューを選んでください。', '싱글배틀': 'シングルバトル', '샘플 빌더': 'サンプルビルダー', '파티·상대 엔트리·스피드·결정력까지 한 흐름으로 관리합니다.': 'パーティ・相手エントリー・素早さ・火力まで一つの流れで管理します。', '단일 포켓몬 샘플을 저장 가능한 작업 단위로 정리합니다.': '単体ポケモンサンプルを構成ごと保存できる形で整理します。', '포켓몬 챔피언스 싱글 배틀에서 파티·선출·스피드·결정력을 한 번에 정리합니다.': 'ポケモンチャンピオンズのシングルバトル向けに、パーティ・選出・素早さ・火力をまとめて整理できます。', '들어가기': '開く', '현재 화면': '現在の画面', '확정 기술 수': '確定技数', '저장 샘플 수': '保存サンプル数', '샘플 개요': 'サンプル概要', '구성': '構成', '기본 정보': '基本情報', '기술 구성': '技構成', '저장/적용': '保存/適用', '노력치 합': '努力値合計', '파티 슬롯': 'パーティスロット', '설정': '設定', '데이터 관리': 'データ管理', '기준 빌드': '基準ビルド', '샘플 빌드 기준으로 자동 반영': '現在のサンプル構成を自動反映', '현재 기술 기준': '現在の技基準', '공격 EV': '攻撃EV', '특공 EV': '特攻EV', '언어': '言語', '프로젝트 링크': 'プロジェクトリンク', 'GitHub 저장소': 'GitHub リポジトリ', '연락 이메일': '連絡先メール', '버그 제보': 'バグ報告', '폼으로 제보하기': 'フォームを開く', '저작권 및 안내': '著作権と案内', '참고 데이터베이스': '参照データベース', '포켓몬 관련 명칭과 이미지에 대한 권리는 각 권리자에게 있으며, 이 프로젝트는 비공식 팬메이드 도구입니다.': 'ポケモン関連の名称と画像の権利は各権利者に帰属します。このプロジェクトは非公式のファンメイドツールです。', '포켓몬 및 관련 명칭은 각 권리자에게 귀속됩니다. 이 프로젝트는 비공식 팬메이드 도구입니다.': 'ポケモンおよび関連名称は各権利者に帰属します。このプロジェクトは非公式のファンメイドツールです。',
    '파티 저장, 스피드 비교, 상대 도구 기록, 간단 데미지 계산, 단일 샘플 깎기까지.': 'パーティ保存、素早さ比較、相手持ち物記録、簡易ダメ計、単体サンプル調整まで対応。',
    '상태 내보내기': '状態を書き出し', '상태 불러오기': '状態を読み込み', '전체 초기화': '全体リセット', '노력치 보정': '努力値補正', '닫기': '閉じる', '성격': '性格', '백업 저장': 'バックアップ保存', '백업 불러오기': 'バックアップ読込', '전체 데이터 초기화': '全データ初期化', '현재 작업 상태를 JSON으로 저장': '現在の作業状態をJSONで保存', '저장한 JSON 상태 파일을 불러오기': '保存したJSON状態ファイルを読み込む', '파티·상대·샘플을 전부 초기화': 'パーティ・相手・サンプルをすべて初期化',
    '최소': '最小', '최대': '最大', '무보정': '補正なし', '목표': '目標', '11배수 달성': '11倍数達成',
    '기존 파티 관리/상대 엔트리/계산기를 한 메뉴로 묶었습니다.': 'パーティ管理・相手エントリー・計算機を1つのメニューにまとめました。',
    '포켓몬 하나만 잡고 성격/능력 포인트/샘플 기술을 빠르게 깎는 전용 화면입니다.': '1匹だけを対象に、性格・能力ポイント・サンプル技を素早く調整する専用画面です。',
    '파티 한눈 요약': 'パーティ一覧', '내 파티': '自分のパーティ', '상대 파티': '相手パーティ',
    '포켓몬별 기술배치 / 노력치보정': 'ポケモンごとの技構成 / 努力値調整', '내 파티 초기화': '自分のパーティを初期化', '포켓몬을 검색해서 추가하세요.': 'ポケモンを検索して追加してください。',
    '특성': '特性', '미선택': '未選択', '특성 검색': '特性検索', '도구': '持ち物', '메가스톤 고정': 'メガストーン固定', '사용 가능 도구 선택': '使用可能な持ち物を選択', '사용 가능 특성 선택': '使用可能な特性を選択', '포켓몬 먼저 선택': '先にポケモンを選択',
    '종 선택': 'ポケモン', '포켓몬 검색': 'ポケモン検索', '기술 배치': '技構成', '기술풀 불러오는 중…': '技プール読み込み中…', '사용 가능 기술 검색': '使用可能な技を検索', '기술 입력': '技入力',
    '시드': 'シード', '검증중': '検証中',
    '기술 데이터가 없는 포켓몬만 직접 입력합니다.': '技データのないポケモンだけ手入力します。',
    '상대 엔트리 초기화': '相手エントリー初期化', '검색창 하나에서 `검색 → 엔터` 반복으로 순서대로 채웁니다.': '1つの検索欄で `検索 → Enter` を繰り返して順番に埋めます。',
    '상대 엔트리 빠른 입력': '相手エントリー高速入力', '현재 입력 슬롯': '現在の入力スロット', '추정 체크됨': '選出想定', '미체크': '未チェック', '도구 없음': '持ち物なし', '포켓몬 미입력': 'ポケモン未入力', '특성 미기입': '特性未入力', '도구 미기입': '持ち物未入力', '선출 추정': '選出想定', '상세 패널에서 공개 정보를 바로 갱신합니다.': '詳細パネルで公開情報をすぐ更新できます。',
    '공개 기술': '公開技', '메모': 'メモ', '최속 가정': '最速想定', '스카프': 'スカーフ', '랭크': 'ランク', '선출 추정 해제': '選出想定を解除', '선출 추정 체크': '選出想定をチェック',
    '상대 엔트리 메모': '相手エントリーメモ', '단일 샘플 빌더': '単体サンプルビルダー', '포켓몬 선택': 'ポケモン選択', '도구 미선택': '持ち物未選択', '실수치 스피드': '実数値素早さ',
    '샘플 기술': 'サンプル技', '샘플 빌드': 'サンプルビルド', '샘플 스피드': 'サンプル素早さ', '샘플 딜계산': 'サンプル火力', '비교 대상 없음': '比較対象なし', '선출 추정된 상대를 비교 대상으로 사용': '選出想定の相手を比較対象として使用', '내 파티 관리처럼 직접 기술을 등록': 'パーティ管理のように直接技を登録', '공격 비교': '火力比較', '내구 비교': '耐久比較', '상대 첫 공개 기술 기준': '各相手の最初の公開技を使用', '샘플 현재 속도선': 'サンプル速度ライン', '스피드 조건': '素早さ条件', '기본': '基本', '특성 발동': '特性発動', '특성+스카프': '特性+スカーフ', '스피드 EV': '素早さ努力値', '속도 구간': '速度帯', '실시간 조정': 'リアルタイム調整', '코어 1번 체크': 'コア1をチェック', '샘플 이름': 'サンプル名', '현재 샘플 저장': '現在のサンプルを保存', '파티 슬롯에 적용': 'パーティスロットに適用', '확정': '確定', '확정 기술': '確定技', '코어': 'コア', '선택': '候補', '유틸': '補助', '코어 라인': 'コアライン', '세부 편집': '詳細編集', '샘플 메모': 'サンプルメモ', '전체': '全部', '미확정': '未確定', '확정만': '確定のみ', '아직 없음': 'まだなし', '매직넘버': 'マジックナンバー', '최대치': '最大値', '미지정': '未指定', '저장한 샘플': '保存したサンプル', '불러오기': '読み込み', '삭제': '削除', '슬롯 비우기': 'スロットを空にする', '아직 저장한 샘플이 없습니다.': '保存したサンプルがまだありません。',
    '엔트리': 'エントリー', '초기화 후 슬롯별 검색창에 한 마리씩 빠르게 채우는 흐름으로 정리했습니다.': '初期化後、スロットごとの検索で1匹ずつ素早く埋める流れに整理しました。',
    '간단 데미지 계산': '簡易ダメージ計算', '상대 엔트리에서 고른 포켓몬의 도구/특성/공개 기술 메모와 같은 슬롯을 계산기가 그대로 따라갑니다.': '相手エントリーで選んだポケモンの持ち物・特性・公開技メモと同じスロットを計算機がそのまま追従します。', '내 기술': '自分の技', '등록 기술 없음': '登録技なし', '수동 위력': '手動威力', '수동 분류': '手動分類', '자동 타입': '自動タイプ', '자동 위력': '自動威力', '자동 분류': '自動分類', '상대 무게에 따라 위력이 바뀌는 기술이라 직접 입력이 필요함': '相手の重さで威力が変わる技のため手動入力が必要', '상대 무게에 따라 위력이 자동 반영됨': '相手の重さに応じて威力を自動反映', '명중 횟수에 따라 총위력이 바뀌는 기술이라 직접 입력이 필요함': '命中回数で合計威力が変わる技のため手動入力が必要', '연속타 누적 위력 기술이라 직접 입력이 필요함': '連続技の累積威力が変わるため手動入力が必要', '특정 조건에 따라 위력이 자동 반영됨': '選択した条件に応じて威力を自動反映', '위력 조건': '威力条件', '타입변환 자속': 'タイプ変化STAB', '공격측 HP 1/3 이하': '攻撃側HP 1/3以下', '상대 독/맹독': '相手がどく/もうどく', '상대 HP 만땅': '相手HP満タン', '상대보다 늦게 행동': '相手より後に行動', '기절한 아군 수': 'ひんしの味方数', '라이벌리 성별 관계': 'とうそうしん性別関係', '같은 성별': '同性', '다른 성별': '異性', '부자유친 발동': 'おやこあい発動', '상대 상태이상': '相手が状態異常', '일렉트릭 차지됨': 'エレクトロモーフォーシス発動', '공수전환': '攻守切替', '공격측': '攻撃側', '방어측': '防御側', '상대 기술 추가': '相手技追加', '추가': '追加', '공격측 화력 랭크': '攻撃側火力ランク', '방어측 내구 랭크': '防御側耐久ランク', '방어측은 내 파티 실수치를 사용함': '防御側は自分のパーティ実数値を使用', '내 쓰러진 포켓몬 수': '自分のひんしポケモン数', '내 능력 상승 랭크 합': '自分の能力上昇ランク合計', '내가 상태이상임': '自分が状態異常', '상대가 상태이상임': '相手が状態異常', '이번 턴 먼저 맞음': 'このターン先に攻撃を受けた', '타수': 'ヒット数', '총위력': '合計威力', '급소': '急所', '변화기는 데미지 계산 대상이 아님': '変化技はダメージ計算対象外', '내 화력 랭크': '自分の火力ランク', '상대 내구 랭크': '相手の耐久ランク', '상대 기본 내구 가정': '相手基本耐久想定', '상대 내구 프리셋': '相手耐久プリセット', '직접 조절': '手動調整', '상대 HP': '相手HP', '상대 물방': '相手防御', '상대 특방': '相手特防', '+방어 성격': '+防御性格', '+특방 성격': '+特防性格', '화력 조건': '火力条件', '전장 조건': '場条件', '상대 내구': '相手耐久', '화상': 'やけど', '날씨': '天気', '필드': 'フィールド', '리플렉터': 'リフレクター', '빛의장막': 'ひかりのかべ', '오로라베일': 'オーロラベール', '프렌드가드': 'フレンドガード', '쾌청': 'にほんばれ', '비': 'あめ', '모래바람': 'すなあらし', '싸라기눈': 'ゆき', '일렉트릭필드': 'エレキフィールド', '그래스필드': 'グラスフィールド', '사이코필드': 'サイコフィールド', '미스트필드': 'ミストフィールド',
    '내 파티 추월컷': '自分の抜きライン', '상대 기준': '相手基準', '기준 속도': '基準素早さ', '추월컷': '抜き', '동속컷': '同速', '이미 추월': 'すでに上', '불가': '不可', '실전 상태': '対面状態', '내가 앞섬': '上', '상대가 앞섬': '下', '동속': '同速', '일반': '通常', '메가': 'メガ', '내 포켓몬': '自分のポケモン', '상대 포켓몬': '相手ポケモン', '기준선': '基準線',
    '준속': '準速', '최속': '最速', '상한': '上限', '하한': '下限', '준속 스카프': '準速スカーフ', '최속 스카프': '最速スカーフ', '선택한 상대 없음': '相手未選択',
    '위력': '威力', '공격분류': '攻撃分類', '물리': '物理', '특수': '特殊', '없음': 'なし', '상성': '相性', '확정 1타 가능성 있음': '一撃圏の可能性あり', '유리한 2타권': '有利な2発圏内', '즉시 마무리 어려움': '即処理は難しい', '상대 엔트리에서 계산 대상 포켓몬을 먼저 채워 주세요.': '先に相手エントリーへ計算対象のポケモンを入れてください。',
    '빈 슬롯': '空きスロット', '현재': '現在', '추가 가능': '追加可能',
    '노력': 'がんばりや', '외로움': 'さみしがり', '용감': 'ゆうかん', '고집': 'いじっぱり', '개구쟁이': 'やんちゃ', '대담': 'ずぶとい', '온순': 'すなお', '무사태평': 'のんき', '장난꾸러기': 'わんぱく', '촐랑': 'のうてんき', '겁쟁이': 'おくびょう', '성급': 'せっかち', '성실': 'まじめ', '명랑': 'ようき', '천진난만': 'むじゃき', '조심': 'ひかえめ', '의젓': 'おっとり', '냉정': 'れいせい', '수줍음': 'てれや', '덜렁': 'うっかりや', '차분': 'おだやか', '얌전': 'おとなしい', '건방': 'なまいき', '신중': 'しんちょう', '변덕': 'きまぐれ',
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
  'mega-floette': 'item-sprites/floettite.png',
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

const OPPONENT_BULK_PRESETS: Record<Exclude<OpponentBulkPreset, 'custom'>, OpponentBulkConfig> = {
  'neutral-0': { hpEv: 0, defenseEv: 0, spDefenseEv: 0, defenseNature: 1, spDefenseNature: 1, label: '무보정 0EV' },
  'hp-32': { hpEv: 32, defenseEv: 0, spDefenseEv: 0, defenseNature: 1, spDefenseNature: 1, label: '체력 32' },
  'phys-32': { hpEv: 32, defenseEv: 32, spDefenseEv: 0, defenseNature: 1.1, spDefenseNature: 1, label: '체력/방어 32/32 +' },
  'spdef-32': { hpEv: 32, defenseEv: 0, spDefenseEv: 32, defenseNature: 1, spDefenseNature: 1.1, label: '체력/특수방어 32/32 +' },
}

function sanitizeOpponentBulkPreset(value: unknown): OpponentBulkPreset {
  return value === 'neutral-0' || value === 'hp-32' || value === 'phys-32' || value === 'spdef-32' || value === 'custom'
    ? value
    : 'neutral-0'
}

function sanitizeOpponentNatureMultiplier(value: unknown) {
  return Number(value) === 1.1 ? 1.1 : 1
}

function opponentBulkStateFromPreset(preset: OpponentBulkPreset): OpponentBulkState {
  const resolved = sanitizeOpponentBulkPreset(preset)
  const config = resolved === 'custom' ? OPPONENT_BULK_PRESETS['neutral-0'] : OPPONENT_BULK_PRESETS[resolved]
  return {
    hpEv: config.hpEv,
    defenseEv: config.defenseEv,
    spDefenseEv: config.spDefenseEv,
    defenseNature: config.defenseNature,
    spDefenseNature: config.spDefenseNature,
  }
}

function sanitizeOpponentBulkState(raw?: Partial<OpponentBulkState> | null, preset: OpponentBulkPreset = 'neutral-0'): OpponentBulkState {
  const base = opponentBulkStateFromPreset(preset)
  return {
    hpEv: clampEv(raw?.hpEv ?? base.hpEv, CHAMPIONS_EFFORT_PER_STAT_CAP),
    defenseEv: clampEv(raw?.defenseEv ?? base.defenseEv, CHAMPIONS_EFFORT_PER_STAT_CAP),
    spDefenseEv: clampEv(raw?.spDefenseEv ?? base.spDefenseEv, CHAMPIONS_EFFORT_PER_STAT_CAP),
    defenseNature: sanitizeOpponentNatureMultiplier(raw?.defenseNature ?? base.defenseNature),
    spDefenseNature: sanitizeOpponentNatureMultiplier(raw?.spDefenseNature ?? base.spDefenseNature),
  }
}

function detectOpponentBulkPreset(state: OpponentBulkState): OpponentBulkPreset {
  for (const [preset, config] of Object.entries(OPPONENT_BULK_PRESETS) as [Exclude<OpponentBulkPreset, 'custom'>, OpponentBulkConfig][]) {
    if (
      state.hpEv === config.hpEv &&
      state.defenseEv === config.defenseEv &&
      state.spDefenseEv === config.spDefenseEv &&
      state.defenseNature === config.defenseNature &&
      state.spDefenseNature === config.spDefenseNature
    ) return preset
  }
  return 'custom'
}

function opponentBulkLabel(state: OpponentBulkState, preset: OpponentBulkPreset) {
  if (preset !== 'custom') return OPPONENT_BULK_PRESETS[preset].label
  const natureBits = [
    state.defenseNature > 1 ? '+방어' : null,
    state.spDefenseNature > 1 ? '+특수방어' : null,
  ].filter(Boolean)
  return `체력 ${state.hpEv} · 방어 ${state.defenseEv} · 특수방어 ${state.spDefenseEv}${natureBits.length ? ` · ${natureBits.join(' / ')}` : ''}`
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
const ITEM_ALIAS_TO_CANONICAL = new Map(
  CHAMPIONS_ITEM_OPTIONS.flatMap((item) => {
    const variants = [
      item,
      localizedChampionsItemLabel(item, 'ko'),
      localizedChampionsItemLabel(item, 'en'),
      ...(CHAMPIONS_ITEM_ALIASES[item] ?? []),
    ]
    return [...new Set(variants.map((variant) => variant.trim()).filter(Boolean))]
      .map((variant) => [variant.toLowerCase(), item] as const)
  }),
)

function canonicalChampionsItemName(item: string) {
  const normalized = item.trim()
  if (!normalized) return ''
  return ITEM_ALIAS_TO_CANONICAL.get(normalized.toLowerCase()) ?? normalized
}

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
  return megaStoneForKey(key) ?? canonicalChampionsItemName(item)
}

function isAllowedChampionsItem(key: string, item: string) {
  const normalized = normalizeItemForKey(key, item).trim()
  if (!normalized) return true
  return normalized === megaStoneForKey(key) || CHAMPIONS_ITEM_OPTIONS.includes(normalized as ChampionsItem)
}

function visibleChampionsItem(key: string, item: string) {
  const normalized = normalizeItemForKey(key, item).trim()
  return isAllowedChampionsItem(key, normalized) ? normalized : ''
}

function isChoiceScarfItem(item: string) {
  return canonicalChampionsItemName(item).trim() === '구애스카프'
}

function itemSpriteSrc(key: string, item: string) {
  const localSpriteSrc = (ref: string) => {
    const cleaned = ref.split('?')[0]?.split('#')[0] ?? ref
    const filename = cleaned.split('/').pop() || cleaned
    return `${import.meta.env.BASE_URL}item-sprites/${filename.endsWith('.png') ? filename : `${filename}.png`}`
  }
  const normalized = normalizeItemForKey(key, item).trim()
  const megaSlug = MEGA_STONE_SPRITE_BY_KEY[key]
  if (megaSlug) return localSpriteSrc(megaSlug)
  const spriteSlug = CHAMPIONS_ITEM_SPRITE_MAP[normalized as ChampionsItem]
  if (spriteSlug) return localSpriteSrc(spriteSlug)
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
const blankSampleSpeedTarget = (): SampleSpeedTarget => ({
  ...blankOpponent(),
  natureBoost: true,
})
const defaultSampleSpeedTargets: SampleSpeedTarget[] = ['garchomp', 'dragapult', 'meowscarada'].filter((key) => indexByKey.has(key)).map((key) => ({
  ...blankSampleSpeedTarget(),
  key,
}))
const blankSampleDamageTarget = (): SampleDamageTarget => ({
  ...blankOpponent(),
  hpEv: 0,
  defenseEv: 0,
  spDefenseEv: 0,
  defenseNature: 1,
  spDefenseNature: 1,
  moveName: '',
})
const defaultSampleDamageTargets: SampleDamageTarget[] = ['garchomp', 'primarina', 'rotom'].filter((key) => indexByKey.has(key)).map((key) => ({
  ...blankSampleDamageTarget(),
  key,
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

type ConditionalMovePowerRule = {
  kind: 'count' | 'toggle'
  label: string
  min?: number
  max?: number
  defaultValue: ConditionalPowerValue
  resolvePower: (basePower: number, value: ConditionalPowerValue) => number
}

const CONDITIONAL_MOVE_POWER_RULES: Record<string, ConditionalMovePowerRule> = {
  '성묘': {
    kind: 'count',
    label: '내 쓰러진 포켓몬 수',
    min: 0,
    max: 5,
    defaultValue: 0,
    resolvePower: (basePower, value) => basePower + Math.max(0, Math.min(5, Math.trunc(Number(value) || 0))) * 50,
  },
  '어시스트파워': {
    kind: 'count',
    label: '내 능력 상승 랭크 합',
    min: 0,
    max: 36,
    defaultValue: 0,
    resolvePower: (basePower, value) => basePower + Math.max(0, Math.min(36, Math.trunc(Number(value) || 0))) * 20,
  },
  '객기': {
    kind: 'toggle',
    label: '내가 상태이상임',
    defaultValue: false,
    resolvePower: (basePower, value) => value ? basePower * 2 : basePower,
  },
  '병상첨병': {
    kind: 'toggle',
    label: '상대가 상태이상임',
    defaultValue: false,
    resolvePower: (basePower, value) => value ? basePower * 2 : basePower,
  },
  '리벤지': {
    kind: 'toggle',
    label: '이번 턴 먼저 맞음',
    defaultValue: false,
    resolvePower: (basePower, value) => value ? basePower * 2 : basePower,
  },
}

const EFFORT_STAT_OPTIONS: { key: EffortStatKey; short: string; label: string }[] = [
  { key: 'hp', short: '체력', label: '체력' },
  { key: 'attack', short: '공격', label: '공격' },
  { key: 'defense', short: '방어', label: '방어' },
  { key: 'spAttack', short: '특수공격', label: '특수공격' },
  { key: 'spDefense', short: '특수방어', label: '특수방어' },
  { key: 'speed', short: '스피드', label: '스피드' },
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

const normalizedTypeChart: Record<string, Partial<Record<string, number>>> = Object.fromEntries(
  Object.entries(typeChart).map(([attackType, targets]) => [
    attackType.toLowerCase(),
    Object.fromEntries(Object.entries(targets).map(([defendType, value]) => [defendType.toLowerCase(), value])),
  ]),
)

function clampSpeedStage(value: unknown) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 0
  return Math.max(-2, Math.min(2, Math.trunc(num)))
}

function clampBattleStage(value: unknown) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 0
  return Math.max(-6, Math.min(6, Math.trunc(num)))
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
    case 'spAttack': return translateText(language, '특수공격')
    case 'spDefense': return translateText(language, '특수방어')
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
  '섀도클로': '섀도크루',
}
const MOVE_NAME_ALIASES_BY_NORMALIZED = new Map(
  Object.entries(MOVE_NAME_ALIASES).map(([name, alias]) => [normalizeSearchText(name), alias] as const),
)

const MOVE_META_BY_NAME = championsLearnedMoveMeta as Record<string, MoveMeta>
const MOVE_META_BY_NORMALIZED = new Map(
  Object.entries(MOVE_META_BY_NAME).map(([name, meta]) => [normalizeSearchText(name), meta] as const),
)

function moveNameCandidates(name: string) {
  const base = name.trim()
  const alias = MOVE_NAME_ALIASES[base] ?? MOVE_NAME_ALIASES_BY_NORMALIZED.get(normalizeSearchText(base))
  return Array.from(new Set([base, alias].filter(Boolean).flatMap((entry) => [entry as string, normalizeSearchText(entry as string)])))
}

function moveMatchesTaggedSet(moveName: string, taggedMoves: Set<string>) {
  return moveNameCandidates(moveName).some((candidate) => taggedMoves.has(normalizeSearchText(candidate)))
}

function resolveAbilityAdjustedMoveMeta(moveName: string, moveMeta: MoveMeta | null, attackerAbility: string) {
  if (!moveMeta) return moveMeta
  const isDamaging = moveMeta.category === 'physical' || moveMeta.category === 'special'
  if (!isDamaging) return moveMeta
  if (moveMeta.type === 'normal') {
    if (attackerAbility === 'aerilate') return { ...moveMeta, type: 'flying' }
    if (attackerAbility === 'pixilate') return { ...moveMeta, type: 'fairy' }
    if (attackerAbility === 'refrigerate') return { ...moveMeta, type: 'ice' }
    if (attackerAbility === 'dragonize') return { ...moveMeta, type: 'dragon' }
  }
  if (attackerAbility === 'liquid-voice' && moveMatchesTaggedSet(moveName, SOUND_MOVE_NAMES)) {
    return { ...moveMeta, type: 'water' }
  }
  return moveMeta
}

function lookupMoveMeta(name: string) {
  if (!name) return null
  return MOVE_META_BY_NAME[name] ?? MOVE_META_BY_NORMALIZED.get(normalizeSearchText(name)) ?? null
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

function resolveMoveMeta(name: string, preferredOptions: MoveOption[], movePools: Record<string, MovePoolState>): MoveMeta | null {
  if (!name) return null
  const candidates = moveNameCandidates(name)
  for (const candidate of candidates) {
    const meta = lookupMoveMeta(candidate)
    if (meta) return meta
  }
  const direct = findMatchingMoveOption(name, preferredOptions)
  if (direct) {
    const directMeta = lookupMoveMeta(direct.name)
    if (directMeta) return directMeta
  }
  for (const pool of Object.values(movePools)) {
    const matched = findMatchingMoveOption(name, pool.moves)
    if (!matched) continue
    const matchedMeta = lookupMoveMeta(matched.name)
    if (matchedMeta) return matchedMeta
  }
  const resolvedType = resolveMoveType(name, preferredOptions, movePools)
  return resolvedType ? { type: resolvedType, category: null, power: null } : null
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

function sanitizeSampleSpeedTargets(input: unknown): SampleSpeedTarget[] {
  if (!Array.isArray(input)) return defaultSampleSpeedTargets
  const cleaned = input
    .map((target) => {
      if (!target || typeof target !== 'object') return null
      const raw = target as Partial<SampleSpeedTarget>
      if (typeof raw.key !== 'string') return null
      if (raw.key && !indexByKey.has(raw.key)) return null
      return {
        key: raw.key,
        item: typeof raw.item === 'string' ? raw.item : '',
        ability: typeof raw.ability === 'string' ? raw.ability : '',
        notes: typeof raw.notes === 'string' ? raw.notes : '',
        revealedMoves: Array.isArray(raw.revealedMoves) ? raw.revealedMoves.filter((move): move is string => typeof move === 'string') : [],
        natureBoost: typeof raw.natureBoost === 'boolean' ? raw.natureBoost : true,
        scarf: typeof raw.scarf === 'boolean' ? raw.scarf : false,
        speedStage: clampSpeedStage(raw.speedStage),
        picked: typeof raw.picked === 'boolean' ? raw.picked : false,
      }
    })
    .filter((target): target is SampleSpeedTarget => Boolean(target))

  return cleaned.length ? cleaned : defaultSampleSpeedTargets
}

function sanitizeSampleDamageTargets(input: unknown): SampleDamageTarget[] {
  if (!Array.isArray(input)) return defaultSampleDamageTargets
  const cleaned = input
    .map((target) => {
      if (!target || typeof target !== 'object') return null
      const raw = target as Partial<SampleDamageTarget>
      if (typeof raw.key !== 'string') return null
      if (raw.key && !indexByKey.has(raw.key)) return null
      return {
        key: raw.key,
        item: typeof raw.item === 'string' ? raw.item : '',
        ability: typeof raw.ability === 'string' ? raw.ability : '',
        notes: typeof raw.notes === 'string' ? raw.notes : '',
        revealedMoves: Array.isArray(raw.revealedMoves) ? raw.revealedMoves.filter((move): move is string => typeof move === 'string') : [],
        natureBoost: typeof raw.natureBoost === 'boolean' ? raw.natureBoost : true,
        scarf: typeof raw.scarf === 'boolean' ? raw.scarf : false,
        speedStage: clampSpeedStage(raw.speedStage),
        picked: typeof raw.picked === 'boolean' ? raw.picked : false,
        hpEv: clampNonNegativeInt(raw.hpEv ?? 0, CHAMPIONS_EFFORT_PER_STAT_CAP),
        defenseEv: clampNonNegativeInt(raw.defenseEv ?? 0, CHAMPIONS_EFFORT_PER_STAT_CAP),
        spDefenseEv: clampNonNegativeInt(raw.spDefenseEv ?? 0, CHAMPIONS_EFFORT_PER_STAT_CAP),
        defenseNature: raw.defenseNature === 1.1 ? 1.1 : 1,
        spDefenseNature: raw.spDefenseNature === 1.1 ? 1.1 : 1,
        moveName: typeof raw.moveName === 'string' ? raw.moveName : '',
      }
    })
    .filter((target): target is SampleDamageTarget => Boolean(target))

  return cleaned.length ? cleaned : defaultSampleDamageTargets
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
    const normalizedHash = rawHash || '/'
    const routeUrl = new URL(normalizedHash.startsWith('/') ? normalizedHash : `/${normalizedHash}`, 'https://openclaw.local')
    const routePath = routeUrl.pathname.replace(/\/+$/, '') || '/'
    const mainSection: MainSection | undefined = routePath === '/single'
      ? 'single'
      : routePath === '/sample-builder'
        ? 'sample'
        : routePath === '/'
          ? 'home'
          : undefined
    const activeTabParam = routeUrl.searchParams.get('tab')
    const activeTab = activeTabParam === 'party' || activeTabParam === 'pick' || activeTabParam === 'speed' || activeTabParam === 'power'
      ? activeTabParam
      : undefined
    const selectedMy = routeUrl.searchParams.get('my') !== null ? Number(routeUrl.searchParams.get('my')) : undefined
    const selectedOpp = routeUrl.searchParams.get('opp') !== null ? Number(routeUrl.searchParams.get('opp')) : undefined
    return { mainSection, activeTab, selectedMy, selectedOpp }
  } catch {
    return null
  }
}

function syncViewStateToUrl(viewState: ViewState) {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams()
  const routePath = viewState.mainSection === 'sample' ? '/sample-builder' : viewState.mainSection === 'single' ? '/single' : '/'
  if (viewState.mainSection === 'single' && viewState.activeTab) params.set('tab', viewState.activeTab)
  if (typeof viewState.selectedMy === 'number') params.set('my', String(viewState.selectedMy))
  if (typeof viewState.selectedOpp === 'number') params.set('opp', String(viewState.selectedOpp))
  const nextHash = `${routePath}${params.toString() ? `?${params.toString()}` : ''}`
  if ((window.location.hash.replace(/^#/, '') || '/') === nextHash) return
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
  if (member.config.scarf || isChoiceScarfItem(member.item)) value = Math.floor(value * 1.5)
  return value
}

function applySpeedStage(value: number, speedStage: number) {
  if (speedStage > 0) return Math.floor(value * ((2 + speedStage) / 2))
  if (speedStage < 0) return Math.floor(value * (2 / (2 + Math.abs(speedStage))))
  return value
}

function buildPartyBattleStats(row: Row, member: PartyMember): BattleStatBlock {
  return {
    hp: actualStat(row.hp, member.evs.hp, 1, true),
    attack: actualStat(row.attack, member.evs.attack, natureMultiplier(member.config.nature, 'attack')),
    defense: actualStat(row.defense, member.evs.defense, natureMultiplier(member.config.nature, 'defense')),
    spAttack: actualStat(row.spAttack, member.evs.spAttack, natureMultiplier(member.config.nature, 'spAttack')),
    spDefense: actualStat(row.spDefense, member.evs.spDefense, natureMultiplier(member.config.nature, 'spDefense')),
  }
}

function buildOpponentBattleStats(row: Row, config: OpponentBulkState): BattleStatBlock {
  return {
    hp: actualStat(row.hp, config.hpEv, 1, true),
    attack: actualStat(row.attack, 0, 1),
    defense: actualStat(row.defense, config.defenseEv, config.defenseNature),
    spAttack: actualStat(row.spAttack, 0, 1),
    spDefense: actualStat(row.spDefense, config.spDefenseEv, config.spDefenseNature),
  }
}

function koChanceForHits(rolls: number[], hp: number, hitCount: number) {
  let states = new Map<number, number>([[0, 1]])
  for (let turn = 0; turn < hitCount; turn += 1) {
    const next = new Map<number, number>()
    for (const [sum, ways] of states) {
      for (const roll of rolls) {
        const total = Math.min(hp, sum + roll)
        next.set(total, (next.get(total) ?? 0) + ways)
      }
    }
    states = next
  }
  const success = states.get(hp) ?? 0
  return success / Math.pow(rolls.length, hitCount)
}

function resolveDamageVerdict(damage: { min: number, max: number, rolls: number[] }, hp: number, language: SiteLanguage) {
  for (let hitCount = 1; hitCount <= 8; hitCount += 1) {
    const chance = koChanceForHits(damage.rolls, hp, hitCount)
    if (chance >= 1) {
      return language === 'en'
        ? `Guaranteed ${hitCount}HKO`
        : language === 'ja'
          ? `確定 ${hitCount}発`
          : `확정 ${hitCount}타`
    }
    if (chance > 0) {
      const chancePct = (chance * 100).toFixed(chance >= 0.1 ? 1 : 2).replace(/\.0$/, '')
      return language === 'en'
        ? `Roll ${hitCount}HKO · ${chancePct}%`
        : language === 'ja'
          ? `乱数 ${hitCount}発 · ${chancePct}%`
          : `난수 ${hitCount}타 · ${chancePct}%`
    }
  }
  return language === 'en' ? 'Needs long game' : language === 'ja' ? '長期戦' : '장기전'
}

function battleStageMultiplier(stage: number) {
  if (stage > 0) return (2 + stage) / 2
  if (stage < 0) return 2 / (2 + Math.abs(stage))
  return 1
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
  if (member.config.scarf || isChoiceScarfItem(member.item)) speed = Math.floor(speed * 1.5)
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
  const attackKey = attackType.toLowerCase()
  return defendTypes.reduce((acc, defendType) => acc * (normalizedTypeChart[attackKey]?.[defendType.toLowerCase()] ?? 1), 1)
}

function weightBasedMovePower(weightKg: number) {
  if (weightKg < 10) return 20
  if (weightKg < 25) return 40
  if (weightKg < 50) return 60
  if (weightKg < 100) return 80
  if (weightKg < 200) return 100
  return 120
}

function applyTargetWeightMovePower(moveName: string, moveMeta: MoveMeta | null, targetWeightKg: number | null) {
  if (!moveMeta) return moveMeta
  if ((moveName !== '로우킥' && moveName !== '풀묶기') || typeof targetWeightKg !== 'number' || !Number.isFinite(targetWeightKg)) return moveMeta
  return {
    ...moveMeta,
    power: weightBasedMovePower(targetWeightKg),
    variablePower: true,
  }
}

async function fetchPokemonWeightKg(id: number) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
  if (!res.ok) throw new Error(`Failed to load weight for pokemon id ${id}`)
  const data = await res.json() as { weight?: number }
  if (!Number.isFinite(data.weight)) throw new Error(`Missing weight for pokemon id ${id}`)
  return Number(data.weight) / 10
}

function variablePowerHint(moveName: string, lt: (key: string) => string, options?: { targetWeightKnown?: boolean }) {
  if (CONDITIONAL_MOVE_POWER_RULES[moveName]) return lt('특정 조건에 따라 위력이 자동 반영됨')
  switch (moveName) {
    case '로우킥':
      return lt(options?.targetWeightKnown ? '상대 무게에 따라 위력이 자동 반영됨' : '상대 무게에 따라 위력이 바뀌는 기술이라 직접 입력이 필요함')
    case '스케일샷':
      return lt('명중 횟수에 따라 총위력이 바뀌는 기술이라 직접 입력이 필요함')
    case '풀묶기':
      return lt(options?.targetWeightKnown ? '상대 무게에 따라 위력이 자동 반영됨' : '상대 무게에 따라 위력이 바뀌는 기술이라 직접 입력이 필요함')
    case '트리플악셀':
      return lt('연속타 누적 위력 기술이라 직접 입력이 필요함')
    default:
      return lt('수동 위력')
  }
}

function normalizeConditionalPowerValue(rule: ConditionalMovePowerRule, raw: unknown): ConditionalPowerValue {
  if (rule.kind === 'toggle') return Boolean(raw)
  const min = rule.min ?? 0
  const max = rule.max ?? min
  const num = Number(raw)
  if (!Number.isFinite(num)) return Number(rule.defaultValue)
  return Math.max(min, Math.min(max, Math.trunc(num)))
}

function applyConditionalMovePower(moveName: string, moveMeta: MoveMeta | null, rawValue: unknown) {
  if (!moveMeta) return moveMeta
  const rule = CONDITIONAL_MOVE_POWER_RULES[moveName]
  if (!rule || typeof moveMeta.power !== 'number') return moveMeta
  const value = normalizeConditionalPowerValue(rule, rawValue)
  return {
    ...moveMeta,
    power: rule.resolvePower(moveMeta.power, value),
    variablePower: true,
  }
}

function multiHitOptions(moveName: string) {
  switch (moveName) {
    case '드래곤애로':
      return [2]
    case '스케일샷':
      return [2, 3, 4, 5]
    case '트리플악셀':
      return [1, 2, 3]
    default:
      return null
  }
}

function resolveMultiHitMeta(moveName: string, moveMeta: MoveMeta | null, hitCount: number | null, attackerAbility = '') {
  if (!moveMeta) return moveMeta
  const skillLink = attackerAbility === 'skill-link'
  if (moveName === '드래곤애로') return { ...moveMeta, hits: 2, hitPowers: [50, 50] }
  if (moveName === '스케일샷') {
    const hits = skillLink ? 5 : (hitCount && hitCount >= 2 && hitCount <= 5 ? hitCount : 2)
    return { ...moveMeta, power: 25, hits, hitPowers: Array.from({ length: hits }, () => 25), variablePower: false }
  }
  if (moveName === '트리플악셀') {
    const hits = skillLink ? 3 : (hitCount && hitCount >= 1 && hitCount <= 3 ? hitCount : 3)
    return { ...moveMeta, power: 20, hits, hitPowers: [20, 40, 60].slice(0, hits), variablePower: false }
  }
  return moveMeta
}

function multiHitSummary(moveName: string, moveMeta: MoveMeta | null, hitCount: number | null) {
  const resolved = resolveMultiHitMeta(moveName, moveMeta, hitCount)
  const powers = resolved?.hitPowers ?? []
  if (!powers.length) return null
  const totalPower = powers.reduce((sum, value) => sum + value, 0)
  return {
    hits: powers.length,
    totalPower,
  }
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

const DAMAGE_MOD_SCALE = 4096

function pokeRound(num: number) {
  return num % 1 > 0.5 ? Math.ceil(num) : Math.floor(num)
}

function chainMods(mods: number[], lowerBound = 410, upperBound = 131172) {
  let value = DAMAGE_MOD_SCALE
  for (const mod of mods) {
    if (mod !== DAMAGE_MOD_SCALE) value = (value * mod + 2048) >> 12
  }
  return Math.max(Math.min(value, upperBound), lowerBound)
}

function fixedMod(multiplier = 1) {
  return Math.round(multiplier * DAMAGE_MOD_SCALE)
}

function applyFixedMod(value: number, mod: number) {
  return Math.floor((value * mod) / DAMAGE_MOD_SCALE)
}

function getBaseDamage(level: number, basePower: number, attack: number, defense: number) {
  return Math.floor(Math.floor(Math.floor(((2 * level) / 5 + 2) * basePower * attack / defense) / 50) + 2)
}

function getFinalDamageRoll(baseAmount: number, roll: number, effectiveness: number, isBurned: boolean, stabMod: number, finalMod: number) {
  let damageAmount = Math.floor((baseAmount * roll) / 100)
  if (stabMod !== DAMAGE_MOD_SCALE) damageAmount = Math.floor((damageAmount * stabMod) / DAMAGE_MOD_SCALE)
  damageAmount = Math.floor(pokeRound(damageAmount) * effectiveness)
  if (isBurned) damageAmount = Math.floor(damageAmount / 2)
  return Math.max(1, pokeRound((damageAmount * finalMod) / DAMAGE_MOD_SCALE))
}

function calcDamage(attacker: BattleStatBlock, defender: BattleStatBlock, movePower: number, mode: CalcMode, stab = 1.5, effectiveness = 1, moveMeta?: MoveMeta | null, modifiers?: DamageCalcModifiers) {
  const resolvedMode = moveMeta?.category === 'physical' || moveMeta?.category === 'special' ? moveMeta.category : mode
  const resolvedPower = typeof moveMeta?.power === 'number' ? moveMeta.power : movePower
  if (!resolvedPower) return null
  let attackStat = resolvedMode === 'physical' ? attacker.attack : attacker.spAttack
  let defenseStat = resolvedMode === 'physical' ? defender.defense : defender.spDefense
  if (moveMeta?.usesDefenseAsAttack) attackStat = attacker.defense
  if (moveMeta?.targetsDefenseStat === 'defense') defenseStat = defender.defense
  if (moveMeta?.targetsDefenseStat === 'spDefense') defenseStat = defender.spDefense
  const powerMod = fixedMod(modifiers?.powerMultiplier ?? 1)
  const attackMod = fixedMod(modifiers?.attackMultiplier ?? 1)
  const defenseMod = fixedMod(modifiers?.defenseMultiplier ?? 1)
  const level = 50
  const scaledAttack = Math.max(1, applyFixedMod(Math.floor(attackStat), attackMod))
  const scaledDefense = Math.max(1, applyFixedMod(Math.floor(defenseStat), defenseMod))
  const hitPowers = moveMeta?.hitPowers?.length ? moveMeta.hitPowers : Array.from({ length: Math.max(1, moveMeta?.hits ?? 1) }, () => resolvedPower)
  const finalMod = chainMods([fixedMod(modifiers?.finalMultiplier ?? 1)])
  const stabMod = fixedMod(stab)
  const rolls = Array.from({ length: 16 }, (_, idx) => 85 + idx).map((random) => hitPowers.reduce((sum, power) => {
    const scaledPower = Math.max(1, applyFixedMod(Math.floor(power), powerMod))
    let base = getBaseDamage(level, scaledPower, scaledAttack, scaledDefense)
    if (moveMeta?.alwaysCrit || modifiers?.critical) base = applyFixedMod(base, fixedMod(1.5))
    return sum + getFinalDamageRoll(base, random, effectiveness, Boolean(modifiers?.burned), stabMod, finalMod)
  }, 0))
  const min = rolls[0]
  const max = rolls[rolls.length - 1]
  return {
    min,
    max,
    rolls,
    minPct: ((min / defender.hp) * 100).toFixed(1),
    maxPct: ((max / defender.hp) * 100).toFixed(1),
  }
}

function resolveAbilityAdjustedTypes(baseTypes: string[], ability: string, weather: DamageWeather, terrain: DamageTerrain) {
  if (ability === 'forecast') {
    if (weather === 'sun') return ['fire']
    if (weather === 'rain') return ['water']
    if (weather === 'snow') return ['ice']
  }
  if (ability === 'mimicry') {
    if (terrain === 'electric') return ['electric']
    if (terrain === 'grassy') return ['grass']
    if (terrain === 'psychic') return ['psychic']
    if (terrain === 'misty') return ['fairy']
  }
  return baseTypes
}

function resolveStabMultiplier(attackerTypes: string[], moveType: string | null, ability: string, typeChangeStab = true) {
  if (!moveType) return 1
  const hasNativeStab = attackerTypes.includes(moveType)
  if ((ability === 'libero' || ability === 'protean' || ability === '변환자재') && typeChangeStab) return 1.5
  if (ability === 'adaptability' || ability === '적응력') return hasNativeStab ? 2 : 1
  return hasNativeStab ? 1.5 : 1
}

function abilityNoteLabel(ability: string) {
  const labels: Record<string, string> = {
    'adaptability': '적응력',
    'aerilate': '스카이스킨',
    'analytic': '애널라이즈',
    'blaze': '맹화',
    'electromorphosis': '전기로바꾸기',
    'forecast': '기분파',
    'beads-of-ruin': '구슬의재앙',
    'dark-aura': '다크오라',
    'dragonize': '드래고나이즈',
    'dragons-maw': '용의턱',
    'dry-skin': '건조피부',
    'earth-eater': '대지먹기',
    'fairy-aura': '페어리오라',
    'filter': '필터',
    'flash-fire': '타오르는불꽃',
    'fluffy': '복슬복슬',
    'friend-guard': '프렌드가드',
    'fur-coat': '퍼코트',
    'guts': '근성',
    'heatproof': '내열',
    'huge-power': '천하장사',
    'hustle': '의욕',
    'ice-scales': '얼음인분',
    'iron-fist': '철주먹',
    'levitate': '부유',
    'liquid-voice': '촉촉보이스',
    'merciless': '무도한행동',
    'mega-launcher': '메가런처',
    'marvel-scale': '이상한비늘',
    'mimicry': '의태',
    'lightning-rod': '피뢰침',
    'libero': '변환자재',
    'motor-drive': '전기엔진',
    'multiscale': '멀티스케일',
    'overgrow': '심록',
    'neuroforce': '브레인포스',
    'pixilate': '페어리스킨',
    'prism-armor': '프리즘아머',
    'protean': '변환자재',
    'pure-power': '순수한힘',
    'purifying-salt': '정화의소금',
    'refrigerate': '프리즈스킨',
    'skill-link': '스킬링크',
    'sand-force': '모래의힘',
    'sap-sipper': '초식',
    'shadow-shield': '팬텀가드',
    'sharpness': '예리함',
    'sheer-force': '우격다짐',
    'sniper': '스나이퍼',
    'solar-power': '선파워',
    'soundproof': '방음',
    'solid-rock': '하드록',
    'strong-jaw': '옹골찬턱',
    'supreme-overlord': '대장군',
    'parental-bond': '부자유친',
    'steelworker': '강철술사',
    'steely-spirit': '강철정신',
    'storm-drain': '마중물',
    'sword-of-ruin': '재앙의검',
    'technician': '테크니션',
    'thick-fat': '두꺼운지방',
    'swarm': '벌레의알림',
    'tinted-lens': '색안경',
    'tough-claws': '단단한발톱',
    'torrent': '급류',
    'transistor': '트랜지스터',
    'reckless': '이판사판',
    'rivalry': '투쟁심',
    'unaware': '천진',
    'vessel-of-ruin': '재앙의그릇',
    'volt-absorb': '축전',
    'water-absorb': '저수',
    'water-bubble': '수포',
  }
  return labels[ability] ?? titleCaseSlug(ability)
}

function resolveDamageModifiers(params: {
  attackerAbility: string
  attackerItem: string
  defenderAbility: string
  defenderItem: string
  moveName: string
  baseMoveType: string | null
  moveType: string | null
  movePower: number | null
  mode: CalcMode
  effectiveness: number
  attackStage: number
  defenseStage: number
  defenderTypes: string[]
  burned: boolean
  attackerLowHp: boolean
  targetPoisoned: boolean
  defenderFullHp: boolean
  movedAfterTarget: boolean
  faintedAllies: number
  rivalryMode: RivalryMode
  parentalBond: boolean
  defenderStatused: boolean
  electromorphosisCharged: boolean
  weather: DamageWeather
  terrain: DamageTerrain
  reflect: boolean
  lightScreen: boolean
  auroraVeil: boolean
  friendGuard: boolean
  critical?: boolean
}) {
  const { attackerAbility, attackerItem, defenderAbility, defenderItem, moveName, baseMoveType, moveType, movePower, mode, effectiveness, attackStage, defenseStage, defenderTypes, burned, attackerLowHp, targetPoisoned, defenderFullHp, movedAfterTarget, faintedAllies, rivalryMode, parentalBond, defenderStatused, electromorphosisCharged, weather, terrain, reflect, lightScreen, auroraVeil, friendGuard, critical } = params
  const attackerIgnoresDefenseStage = attackerAbility === 'unaware'
  const defenderIgnoresAttackStage = defenderAbility === 'unaware'
  const effectiveCritical = Boolean(critical || (attackerAbility === 'merciless' && targetPoisoned))
  const effectiveAttackStage = defenderIgnoresAttackStage ? 0 : effectiveCritical && attackStage < 0 ? 0 : attackStage
  const effectiveDefenseStage = attackerIgnoresDefenseStage ? 0 : effectiveCritical && defenseStage > 0 ? 0 : defenseStage
  let attackMultiplier = battleStageMultiplier(effectiveAttackStage)
  let defenseMultiplier = battleStageMultiplier(effectiveDefenseStage)
  let powerMultiplier = 1
  let finalMultiplier = 1
  let adjustedEffectiveness = effectiveness
  const notes: string[] = []
  let incomingScreenName: string | null = null

  const typeBoostItems: Partial<Record<string, string>> = {
    'きせきのタネ': 'grass',
    'くろいメガネ': 'dark',
    'くろおび': 'fighting',
    'じしゃく': 'electric',
    'シルクのスカーフ': 'normal',
    'しんぴのしずく': 'water',
    'するどいくちばし': 'flying',
    'どくバリ': 'poison',
    'とけないこおり': 'ice',
    'のろいのおふだ': 'ghost',
    'まがったスプーン': 'psychic',
    'メタルコート': 'steel',
    'もくたん': 'fire',
    'やわらかいすな': 'ground',
    'ようせいのハネ': 'fairy',
    'りゅうのキバ': 'dragon',
  }

  if (effectiveAttackStage) notes.push(`공격 ${effectiveAttackStage > 0 ? '+' : ''}${effectiveAttackStage}`)
  if (effectiveDefenseStage) notes.push(`방어 ${effectiveDefenseStage > 0 ? '+' : ''}${effectiveDefenseStage}`)
  if (defenderIgnoresAttackStage && attackStage) notes.push(`${abilityNoteLabel(defenderAbility)}(공랭 무시)`)
  if (attackerIgnoresDefenseStage && defenseStage) notes.push(`${abilityNoteLabel(attackerAbility)}(방랭 무시)`)
  if (effectiveCritical && attackStage < 0) notes.push('급소(공깎 무시)')
  if (effectiveCritical && defenseStage > 0) notes.push('급소(방증 무시)')

  const burnApplies = burned && mode === 'physical' && attackerAbility !== 'guts' && attackerAbility !== '근성' && attackerAbility !== 'water-bubble'
  if (burnApplies) notes.push('화상')

  if (effectiveCritical) notes.push(attackerAbility === 'merciless' && targetPoisoned && !critical ? `${abilityNoteLabel(attackerAbility)}(급소)` : '급소')

  if (mode === 'physical' && (attackerAbility === 'huge-power' || attackerAbility === 'pure-power')) {
    attackMultiplier *= 2
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (mode === 'physical' && attackerAbility === 'hustle') {
    attackMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (weather === 'sun' && mode === 'special' && attackerAbility === 'solar-power') {
    attackMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'electromorphosis' && electromorphosisCharged && moveType === 'electric') {
    powerMultiplier *= 2
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerLowHp) {
    if (moveType === 'fire' && attackerAbility === 'blaze') {
      powerMultiplier *= 1.5
      notes.push(abilityNoteLabel(attackerAbility))
    }
    if (moveType === 'water' && attackerAbility === 'torrent') {
      powerMultiplier *= 1.5
      notes.push(abilityNoteLabel(attackerAbility))
    }
    if (moveType === 'grass' && attackerAbility === 'overgrow') {
      powerMultiplier *= 1.5
      notes.push(abilityNoteLabel(attackerAbility))
    }
    if (moveType === 'bug' && attackerAbility === 'swarm') {
      powerMultiplier *= 1.5
      notes.push(abilityNoteLabel(attackerAbility))
    }
  }

  if (weather === 'sand' && moveType && ['rock', 'ground', 'steel'].includes(moveType) && attackerAbility === 'sand-force') {
    powerMultiplier *= 1.3
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (moveType === 'water' && attackerAbility === 'water-bubble') {
    powerMultiplier *= 2
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (baseMoveType === 'normal' && moveType && moveType !== 'normal' && ['aerilate', 'pixilate', 'refrigerate', 'dragonize'].includes(attackerAbility)) {
    powerMultiplier *= 1.2
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'liquid-voice' && moveMatchesTaggedSet(moveName, SOUND_MOVE_NAMES) && moveType === 'water') {
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'iron-fist' && moveMatchesTaggedSet(moveName, PUNCH_MOVE_NAMES)) {
    powerMultiplier *= 1.2
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'reckless' && moveMatchesTaggedSet(moveName, RECKLESS_MOVE_NAMES)) {
    powerMultiplier *= 1.2
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'sheer-force' && moveMatchesTaggedSet(moveName, SHEER_FORCE_MOVE_NAMES)) {
    powerMultiplier *= 1.3
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'analytic' && movedAfterTarget) {
    powerMultiplier *= 1.3
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'supreme-overlord' && faintedAllies > 0) {
    finalMultiplier *= 1 + Math.min(5, Math.max(0, faintedAllies)) * 0.1
    notes.push(`${abilityNoteLabel(attackerAbility)} x${Math.min(5, Math.max(0, faintedAllies))}`)
  }

  if (attackerAbility === 'skill-link' && ['드래곤애로', '스케일샷', '트리플악셀'].includes(moveName)) {
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'rivalry') {
    if (rivalryMode === 'same') {
      finalMultiplier *= 1.25
      notes.push(abilityNoteLabel(attackerAbility))
    } else if (rivalryMode === 'opposite') {
      finalMultiplier *= 0.75
      notes.push(`${abilityNoteLabel(attackerAbility)}↓`)
    }
  }

  if (attackerAbility === 'parental-bond' && parentalBond) {
    finalMultiplier *= 1.25
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'strong-jaw' && moveMatchesTaggedSet(moveName, BITE_MOVE_NAMES)) {
    powerMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'mega-launcher' && moveMatchesTaggedSet(moveName, PULSE_MOVE_NAMES)) {
    powerMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'sharpness' && moveMatchesTaggedSet(moveName, SLICING_MOVE_NAMES)) {
    powerMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'tough-claws' && moveMatchesTaggedSet(moveName, CONTACT_MOVE_NAMES)) {
    powerMultiplier *= 1.3
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (moveType === 'dragon' && attackerAbility === 'dragons-maw') {
    powerMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (moveType === 'electric' && attackerAbility === 'transistor') {
    powerMultiplier *= 1.3
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (moveType === 'steel' && (attackerAbility === 'steelworker' || attackerAbility === 'steely-spirit')) {
    powerMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (moveType === 'fairy' && (attackerAbility === 'fairy-aura' || defenderAbility === 'fairy-aura')) {
    powerMultiplier *= 4 / 3
    notes.push(abilityNoteLabel('fairy-aura'))
  }

  if (moveType === 'dark' && (attackerAbility === 'dark-aura' || defenderAbility === 'dark-aura')) {
    powerMultiplier *= 4 / 3
    notes.push(abilityNoteLabel('dark-aura'))
  }

  if (attackerItem && moveType && typeBoostItems[attackerItem] === moveType) {
    finalMultiplier *= 1.2
    notes.push(attackerItem)
  }

  if (weather === 'sun') {
    if (moveType === 'fire') {
      finalMultiplier *= 1.5
      notes.push('쾌청')
    } else if (moveType === 'water') {
      finalMultiplier *= 0.5
      notes.push('쾌청')
    }
  }

  if (weather === 'rain') {
    if (moveType === 'water') {
      finalMultiplier *= 1.5
      notes.push('비')
    } else if (moveType === 'fire') {
      finalMultiplier *= 0.5
      notes.push('비')
    }
  }

  if (weather === 'sand' && mode === 'special' && defenderTypes.includes('rock')) {
    defenseMultiplier *= 1.5
    notes.push('모래바람')
  }

  if (terrain === 'electric' && moveType === 'electric') {
    finalMultiplier *= 1.3
    notes.push('일렉트릭필드')
  }
  if (terrain === 'grassy' && moveType === 'grass') {
    finalMultiplier *= 1.3
    notes.push('그래스필드')
  }
  if (terrain === 'psychic' && moveType === 'psychic') {
    finalMultiplier *= 1.3
    notes.push('사이코필드')
  }
  if (terrain === 'misty' && moveType === 'dragon') {
    finalMultiplier *= 0.5
    notes.push('미스트필드')
  }

  if (moveType === 'ground' && (defenderAbility === 'levitate' || defenderAbility === '부유')) {
    adjustedEffectiveness = 0
    notes.push(abilityNoteLabel('levitate'))
  }

  if (moveType === 'water' && ['water-absorb', 'storm-drain', 'dry-skin'].includes(defenderAbility)) {
    adjustedEffectiveness = 0
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (moveType === 'fire' && defenderAbility === 'flash-fire') {
    adjustedEffectiveness = 0
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (moveType === 'electric' && ['volt-absorb', 'lightning-rod', 'motor-drive'].includes(defenderAbility)) {
    adjustedEffectiveness = 0
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (moveType === 'grass' && defenderAbility === 'sap-sipper') {
    adjustedEffectiveness = 0
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (moveMatchesTaggedSet(moveName, SOUND_MOVE_NAMES) && defenderAbility === 'soundproof') {
    adjustedEffectiveness = 0
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (moveType === 'ground' && defenderAbility === 'earth-eater') {
    adjustedEffectiveness = 0
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (moveType === 'ground' && defenderAbility === '부유') {
    adjustedEffectiveness = 0
    notes.push('부유')
  }

  if (adjustedEffectiveness > 0 && (moveType === 'fire' || moveType === 'ice') && defenderAbility === 'thick-fat') {
    finalMultiplier *= 0.5
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (adjustedEffectiveness > 0 && moveType === 'fire' && defenderAbility === 'heatproof') {
    finalMultiplier *= 0.5
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (adjustedEffectiveness > 0 && moveType === 'ghost' && defenderAbility === 'purifying-salt') {
    finalMultiplier *= 0.5
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (adjustedEffectiveness > 1) {
    if (['filter', 'solid-rock', 'prism-armor'].includes(defenderAbility)) {
      finalMultiplier *= 0.75
      notes.push(abilityNoteLabel(defenderAbility))
    }
    if (defenderItem === 'オッカのみ' && moveType === 'fire') {
      finalMultiplier *= 0.5
      notes.push('オッカのみ')
    }
    if (defenderItem === 'ヤチェのみ' && moveType === 'ice') {
      finalMultiplier *= 0.5
      notes.push('ヤチェのみ')
    }
    if (defenderItem === 'ロゼルのみ' && moveType === 'fairy') {
      finalMultiplier *= 0.5
      notes.push('ロゼルのみ')
    }
  }

  if (weather === 'snow' && mode === 'physical' && defenderTypes.includes('ice')) {
    defenseMultiplier *= 1.5
    notes.push('싸라기눈')
  }

  if (mode === 'physical' && defenderAbility === 'fur-coat') {
    defenseMultiplier *= 2
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (mode === 'physical' && defenderAbility === 'marvel-scale' && defenderStatused) {
    defenseMultiplier *= 1.5
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (adjustedEffectiveness > 0 && friendGuard) {
    finalMultiplier *= 0.75
    notes.push('프렌드가드')
  }

  if (adjustedEffectiveness > 0 && defenderFullHp && (defenderAbility === 'multiscale' || defenderAbility === 'shadow-shield')) {
    finalMultiplier *= 0.5
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (mode === 'special' && defenderAbility === 'ice-scales') {
    finalMultiplier *= 0.5
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (mode === 'physical' && defenderAbility === 'tablets-of-ruin') {
    attackMultiplier *= 0.75
    notes.push('패도의목간')
  }

  if (mode === 'special' && defenderAbility === 'vessel-of-ruin') {
    attackMultiplier *= 0.75
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (mode === 'physical' && attackerAbility === 'sword-of-ruin') {
    defenseMultiplier *= 0.75
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (mode === 'special' && attackerAbility === 'beads-of-ruin') {
    defenseMultiplier *= 0.75
    notes.push(abilityNoteLabel(attackerAbility))
  }

  const screenApplies = !effectiveCritical && (auroraVeil || (mode === 'physical' ? reflect : lightScreen))
  if (screenApplies) {
    finalMultiplier *= 0.5
    incomingScreenName = auroraVeil ? '오로라베일' : mode === 'physical' ? '리플렉터' : '빛의장막'
    notes.push(incomingScreenName)
  }

  if (attackerAbility === '테크니션' && typeof movePower === 'number' && movePower <= 60) {
    powerMultiplier *= 1.5
    notes.push('테크니션')
  }
  if (attackerAbility === 'technician' && typeof movePower === 'number' && movePower <= 60) {
    powerMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }
  if (attackerAbility === 'tinted-lens' && adjustedEffectiveness > 0 && adjustedEffectiveness < 1) {
    finalMultiplier *= 2
    notes.push(abilityNoteLabel(attackerAbility))
  }
  if (attackerAbility === 'neuroforce' && adjustedEffectiveness > 1) {
    finalMultiplier *= 1.25
    notes.push(abilityNoteLabel(attackerAbility))
  }
  if (attackerAbility === 'sniper' && effectiveCritical) {
    finalMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }
  if (attackerAbility === 'guts' && burned && mode === 'physical') {
    attackMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }
  return {
    attackMultiplier,
    defenseMultiplier,
    powerMultiplier,
    finalMultiplier,
    incomingScreenName,
    effectiveness: adjustedEffectiveness,
    critical: effectiveCritical,
    burned: burnApplies,
    notes,
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
  return value.toLowerCase().replace(/[^0-9a-z가-힣ぁ-んァ-ヶ一-龯]+/g, '')
}

function speciesSearchCandidates(row: Row) {
  const base = [row.name_ko, row.name_en, row.name_ja, row.key].filter(Boolean) as string[]
  const extra: string[] = []
  if (row.name_ko.startsWith('메가')) extra.push(row.name_ko.replace(/^메가/, ''))
  if (row.name_en.toLowerCase().startsWith('mega ')) extra.push(row.name_en.replace(/^Mega\s+/i, ''))
  if (row.key.startsWith('mega-')) extra.push(row.key.slice(5))
  if (row.key.startsWith('rotom-')) extra.push(`로토무${row.name_ko.replace(/로토무$/, '')}`)
  if (row.key.startsWith('gourgeist-')) extra.push(row.name_ko.replace(/^보통\s*/, ''), row.name_en.replace(/^Gourgeist\s*/, 'Gourgeist '))
  if (row.key === 'basculegion') extra.push('대쓰여너', '대쓰여너수컷', 'Basculegion', 'Basculegion Male')
  if (row.key === 'basculegion-female') extra.push('대쓰여너', '대쓰여너암컷', 'Basculegion', 'Basculegion Female')
  if (row.key === 'floette-eternal-flower') extra.push('영원의 꽃 플라엣테', '영원의꽃 플라엣테', '영원의꽃플라엣테', 'Eternal Flower Floette')
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
  const localized = localizedChampionsItemLabel(item, language)
  return localized !== item ? localized : translateText(language, item)
}

function filterItemOptions(query: string, language: SiteLanguage = 'ko') {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return [...CHAMPIONS_ITEM_OPTIONS]
  const matched = [...CHAMPIONS_ITEM_OPTIONS]
    .map((item) => {
      const aliases = CHAMPIONS_ITEM_ALIASES[item] ?? []
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
    .filter((entry): entry is { item: ChampionsItem; score: number } => Boolean(entry))
    .sort((a, b) => a.score - b.score || a.item.localeCompare(b.item, 'ko'))
    .map((entry) => entry.item)
  return matched.length ? matched : [...CHAMPIONS_ITEM_OPTIONS]
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

function abilitiesForKey(key: string, language: SiteLanguage) {
  const row = indexByKey.get(key)
  if (!row) return [] as string[]
  return displayAbilities(row, language)
}

function itemOptionsForKey(key: string) {
  const fixed = megaStoneForKey(key)
  if (fixed) return [fixed]
  return CHAMPIONS_ITEM_OPTIONS.filter((item) => isAllowedChampionsItem(key, item))
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
  return scope === 'party' ? ('idx' in a && a.idx === idx) : true
}

function menuLabelForTab(tab: MainTab, language: SiteLanguage = 'ko') {
  switch (tab) {
    case 'party': return translateText(language, '내 파티 관리')
    case 'pick': return translateText(language, '상대 엔트리')
    case 'speed': return translateText(language, '스피드 계산')
    case 'power': return translateText(language, '결정력 계산')
  }
}

function menuLabelForSection(section: MainSection, activeTab: MainTab, language: SiteLanguage = 'ko') {
  if (section === 'home') return translateText(language, '홈')
  if (section === 'sample') return translateText(language, '포켓몬 샘플 깎기')
  return menuLabelForTab(activeTab, language)
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

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="language-icon-svg">
      <path fill="currentColor" d="M5 3h11l3 3v15H5V3Zm2 2v4h8V5H7Zm0 8v6h10v-6H7Zm2 1h6v4H9v-4Z"/>
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
  const [calcSwapSides, setCalcSwapSides] = React.useState(() => Boolean(persisted?.calcSwapSides))
  const [calcAttackStage, setCalcAttackStage] = React.useState(() => clampBattleStage(persisted?.calcAttackStage))
  const [calcDefenseStage, setCalcDefenseStage] = React.useState(() => clampBattleStage(persisted?.calcDefenseStage))
  const [calcHitCount, setCalcHitCount] = React.useState(() => {
    const value = Number(persisted?.calcHitCount)
    return Number.isFinite(value) ? Math.max(1, Math.trunc(value)) : 3
  })
  const initialOpponentBulkPreset = React.useMemo(() => sanitizeOpponentBulkPreset(persisted?.calcOpponentBulkPreset), [persisted])
  const initialOpponentBulkState = React.useMemo(() => sanitizeOpponentBulkState({
    hpEv: persisted?.calcOpponentHpEv,
    defenseEv: persisted?.calcOpponentDefenseEv,
    spDefenseEv: persisted?.calcOpponentSpDefenseEv,
    defenseNature: persisted?.calcOpponentDefenseNature,
    spDefenseNature: persisted?.calcOpponentSpDefenseNature,
  }, initialOpponentBulkPreset), [initialOpponentBulkPreset, persisted])
  const [calcWeather, setCalcWeather] = React.useState<DamageWeather>(() => persisted?.calcWeather ?? 'none')
  const [calcTerrain, setCalcTerrain] = React.useState<DamageTerrain>(() => persisted?.calcTerrain ?? 'none')
  const [calcBurned, setCalcBurned] = React.useState(() => Boolean(persisted?.calcBurned))
  const [calcCritical, setCalcCritical] = React.useState(() => Boolean(persisted?.calcCritical))
  const [calcAttackerLowHp, setCalcAttackerLowHp] = React.useState(() => Boolean(persisted?.calcAttackerLowHp))
  const [calcTargetPoisoned, setCalcTargetPoisoned] = React.useState(() => Boolean(persisted?.calcTargetPoisoned))
  const [calcDefenderFullHp, setCalcDefenderFullHp] = React.useState(() => Boolean(persisted?.calcDefenderFullHp))
  const [calcMovedAfterTarget, setCalcMovedAfterTarget] = React.useState(() => Boolean(persisted?.calcMovedAfterTarget))
  const [calcFaintedAllies, setCalcFaintedAllies] = React.useState(() => Number.isFinite(Number(persisted?.calcFaintedAllies)) ? Math.max(0, Math.min(5, Math.trunc(Number(persisted?.calcFaintedAllies)))) : 0)
  const [calcRivalryMode, setCalcRivalryMode] = React.useState<RivalryMode>(() => persisted?.calcRivalryMode === 'same' || persisted?.calcRivalryMode === 'opposite' ? persisted.calcRivalryMode : 'neutral')
  const [calcParentalBond, setCalcParentalBond] = React.useState(() => Boolean(persisted?.calcParentalBond))
  const [calcDefenderStatused, setCalcDefenderStatused] = React.useState(() => Boolean(persisted?.calcDefenderStatused))
  const [calcElectromorphosisCharged, setCalcElectromorphosisCharged] = React.useState(() => Boolean(persisted?.calcElectromorphosisCharged))
  const [calcReflect, setCalcReflect] = React.useState(() => Boolean(persisted?.calcReflect))
  const [calcLightScreen, setCalcLightScreen] = React.useState(() => Boolean(persisted?.calcLightScreen))
  const [calcAuroraVeil, setCalcAuroraVeil] = React.useState(() => Boolean(persisted?.calcAuroraVeil))
  const [calcFriendGuard, setCalcFriendGuard] = React.useState(() => Boolean(persisted?.calcFriendGuard))
  const [calcTypeChangeStab, setCalcTypeChangeStab] = React.useState(() => persisted?.calcTypeChangeStab !== false)
  const [calcConditionalPowerValues, setCalcConditionalPowerValues] = React.useState<Record<string, ConditionalPowerValue>>(() => (persisted?.calcConditionalPowerValues && typeof persisted.calcConditionalPowerValues === 'object') ? persisted.calcConditionalPowerValues : {})
  const [weightByKey, setWeightByKey] = React.useState<Record<string, number>>({})
  const [calcOpponentBulkPreset, setCalcOpponentBulkPreset] = React.useState<OpponentBulkPreset>(initialOpponentBulkPreset)
  const [calcOpponentHpEv, setCalcOpponentHpEv] = React.useState(initialOpponentBulkState.hpEv)
  const [calcOpponentDefenseEv, setCalcOpponentDefenseEv] = React.useState(initialOpponentBulkState.defenseEv)
  const [calcOpponentSpDefenseEv, setCalcOpponentSpDefenseEv] = React.useState(initialOpponentBulkState.spDefenseEv)
  const [calcOpponentDefenseNature, setCalcOpponentDefenseNature] = React.useState(initialOpponentBulkState.defenseNature)
  const [calcOpponentSpDefenseNature, setCalcOpponentSpDefenseNature] = React.useState(initialOpponentBulkState.spDefenseNature)
  const [stab, setStab] = React.useState(1.5)
  const [effectiveness, setEffectiveness] = React.useState(1)
  const [battleNote, setBattleNote] = React.useState(() => typeof persisted?.battleNote === 'string' ? persisted.battleNote : '')
  const [mainSection, setMainSection] = React.useState<MainSection>(() => viewState?.mainSection ?? persisted?.mainSection ?? 'home')
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
  const [opponentAbilityDrafts, setOpponentAbilityDrafts] = React.useState<string[]>(() => sanitizeOpponents(persisted?.opponents).map((member) => member.ability ?? ''))
  const [opponentMoveDraft, setOpponentMoveDraft] = React.useState('')
  const [opponentMoveInputFocused, setOpponentMoveInputFocused] = React.useState(false)
  const [calcOpponentMoveDraft, setCalcOpponentMoveDraft] = React.useState('')
  const [calcOpponentMoveInputFocused, setCalcOpponentMoveInputFocused] = React.useState(false)
  const [activeSearchField, setActiveSearchField] = React.useState<SearchFieldTarget>(null)
  const [activeMoveField, setActiveMoveField] = React.useState<MoveFieldTarget>(null)
  const [activeItemField, setActiveItemField] = React.useState<ItemFieldTarget>(null)
  const [activeOpponentAbilityField, setActiveOpponentAbilityField] = React.useState<number | null>(null)
  const [activeMetaListField, setActiveMetaListField] = React.useState<MetaListField>(null)
  const [languageMenuOpen, setLanguageMenuOpen] = React.useState(false)
  const [settingsMenuOpen, setSettingsMenuOpen] = React.useState(false)
  const [tuningModalIndex, setTuningModalIndex] = React.useState<number | null>(null)
  const [sampleForge, setSampleForge] = React.useState<PartyMember>(() => persisted?.sampleForge ? sanitizeParty([persisted.sampleForge])[0] ?? defaultSampleForge() : defaultSampleForge())
  const [sampleSearch, setSampleSearch] = React.useState(() => searchDisplayLabel((persisted?.sampleForge ? sanitizeParty([persisted.sampleForge])[0] : defaultSampleForge()).key, 'ko'))
  const [savedSamples, setSavedSamples] = React.useState<SavedSample[]>(() => sanitizeSavedSamples(persisted?.savedSamples))
  const [sampleWorkbenchTab, setSampleWorkbenchTab] = React.useState<SampleWorkbenchTab>(() => persisted?.sampleWorkbenchTab ?? 'builder')
  const [sampleSpeedTargets, setSampleSpeedTargets] = React.useState<SampleSpeedTarget[]>(() => sanitizeSampleSpeedTargets(persisted?.sampleSpeedTargets))
  const [sampleDamageTargets, setSampleDamageTargets] = React.useState<SampleDamageTarget[]>(() => sanitizeSampleDamageTargets(persisted?.sampleDamageTargets))
  const [sampleSpeedSearch, setSampleSpeedSearch] = React.useState('')
  const [sampleSpeedSearchOpen, setSampleSpeedSearchOpen] = React.useState(false)
  const [sampleDamageSearch, setSampleDamageSearch] = React.useState('')
  const [sampleDamageSearchOpen, setSampleDamageSearchOpen] = React.useState(false)
  const [sampleTuningModalOpen, setSampleTuningModalOpen] = React.useState(false)
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
    setOpponentAbilityDrafts((prev) => opponents.map((member, idx) => prev[idx] ?? member.ability ?? ''))
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
    const targetKeys = Array.from(new Set([...party.map((member) => member.key), ...opponents.map((member) => member.key), sampleForge.key].filter(Boolean)))
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
  }, [party, opponents, sampleForge.key, movePoolByKey])

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const payload: PersistedState = {
      party,
      opponents,
      selectedMy,
      selectedOpp,
      calcSwapSides,
      calcAttackStage,
      calcDefenseStage,
      calcHitCount,
      calcWeather,
      calcTerrain,
      calcBurned,
      calcCritical,
      calcAttackerLowHp,
      calcTargetPoisoned,
      calcDefenderFullHp,
      calcMovedAfterTarget,
      calcFaintedAllies,
      calcRivalryMode,
      calcParentalBond,
      calcDefenderStatused,
      calcElectromorphosisCharged,
      calcReflect,
      calcLightScreen,
      calcAuroraVeil,
      calcFriendGuard,
      calcTypeChangeStab,
      calcConditionalPowerValues,
      calcOpponentBulkPreset,
      calcOpponentHpEv,
      calcOpponentDefenseEv,
      calcOpponentSpDefenseEv,
      calcOpponentDefenseNature,
      calcOpponentSpDefenseNature,
      battleNote,
      confirmedMovesByKey,
      mainSection,
      sampleForge,
      savedSamples,
      sampleWorkbenchTab,
      sampleSpeedTargets,
      sampleDamageTargets,
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [party, opponents, selectedMy, selectedOpp, calcSwapSides, calcAttackStage, calcDefenseStage, calcHitCount, calcWeather, calcTerrain, calcBurned, calcCritical, calcAttackerLowHp, calcTargetPoisoned, calcDefenderFullHp, calcMovedAfterTarget, calcFaintedAllies, calcRivalryMode, calcParentalBond, calcDefenderStatused, calcElectromorphosisCharged, calcReflect, calcLightScreen, calcAuroraVeil, calcFriendGuard, calcTypeChangeStab, calcConditionalPowerValues, calcOpponentBulkPreset, calcOpponentHpEv, calcOpponentDefenseEv, calcOpponentSpDefenseEv, calcOpponentDefenseNature, calcOpponentSpDefenseNature, battleNote, confirmedMovesByKey, mainSection, sampleForge, savedSamples, sampleWorkbenchTab, sampleSpeedTargets, sampleDamageTargets])

  React.useEffect(() => {
    syncViewStateToUrl({
      mainSection,
      activeTab: mainSection === 'single' ? activeTab : undefined,
      selectedMy,
      selectedOpp,
    })
  }, [mainSection, activeTab, selectedMy, selectedOpp])

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [mainSection, activeTab])

  const myMember = party[selectedMy] ?? party[0]
  const oppMember = opponents[selectedOpp] ?? opponents[0]
  const sampleRow = indexByKey.get(sampleForge.key) ?? rows[0]
  const sampleMagicCandidate = sampleRow ? findMagicNumberCandidate(sampleRow, sampleForge) : null
  const calcMyKey = resolveCalcKeyWithMega(myMember.key, calcMyMegaOn)
  const calcOppKey = oppMember.key ? resolveCalcKeyWithMega(oppMember.key, calcOppMegaOn) : ''
  const myRow = indexByKey.get(calcMyKey) ?? rows[0]
  const oppRow = calcOppKey ? (indexByKey.get(calcOppKey) ?? rows[0]) : null
  const oppWeightKg = oppRow ? (typeof oppRow.weightKg === 'number' ? oppRow.weightKg : weightByKey[oppRow.key] ?? null) : null
  const opponentBulkState = React.useMemo<OpponentBulkState>(() => ({
    hpEv: calcOpponentHpEv,
    defenseEv: calcOpponentDefenseEv,
    spDefenseEv: calcOpponentSpDefenseEv,
    defenseNature: calcOpponentDefenseNature,
    spDefenseNature: calcOpponentSpDefenseNature,
  }), [calcOpponentHpEv, calcOpponentDefenseEv, calcOpponentSpDefenseEv, calcOpponentDefenseNature, calcOpponentSpDefenseNature])
  const myBattleStats = buildPartyBattleStats(myRow, myMember)
  const oppBattleStats = oppRow ? buildOpponentBattleStats(oppRow, opponentBulkState) : null
  const myMegaCandidates = megaCandidateKeysForBase(megaBaseKey(myMember.key))
  const oppMegaCandidates = megaCandidateKeysForBase(megaBaseKey(oppMember.key))

  const calcTargetWeightRow = calcSwapSides ? myRow : oppRow
  const calcTargetWeightKg = calcSwapSides
    ? (typeof myRow.weightKg === 'number' ? myRow.weightKg : weightByKey[myRow.key] ?? null)
    : oppWeightKg

  React.useEffect(() => {
    if (!calcTargetWeightRow?.key || typeof calcTargetWeightRow.id !== 'number') return
    if (typeof calcTargetWeightKg === 'number') return
    let cancelled = false
    fetchPokemonWeightKg(calcTargetWeightRow.id)
      .then((weightKg) => {
        if (cancelled) return
        setWeightByKey((prev) => prev[calcTargetWeightRow.key] === weightKg ? prev : { ...prev, [calcTargetWeightRow.key]: weightKg })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [calcTargetWeightRow, calcTargetWeightKg])

  React.useEffect(() => {
    const megaCandidates = megaCandidateKeysForBase(megaBaseKey(myMember.key))
    setCalcMyMegaOn(myMember.key.startsWith('mega-') ? true : (megaCandidates.length ? false : false))
  }, [myMember.key])

  React.useEffect(() => {
    const megaCandidates = megaCandidateKeysForBase(megaBaseKey(oppMember.key))
    setCalcOppMegaOn(oppMember.key.startsWith('mega-') ? true : (megaCandidates.length ? false : false))
  }, [oppMember.key])

  React.useEffect(() => {
    const moves = (calcSwapSides ? oppMember.revealedMoves : (confirmedMovesByKey[myMember.key] ?? [])).filter(Boolean)
    const activeKey = calcSwapSides ? oppMember.key : myMember.key
    if (!moves.length) {
      if (selectedDamageMove !== null) setSelectedDamageMove(null)
      return
    }
    if (!selectedDamageMove || selectedDamageMove.key !== activeKey || !moves.includes(selectedDamageMove.move)) {
      setSelectedDamageMove({ key: activeKey, move: moves[0] })
    }
  }, [calcSwapSides, confirmedMovesByKey, myMember.key, oppMember.key, oppMember.revealedMoves, selectedDamageMove])

  React.useEffect(() => {
    setOpponentMoveDraft('')
    setOpponentMoveInputFocused(false)
    setCalcOpponentMoveDraft('')
    setCalcOpponentMoveInputFocused(false)
  }, [selectedOpp, oppMember.key])

  const mySpeed = partySpeedValue(myRow, myMember)
  const mySpeedAbilityLine = myRow ? mySpeedAbilityMarker(myRow, myMember, siteLanguage) : null
  const oppSpeed = oppRow ? speedValue(oppRow, {
    nature: oppMember.natureBoost ? 'jolly' : 'hardy',
    scarf: oppMember.scarf || isChoiceScarfItem(oppMember.item),
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
  const oppMoveSet = sampleMoves.find((entry) => entry.key === oppMember.key)
  const oppMovePool = movePoolByKey[oppMember.key]
  const oppMoveOptions = oppMovePool?.moves?.length ? oppMovePool.moves : moveOptionsForEntry(oppMoveSet)
  const selectedMyAbility = resolveSelectedAbility(myRow, myMember.ability, siteLanguage)
  const selectedOppAbility = oppRow ? resolveSelectedAbility(oppRow, oppMember.ability, siteLanguage) : null
  const attackFromOpponent = calcSwapSides && Boolean(oppRow)
  const attackerRow = attackFromOpponent ? oppRow : myRow
  const defenderRow = attackFromOpponent ? myRow : oppRow
  const attackerMemberKey = attackFromOpponent ? oppMember.key : myMember.key
  const attackerAbilityValue = attackFromOpponent ? (selectedOppAbility?.slug ?? oppMember.ability) : (selectedMyAbility?.slug ?? myMember.ability)
  const defenderAbilityValue = attackFromOpponent ? (selectedMyAbility?.slug ?? myMember.ability) : (selectedOppAbility?.slug ?? oppMember.ability)
  const selectedAttackAbility = attackFromOpponent ? selectedOppAbility : selectedMyAbility
  const selectedDefenseAbility = attackFromOpponent ? selectedMyAbility : selectedOppAbility
  const attackerBattleStats = attackFromOpponent ? (oppRow ? buildOpponentBattleStats(oppRow, opponentBulkState) : null) : myBattleStats
  const defenderBattleStats = attackFromOpponent ? myBattleStats : oppBattleStats
  const myRegisteredDamageMoves = (confirmedMovesByKey[myMember.key] ?? []).filter(Boolean)
  const opponentRegisteredDamageMoves = oppMember.revealedMoves.filter(Boolean)
  const registeredDamageMoves = (attackFromOpponent ? opponentRegisteredDamageMoves : myRegisteredDamageMoves).filter(Boolean)
  const attackerMoveOptions = attackFromOpponent ? oppMoveOptions : myMoveOptions
  const defenderWeightKg = attackFromOpponent
    ? (typeof myRow.weightKg === 'number' ? myRow.weightKg : weightByKey[myRow.key] ?? null)
    : oppWeightKg
  const activeDamageMove = registeredDamageMoves.find((move) => move === selectedDamageMove?.move && attackerMemberKey === selectedDamageMove?.key) ?? registeredDamageMoves[0] ?? ''
  const activeDamageMoveBaseMeta = resolveMoveMeta(activeDamageMove, attackerMoveOptions, movePoolByKey)
  const activeDamageMoveHitOptions = multiHitOptions(activeDamageMove)
  const activeDamageMoveHitCount = activeDamageMoveHitOptions?.includes(calcHitCount) ? calcHitCount : (activeDamageMoveHitOptions?.[0] ?? null)
  const activeDamageMoveRule = activeDamageMove ? CONDITIONAL_MOVE_POWER_RULES[activeDamageMove] ?? null : null
  const activeDamageMoveConditionValue = activeDamageMoveRule
    ? normalizeConditionalPowerValue(activeDamageMoveRule, calcConditionalPowerValues[activeDamageMove] ?? activeDamageMoveRule.defaultValue)
    : null
  const activeDamageMoveMeta = applyConditionalMovePower(
    activeDamageMove,
    applyTargetWeightMovePower(
      activeDamageMove,
      resolveAbilityAdjustedMoveMeta(
        activeDamageMove,
        resolveMultiHitMeta(activeDamageMove, activeDamageMoveBaseMeta, activeDamageMoveHitCount, attackerAbilityValue),
        attackerAbilityValue,
      ),
      defenderWeightKg,
    ),
    activeDamageMoveConditionValue,
  )
  const activeDamageMoveHitSummary = multiHitSummary(activeDamageMove, activeDamageMoveMeta, activeDamageMoveHitCount)
  const activeDamageMoveBaseType = activeDamageMoveBaseMeta?.type ?? null
  const activeDamageMoveType = activeDamageMoveMeta?.type ?? null
  const activeDamageMoveCategory = activeDamageMoveMeta?.category === 'physical' || activeDamageMoveMeta?.category === 'special' ? activeDamageMoveMeta.category : null
  const activeDamageMovePower = typeof activeDamageMoveMeta?.power === 'number' ? activeDamageMoveMeta.power : null
  const activeDamageMoveAlwaysCrit = Boolean(activeDamageMoveMeta?.alwaysCrit)
  const activeDamageMoveIsStatus = activeDamageMoveMeta?.category === 'status'

  React.useEffect(() => {
    if (!activeDamageMoveCategory) return
    setCalcMode((prev) => (prev === activeDamageMoveCategory ? prev : activeDamageMoveCategory))
  }, [activeDamageMoveCategory])

  React.useEffect(() => {
    if (!activeDamageMoveHitOptions?.length) return
    setCalcHitCount((prev) => (activeDamageMoveHitOptions.includes(prev) ? prev : activeDamageMoveHitOptions[0]))
  }, [activeDamageMove, activeDamageMoveHitOptions])
  const attackerAbilitySlug = attackerAbilityValue
  const defenderAbilitySlug = defenderAbilityValue
  const effectiveAttackerTypes = attackerRow ? resolveAbilityAdjustedTypes(attackerRow.types, attackerAbilitySlug, calcWeather, calcTerrain) : []
  const effectiveDefenderTypes = defenderRow ? resolveAbilityAdjustedTypes(defenderRow.types, defenderAbilitySlug, calcWeather, calcTerrain) : []
  const usesTypeChangeStabAbility = ['libero', 'protean', '변환자재'].includes(attackerAbilitySlug)
  const showAttackerLowHpToggle = ['blaze', 'torrent', 'overgrow', 'swarm'].includes(attackerAbilitySlug)
  const showTargetPoisonedToggle = attackerAbilitySlug === 'merciless'
  const showMovedAfterTargetToggle = attackerAbilitySlug === 'analytic'
  const showFaintedAlliesInput = attackerAbilitySlug === 'supreme-overlord'
  const showRivalryModeInput = attackerAbilitySlug === 'rivalry'
  const showParentalBondToggle = attackerAbilitySlug === 'parental-bond'
  const showElectromorphosisToggle = attackerAbilitySlug === 'electromorphosis'
  const showDefenderStatusedToggle = defenderAbilitySlug === 'marvel-scale'
  const showDefenderFullHpToggle = ['multiscale', 'shadow-shield'].includes(defenderAbilitySlug)
  const autoStab = resolveStabMultiplier(effectiveAttackerTypes, activeDamageMoveType, attackerAbilitySlug, calcTypeChangeStab)
  const autoEffectiveness = activeDamageMoveType && defenderRow ? typeEffectiveness(activeDamageMoveType, effectiveDefenderTypes) : 1
  const setActiveDamageMoveConditionValue = (value: ConditionalPowerValue) => {
    if (!activeDamageMoveRule || !activeDamageMove) return
    const normalized = normalizeConditionalPowerValue(activeDamageMoveRule, value)
    setCalcConditionalPowerValues((prev) => ({ ...prev, [activeDamageMove]: normalized }))
  }
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
  const addOpponentRevealedMove = (move: string) => {
    const trimmed = move.trim()
    if (!trimmed) return false
    const nextMoves = [...oppMember.revealedMoves]
    if (nextMoves.includes(trimmed) || nextMoves.length >= 4) return false
    const next = [...opponents]
    next[selectedOpp] = { ...oppMember, revealedMoves: [...nextMoves, trimmed] }
    setOpponents(next)
    return true
  }
  const commitOpponentMoveDraft = () => {
    const top = filterMoveOptions(opponentMoveDraft, oppMoveOptions)[0]
    if (!top) return false
    const added = addOpponentRevealedMove(top.name)
    if (added) {
      setOpponentMoveDraft('')
      setOpponentMoveInputFocused(false)
    }
    return added
  }
  const commitCalcOpponentMoveDraft = () => {
    const top = filterMoveOptions(calcOpponentMoveDraft, oppMoveOptions)[0]
    if (!top) return false
    const added = addOpponentRevealedMove(top.name)
    if (added) {
      setCalcOpponentMoveDraft('')
      setCalcOpponentMoveInputFocused(false)
    }
    return added
  }
  const removeOpponentRevealedMove = (move: string) => {
    const next = [...opponents]
    next[selectedOpp] = { ...oppMember, revealedMoves: oppMember.revealedMoves.filter((entry) => entry !== move) }
    setOpponents(next)
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
  const commitOpponentItemInput = (idx: number, rawValue?: string) => {
    const member = opponents[idx]
    if (!member) return false
    const resolved = resolveItemInput(member.key, rawValue ?? opponentItemDrafts[idx] ?? '', siteLanguage)
    const next = [...opponents]
    next[idx] = { ...member, item: resolved }
    setOpponents(next)
    setOpponentItemDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[idx] = displayItemLabel(resolved, siteLanguage)
      return nextDrafts
    })
    return Boolean(resolved)
  }
  const commitOpponentAbilityInput = (idx: number, rawValue?: string) => {
    const member = opponents[idx]
    if (!member) return false
    const options = abilitiesForKey(member.key, siteLanguage)
    if (!options.length) {
      const next = [...opponents]
      next[idx] = { ...member, ability: '' }
      setOpponents(next)
      setOpponentAbilityDrafts((prev) => {
        const nextDrafts = [...prev]
        nextDrafts[idx] = ''
        return nextDrafts
      })
      return false
    }
    const resolved = resolveAbilityInput(options, rawValue ?? opponentAbilityDrafts[idx] ?? '')
    const next = [...opponents]
    next[idx] = { ...member, ability: resolved }
    setOpponents(next)
    setOpponentAbilityDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[idx] = resolved
      return nextDrafts
    })
    return Boolean(resolved)
  }
  const selectOpponentAbilityOption = (idx: number, ability: string) => {
    const member = opponents[idx]
    if (!member) return
    const next = [...opponents]
    next[idx] = { ...member, ability }
    setOpponents(next)
    setOpponentAbilityDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[idx] = ability
      return nextDrafts
    })
    setActiveOpponentAbilityField(null)
  }
  const clearOpponentAbilityInput = (idx: number) => {
    const member = opponents[idx]
    if (!member) return
    const next = [...opponents]
    next[idx] = { ...member, ability: '' }
    setOpponents(next)
    setOpponentAbilityDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[idx] = ''
      return nextDrafts
    })
    setActiveOpponentAbilityField(idx)
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
      const allowedAbilities = abilitiesForKey(key, siteLanguage)
      const nextAbility = allowedAbilities.includes(member.ability) ? member.ability : ''
      const next = [...opponents]
      next[idx] = { ...member, key, item: normalizeItemForKey(key, member.item), ability: nextAbility }
      setOpponents(next)
      setOpponentItemDrafts((prev) => {
        const nextDrafts = [...prev]
        nextDrafts[idx] = displayItemLabel(visibleChampionsItem(key, next[idx].item), siteLanguage)
        return nextDrafts
      })
      setOpponentAbilityDrafts((prev) => {
        const nextDrafts = [...prev]
        nextDrafts[idx] = nextAbility
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
  const effectiveCalcMode = activeDamageMoveCategory ?? calcMode
  const effectiveMovePower = activeDamageMovePower ?? movePower
  const damageModifiers = resolveDamageModifiers({
    attackerAbility: attackerAbilitySlug,
    attackerItem: attackFromOpponent ? oppMember.item : myMember.item,
    defenderAbility: defenderAbilitySlug,
    defenderItem: attackFromOpponent ? myMember.item : oppMember.item,
    moveName: activeDamageMove,
    baseMoveType: activeDamageMoveBaseType,
    moveType: activeDamageMoveType,
    movePower: effectiveMovePower,
    mode: effectiveCalcMode,
    effectiveness: activeDamageMoveType ? autoEffectiveness : effectiveness,
    attackStage: calcAttackStage,
    defenseStage: calcDefenseStage,
    defenderTypes: effectiveDefenderTypes,
    burned: calcBurned,
    attackerLowHp: calcAttackerLowHp,
    targetPoisoned: calcTargetPoisoned,
    defenderFullHp: calcDefenderFullHp,
    movedAfterTarget: calcMovedAfterTarget,
    faintedAllies: calcFaintedAllies,
    rivalryMode: calcRivalryMode,
    parentalBond: calcParentalBond,
    defenderStatused: calcDefenderStatused,
    electromorphosisCharged: calcElectromorphosisCharged,
    critical: calcCritical || activeDamageMoveAlwaysCrit,
    weather: calcWeather,
    terrain: calcTerrain,
    reflect: calcReflect,
    lightScreen: calcLightScreen,
    auroraVeil: calcAuroraVeil,
    friendGuard: calcFriendGuard,
  })
  const damage = attackerBattleStats && defenderBattleStats && defenderRow && !activeDamageMoveIsStatus
    ? calcDamage(attackerBattleStats, defenderBattleStats, effectiveMovePower, effectiveCalcMode, activeDamageMoveType ? autoStab : stab, damageModifiers.effectiveness, activeDamageMoveMeta, damageModifiers)
    : null
  const damageVerdict = defenderBattleStats && damage ? resolveDamageVerdict(damage, defenderBattleStats.hp, siteLanguage) : null
  const applyOpponentBulkPresetSelection = (preset: OpponentBulkPreset) => {
    setCalcOpponentBulkPreset(preset)
    if (preset === 'custom') return
    const next = opponentBulkStateFromPreset(preset)
    setCalcOpponentHpEv(next.hpEv)
    setCalcOpponentDefenseEv(next.defenseEv)
    setCalcOpponentSpDefenseEv(next.spDefenseEv)
    setCalcOpponentDefenseNature(next.defenseNature)
    setCalcOpponentSpDefenseNature(next.spDefenseNature)
  }
  const updateOpponentBulkState = (patch: Partial<OpponentBulkState>) => {
    const nextState = sanitizeOpponentBulkState({ ...opponentBulkState, ...patch }, 'custom')
    setCalcOpponentHpEv(nextState.hpEv)
    setCalcOpponentDefenseEv(nextState.defenseEv)
    setCalcOpponentSpDefenseEv(nextState.spDefenseEv)
    setCalcOpponentDefenseNature(nextState.defenseNature)
    setCalcOpponentSpDefenseNature(nextState.spDefenseNature)
    setCalcOpponentBulkPreset(detectOpponentBulkPreset(nextState))
  }
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
  const sampleCalcConfig = sampleFixedMegaStone ? { ...sampleForge.config, scarf: false } : sampleForge.config
  const sampleCalcMember = sampleFixedMegaStone ? { ...sampleForge, config: sampleCalcConfig } : sampleForge
  const sampleCurrentItem = visibleChampionsItem(sampleForge.key, sampleForge.item)
  const sampleEvTotal = Object.values(sampleForge.evs).reduce((sum, value) => sum + value, 0)
  const sampleSpeedValueNow = partySpeedValue(sampleRow, sampleCalcMember)
  const sampleSpeedAbilityLine = sampleRow ? mySpeedAbilityMarker(sampleRow, sampleCalcMember, siteLanguage) : null
  const sampleSpeedSearchResults = filterSpeciesOptions(sampleSpeedSearch, { includeMega: true })
    .filter((option) => !sampleSpeedTargets.some((target) => target.key === option.key))
    .slice(0, 8)
  const sampleSpeedCalcs = sampleSpeedTargets.map((member, idx) => {
    const row = member.key ? (indexByKey.get(member.key) ?? null) : null
    if (!row) return null
    const scenarios = [
      { id: 'base', label: lt('준속'), speed: opponentScenarioSpeed(row, CHAMPIONS_EFFORT_PER_STAT_CAP, false, false, member.speedStage) },
      { id: 'fast', label: lt('최속'), speed: opponentScenarioSpeed(row, CHAMPIONS_EFFORT_PER_STAT_CAP, true, false, member.speedStage) },
      { id: 'neutral-scarf', label: `${lt('준속')} ${lt('스카프')}`, speed: opponentScenarioSpeed(row, CHAMPIONS_EFFORT_PER_STAT_CAP, false, true, member.speedStage) },
      { id: 'scarf', label: `${lt('최속')} ${lt('스카프')}`, speed: opponentScenarioSpeed(row, CHAMPIONS_EFFORT_PER_STAT_CAP, true, true, member.speedStage) },
    ]
    const doubleSpeedAbility = speedAbilityCandidate(row, siteLanguage)
    if (doubleSpeedAbility) {
      scenarios.push({ id: 'ability', label: doubleSpeedAbility.label, speed: opponentScenarioSpeed(row, CHAMPIONS_EFFORT_PER_STAT_CAP, true, false, member.speedStage) * 2 })
    }
    const cutoffs = scenarios.map((scenario) => ({
      ...scenario,
      needs: mySpeedNeeds(sampleRow, sampleCalcConfig, scenario.speed),
      result: sampleSpeedValueNow > scenario.speed ? lt('내가 앞섬') : sampleSpeedValueNow < scenario.speed ? lt('상대가 앞섬') : lt('동속'),
    }))
    return { idx, member, row, cutoffs }
  }).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
  const sampleDamageMoveChoices = Array.from(new Set(sampleRegisteredMoves.filter((move): move is string => Boolean(move.trim()))))
  const sampleAttackerStats = buildPartyBattleStats(sampleRow, sampleCalcMember)
  React.useEffect(() => {
    if (!sampleFixedMegaStone || !sampleForge.config.scarf) return
    setSampleForge((prev) => prev.config.scarf ? { ...prev, config: { ...prev.config, scarf: false } } : prev)
  }, [sampleFixedMegaStone, sampleForge.config.scarf])

  const sampleDamageSearchResults = filterSpeciesOptions(sampleDamageSearch, { includeMega: true })
    .filter((option) => !sampleDamageTargets.some((target) => target.key === option.key))
    .slice(0, 8)
  const sampleAttackerAbilityValue = sampleRow ? (resolveSelectedAbility(sampleRow, sampleForge.ability, siteLanguage)?.slug ?? sampleForge.ability) : sampleForge.ability
  const sampleUsesTypeChangeStabAbility = sampleAttackerAbilityValue === 'protean' || sampleAttackerAbilityValue === 'libero' || sampleAttackerAbilityValue === '변환자재'
  const sampleDamageDefenderAbilitySlugs = sampleDamageTargets.map((member) => {
    const row = member.key ? (indexByKey.get(member.key) ?? null) : null
    return row ? (resolveSelectedAbility(row, member.ability, siteLanguage)?.slug ?? member.ability) : member.ability
  })
  const sampleShowAttackerLowHpToggle = ['blaze', 'torrent', 'overgrow', 'swarm'].includes(sampleAttackerAbilityValue)
  const sampleShowTargetPoisonedToggle = sampleAttackerAbilityValue === 'merciless'
  const sampleShowMovedAfterTargetToggle = sampleAttackerAbilityValue === 'analytic'
  const sampleShowFaintedAlliesInput = sampleAttackerAbilityValue === 'supreme-overlord'
  const sampleShowRivalryModeInput = sampleAttackerAbilityValue === 'rivalry'
  const sampleShowParentalBondToggle = sampleAttackerAbilityValue === 'parental-bond'
  const sampleShowElectromorphosisToggle = sampleAttackerAbilityValue === 'electromorphosis'
  const sampleShowDefenderStatusedToggle = sampleDamageDefenderAbilitySlugs.includes('marvel-scale')
  const sampleShowDefenderFullHpToggle = sampleDamageDefenderAbilitySlugs.some((ability) => ability === 'multiscale' || ability === 'shadow-shield')
  const sampleDamageCalcs = sampleDamageTargets.map((member, idx) => {
    const row = member.key ? (indexByKey.get(member.key) ?? null) : null
    const defenderAbilityValue = row ? (resolveSelectedAbility(row, member.ability, siteLanguage)?.slug ?? member.ability) : member.ability
    const moveName = member.moveName || sampleDamageMoveChoices[0] || ''
    const moveMetaBase = resolveMoveMeta(moveName, sampleMoveOptions, movePoolByKey)
    const moveHitOptions = multiHitOptions(moveName)
    const moveHitCount = moveHitOptions?.includes(calcHitCount) ? calcHitCount : (moveHitOptions?.[0] ?? null)
    const moveRule = moveName ? CONDITIONAL_MOVE_POWER_RULES[moveName] ?? null : null
    const moveConditionValue = moveRule ? normalizeConditionalPowerValue(moveRule, calcConditionalPowerValues[moveName] ?? moveRule.defaultValue) : null
    const targetWeightKg = row ? (typeof row.weightKg === 'number' ? row.weightKg : weightByKey[row.key] ?? null) : null
    const moveMeta = applyConditionalMovePower(
      moveName,
      applyTargetWeightMovePower(
        moveName,
        resolveAbilityAdjustedMoveMeta(
          moveName,
          resolveMultiHitMeta(moveName, moveMetaBase, moveHitCount, sampleAttackerAbilityValue),
          sampleAttackerAbilityValue,
        ),
        targetWeightKg,
      ),
      moveConditionValue,
    )
    const moveType = moveMeta?.type ?? null
    const moveCategory = moveMeta?.category === 'physical' || moveMeta?.category === 'special' ? moveMeta.category : null
    const movePower = typeof moveMeta?.power === 'number' ? moveMeta.power : null
    const unavailableReason = !row
      ? lt('비교 대상 없음')
      : !moveName
        ? lt('등록 기술 없음')
        : moveMeta?.category === 'status'
          ? lt('변화기는 데미지 계산 대상이 아님')
          : (!movePower || !moveCategory || !moveType)
            ? lt('수동 위력')
            : null
    const effectiveAttackerTypes = row ? resolveAbilityAdjustedTypes(sampleRow.types, sampleAttackerAbilityValue, calcWeather, calcTerrain) : sampleRow.types
    const effectiveDefenderTypes = row ? resolveAbilityAdjustedTypes(row.types, defenderAbilityValue, calcWeather, calcTerrain) : []
    const defenderStats = row ? buildOpponentBattleStats(row, {
      hpEv: member.hpEv,
      defenseEv: member.defenseEv,
      spDefenseEv: member.spDefenseEv,
      defenseNature: member.defenseNature,
      spDefenseNature: member.spDefenseNature,
    }) : null
    if (!row || !defenderStats || unavailableReason || !moveType || !moveCategory || !movePower) {
      return { idx, member, row, moveName, moveCategory, attackStatLabel: moveCategory === 'physical' ? '공격' : '특수공격', attackStatValue: moveCategory === 'physical' ? sampleAttackerStats.attack : sampleAttackerStats.spAttack, defenderStats, damage: null, verdict: unavailableReason, moveRule, moveConditionValue, moveHitOptions, moveHitCount, moveHitSummary: multiHitSummary(moveName, moveMeta, moveHitCount), targetWeightKnown: typeof targetWeightKg === 'number', unavailableReason }
    }
    const effectivenessValue = typeEffectiveness(moveType, effectiveDefenderTypes)
    const modifierPack = resolveDamageModifiers({
      attackerAbility: sampleAttackerAbilityValue,
      attackerItem: sampleForge.item,
      defenderAbility: defenderAbilityValue,
      defenderItem: member.item,
      moveName,
      baseMoveType: moveMetaBase?.type ?? moveType,
      moveType,
      movePower,
      mode: moveCategory,
      effectiveness: effectivenessValue,
      attackStage: calcAttackStage,
      defenseStage: calcDefenseStage,
      defenderTypes: effectiveDefenderTypes,
      burned: calcBurned,
      attackerLowHp: calcAttackerLowHp,
      targetPoisoned: calcTargetPoisoned,
      defenderFullHp: calcDefenderFullHp,
      movedAfterTarget: calcMovedAfterTarget,
      faintedAllies: calcFaintedAllies,
      rivalryMode: calcRivalryMode,
      parentalBond: calcParentalBond,
      defenderStatused: calcDefenderStatused,
      electromorphosisCharged: calcElectromorphosisCharged,
      critical: calcCritical,
      weather: calcWeather,
      terrain: calcTerrain,
      reflect: calcReflect,
      lightScreen: calcLightScreen,
      auroraVeil: calcAuroraVeil,
      friendGuard: calcFriendGuard,
    })
    const attackStatLabel = moveCategory === 'physical' ? '공격' : '특수공격'
    const attackStatValue = moveCategory === 'physical' ? sampleAttackerStats.attack : sampleAttackerStats.spAttack
    const damage = calcDamage(sampleAttackerStats, defenderStats, movePower, moveCategory, resolveStabMultiplier(effectiveAttackerTypes, moveType, sampleAttackerAbilityValue, calcTypeChangeStab), modifierPack.effectiveness, moveMeta, modifierPack)
    return { idx, member, row, moveName, moveCategory, attackStatLabel, attackStatValue, defenderStats, damage, verdict: damage ? resolveDamageVerdict(damage, defenderStats.hp, siteLanguage) : lt('데미지 계산 불가'), moveRule, moveConditionValue, moveHitOptions, moveHitCount, moveHitSummary: multiHitSummary(moveName, moveMeta, moveHitCount), targetWeightKnown: typeof targetWeightKg === 'number', unavailableReason: damage ? null : lt('데미지 계산 불가') }
  })

  const addSampleSpeedTarget = (key: string) => {
    setSampleSpeedTargets((prev) => ([
      ...prev,
      { ...blankSampleSpeedTarget(), key },
    ]))
    setSampleSpeedSearch('')
    setSampleSpeedSearchOpen(false)
  }

  const updateSampleSpeedTarget = (idx: number, patch: Partial<SampleSpeedTarget>) => {
    setSampleSpeedTargets((prev) => prev.map((entry, entryIdx) => (entryIdx === idx ? { ...entry, ...patch } : entry)))
  }

  const removeSampleSpeedTarget = (idx: number) => {
    setSampleSpeedTargets((prev) => prev.filter((_, entryIdx) => entryIdx !== idx))
  }

  const addSampleDamageTarget = (key: string) => {
    setSampleDamageTargets((prev) => ([
      ...prev,
      { ...blankSampleDamageTarget(), key, moveName: sampleDamageMoveChoices[0] ?? '' },
    ]))
    setSampleDamageSearch('')
    setSampleDamageSearchOpen(false)
  }

  const updateSampleDamageTarget = (idx: number, patch: Partial<SampleDamageTarget>) => {
    setSampleDamageTargets((prev) => prev.map((entry, entryIdx) => (entryIdx === idx ? { ...entry, ...patch } : entry)))
  }

  const applySampleDamageBulkPresetSelection = (idx: number, preset: OpponentBulkPreset) => {
    if (preset === 'custom') return
    const next = opponentBulkStateFromPreset(preset)
    updateSampleDamageTarget(idx, {
      hpEv: next.hpEv,
      defenseEv: next.defenseEv,
      spDefenseEv: next.spDefenseEv,
      defenseNature: next.defenseNature,
      spDefenseNature: next.spDefenseNature,
    })
  }

  const removeSampleDamageTarget = (idx: number) => {
    setSampleDamageTargets((prev) => prev.filter((_, entryIdx) => entryIdx !== idx))
  }

  const scrollToSampleSection = (sectionId: string) => {
    if (typeof document === 'undefined') return
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const applyMemberToPartySlot = (member: PartyMember, slotIdx: number) => {
    const target = party[slotIdx]
    if (!target) return
    const next = [...party]
    next[slotIdx] = {
      ...member,
      picked: target.picked,
      key: member.key,
      evs: { ...member.evs },
      config: { ...member.config },
      tuning: { ...member.tuning },
      item: member.item,
    }
    setParty(next)
    setPartyItemDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[slotIdx] = visibleChampionsItem(member.key, member.item)
      return nextDrafts
    })
    const nextSearch = [...partySearch]
    nextSearch[slotIdx] = searchDisplayLabel(member.key, siteLanguage)
    setPartySearch(nextSearch)
    setSelectedMy(slotIdx)
    setMainSection('single')
    setActiveTab('party')
  }

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
    applyMemberToPartySlot(sampleForge, slotIdx)
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

  const nudgeTuningEffort = (slotIdx: number, stat: EffortStatKey, delta: number, availableCap: number) => {
    const next = [...party]
    const current = next[slotIdx].evs[stat]
    next[slotIdx] = { ...next[slotIdx], evs: applyChampionsEffort(next[slotIdx].evs, stat, Math.max(0, Math.min(availableCap, current + delta))) }
    setParty(next)
  }

  const updateSampleEffortFromPointer = (stat: EffortStatKey, availableCap: number, clientX: number, element: HTMLDivElement) => {
    const rect = element.getBoundingClientRect()
    if (rect.width <= 0) return
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const nextValue = Math.round(ratio * availableCap)
    setSampleForge((prev) => ({ ...prev, evs: applyChampionsEffort(prev.evs, stat, nextValue) }))
  }

  const nudgeSampleEffort = (stat: EffortStatKey, delta: number, availableCap: number) => {
    setSampleForge((prev) => ({
      ...prev,
      evs: applyChampionsEffort(prev.evs, stat, Math.max(0, Math.min(availableCap, prev.evs[stat] + delta))),
    }))
  }

  const focusEffortRange = (element: HTMLDivElement) => {
    const range = element.querySelector<HTMLInputElement>('.effort-gauge-range')
    range?.focus()
  }

  const renderSampleForgeEffortGrid = (scope: 'speed' | 'damage') => {
    if (!sampleRow) return null
    const visibleStats = scope === 'speed'
      ? EFFORT_STAT_OPTIONS.filter((stat) => stat.key === 'speed')
      : EFFORT_STAT_OPTIONS.filter((stat) => stat.key === 'attack' || stat.key === 'spAttack')
    return <div className={`drag-stat-list sample-embedded-drag-stat-list sample-embedded-drag-stat-list-${scope}`}>
      {visibleStats.map((stat) => {
        const currentEffort = sampleForge.evs[stat.key]
        const availableCap = Math.min(CHAMPIONS_EFFORT_PER_STAT_CAP, remainingEffortPoints(sampleForge.evs, stat.key))
        const additionalAvailable = Math.max(0, availableCap - currentEffort)
        const actualValue = partyStatValue(sampleRow, sampleForge, stat.key)
        const isMagicStat = sampleMagicCandidate?.stat === stat.key && actualValue % 11 === 0
        const targetEffort = sampleMagicCandidate?.stat === stat.key ? sampleMagicCandidate.nextEffort : null
        const magicPoints = magicEffortPoints(sampleRow, sampleForge, stat.key)
        return <div key={`${scope}-sample-drag-stat-${stat.key}`} className={`drag-stat-card ${statThemeClass(stat.key)} ${isMagicStat ? 'magic' : ''}`}>
          <div className="row-between"><strong>{lt(stat.label)}</strong><span>{actualValue}</span></div>
          <div className="effort-gauge-wrap" role="group" aria-label={`${lt(stat.label)} effort points`}>
            <div className={`effort-gauge-track ${statThemeClass(stat.key)}`} tabIndex={0} role="slider" aria-label={`${lt(stat.label)} effort points`} aria-valuemin={0} aria-valuemax={availableCap} aria-valuenow={currentEffort} onKeyDown={(e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeSampleEffort(stat.key, -1, availableCap) } if (e.key === 'ArrowRight') { e.preventDefault(); nudgeSampleEffort(stat.key, 1, availableCap) } }} onPointerDown={(e) => { e.preventDefault(); focusEffortRange(e.currentTarget); e.currentTarget.setPointerCapture(e.pointerId); updateSampleEffortFromPointer(stat.key, availableCap, e.clientX, e.currentTarget) }} onPointerMove={(e) => { if ((e.buttons & 1) !== 1) return; updateSampleEffortFromPointer(stat.key, availableCap, e.clientX, e.currentTarget) }} onPointerUp={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId) }}>
              <div className={`effort-gauge-cells ${statThemeClass(stat.key)}`} aria-hidden="true">{Array.from({ length: CHAMPIONS_EFFORT_PER_STAT_CAP }, (_, cellIdx) => { const point = cellIdx + 1; const reachable = point <= availableCap; const filled = point <= currentEffort; const magicPoint = magicPoints.includes(point); const currentPoint = point === currentEffort && currentEffort > 0; const checkpointPoint = EFFORT_CHECKPOINTS.includes(point as 11 | 22 | 32); const targetPoint = point === targetEffort; return <span key={`${scope}-sample-effort-cell-${stat.key}-${point}`} className={['effort-gauge-cell', reachable ? 'reachable' : 'locked', filled ? 'filled' : '', magicPoint ? 'magic' : '', currentPoint ? 'current' : '', checkpointPoint ? 'checkpoint' : '', targetPoint ? 'target' : ''].filter(Boolean).join(' ')} title={`${lt(stat.label)} ${point}pt`} /> })}</div>
              <input type="range" className="effort-gauge-range" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} step={1} value={currentEffort} onKeyDown={(e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeSampleEffort(stat.key, -1, availableCap) } if (e.key === 'ArrowRight') { e.preventDefault(); nudgeSampleEffort(stat.key, 1, availableCap) } }} onChange={(e) => setSampleForge((prev) => ({ ...prev, evs: applyChampionsEffort(prev.evs, stat.key, e.target.value) }))} />
            </div>
            <div className={`effort-gauge-scale ${statThemeClass(stat.key)}`}>{EFFORT_CHECKPOINTS.map((checkpoint) => { const checkpointValue = partyStatValue(sampleRow, { ...sampleForge, evs: { ...sampleForge.evs, [stat.key]: checkpoint } }, stat.key); return <div key={`${scope}-sample-effort-scale-${stat.key}-${checkpoint}`} className="effort-gauge-scale-item"><span>{checkpoint}pt</span><small>{stat.key === sampleMagicCandidate?.stat ? checkpointValue : ''}</small></div> })}</div>
          </div>
          <div className="effort-cell-toolbar"><button type="button" className="mini-action" onClick={() => setSampleForge((prev) => ({ ...prev, evs: applyChampionsEffort(prev.evs, stat.key, Math.max(0, currentEffort - 1)) }))} disabled={currentEffort <= 0}>-1</button><button type="button" className="mini-action" onClick={() => setSampleForge((prev) => ({ ...prev, evs: applyChampionsEffort(prev.evs, stat.key, 0) }))} disabled={currentEffort <= 0}>{lt('최소')}</button><button type="button" className="mini-action" onClick={() => setSampleForge((prev) => ({ ...prev, evs: applyChampionsEffort(prev.evs, stat.key, availableCap) }))} disabled={currentEffort >= availableCap}>{lt('최대')}</button><button type="button" className="mini-action" onClick={() => setSampleForge((prev) => ({ ...prev, evs: applyChampionsEffort(prev.evs, stat.key, Math.min(availableCap, currentEffort + 1)) }))} disabled={currentEffort >= availableCap}>+1</button></div>
          <div className="row-between effort-cell-meta"><span className="muted-inline">{lt('현재')} {currentEffort}pt · {lt('추가 가능')} {additionalAvailable}pt</span>{sampleMagicCandidate?.stat === stat.key && targetEffort ? <span className="magic-inline">{lt('목표')} {targetEffort}칸</span> : isMagicStat ? <span className="magic-inline">{lt('11배수 달성')}</span> : null}</div>
        </div>
      })}
    </div>
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
    const allowedAbilities = abilitiesForKey(resolvedKey, siteLanguage)
    const nextAbility = allowedAbilities.includes(opponents[slotIdx]?.ability) ? opponents[slotIdx]?.ability ?? '' : ''
    const next = [...opponents]
    next[slotIdx] = { ...next[slotIdx], key: resolvedKey, item: normalizeItemForKey(resolvedKey, next[slotIdx].item), ability: nextAbility }
    setOpponents(next)
    setOpponentItemDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[slotIdx] = displayItemLabel(visibleChampionsItem(resolvedKey, next[slotIdx].item), siteLanguage)
      return nextDrafts
    })
    setOpponentAbilityDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[slotIdx] = nextAbility
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
    setOpponentAbilityDrafts(next.map(() => ''))
    setActiveOpponentAbilityField(null)
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
    setOpponentAbilityDrafts(emptyOpponents.map(() => ''))
    setActiveOpponentAbilityField(null)
    setSelectedMy(0)
    setSelectedOpp(0)
    setOpponentQuickSearch('')
    setActivePartyMetaEditor(null)
    setActiveSampleMetaEditor(null)
    setTuningModalIndex(null)
    setMovePower(90)
    setCalcMode('special')
    setCalcSwapSides(false)
    setCalcAttackStage(0)
    setCalcDefenseStage(0)
    setCalcHitCount(3)
    setCalcWeather('none')
    setCalcTerrain('none')
    setCalcBurned(false)
    setCalcCritical(false)
    setCalcAttackerLowHp(false)
    setCalcTargetPoisoned(false)
    setCalcDefenderFullHp(false)
    setCalcMovedAfterTarget(false)
    setCalcFaintedAllies(0)
    setCalcRivalryMode('neutral')
    setCalcParentalBond(false)
    setCalcDefenderStatused(false)
    setCalcElectromorphosisCharged(false)
    setCalcReflect(false)
    setCalcLightScreen(false)
    setCalcAuroraVeil(false)
    setCalcFriendGuard(false)
    setCalcTypeChangeStab(true)
    setCalcConditionalPowerValues({})
    setCalcOpponentBulkPreset('neutral-0')
    setCalcOpponentHpEv(0)
    setCalcOpponentDefenseEv(0)
    setCalcOpponentSpDefenseEv(0)
    setCalcOpponentDefenseNature(1)
    setCalcOpponentSpDefenseNature(1)
    setStab(1.5)
    setEffectiveness(1)
    setBattleNote('')
    setConfirmedMovesByKey({})
    setActiveTab('party')
    setMainSection('home')
    setSampleForge(defaultSampleForge())
    setSampleItemDraft(visibleChampionsItem(defaultSampleForge().key, defaultSampleForge().item))
    setSampleSearch(searchDisplayLabel(defaultSampleForge().key, siteLanguage))
    setSavedSamples([])
    setSampleSpeedTargets(defaultSampleSpeedTargets)
    setSampleDamageTargets(defaultSampleDamageTargets)
    setSampleSpeedSearch('')
    setSampleDamageSearch('')
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
      calcSwapSides,
      calcAttackStage,
      calcDefenseStage,
      calcHitCount,
      calcWeather,
      calcTerrain,
      calcBurned,
      calcCritical,
      calcAttackerLowHp,
      calcTargetPoisoned,
      calcDefenderFullHp,
      calcMovedAfterTarget,
      calcFaintedAllies,
      calcRivalryMode,
      calcParentalBond,
      calcDefenderStatused,
      calcElectromorphosisCharged,
      calcReflect,
      calcLightScreen,
      calcAuroraVeil,
      calcFriendGuard,
      calcTypeChangeStab,
      calcConditionalPowerValues,
      calcOpponentBulkPreset,
      calcOpponentHpEv,
      calcOpponentDefenseEv,
      calcOpponentSpDefenseEv,
      calcOpponentDefenseNature,
      calcOpponentSpDefenseNature,
      battleNote,
      confirmedMovesByKey,
      mainSection,
      sampleForge,
      savedSamples,
      sampleWorkbenchTab,
      sampleSpeedTargets,
      sampleDamageTargets,
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
      setOpponentAbilityDrafts(nextOpponents.map((member) => member.ability ?? ''))
      setPartySearch(nextParty.map((member) => searchDisplayLabel(member.key, siteLanguage)))
      setOpponentSearch(nextOpponents.map((member) => searchDisplayLabel(member.key, siteLanguage)))
      setSelectedMy(sanitizeSelectedIndex(parsed.selectedMy, nextParty.length))
      setSelectedOpp(sanitizeSelectedIndex(parsed.selectedOpp, nextOpponents.length))
      setCalcSwapSides(Boolean(parsed.calcSwapSides))
      setCalcAttackStage(clampBattleStage(parsed.calcAttackStage))
      setCalcDefenseStage(clampBattleStage(parsed.calcDefenseStage))
      setCalcHitCount(Number.isFinite(Number(parsed.calcHitCount)) ? Math.max(1, Math.trunc(Number(parsed.calcHitCount))) : 3)
      setCalcWeather(parsed.calcWeather ?? 'none')
      setCalcTerrain(parsed.calcTerrain ?? 'none')
      setCalcBurned(Boolean(parsed.calcBurned))
      setCalcCritical(Boolean(parsed.calcCritical))
      setCalcAttackerLowHp(Boolean(parsed.calcAttackerLowHp))
      setCalcTargetPoisoned(Boolean(parsed.calcTargetPoisoned))
      setCalcDefenderFullHp(Boolean(parsed.calcDefenderFullHp))
      setCalcMovedAfterTarget(Boolean(parsed.calcMovedAfterTarget))
      setCalcFaintedAllies(Number.isFinite(Number(parsed.calcFaintedAllies)) ? Math.max(0, Math.min(5, Math.trunc(Number(parsed.calcFaintedAllies)))) : 0)
      setCalcRivalryMode(parsed.calcRivalryMode === 'same' || parsed.calcRivalryMode === 'opposite' ? parsed.calcRivalryMode : 'neutral')
      setCalcParentalBond(Boolean(parsed.calcParentalBond))
      setCalcDefenderStatused(Boolean(parsed.calcDefenderStatused))
      setCalcElectromorphosisCharged(Boolean(parsed.calcElectromorphosisCharged))
      setCalcReflect(Boolean(parsed.calcReflect))
      setCalcLightScreen(Boolean(parsed.calcLightScreen))
      setCalcAuroraVeil(Boolean(parsed.calcAuroraVeil))
      setCalcFriendGuard(Boolean(parsed.calcFriendGuard))
      setCalcTypeChangeStab(parsed.calcTypeChangeStab !== false)
      setSampleWorkbenchTab(parsed.sampleWorkbenchTab ?? 'builder')
      setSampleSpeedTargets(sanitizeSampleSpeedTargets(parsed.sampleSpeedTargets))
      setSampleDamageTargets(sanitizeSampleDamageTargets(parsed.sampleDamageTargets))
      setCalcConditionalPowerValues((parsed.calcConditionalPowerValues && typeof parsed.calcConditionalPowerValues === 'object') ? parsed.calcConditionalPowerValues as Record<string, ConditionalPowerValue> : {})
      const nextBulkPreset = sanitizeOpponentBulkPreset(parsed.calcOpponentBulkPreset)
      const nextBulkState = sanitizeOpponentBulkState({
        hpEv: parsed.calcOpponentHpEv,
        defenseEv: parsed.calcOpponentDefenseEv,
        spDefenseEv: parsed.calcOpponentSpDefenseEv,
        defenseNature: parsed.calcOpponentDefenseNature,
        spDefenseNature: parsed.calcOpponentSpDefenseNature,
      }, nextBulkPreset)
      setCalcOpponentBulkPreset(nextBulkPreset)
      setCalcOpponentHpEv(nextBulkState.hpEv)
      setCalcOpponentDefenseEv(nextBulkState.defenseEv)
      setCalcOpponentSpDefenseEv(nextBulkState.spDefenseEv)
      setCalcOpponentDefenseNature(nextBulkState.defenseNature)
      setCalcOpponentSpDefenseNature(nextBulkState.spDefenseNature)
      setBattleNote(typeof parsed.battleNote === 'string' ? parsed.battleNote : '')
      setConfirmedMovesByKey(parsed.confirmedMovesByKey ?? {})
      setMainSection(parsed.mainSection ?? 'home')
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
            <div className="header-title-stack">
              <div>
                <h1>Pokemon Champions Battle Assistant</h1>
                <p>{mainSection === 'home' ? lt('포켓몬 챔피언스 싱글 배틀에서 파티·선출·스피드·결정력을 한 번에 정리합니다.') : menuLabelForSection(mainSection, activeTab, siteLanguage)}</p>
              </div>
              <div className="header-primary-tabs" role="tablist" aria-label={lt('모드 선택')}>
                <button type="button" className={`header-primary-tab ${mainSection === 'home' ? 'active' : ''}`} onClick={() => setMainSection('home')}>{lt('홈')}</button>
                <button type="button" className={`header-primary-tab ${mainSection === 'single' ? 'active' : ''}`} onClick={() => setMainSection('single')}>{lt('싱글배틀 메뉴')}</button>
                <button type="button" className={`header-primary-tab ${mainSection === 'sample' ? 'active' : ''}`} onClick={() => setMainSection('sample')}>{lt('포켓몬 샘플 깎기')}</button>
              </div>
            </div>
          </div>
          <div className="header-utility-row">
            <div className="language-menu-wrap header-language-wrap">
              <button type="button" className="icon-button" aria-label={siteLanguage === 'en' ? 'Choose language' : siteLanguage === 'ja' ? '言語選択' : '언어 선택'} title={siteLanguage === 'en' ? 'Language' : siteLanguage === 'ja' ? '言語' : '언어'} onClick={() => { setLanguageMenuOpen((prev) => !prev); setSettingsMenuOpen(false) }}>
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
            <div className="settings-menu-wrap">
              <button type="button" className="icon-button" aria-label={siteLanguage === 'en' ? 'Settings' : siteLanguage === 'ja' ? '設定' : '설정'} title={siteLanguage === 'en' ? 'Settings' : siteLanguage === 'ja' ? '設定' : '설정'} onClick={() => { setSettingsMenuOpen((prev) => !prev); setLanguageMenuOpen(false) }}>
                <SettingsIcon />
              </button>
              {settingsMenuOpen ? (
                <div className="settings-menu">
                  <div className="settings-menu-section">
                    <span className="settings-menu-title">{lt('데이터 관리')}</span>
                    <button type="button" className="settings-action-item" onClick={() => { exportState(); setSettingsMenuOpen(false) }}>
                      <strong>{lt('백업 저장')}</strong>
                      <span>{lt('현재 작업 상태를 JSON으로 저장')}</span>
                    </button>
                    <button type="button" className="settings-action-item" onClick={() => { fileInputRef.current?.click(); setSettingsMenuOpen(false) }}>
                      <strong>{lt('백업 불러오기')}</strong>
                      <span>{lt('저장한 JSON 상태 파일을 불러오기')}</span>
                    </button>
                    <button type="button" className="settings-action-item danger" onClick={() => { resetAll(); setSettingsMenuOpen(false) }}>
                      <strong>{lt('전체 데이터 초기화')}</strong>
                      <span>{lt('파티·상대·샘플을 전부 초기화')}</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden-file" onChange={importState} />
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
                    <div className="row-between"><strong>{lt(stat.label)}</strong><span>{actualValue}</span></div>
                    <div className="effort-gauge-wrap" role="group" aria-label={`${lt(stat.label)} effort points`}>
                      <div className={`effort-gauge-track ${statThemeClass(stat.key)}`} tabIndex={0} role="slider" aria-label={`${lt(stat.label)} effort points`} aria-valuemin={0} aria-valuemax={availableCap} aria-valuenow={currentEffort} onKeyDown={(e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeTuningEffort(tuningModalIndex, stat.key, -1, availableCap) } if (e.key === 'ArrowRight') { e.preventDefault(); nudgeTuningEffort(tuningModalIndex, stat.key, 1, availableCap) } }} onPointerDown={(e) => { e.preventDefault(); focusEffortRange(e.currentTarget); e.currentTarget.setPointerCapture(e.pointerId); updateTuningEffortFromPointer(tuningModalIndex, stat.key, availableCap, e.clientX, e.currentTarget) }} onPointerMove={(e) => { if ((e.buttons & 1) !== 1) return; updateTuningEffortFromPointer(tuningModalIndex, stat.key, availableCap, e.clientX, e.currentTarget) }} onPointerUp={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId) }}>
                        <div className={`effort-gauge-cells ${statThemeClass(stat.key)}`} aria-hidden="true">{Array.from({ length: CHAMPIONS_EFFORT_PER_STAT_CAP }, (_, cellIdx) => { const point = cellIdx + 1; const reachable = point <= availableCap; const filled = point <= currentEffort; const magicPoint = magicPoints.includes(point); const currentPoint = point === currentEffort && currentEffort > 0; const checkpointPoint = EFFORT_CHECKPOINTS.includes(point as 11 | 22 | 32); const targetPoint = point === targetEffort; return <span key={`effort-cell-${stat.key}-${point}`} className={['effort-gauge-cell', reachable ? 'reachable' : 'locked', filled ? 'filled' : '', magicPoint ? 'magic' : '', currentPoint ? 'current' : '', checkpointPoint ? 'checkpoint' : '', targetPoint ? 'target' : ''].filter(Boolean).join(' ')} title={`${lt(stat.label)} ${point}pt`} /> })}</div>
                        <input type="range" className="effort-gauge-range" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} step={1} value={currentEffort} onKeyDown={(e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeTuningEffort(tuningModalIndex, stat.key, -1, availableCap) } if (e.key === 'ArrowRight') { e.preventDefault(); nudgeTuningEffort(tuningModalIndex, stat.key, 1, availableCap) } }} onChange={(e) => { const next = [...party]; next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, e.target.value) }; setParty(next) }} />
                      </div>
                      <div className={`effort-gauge-scale ${statThemeClass(stat.key)}`}>{EFFORT_CHECKPOINTS.map((checkpoint) => { const checkpointValue = partyStatValue(tuningRow, { ...tuningMember, evs: { ...tuningMember.evs, [stat.key]: checkpoint } }, stat.key); return <div key={`effort-scale-${stat.key}-${checkpoint}`} className="effort-gauge-scale-item"><span>{checkpoint}pt</span><small>{stat.key === magicCandidate?.stat ? checkpointValue : ''}</small></div> })}</div>
                    </div>
                    <div className="effort-cell-toolbar"><button type="button" className="mini-action" onClick={() => { const next = [...party]; next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, Math.max(0, currentEffort - 1)) }; setParty(next) }} disabled={currentEffort <= 0}>-1</button><button type="button" className="mini-action" onClick={() => { const next = [...party]; next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, 0) }; setParty(next) }} disabled={currentEffort <= 0}>{lt('최소')}</button><button type="button" className="mini-action" onClick={() => { const next = [...party]; next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, availableCap) }; setParty(next) }} disabled={currentEffort >= availableCap}>{lt('최대')}</button><button type="button" className="mini-action" onClick={() => { const next = [...party]; next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, Math.min(availableCap, currentEffort + 1)) }; setParty(next) }} disabled={currentEffort >= availableCap}>+1</button></div>
                    <div className="row-between effort-cell-meta"><span className="muted-inline">{lt('현재')} {currentEffort}pt · {lt('추가 가능')} {additionalAvailable}pt</span>{magicCandidate?.stat === stat.key && targetEffort ? <span className="magic-inline">{lt('목표')} {targetEffort}칸</span> : isMagicStat ? <span className="magic-inline">{lt('11배수 달성')}</span> : null}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}

      {sampleTuningModalOpen ? (
        <div className="modal-backdrop" onClick={() => setSampleTuningModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="row-between modal-header">
              <h2>{lt('노력치 보정')}</h2>
              <button type="button" className="action-button" onClick={() => setSampleTuningModalOpen(false)}>{lt('닫기')}</button>
            </div>
            <div className="modal-grid">
              <label>
                {lt('성격')}
                <select value={sampleForge.config.nature} onChange={(e) => setSampleForge((prev) => ({ ...prev, config: { ...prev.config, nature: e.target.value as NatureId } }))}>
                  {NATURES.map((nature) => <option key={`sample-modal-nature-${nature.id}`} value={nature.id}>{natureLabel(nature.id, siteLanguage)}</option>)}
                </select>
              </label>
            </div>
            <div className="drag-stat-list">
              {EFFORT_STAT_OPTIONS.map((stat) => {
                const currentEffort = sampleForge.evs[stat.key]
                const availableCap = Math.min(CHAMPIONS_EFFORT_PER_STAT_CAP, remainingEffortPoints(sampleForge.evs, stat.key))
                const additionalAvailable = Math.max(0, availableCap - currentEffort)
                const actualValue = partyStatValue(sampleRow, sampleForge, stat.key)
                const isMagicStat = sampleMagicCandidate?.stat === stat.key && actualValue % 11 === 0
                const targetEffort = sampleMagicCandidate?.stat === stat.key ? sampleMagicCandidate.nextEffort : null
                const magicPoints = magicEffortPoints(sampleRow, sampleForge, stat.key)
                return <div key={`sample-drag-stat-${stat.key}`} className={`drag-stat-card ${statThemeClass(stat.key)} ${isMagicStat ? 'magic' : ''}`}>
                  <div className="row-between"><strong>{lt(stat.label)}</strong><span>{actualValue}</span></div>
                  <div className="effort-gauge-wrap" role="group" aria-label={`${lt(stat.label)} effort points`}>
                    <div className={`effort-gauge-track ${statThemeClass(stat.key)}`} tabIndex={0} role="slider" aria-label={`${lt(stat.label)} effort points`} aria-valuemin={0} aria-valuemax={availableCap} aria-valuenow={currentEffort} onKeyDown={(e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeSampleEffort(stat.key, -1, availableCap) } if (e.key === 'ArrowRight') { e.preventDefault(); nudgeSampleEffort(stat.key, 1, availableCap) } }} onPointerDown={(e) => { e.preventDefault(); focusEffortRange(e.currentTarget); e.currentTarget.setPointerCapture(e.pointerId); updateSampleEffortFromPointer(stat.key, availableCap, e.clientX, e.currentTarget) }} onPointerMove={(e) => { if ((e.buttons & 1) !== 1) return; updateSampleEffortFromPointer(stat.key, availableCap, e.clientX, e.currentTarget) }} onPointerUp={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId) }}>
                      <div className={`effort-gauge-cells ${statThemeClass(stat.key)}`} aria-hidden="true">{Array.from({ length: CHAMPIONS_EFFORT_PER_STAT_CAP }, (_, cellIdx) => { const point = cellIdx + 1; const reachable = point <= availableCap; const filled = point <= currentEffort; const magicPoint = magicPoints.includes(point); const currentPoint = point === currentEffort && currentEffort > 0; const checkpointPoint = EFFORT_CHECKPOINTS.includes(point as 11 | 22 | 32); const targetPoint = point === targetEffort; return <span key={`sample-effort-cell-${stat.key}-${point}`} className={['effort-gauge-cell', reachable ? 'reachable' : 'locked', filled ? 'filled' : '', magicPoint ? 'magic' : '', currentPoint ? 'current' : '', checkpointPoint ? 'checkpoint' : '', targetPoint ? 'target' : ''].filter(Boolean).join(' ')} title={`${lt(stat.label)} ${point}pt`} /> })}</div>
                      <input type="range" className="effort-gauge-range" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} step={1} value={currentEffort} onKeyDown={(e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeSampleEffort(stat.key, -1, availableCap) } if (e.key === 'ArrowRight') { e.preventDefault(); nudgeSampleEffort(stat.key, 1, availableCap) } }} onChange={(e) => setSampleForge((prev) => ({ ...prev, evs: applyChampionsEffort(prev.evs, stat.key, e.target.value) }))} />
                    </div>
                    <div className={`effort-gauge-scale ${statThemeClass(stat.key)}`}>{EFFORT_CHECKPOINTS.map((checkpoint) => { const checkpointValue = partyStatValue(sampleRow, { ...sampleForge, evs: { ...sampleForge.evs, [stat.key]: checkpoint } }, stat.key); return <div key={`sample-effort-scale-${stat.key}-${checkpoint}`} className="effort-gauge-scale-item"><span>{checkpoint}pt</span><small>{stat.key === sampleMagicCandidate?.stat ? checkpointValue : ''}</small></div> })}</div>
                  </div>
                  <div className="effort-cell-toolbar"><button type="button" className="mini-action" onClick={() => setSampleForge((prev) => ({ ...prev, evs: applyChampionsEffort(prev.evs, stat.key, Math.max(0, currentEffort - 1)) }))} disabled={currentEffort <= 0}>-1</button><button type="button" className="mini-action" onClick={() => setSampleForge((prev) => ({ ...prev, evs: applyChampionsEffort(prev.evs, stat.key, 0) }))} disabled={currentEffort <= 0}>{lt('최소')}</button><button type="button" className="mini-action" onClick={() => setSampleForge((prev) => ({ ...prev, evs: applyChampionsEffort(prev.evs, stat.key, availableCap) }))} disabled={currentEffort >= availableCap}>{lt('최대')}</button><button type="button" className="mini-action" onClick={() => setSampleForge((prev) => ({ ...prev, evs: applyChampionsEffort(prev.evs, stat.key, Math.min(availableCap, currentEffort + 1)) }))} disabled={currentEffort >= availableCap}>+1</button></div>
                  <div className="row-between effort-cell-meta"><span className="muted-inline">{lt('현재')} {currentEffort}pt · {lt('추가 가능')} {additionalAvailable}pt</span>{sampleMagicCandidate?.stat === stat.key && targetEffort ? <span className="magic-inline">{lt('목표')} {targetEffort}칸</span> : isMagicStat ? <span className="magic-inline">{lt('11배수 달성')}</span> : null}</div>
                </div>
              })}
            </div>
          </div>
        </div>
      ) : null}

      <main className="grid">
        {mainSection === 'home' ? (
        <section className="panel wide home-hero-panel">
          <div className="row-between section-head home-hero-head" />
          <div className="home-route-grid">
            <button type="button" className="home-route-card accent" onClick={() => setMainSection('single')}>
              <div className="home-route-card-copy">
                <span className="home-route-eyebrow">{lt('싱글배틀 메뉴')}</span>
                <strong>{lt('싱글배틀')}</strong>
                <p>{lt('파티·상대 엔트리·스피드·결정력까지 한 흐름으로 관리합니다.')}</p>
              </div>
            </button>
            <button type="button" className="home-route-card" onClick={() => setMainSection('sample')}>
              <div className="home-route-card-copy">
                <span className="home-route-eyebrow">{lt('포켓몬 샘플 깎기')}</span>
                <strong>{lt('샘플 빌더')}</strong>
                <p>{lt('단일 포켓몬 샘플을 저장 가능한 작업 단위로 정리합니다.')}</p>
              </div>
            </button>
          </div>
        </section>
        ) : null}
        {mainSection === 'home' ? (
        <div className="home-footer-text-block">
          <div className="home-footer-text-row">
            <span className="home-footer-label">{lt('프로젝트 링크')}</span>
            <div className="home-link-list home-link-icon-list">
              <a href="https://forms.gle/Yrav9HB7Fzdffh3Q8" target="_blank" rel="noreferrer" className="home-link-pill" aria-label={lt('버그 제보')} title={lt('버그 제보')}>
                <span className="home-link-pill-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" role="img" focusable="false">
                    <path d="M14 3H6.75A2.75 2.75 0 0 0 4 5.75v12.5A2.75 2.75 0 0 0 6.75 21h10.5A2.75 2.75 0 0 0 20 18.25V9Zm0 1.5 4.5 4.5h-3A1.5 1.5 0 0 1 14 7.5Zm-5 7a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 9 11.5Zm0 3.5a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 9 15Zm0 3.5a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5A.75.75 0 0 1 9 18.5Z" fill="currentColor"/>
                  </svg>
                </span>
                <span className="home-link-pill-copy">
                  <strong>{lt('버그 제보')}</strong>
                  <span>{lt('폼으로 제보하기')}</span>
                </span>
              </a>
              <a href="mailto:me@w8385.dev" className="home-link-pill" aria-label={`${lt('연락 이메일')} me@w8385.dev`} title="me@w8385.dev">
                <span className="home-link-pill-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" role="img" focusable="false">
                    <path d="M3 5.75A2.75 2.75 0 0 1 5.75 3h12.5A2.75 2.75 0 0 1 21 5.75v12.5A2.75 2.75 0 0 1 18.25 21H5.75A2.75 2.75 0 0 1 3 18.25V5.75Zm2 .28v.22l7 5.34 7-5.34v-.22a.75.75 0 0 0-.75-.75H5.75a.75.75 0 0 0-.75.75Zm13 2.73-5.39 4.11a1 1 0 0 1-1.22 0L6 8.76v9.49c0 .41.34.75.75.75h10.5c.41 0 .75-.34.75-.75V8.76Z" fill="currentColor"/>
                  </svg>
                </span>
                <span className="home-link-pill-copy">
                  <strong>{lt('연락 이메일')}</strong>
                  <span>me@w8385.dev</span>
                </span>
              </a>
              <a href="https://github.com/w8385/Pokemon-Champions-Assistant" target="_blank" rel="noreferrer" className="home-link-pill" aria-label={lt('GitHub 저장소')} title={lt('GitHub 저장소')}>
                <span className="home-link-pill-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" role="img" focusable="false">
                    <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.5 0-.24-.01-1.04-.01-1.88-2.78.62-3.37-1.2-3.37-1.2-.46-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .08 1.53 1.05 1.53 1.05.9 1.58 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.74 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.56 1.43.21 2.48.11 2.74.64.72 1.03 1.63 1.03 2.75 0 3.95-2.33 4.82-4.56 5.07.36.32.67.95.67 1.92 0 1.39-.01 2.5-.01 2.84 0 .28.18.61.69.5A10.24 10.24 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" fill="currentColor"/>
                  </svg>
                </span>
                <span className="home-link-pill-copy">
                  <strong>{lt('GitHub 저장소')}</strong>
                </span>
              </a>
            </div>
          </div>
          <div className="home-footer-text-row">
            <span className="home-footer-label">{lt('저작권 및 안내')}</span>
            <p className="muted home-footer-copy">{lt('포켓몬 관련 명칭과 이미지에 대한 권리는 각 권리자에게 있으며, 이 프로젝트는 비공식 팬메이드 도구입니다.')}</p>
            <div className="home-reference-list-wrap">
              <span className="home-reference-label">{lt('참고 데이터베이스')}</span>
              <div className="home-reference-list">
                <span className="pick-badge">PokéAPI</span>
                <span className="pick-badge">PokemonDB</span>
                <span className="pick-badge">Serebii</span>
                <span className="pick-badge">champs.pokedb.tokyo</span>
              </div>
            </div>
          </div>
        </div>
        ) : null}
        {mainSection !== 'home' ? <section className="panel wide">
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
                    <button type="button" className={`flow-node ${activeTab === 'power' ? 'active' : ''}`} onClick={() => setActiveTab('power')}>{lt('결정력 계산')}</button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section> : null}

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
                        ['hp', '체력'],
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
                          <div className="stat-preview-topline">
                            <span>{lt(label)}</span>
                            <strong>{partyStatValue(row, member, field)}</strong>
                          </div>
                          <div className="stat-preview-bar"><span style={{ width: statGaugePercent(partyStatValue(row, member, field)) }} /></div>
                          <div className="stat-preview-meta">
                            <span className="stat-preview-ev">EV +{member.evs[field]}</span>
                          </div>
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

        {mainSection === 'home' ? null : mainSection === 'single' && activeTab === 'pick' ? <>
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
                  <button key={`opp-board-${idx}`} type="button" className={`opponent-board-card ${selectedOpp === idx ? 'active' : ''}`} onClick={() => setSelectedOpp(idx)}>
                    <span className={`opponent-board-slot-badge ${selectedOpp === idx ? 'active' : ''}`}>{selectedOpp === idx ? lt('현재') : `${idx + 1}`}</span>
                    {row?.sprite ? <img src={row.sprite} alt={displayName(row, siteLanguage)} className="pick-slot-sprite" /> : null}
                    <strong>{row ? displayName(row, siteLanguage) : emptySlotLabel(idx, siteLanguage)}</strong>
                    <span>{opponentSearch[idx] || lt('포켓몬 미입력')}</span>
                    <span>{member.ability || lt('특성 미기입')}</span>
                    <span>{member.item ? displayItemLabel(member.item, siteLanguage) : lt('도구 미기입')}</span>
                  </button>
                )
              })}
            </div>
            <div className="opponent-detail-panel">
              <div className="entry-card-top">
                {oppMember.key && oppRow?.sprite ? <img src={oppRow.sprite} alt={displayName(oppRow, siteLanguage)} className="entry-sprite large" /> : null}
                <div className="entry-card-head">
                  <div className="row-between compact-gap">
                    <strong>{oppMember.key && oppRow ? displayName(oppRow, siteLanguage) : emptySlotLabel(selectedOpp, siteLanguage)}</strong>
                  </div>
                  {oppMember.key && oppRow ? <div className="type-badge-wrap">{oppRow.types.map((type) => <TypeBadgeImage key={`${oppRow.key}-${type}`} type={type} />)}</div> : null}
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
                  <div className="opponent-item-search">
                    <div className="meta-item-input-row">
                      <input
                        className="opponent-meta-input"
                        value={opponentItemDrafts[selectedOpp] ?? ''}
                        placeholder={oppMember.key ? lt('사용 가능 도구 선택') : lt('포켓몬 먼저 선택')}
                        disabled={!oppMember.key}
                        onFocus={() => oppMember.key && setActiveItemField({ scope: 'opponent', idx: selectedOpp })}
                        onBlur={() => {
                          setTimeout(() => setActiveItemField((prev) => sameItemField(prev, 'opponent', selectedOpp) ? null : prev), 120)
                          commitOpponentItemInput(selectedOpp)
                        }}
                        onChange={(e) => {
                          const nextDrafts = [...opponentItemDrafts]
                          nextDrafts[selectedOpp] = e.target.value
                          setOpponentItemDrafts(nextDrafts)
                          setActiveItemField({ scope: 'opponent', idx: selectedOpp })
                        }}
                        onKeyDown={(e) => {
                          if (e.key !== 'Enter') return
                          e.preventDefault()
                          commitOpponentItemInput(selectedOpp)
                          setActiveItemField(null)
                        }}
                      />
                      {oppMember.key && (opponentItemDrafts[selectedOpp] || oppMember.item) ? <button type="button" className="meta-item-clear-button" aria-label="clear item" onMouseDown={(e) => {
                        e.preventDefault()
                        clearOpponentItemInput(selectedOpp)
                      }}>×</button> : null}
                    </div>
                    {oppMember.key && sameItemField(activeItemField, 'opponent', selectedOpp) ? <div className="move-autocomplete-menu">
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
                  </div>
                </label>
                <label>
                  {lt('특성')}
                  <select
                    className="opponent-meta-select"
                    value={oppMember.ability}
                    disabled={!oppMember.key}
                    onChange={(e) => {
                      const next = [...opponents]
                      next[selectedOpp] = { ...oppMember, ability: e.target.value }
                      setOpponents(next)
                    }}
                  >
                    <option value="">{oppMember.key ? lt('사용 가능 특성 선택') : lt('포켓몬 먼저 선택')}</option>
                    {abilitiesForKey(oppMember.key, siteLanguage).map((ability) => (
                      <option key={`opp-ability-option-${selectedOpp}-${ability}`} value={ability}>{ability}</option>
                    ))}
                  </select>
                </label>
                <div className="opponent-revealed-moves-card">
                  <div className="opponent-revealed-moves-head">{lt('공개 기술')}</div>
                  <div className="damage-side-moves opponent-revealed-moves-grid">
                    {oppMember.revealedMoves.length ? oppMember.revealedMoves.map((move) => {
                      const moveType = resolveMoveType(move, oppMoveOptions, movePoolByKey)
                      return (
                        <div key={`opp-entry-move-${selectedOpp}-${move}`} className="damage-move-chip-wrap">
                          <button type="button" className={`move-chip core damage-move-chip ${moveTypeThemeClass(moveType)}`} onClick={() => {
                            setCalcSwapSides(true)
                            setSelectedDamageMove({ key: oppMember.key, move })
                            setActiveTab('power')
                          }}>
                            {moveType ? <SmallTypeBadgeImage type={moveType} /> : null}
                            <span>{move}</span>
                          </button>
                          <button type="button" className="damage-move-remove-button" onClick={() => removeOpponentRevealedMove(move)} aria-label={`${move} remove`}>
                            ×
                          </button>
                        </div>
                      )
                    }) : <div className="damage-side-empty">{lt('등록 기술 없음')}</div>}
                    <div className="damage-opponent-move-adder opponent-entry-move-adder">
                      <label>
                        <span>{lt('상대 기술 추가')}</span>
                        <div className="damage-opponent-move-input-row">
                          <input
                            value={opponentMoveDraft}
                            placeholder={lt('사용 가능 기술 검색')}
                            disabled={!oppMember.key || oppMember.revealedMoves.length >= 4}
                            onFocus={() => setOpponentMoveInputFocused(true)}
                            onBlur={() => setTimeout(() => setOpponentMoveInputFocused(false), 120)}
                            onChange={(e) => setOpponentMoveDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key !== 'Enter') return
                              e.preventDefault()
                              commitOpponentMoveDraft()
                            }}
                          />
                          <button
                            type="button"
                            className="pick-chip"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => commitOpponentMoveDraft()}
                            disabled={!oppMember.key || oppMember.revealedMoves.length >= 4}
                          >
                            {lt('추가')}
                          </button>
                        </div>
                      </label>
                      {oppMember.key && opponentMoveInputFocused && opponentMoveDraft && oppMoveOptions.length ? <div className="move-autocomplete-menu damage-opponent-move-menu">
                        {filterMoveOptions(opponentMoveDraft, oppMoveOptions)
                          .filter((option) => !oppMember.revealedMoves.includes(option.name))
                          .slice(0, 8)
                          .map((option) => (
                            <button key={`opp-entry-move-suggest-${oppMember.key}-${option.name}`} type="button" className="move-autocomplete-item" onMouseDown={() => {
                              addOpponentRevealedMove(option.name)
                              setOpponentMoveDraft('')
                              setOpponentMoveInputFocused(false)
                            }}>
                              <span className="move-autocomplete-main">
                                <strong>{option.name}</strong>
                                {option.type ? <span className="move-autocomplete-meta">{option.type}</span> : null}
                              </span>
                            </button>
                          ))}
                      </div> : null}
                    </div>
                  </div>
                </div>
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
            <h2>{lt('샘플 개요')}</h2>
            <div className="pick-summary-badges home-hero-badges">
              <span className="pick-badge">{displayName(sampleRow, siteLanguage)}</span>
              <span className="pick-badge">{lt('확정 기술 수')} {sampleConfirmedMoves.length}/4</span>
              <span className="pick-badge">{lt('저장 샘플 수')} {savedSamples.length}</span>
            </div>
          </div>
          <div className="team-strip-grid sample-overview-grid">
            <div className="sample-overview-card">
              <span className="muted">{lt('현재 화면')}</span>
              <strong>{displayName(sampleRow, siteLanguage)}</strong>
              <div className="pick-summary-badges">
                <span className="pick-badge">{natureChipLabel(sampleForge.config.nature, siteLanguage)}</span>
                <span className="pick-badge">{lt('실수치 스피드')} {partySpeedValue(sampleRow, sampleForge)}</span>
                <span className="pick-badge">{lt('노력치 합')} {sampleEvTotal}</span>
              </div>
              <div className="pick-row sample-overview-actions">
                <button type="button" className="pick-chip" onClick={() => scrollToSampleSection('sample-builder-card')}>{lt('기본 정보')}</button>
                <button type="button" className="pick-chip" onClick={() => scrollToSampleSection('sample-moves-card')}>{lt('기술 구성')}</button>
              </div>
            </div>
            <div className="sample-overview-card">
              <span className="muted">{lt('샘플 빌더')}</span>
              <strong>{sampleLabelDraft.trim() || lt('샘플 이름')}</strong>
              <div className="pick-summary-badges">
                <span className="pick-badge">{sampleCurrentItem ? displayItemLabel(sampleCurrentItem, siteLanguage) : lt('도구 미선택')}</span>
                <span className="pick-badge">{sampleAbility || lt('미선택')}</span>
                <span className="pick-badge">{lt('확정')} {sampleConfirmedMoves.length}/4</span>
              </div>
            </div>
            <div className="sample-overview-card sample-workflow-card">
              <span className="muted">{lt('구성')}</span>
              <strong>{lt('저장/적용')}</strong>
              <div className="pick-summary-badges">
                <span className="pick-badge">{lt('파티 슬롯')} {selectedMy + 1}</span>
                <span className="pick-badge">{lt('저장 샘플 수')} {savedSamples.length}</span>
              </div>
              <div className="pick-row sample-overview-actions">
                <button type="button" className="pick-chip" onClick={() => scrollToSampleSection('sample-saved-card')}>{lt('저장한 샘플')}</button>
                <button type="button" className="pick-chip active" onClick={() => applySampleToPartySlot(selectedMy)}>{lt('파티 슬롯에 적용')}</button>
              </div>
            </div>
          </div>
        </section>
        <section className="panel wide">
          <div className="row-between section-head">
            <h2>{lt('단일 샘플 빌더')}</h2>
            <span className="muted-inline">{displayName(sampleRow, siteLanguage)}</span>
          </div>
          <div className="tab-bar sample-filter-bar">
            {([
              ['builder', lt('샘플 빌드')],
              ['speed', lt('샘플 스피드')],
              ['damage', lt('샘플 딜계산')],
            ] as const).map(([value, label]) => (
              <button key={`sample-workbench-tab-${value}`} type="button" className={`tab-chip sample-filter-chip ${sampleWorkbenchTab === value ? 'active' : ''}`} onClick={() => setSampleWorkbenchTab(value)}>{label}</button>
            ))}
          </div>
          {sampleWorkbenchTab === 'builder' ? <div className="sample-builder-grid compact-sample-builder-grid">
            <div id="sample-builder-card" className="sample-main-card flat-sample-main-card">
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
              <div className="stat-preview-list sample-stat-preview-list">
                {([
                  ['hp', '체력'], ['attack', '공격'], ['defense', '방어'], ['spAttack', '특수공격'], ['spDefense', '특수방어'], ['speed', '스피드'],
                ] as const).map(([field, label]) => (
                  <button key={field} type="button" className={`stat-preview-row stat-preview-button sample-stat-preview-row ${statThemeClass(field)}`} onClick={() => setSampleTuningModalOpen(true)}>
                    <div className="stat-preview-topline sample-stat-topline">
                      <span>{lt(label)}</span>
                      <strong>{partyStatValue(sampleRow, sampleForge, field)}</strong>
                    </div>
                    <div className="stat-preview-bar"><span style={{ width: statGaugePercent(partyStatValue(sampleRow, sampleForge, field)) }} /></div>
                    <div className="stat-preview-meta">
                      <span className="stat-preview-ev sample-stat-ev">EV +{sampleForge.evs[field]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div id="sample-moves-card" className="move-card flat-sample-move-card">
              <div className="row-between sample-panel-header sample-panel-header-side">
                <strong>{lt('샘플 기술')}</strong>
                <span className="muted-inline">{lt('내 파티 관리처럼 직접 기술을 등록')}</span>
              </div>
              <div className="sample-save-box flat-sample-save-box">
                <div className="sample-save-head">
                  <div className="sample-save-head-topline">
                    <span className="muted-inline sample-work-draft-label">{sampleLabelDraft.trim() || lt('샘플 이름')}</span>
                  </div>
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
              <>
                  <div className="sample-tracking-cluster">
                    <div className="sample-track-card sample-track-editor-card">
                      <div className="row-between sample-track-head">
                        <strong>{lt('기술 배치')}</strong>
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
                    </div>
                  </div>
                </>
            </div>
          </div> : sampleWorkbenchTab === 'speed' ? <div className="sample-builder-grid compact-sample-builder-grid sample-single-pane-grid">
            <div className="sample-main-card flat-sample-main-card">
              <div className="row-between sample-panel-header sample-panel-header-side">
                <strong>{lt('샘플 스피드')}</strong>
                <span className="muted-inline">추월컷 계산</span>
              </div>
              <div className="sample-speed-toolbar sample-workbench-toolbar">
                <div className="sample-speed-toolbar-head sample-workbench-toolbar-head">
                  <div className="pick-summary-badges">
                    <span className="pick-badge">{lt('샘플 현재 속도선')} {sampleSpeedValueNow}</span>
                    <span className="pick-badge">{lt('스피드 EV')} {sampleForge.evs.speed}</span>
                    {sampleSpeedAbilityLine ? <span className="pick-badge enemy">{sampleSpeedAbilityLine.label} {sampleSpeedAbilityLine.speed}</span> : null}
                  </div>
                </div>
                <div className="sample-speed-inline-controls sample-current-build-toolbar">
                  <label className="sample-speed-slider-field sample-damage-search-field sample-speed-control-card">
                    <span>{lt('추가')}</span>
                    <input value={sampleSpeedSearch} placeholder={lt('포켓몬 검색')} onFocus={() => setSampleSpeedSearchOpen(true)} onBlur={() => setTimeout(() => setSampleSpeedSearchOpen(false), 120)} onChange={(e) => { setSampleSpeedSearch(e.target.value); setSampleSpeedSearchOpen(true) }} />
                    {sampleSpeedSearchOpen && sampleSpeedSearchResults.length ? <div className="autocomplete-menu sample-damage-search-menu">
                      {sampleSpeedSearchResults.map((option) => <button key={`sample-speed-add-${option.key}`} type="button" className="autocomplete-item" onMouseDown={() => addSampleSpeedTarget(option.key)}>{searchDisplayLabel(option.key, siteLanguage)}</button>)}
                    </div> : null}
                  </label>
                  <div className="sample-speed-control-card sample-current-build-card sample-current-build-card-embedded">
                    <span className="sample-current-build-label">{lt('기준 빌드')}</span>
                    <div className="sample-compare-hero">
                      {sampleRow.sprite ? <img src={sampleRow.sprite} alt={displayName(sampleRow, siteLanguage)} className="sample-compare-sprite" /> : null}
                      <div>
                        <strong>{displayName(sampleRow, siteLanguage)}</strong>
                        <p className="sample-current-build-copy">{lt('샘플 빌드 기준으로 자동 반영')}</p>
                      </div>
                    </div>
                    {renderSampleForgeEffortGrid('speed')}
                    <div className="pick-summary-badges sample-current-build-badges">
                      <span className="pick-badge">{natureChipLabel(sampleForge.config.nature, siteLanguage)}</span>
                      <span className="pick-badge">{lt('실수치 스피드')} {sampleSpeedValueNow}</span>
                      {sampleAbility ? <span className="pick-badge">{sampleAbility}</span> : null}
                      <span className="pick-badge">{sampleCurrentItem ? displayItemLabel(sampleCurrentItem, siteLanguage) : lt('도구 미선택')}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sample-overview-stack">
                {sampleSpeedCalcs.length ? sampleSpeedCalcs.map((entry) => (
                  <div key={`sample-speed-target-${entry.idx}`} className="sample-overview-card sample-damage-target-card sample-workbench-wide-card">
                    <div className="row-between sample-compare-card-head">
                      <div className="sample-compare-hero sample-compare-hero-compact">
                        {entry.row.sprite ? <img src={entry.row.sprite} alt={displayName(entry.row, siteLanguage)} className="sample-compare-sprite" /> : null}
                        <strong>{displayName(entry.row, siteLanguage)}</strong>
                      </div>
                      <button type="button" className="pick-chip" onClick={() => removeSampleSpeedTarget(entry.idx)}>{lt('삭제')}</button>
                    </div>
                    <div className="sample-workbench-card-body sample-speed-card-body">
                      <div className="sample-workbench-sidepanel">
                        <div className="sample-damage-target-controls sample-speed-target-controls">
                          <label>
                            {lt('랭크')}
                            <select value={entry.member.speedStage} onChange={(e) => updateSampleSpeedTarget(entry.idx, { speedStage: clampSpeedStage(e.target.value) })}>
                              {[6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6].map((stage) => <option key={`sample-speed-stage-${entry.idx}-${stage}`} value={stage}>{stage > 0 ? `+${stage}` : stage}</option>)}
                            </select>
                          </label>
                        </div>
                      </div>
                      <div className="sample-workbench-mainpanel">
                        <div className="sample-speed-cut-grid sample-speed-cut-grid-wide">
                          {entry.cutoffs.map((cutoff) => (
                            <div key={`sample-speed-cutoff-${entry.idx}-${cutoff.id}`} className={`sample-speed-cut-card ${cutoff.result === lt('내가 앞섬') ? 'ahead' : cutoff.result === lt('동속') ? 'tie' : 'behind'}`}>
                              <strong>{cutoff.label}</strong>
                              <div className="pick-summary-badges">
                                <span className="pick-badge">현재 {cutoff.speed}</span>
                                <span className="pick-badge enemy">{cutoff.result}</span>
                              </div>
                              <div className="pick-summary-badges">
                                <span className="pick-badge">{lt('동속컷')} {cutoff.needs.tieEffort ?? '-'}</span>
                                <span className="pick-badge">{lt('추월컷')} {cutoff.needs.passEffort ?? '-'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )) : <div className="sample-empty-state">{lt('비교 대상 없음')}</div>}
              </div>
            </div>
          </div> : <div className="sample-builder-grid compact-sample-builder-grid sample-single-pane-grid">
            <div className="sample-main-card flat-sample-main-card">
              <div className="row-between sample-panel-header sample-panel-header-side">
                <strong>{lt('샘플 딜계산')}</strong>
                <span className="muted-inline">{sampleDamageMoveChoices[0] || lt('등록 기술 없음')}</span>
              </div>
              <div className="sample-damage-adder sample-workbench-toolbar">
                <div className="sample-speed-inline-controls sample-current-build-toolbar">
                  <label className="sample-speed-slider-field sample-damage-search-field sample-speed-control-card">
                    <span>{lt('추가')}</span>
                    <input value={sampleDamageSearch} placeholder={lt('포켓몬 검색')} onFocus={() => setSampleDamageSearchOpen(true)} onBlur={() => setTimeout(() => setSampleDamageSearchOpen(false), 120)} onChange={(e) => { setSampleDamageSearch(e.target.value); setSampleDamageSearchOpen(true) }} />
                    {sampleDamageSearchOpen && sampleDamageSearchResults.length ? <div className="autocomplete-menu sample-damage-search-menu">
                      {sampleDamageSearchResults.map((option) => <button key={`sample-damage-add-${option.key}`} type="button" className="autocomplete-item" onMouseDown={() => addSampleDamageTarget(option.key)}>{searchDisplayLabel(option.key, siteLanguage)}</button>)}
                    </div> : null}
                  </label>
                  <div className="sample-speed-control-card sample-current-build-card sample-current-build-card-embedded">
                    <span className="sample-current-build-label">{lt('기준 빌드')}</span>
                    <div className="sample-compare-hero">
                      {sampleRow.sprite ? <img src={sampleRow.sprite} alt={displayName(sampleRow, siteLanguage)} className="sample-compare-sprite" /> : null}
                      <div>
                        <strong>{displayName(sampleRow, siteLanguage)}</strong>
                        <p className="sample-current-build-copy">{lt('샘플 빌드 기준으로 자동 반영')}</p>
                      </div>
                    </div>
                    {renderSampleForgeEffortGrid('damage')}
                    <div className="pick-summary-badges sample-current-build-badges">
                      <span className="pick-badge">{natureChipLabel(sampleForge.config.nature, siteLanguage)}</span>
                      {sampleAbility ? <span className="pick-badge">{sampleAbility}</span> : null}
                      <span className="pick-badge">{sampleCurrentItem ? displayItemLabel(sampleCurrentItem, siteLanguage) : lt('도구 미선택')}</span>
                      <span className="pick-badge">공격 {sampleAttackerStats.attack}</span>
                      <span className="pick-badge">특수공격 {sampleAttackerStats.spAttack}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sample-damage-shared-controls sample-workbench-wide-card">
                <div className="damage-control-group">
                  <div className="damage-control-group-title">{lt('화력 조건')}</div>
                  <div className="calc-grid damage-calc-grid compact offense-grid">
                    {sampleUsesTypeChangeStabAbility ? <label className="calc-toggle-box"><input type="checkbox" checked={calcTypeChangeStab} onChange={(e) => setCalcTypeChangeStab(e.target.checked)} /><span>{lt('타입변환 자속')}</span></label> : null}
                    <label className="calc-toggle-box"><input type="checkbox" checked={calcCritical} onChange={(e) => setCalcCritical(e.target.checked)} /><span>{lt('급소')}</span></label>
                    <label className="calc-toggle-box"><input type="checkbox" checked={calcBurned} onChange={(e) => setCalcBurned(e.target.checked)} /><span>{lt('화상')}</span></label>
                    {sampleShowAttackerLowHpToggle ? <label className="calc-toggle-box"><input type="checkbox" checked={calcAttackerLowHp} onChange={(e) => setCalcAttackerLowHp(e.target.checked)} /><span>{lt('공격측 HP 1/3 이하')}</span></label> : null}
                    {sampleShowTargetPoisonedToggle ? <label className="calc-toggle-box"><input type="checkbox" checked={calcTargetPoisoned} onChange={(e) => setCalcTargetPoisoned(e.target.checked)} /><span>{lt('상대 독/맹독')}</span></label> : null}
                    {sampleShowMovedAfterTargetToggle ? <label className="calc-toggle-box"><input type="checkbox" checked={calcMovedAfterTarget} onChange={(e) => setCalcMovedAfterTarget(e.target.checked)} /><span>{lt('상대보다 늦게 행동')}</span></label> : null}
                    {sampleShowFaintedAlliesInput ? <label>{lt('기절한 아군 수')}<input type="number" min={0} max={5} value={calcFaintedAllies} onChange={(e) => setCalcFaintedAllies(Math.max(0, Math.min(5, Math.trunc(Number(e.target.value) || 0))))} /></label> : null}
                    {sampleShowRivalryModeInput ? <label>{lt('라이벌리 성별 관계')}<select value={calcRivalryMode} onChange={(e) => setCalcRivalryMode(e.target.value as RivalryMode)}><option value="neutral">{lt('없음')}</option><option value="same">{lt('같은 성별')}</option><option value="opposite">{lt('다른 성별')}</option></select></label> : null}
                    {sampleShowParentalBondToggle ? <label className="calc-toggle-box"><input type="checkbox" checked={calcParentalBond} onChange={(e) => setCalcParentalBond(e.target.checked)} /><span>{lt('부자유친 발동')}</span></label> : null}
                    {sampleShowDefenderStatusedToggle ? <label className="calc-toggle-box"><input type="checkbox" checked={calcDefenderStatused} onChange={(e) => setCalcDefenderStatused(e.target.checked)} /><span>{lt('상대 상태이상')}</span></label> : null}
                    {sampleShowElectromorphosisToggle ? <label className="calc-toggle-box"><input type="checkbox" checked={calcElectromorphosisCharged} onChange={(e) => setCalcElectromorphosisCharged(e.target.checked)} /><span>{lt('일렉트릭 차지됨')}</span></label> : null}
                    <label>{lt('공격측 화력 랭크')}<select value={calcAttackStage} onChange={(e) => setCalcAttackStage(clampBattleStage(e.target.value))}>{[6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6].map((stage) => <option key={`sample-damage-atk-stage-${stage}`} value={stage}>{stage > 0 ? `+${stage}` : stage}</option>)}</select></label>
                    <label>{lt('방어측 내구 랭크')}<select value={calcDefenseStage} onChange={(e) => setCalcDefenseStage(clampBattleStage(e.target.value))}>{[6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6].map((stage) => <option key={`sample-damage-def-stage-${stage}`} value={stage}>{stage > 0 ? `+${stage}` : stage}</option>)}</select></label>
                    {sampleShowDefenderFullHpToggle ? <label className="calc-toggle-box"><input type="checkbox" checked={calcDefenderFullHp} onChange={(e) => setCalcDefenderFullHp(e.target.checked)} /><span>{lt('상대 HP 만땅')}</span></label> : null}
                  </div>
                </div>
                <div className="damage-control-group">
                  <div className="damage-control-group-title">{lt('전장 조건')}</div>
                  <div className="calc-grid damage-calc-grid compact field-grid">
                    <label>{lt('날씨')}<select value={calcWeather} onChange={(e) => setCalcWeather(e.target.value as DamageWeather)}><option value="none">{lt('없음')}</option><option value="sun">{lt('쾌청')}</option><option value="rain">{lt('비')}</option><option value="sand">{lt('모래바람')}</option><option value="snow">{lt('싸라기눈')}</option></select></label>
                    <label>{lt('필드')}<select value={calcTerrain} onChange={(e) => setCalcTerrain(e.target.value as DamageTerrain)}><option value="none">{lt('없음')}</option><option value="electric">{lt('일렉트릭필드')}</option><option value="grassy">{lt('그래스필드')}</option><option value="psychic">{lt('사이코필드')}</option><option value="misty">{lt('미스트필드')}</option></select></label>
                    <label className="calc-toggle-box"><input type="checkbox" checked={calcReflect} onChange={(e) => setCalcReflect(e.target.checked)} /><span>{lt('리플렉터')}</span></label>
                    <label className="calc-toggle-box"><input type="checkbox" checked={calcLightScreen} onChange={(e) => setCalcLightScreen(e.target.checked)} /><span>{lt('빛의장막')}</span></label>
                    <label className="calc-toggle-box"><input type="checkbox" checked={calcAuroraVeil} onChange={(e) => setCalcAuroraVeil(e.target.checked)} /><span>{lt('오로라베일')}</span></label>
                    <label className="calc-toggle-box"><input type="checkbox" checked={calcFriendGuard} onChange={(e) => setCalcFriendGuard(e.target.checked)} /><span>{lt('프렌드가드')}</span></label>
                  </div>
                </div>
              </div>
              <div className="sample-overview-stack">
                {sampleDamageCalcs.length ? sampleDamageCalcs.map((entry) => (
                  <div key={`sample-damage-target-${entry.idx}`} className="sample-overview-card sample-damage-target-card sample-workbench-wide-card">
                    <div className="row-between sample-compare-card-head">
                      <div className="sample-compare-hero sample-compare-hero-compact">
                        {entry.row?.sprite ? <img src={entry.row.sprite} alt={displayName(entry.row, siteLanguage)} className="sample-compare-sprite" /> : null}
                        <strong>{entry.row ? displayName(entry.row, siteLanguage) : lt('비교 대상 없음')}</strong>
                      </div>
                      <button type="button" className="pick-chip" onClick={() => removeSampleDamageTarget(entry.idx)}>{lt('삭제')}</button>
                    </div>
                    <div className="sample-workbench-card-body sample-damage-card-body">
                      <div className="sample-workbench-sidepanel">
                        <div className="sample-damage-target-controls sample-damage-target-controls-wide">
                          <label>
                            {lt('기술 구성')}
                            <select value={entry.member.moveName || ''} onChange={(e) => updateSampleDamageTarget(entry.idx, { moveName: e.target.value })}>
                              {!sampleDamageMoveChoices.length ? <option value="">{lt('등록 기술 없음')}</option> : null}
                              {sampleDamageMoveChoices.map((move) => <option key={`sample-damage-move-${entry.idx}-${move}`} value={move}>{move}</option>)}
                            </select>
                          </label>
                          <label>
                            {lt('상대 내구 프리셋')}
                            <select value={detectOpponentBulkPreset({ hpEv: entry.member.hpEv, defenseEv: entry.member.defenseEv, spDefenseEv: entry.member.spDefenseEv, defenseNature: entry.member.defenseNature, spDefenseNature: entry.member.spDefenseNature })} onChange={(e) => applySampleDamageBulkPresetSelection(entry.idx, e.target.value as OpponentBulkPreset)}>
                              {Object.entries(OPPONENT_BULK_PRESETS).map(([key, preset]) => <option key={`sample-damage-bulk-preset-${entry.idx}-${key}`} value={key}>{preset.label}</option>)}
                              <option value="custom">{lt('직접 조절')}</option>
                            </select>
                          </label>
                          {entry.moveHitOptions?.length ? <label>
                            {lt('타수')}
                            <select value={entry.moveHitCount ?? entry.moveHitOptions[0]} onChange={(e) => setCalcHitCount(Math.max(1, Math.trunc(Number(e.target.value))))} disabled={entry.moveHitOptions.length === 1}>
                              {entry.moveHitOptions.map((hit) => <option key={`sample-damage-hit-${entry.idx}-${hit}`} value={hit}>{`${hit} ${lt('타수')}`}</option>)}
                            </select>
                            {entry.moveHitSummary ? <small>{lt('총위력')} {entry.moveHitSummary.totalPower}</small> : null}
                          </label> : entry.moveRule ? <label>
                            {lt('위력 조건')}
                            {entry.moveRule.kind === 'count'
                              ? <><span>{lt(entry.moveRule.label)}</span><input type="number" min={entry.moveRule.min ?? 0} max={entry.moveRule.max ?? 999} value={Number(entry.moveConditionValue ?? entry.moveRule.defaultValue)} onChange={(e) => setCalcConditionalPowerValues((prev) => ({ ...prev, [entry.moveName]: Number(e.target.value) }))} /></>
                              : <span className="calc-toggle-box"><input type="checkbox" checked={Boolean(entry.moveConditionValue)} onChange={(e) => setCalcConditionalPowerValues((prev) => ({ ...prev, [entry.moveName]: e.target.checked }))} /><span>{lt(entry.moveRule.label)}</span></span>}
                          </label> : null}
                          {(entry.moveRule || entry.moveHitOptions?.length || entry.moveName === '로우킥' || entry.moveName === '풀묶기' || entry.moveName === '트리플악셀') ? <div className="calc-lock-box">{variablePowerHint(entry.moveName, lt, { targetWeightKnown: entry.targetWeightKnown })}</div> : null}
                          <label>
                            체력 EV
                            <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={entry.member.hpEv} onChange={(e) => updateSampleDamageTarget(entry.idx, { hpEv: clampNonNegativeInt(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                          </label>
                          <div className="sample-bulk-pair-row">
                            <label>
                              방어 EV
                              <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={entry.member.defenseEv} onChange={(e) => updateSampleDamageTarget(entry.idx, { defenseEv: clampNonNegativeInt(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                            </label>
                            <label className="sample-bulk-check-label">
                              <span>+방어</span>
                              <input type="checkbox" checked={entry.member.defenseNature > 1} onChange={(e) => updateSampleDamageTarget(entry.idx, { defenseNature: e.target.checked ? 1.1 : 1 })} />
                            </label>
                          </div>
                          <div className="sample-bulk-pair-row">
                            <label>
                              특수방어 EV
                              <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={entry.member.spDefenseEv} onChange={(e) => updateSampleDamageTarget(entry.idx, { spDefenseEv: clampNonNegativeInt(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                            </label>
                            <label className="sample-bulk-check-label">
                              <span>+특수방어</span>
                              <input type="checkbox" checked={entry.member.spDefenseNature > 1} onChange={(e) => updateSampleDamageTarget(entry.idx, { spDefenseNature: e.target.checked ? 1.1 : 1 })} />
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="sample-workbench-mainpanel">
                        <div className="pick-summary-badges sample-workbench-metric-badges">
                          <span className="pick-badge">{entry.moveName || lt('등록 기술 없음')}</span>
                          <span className="pick-badge">{entry.attackStatLabel} {entry.attackStatValue}</span>
                          {entry.defenderStats ? <>
                            <span className="pick-badge">체력 {entry.defenderStats.hp}</span>
                            <span className="pick-badge">방어 {entry.defenderStats.defense}</span>
                            <span className="pick-badge">특수방어 {entry.defenderStats.spDefense}</span>
                          </> : null}
                        </div>
                        {entry.damage ? <div className="pick-summary-badges sample-workbench-metric-badges">
                          <span className="pick-badge">{entry.damage.min} ~ {entry.damage.max}</span>
                          <span className="pick-badge enemy">{entry.damage.minPct}% ~ {entry.damage.maxPct}%</span>
                        </div> : null}
                        <div className="pick-summary-badges sample-workbench-metric-badges"><span className="pick-badge">{entry.unavailableReason || entry.verdict}</span></div>
                      </div>
                    </div>
                  </div>
                )) : <div className="sample-empty-state">{lt('비교 대상 없음')}</div>}
              </div>
            </div>
          </div>}
        </section>
        <section id="sample-saved-card" className="panel wide">
          <details className="saved-sample-list flat-saved-sample-list sample-drawer sample-managed-drawer" open>
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
                <div key={entry.id} className="saved-sample-item sample-saved-card-item">
                  <div>
                    <strong>{entry.label}</strong>
                    <p className="muted">{displayName(savedRow, siteLanguage)} · {natureLabel(entry.member.config.nature, siteLanguage)}{entry.member.item ? ` · ${displayItemLabel(entry.member.item, siteLanguage)}` : ''}</p>
                    <div className="pick-summary-badges sample-saved-item-badges">
                      <span className="pick-badge">{lt('노력치 합')} {Object.values(entry.member.evs).reduce((sum, value) => sum + value, 0)}</span>
                      <span className="pick-badge">{lt('실수치 스피드')} {partyStatValue(savedRow, entry.member, 'speed')}</span>
                    </div>
                  </div>
                  <div className="inline-controls">
                    <button type="button" className="pick-chip" onClick={() => {
                      setSampleForge({ ...entry.member, evs: { ...entry.member.evs }, config: { ...entry.member.config }, tuning: { ...entry.member.tuning } })
                      setSampleItemDraft(displayItemLabel(visibleChampionsItem(entry.member.key, entry.member.item), siteLanguage))
                      setSampleSearch(searchDisplayLabel(entry.member.key, siteLanguage))
                      setActiveSampleMetaEditor(null)
                    }}>{lt('불러오기')}</button>
                    <button type="button" className="pick-chip" onClick={() => applyMemberToPartySlot(entry.member, selectedMy)}>{lt('파티 슬롯에 적용')}</button>
                    <button type="button" className="pick-chip" onClick={() => setSavedSamples((prev) => prev.filter((saved) => saved.id !== entry.id))}>{lt('삭제')}</button>
                  </div>
                </div>
              )
            }) : <p className="muted">{lt('아직 저장한 샘플이 없습니다.')}</p>}
            </div>
          </details>
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
                        {isChoiceScarfItem(myMember.item) ? <span className="pick-badge icon-badge"><img src={itemSpriteSrc(myMember.key, '구애스카프')} alt={lt('스카프')} className="pick-badge-item-icon" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} /></span> : null}
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
                    <div className="speed-plane-axis-legend">
                      <span className="speed-plane-axis-chip upper">{lt('최속')} {lt('상한')}</span>
                      <span className="speed-plane-axis-chip lower">{lt('준속')} {lt('하한')}</span>
                    </div>
                    <div className="speed-plane-plot">
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
                        const left = opponentSpeedBands.length === 1 ? 50 : 18 + ((60 / (opponentSpeedBands.length - 1)) * idx)
                        const guideTop = Math.min(maxTop, speedAxisTop(mySpeed))
                        const guideBottom = Math.max(minTop, speedAxisTop(mySpeed))
                        const guideHeight = Math.max(0, guideBottom - guideTop)
                        const rangeClass = maxScenario.speedAtMax < mySpeed ? 'below' : minScenario.speedAtMax > mySpeed ? 'above' : 'cross'
                        const labelSideClass = left > 70 ? 'label-left' : 'label-right'
                        return (
                          <div key={`speed-band-${band.id}`} className="speed-plane-band-wrap" style={{ left: `${left}%` }}>
                            {rangeClass !== 'cross' && guideHeight > 0 ? <div className="speed-plane-guide" style={{ top: `${guideTop}%`, height: `${guideHeight}%` }} /> : null}
                            <div className={`speed-plane-range-node ${rangeClass} ${labelSideClass}`} style={{ top: `${maxTop}%`, height: `${Math.max(0.5, minTop - maxTop)}%` }}>
                              {band.scarf || band.abilityLabel ? <div className={`speed-plane-range-marker ${band.scarf ? 'item' : 'ability'}`}>
                                {band.scarf ? <img src={itemSpriteSrc('', '구애스카프')} alt={lt('스카프')} className="speed-band-item-icon" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} /> : null}
                                {band.abilityLabel ? <>
                                  <span className="speed-plane-range-marker-burst" aria-hidden="true">✦</span>
                                  <span>{band.abilityLabel}</span>
                                </> : null}
                              </div> : null}
                              <div className="speed-plane-range-line" aria-hidden="true">
                                <i className="top-dot" />
                                <i className="bottom-dot" />
                              </div>
                              <div className="speed-plane-range-node-head">
                                <span>{lt('최속')} {lt('상한')}</span>
                                <strong>{maxScenario.speedAtMax}</strong>
                              </div>
                              <div className="speed-plane-range-node-tail">
                                <span>{lt('준속')} {lt('하한')}</span>
                                <strong>{minScenario.speedAtMax}</strong>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
            </div>
          </> : <div className="speed-empty-box">{lt('선택한 상대 없음')}</div>}
        </section> : null}

        {activeTab === 'power' ? <section className="panel wide">
          <div className="row-between section-head">
            <h2>{lt('간단 데미지 계산')}</h2>
            <div className="pick-summary-badges">
              <span className="pick-badge">{lt('공격측')} · {attackFromOpponent ? lt('상대 포켓몬') : lt('내 포켓몬')}</span>
              <span className="pick-badge enemy">{defenderRow ? `${lt('방어측')} · ${displayName(defenderRow, siteLanguage)}` : lt('선택한 상대 없음')}</span>
            </div>
          </div>
          <div className="speed-target-panel compare-target-panel damage-compare-panel">
            <div className={`speed-target-card damage-side-card ${!attackFromOpponent ? 'active-side' : ''}`}>
              <div className="speed-target-head">
                {myRow.sprite ? <img src={myRow.sprite} alt={displayName(myRow, siteLanguage)} className="pick-slot-sprite" /> : null}
                <div>
                  <strong>{displayName(myRow, siteLanguage)}</strong>
                  <div className="pick-summary-badges">
                    <span className="pick-badge">{attackFromOpponent ? lt('방어측') : lt('공격측')}</span>
                  </div>
                  {myMegaCandidates.length ? <div className="calc-toggle-row">
                    <button type="button" className={`pick-chip ${!calcMyMegaOn ? 'active' : ''}`} onClick={() => setCalcMyMegaOn(false)}>{lt('일반')}</button>
                    <button type="button" className={`pick-chip ${calcMyMegaOn ? 'active' : ''}`} onClick={() => setCalcMyMegaOn(true)}>{lt('메가')}</button>
                  </div> : null}
                </div>
              </div>
              <div className="damage-side-moves">
                {myRegisteredDamageMoves.length ? myRegisteredDamageMoves.map((move) => {
                  const moveType = resolveMoveType(move, myMoveOptions, movePoolByKey)
                  const active = !attackFromOpponent && activeDamageMove === move
                  return (
                    <button
                      key={`damage-move-my-${myMember.key}-${move}`}
                      type="button"
                      className={`move-chip core damage-move-chip ${moveTypeThemeClass(moveType)} ${active ? 'confirmed' : ''}`}
                      onClick={() => {
                        setCalcSwapSides(false)
                        setSelectedDamageMove({ key: myMember.key, move })
                      }}
                    >
                      {moveType ? <SmallTypeBadgeImage type={moveType} /> : null}
                      <span>{move}</span>
                    </button>
                  )
                }) : <div className="damage-side-empty">{lt('등록 기술 없음')}</div>}
              </div>
            </div>
            <div className="damage-swap-rail">
              <button
                type="button"
                className="damage-swap-button"
                onClick={() => setCalcSwapSides((prev) => !prev)}
                disabled={!oppRow}
                aria-label={lt('공수전환')}
                title={lt('공수전환')}
              >
                <span aria-hidden="true">⇄</span>
              </button>
            </div>
            <div className={`speed-target-card enemy damage-side-card ${attackFromOpponent ? 'active-side' : ''}`}>
              <div className="speed-target-head">
                {oppRow?.sprite ? <img src={oppRow.sprite} alt={displayName(oppRow, siteLanguage)} className="pick-slot-sprite" /> : null}
                <div>
                  <strong>{oppRow ? displayName(oppRow, siteLanguage) : lt('선택한 상대 없음')}</strong>
                  <div className="pick-summary-badges">
                    <span className="pick-badge enemy">{attackFromOpponent ? lt('공격측') : lt('방어측')}</span>
                  </div>
                  {oppMegaCandidates.length ? <div className="calc-toggle-row">
                    <button type="button" className={`pick-chip ${!calcOppMegaOn ? 'active' : ''}`} onClick={() => setCalcOppMegaOn(false)}>{lt('일반')}</button>
                    <button type="button" className={`pick-chip ${calcOppMegaOn ? 'active' : ''}`} onClick={() => setCalcOppMegaOn(true)}>{lt('메가')}</button>
                  </div> : null}
                </div>
              </div>
              <div className="damage-side-moves damage-side-moves-opponent">
                {opponentRegisteredDamageMoves.length ? opponentRegisteredDamageMoves.map((move) => {
                  const moveType = resolveMoveType(move, oppMoveOptions, movePoolByKey)
                  const active = attackFromOpponent && activeDamageMove === move
                  return (
                    <div
                      key={`damage-move-opp-${oppMember.key}-${move}`}
                      className={`damage-move-chip-wrap ${active ? 'active' : ''}`}
                    >
                      <button
                        type="button"
                        className={`move-chip core damage-move-chip ${moveTypeThemeClass(moveType)} ${active ? 'confirmed' : ''}`}
                        onClick={() => {
                          if (!oppRow) return
                          setCalcSwapSides(true)
                          setSelectedDamageMove({ key: oppMember.key, move })
                        }}
                        disabled={!oppRow}
                      >
                        {moveType ? <SmallTypeBadgeImage type={moveType} /> : null}
                        <span>{move}</span>
                      </button>
                      <button
                        type="button"
                        className="damage-move-remove-button"
                        onClick={() => removeOpponentRevealedMove(move)}
                        aria-label={`${move} remove`}
                      >
                        ×
                      </button>
                    </div>
                  )
                }) : <div className="damage-side-empty">{lt('등록 기술 없음')}</div>}
                <div className="damage-opponent-move-adder">
                  <label>
                    <span>{lt('상대 기술 추가')}</span>
                    <div className="damage-opponent-move-input-row">
                      <input
                        value={calcOpponentMoveDraft}
                        placeholder={lt('사용 가능 기술 검색')}
                        disabled={!oppMember.key || opponentRegisteredDamageMoves.length >= 4}
                        onFocus={() => setCalcOpponentMoveInputFocused(true)}
                        onBlur={() => setTimeout(() => setCalcOpponentMoveInputFocused(false), 120)}
                        onChange={(e) => setCalcOpponentMoveDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key !== 'Enter') return
                          e.preventDefault()
                          commitCalcOpponentMoveDraft()
                        }}
                      />
                      <button
                        type="button"
                        className="pick-chip"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => commitCalcOpponentMoveDraft()}
                        disabled={!oppMember.key || opponentRegisteredDamageMoves.length >= 4}
                      >
                        {lt('추가')}
                      </button>
                    </div>
                  </label>
                  {oppMember.key && calcOpponentMoveInputFocused && calcOpponentMoveDraft && oppMoveOptions.length ? <div className="move-autocomplete-menu damage-opponent-move-menu">
                    {filterMoveOptions(calcOpponentMoveDraft, oppMoveOptions)
                      .filter((option) => !opponentRegisteredDamageMoves.includes(option.name))
                      .slice(0, 8)
                      .map((option) => (
                        <button key={`calc-opp-move-suggest-${oppMember.key}-${option.name}`} type="button" className="move-autocomplete-item" onMouseDown={() => {
                          addOpponentRevealedMove(option.name)
                          setCalcOpponentMoveDraft('')
                          setCalcOpponentMoveInputFocused(false)
                        }}>
                          <span className="move-autocomplete-main">
                            <strong>{option.name}</strong>
                            {option.type ? <span className="move-autocomplete-meta">{option.type}</span> : null}
                          </span>
                        </button>
                      ))}
                  </div> : null}
                </div>
              </div>
            </div>
          </div>
          <div className="damage-surface-card damage-control-surface">
            {activeDamageMoveMeta?.variablePower && !activeDamageMoveHitOptions?.length ? <div className="pick-summary-badges damage-auto-badges">
              <span className="pick-badge warn">{variablePowerHint(activeDamageMove, lt, { targetWeightKnown: typeof calcTargetWeightKg === 'number' })}</span>
            </div> : null}
            {activeDamageMovePower === null ? <div className="preset-row damage-preset-row">
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
            </div> : null}
            <div className="damage-control-groups">
              <div className="damage-control-group">
                <div className="damage-control-group-title">{lt('화력 조건')}</div>
                <div className="calc-grid damage-calc-grid compact offense-grid">
                  {activeDamageMoveCategory === null ? <label>
                    {lt('수동 분류')}
                    <select value={calcMode} onChange={(e) => setCalcMode(e.target.value as CalcMode)}>
                      <option value="physical">{lt('물리')}</option>
                      <option value="special">{lt('특수')}</option>
                    </select>
                  </label> : <div className="calc-lock-box">{lt(activeDamageMoveCategory === 'physical' ? '물리' : '특수')}</div>}
                  {activeDamageMoveHitOptions?.length ? <label>
                    {lt('타수')}
                    <select value={activeDamageMoveHitCount ?? activeDamageMoveHitOptions[0]} onChange={(e) => setCalcHitCount(Math.max(1, Math.trunc(Number(e.target.value))))} disabled={activeDamageMoveHitOptions.length === 1}>
                      {activeDamageMoveHitOptions.map((hit) => <option key={`hit-${hit}`} value={hit}>{`${hit} ${lt('타수')}`}</option>)}
                    </select>
                    {activeDamageMoveHitSummary ? <small>{lt('총위력')} {activeDamageMoveHitSummary.totalPower}</small> : null}
                  </label> : activeDamageMoveRule ? <label>
                    {lt('위력 조건')}
                    {activeDamageMoveRule.kind === 'count'
                      ? <>
                          <span>{lt(activeDamageMoveRule.label)}</span>
                          <input type="number" min={activeDamageMoveRule.min ?? 0} max={activeDamageMoveRule.max ?? 999} value={Number(activeDamageMoveConditionValue ?? activeDamageMoveRule.defaultValue)} onChange={(e) => setActiveDamageMoveConditionValue(Number(e.target.value))} />
                        </>
                      : <span className="calc-toggle-box"><input type="checkbox" checked={Boolean(activeDamageMoveConditionValue)} onChange={(e) => setActiveDamageMoveConditionValue(e.target.checked)} /><span>{lt(activeDamageMoveRule.label)}</span></span>}
                    <small>{lt('위력')} {activeDamageMovePower ?? '-'}</small>
                  </label> : activeDamageMovePower === null ? <label>
                    {lt('수동 위력')}
                    <input type="number" value={movePower} onChange={(e) => setMovePower(Number(e.target.value))} />
                  </label> : <div className="calc-lock-box">{lt('위력')} {activeDamageMovePower}</div>}
                  {!activeDamageMoveType ? <label>
                    자속
                    <select value={stab} onChange={(e) => setStab(Number(e.target.value))}>
                      <option value={1}>{lt('없음')}</option>
                      <option value={1.5}>1.5</option>
                      <option value={2}>2.0</option>
                    </select>
                  </label> : usesTypeChangeStabAbility ? <label className="calc-toggle-box">
                    <input type="checkbox" checked={calcTypeChangeStab} onChange={(e) => setCalcTypeChangeStab(e.target.checked)} />
                    <span>{lt('타입변환 자속')} {autoStab}</span>
                  </label> : <div className="calc-lock-box">자속 {autoStab}</div>}
                  {!activeDamageMoveType ? <label>
                    {lt('상성')}
                    <select value={effectiveness} onChange={(e) => setEffectiveness(Number(e.target.value))}>
                      <option value={0.25}>0.25x</option>
                      <option value={0.5}>0.5x</option>
                      <option value={1}>1x</option>
                      <option value={2}>2x</option>
                      <option value={4}>4x</option>
                    </select>
                  </label> : <div className="calc-lock-box">{lt('상성')} {damageModifiers.effectiveness}x</div>}
                  {activeDamageMoveAlwaysCrit ? <div className="calc-lock-box">{lt('급소')}</div> : <label className="calc-toggle-box">
                    <input type="checkbox" checked={calcCritical} onChange={(e) => setCalcCritical(e.target.checked)} />
                    <span>{lt('급소')}</span>
                  </label>}
                  <label className="calc-toggle-box">
                    <input type="checkbox" checked={calcBurned} onChange={(e) => setCalcBurned(e.target.checked)} />
                    <span>{lt('화상')}</span>
                  </label>
                  {showAttackerLowHpToggle ? <label className="calc-toggle-box">
                    <input type="checkbox" checked={calcAttackerLowHp} onChange={(e) => setCalcAttackerLowHp(e.target.checked)} />
                    <span>{lt('공격측 HP 1/3 이하')}</span>
                  </label> : null}
                  {showTargetPoisonedToggle ? <label className="calc-toggle-box">
                    <input type="checkbox" checked={calcTargetPoisoned} onChange={(e) => setCalcTargetPoisoned(e.target.checked)} />
                    <span>{lt('상대 독/맹독')}</span>
                  </label> : null}
                  {showMovedAfterTargetToggle ? <label className="calc-toggle-box">
                    <input type="checkbox" checked={calcMovedAfterTarget} onChange={(e) => setCalcMovedAfterTarget(e.target.checked)} />
                    <span>{lt('상대보다 늦게 행동')}</span>
                  </label> : null}
                  {showFaintedAlliesInput ? <label>
                    {lt('기절한 아군 수')}
                    <input type="number" min={0} max={5} value={calcFaintedAllies} onChange={(e) => setCalcFaintedAllies(Math.max(0, Math.min(5, Math.trunc(Number(e.target.value) || 0))))} />
                  </label> : null}
                  {showRivalryModeInput ? <label>
                    {lt('라이벌리 성별 관계')}
                    <select value={calcRivalryMode} onChange={(e) => setCalcRivalryMode(e.target.value as RivalryMode)}>
                      <option value="neutral">{lt('없음')}</option>
                      <option value="same">{lt('같은 성별')}</option>
                      <option value="opposite">{lt('다른 성별')}</option>
                    </select>
                  </label> : null}
                  {showParentalBondToggle ? <label className="calc-toggle-box">
                    <input type="checkbox" checked={calcParentalBond} onChange={(e) => setCalcParentalBond(e.target.checked)} />
                    <span>{lt('부자유친 발동')}</span>
                  </label> : null}
                  {showDefenderStatusedToggle ? <label className="calc-toggle-box">
                    <input type="checkbox" checked={calcDefenderStatused} onChange={(e) => setCalcDefenderStatused(e.target.checked)} />
                    <span>{lt('상대 상태이상')}</span>
                  </label> : null}
                  {showElectromorphosisToggle ? <label className="calc-toggle-box">
                    <input type="checkbox" checked={calcElectromorphosisCharged} onChange={(e) => setCalcElectromorphosisCharged(e.target.checked)} />
                    <span>{lt('일렉트릭 차지됨')}</span>
                  </label> : null}
                  <label>
                    {lt('공격측 화력 랭크')}
                    <select value={calcAttackStage} onChange={(e) => setCalcAttackStage(clampBattleStage(e.target.value))}>
                      {[6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6].map((stage) => <option key={`atk-stage-${stage}`} value={stage}>{stage > 0 ? `+${stage}` : stage}</option>)}
                    </select>
                  </label>
                </div>
              </div>
              <div className="damage-control-group">
                <div className="damage-control-group-title">{lt('방어측')}</div>
                <div className="calc-grid damage-calc-grid compact defender-grid">
                  {attackFromOpponent ? <div className="calc-lock-box">{lt('방어측은 내 파티 실수치를 사용함')}</div> : <>
                    <label>
                      {lt('상대 내구 프리셋')}
                      <select value={calcOpponentBulkPreset} onChange={(e) => applyOpponentBulkPresetSelection(e.target.value as OpponentBulkPreset)}>
                        {Object.entries(OPPONENT_BULK_PRESETS).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}
                        <option value="custom">{lt('직접 조절')}</option>
                      </select>
                    </label>
                    <label>
                      상대 체력
                      <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={calcOpponentHpEv} onChange={(e) => updateOpponentBulkState({ hpEv: clampEv(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                    </label>
                    <label>
                      상대 방어
                      <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={calcOpponentDefenseEv} onChange={(e) => updateOpponentBulkState({ defenseEv: clampEv(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                    </label>
                    <label>
                      상대 특수방어
                      <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={calcOpponentSpDefenseEv} onChange={(e) => updateOpponentBulkState({ spDefenseEv: clampEv(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                    </label>
                    <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcOpponentDefenseNature > 1} onChange={(e) => updateOpponentBulkState({ defenseNature: e.target.checked ? 1.1 : 1 })} />
                      <span>{lt('+방어 성격')}</span>
                    </label>
                    <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcOpponentSpDefenseNature > 1} onChange={(e) => updateOpponentBulkState({ spDefenseNature: e.target.checked ? 1.1 : 1 })} />
                      <span>+특수방어 성격</span>
                    </label>
                  </>}
                  <label>
                    {lt('방어측 내구 랭크')}
                    <select value={calcDefenseStage} onChange={(e) => setCalcDefenseStage(clampBattleStage(e.target.value))}>
                      {[6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6].map((stage) => <option key={`def-stage-${stage}`} value={stage}>{stage > 0 ? `+${stage}` : stage}</option>)}
                    </select>
                  </label>
                  {showDefenderFullHpToggle ? <label className="calc-toggle-box">
                    <input type="checkbox" checked={calcDefenderFullHp} onChange={(e) => setCalcDefenderFullHp(e.target.checked)} />
                    <span>{lt('상대 HP 만땅')}</span>
                  </label> : null}
                </div>
              </div>
              <div className="damage-control-group">
                <div className="damage-control-group-title">{lt('전장 조건')}</div>
                <div className="calc-grid damage-calc-grid compact field-grid">
                  <label>
                    {lt('날씨')}
                    <select value={calcWeather} onChange={(e) => setCalcWeather(e.target.value as DamageWeather)}>
                      <option value="none">{lt('없음')}</option>
                      <option value="sun">{lt('쾌청')}</option>
                      <option value="rain">{lt('비')}</option>
                      <option value="sand">{lt('모래바람')}</option>
                      <option value="snow">{lt('싸라기눈')}</option>
                    </select>
                  </label>
                  <label>
                    {lt('필드')}
                    <select value={calcTerrain} onChange={(e) => setCalcTerrain(e.target.value as DamageTerrain)}>
                      <option value="none">{lt('없음')}</option>
                      <option value="electric">{lt('일렉트릭필드')}</option>
                      <option value="grassy">{lt('그래스필드')}</option>
                      <option value="psychic">{lt('사이코필드')}</option>
                      <option value="misty">{lt('미스트필드')}</option>
                    </select>
                  </label>
                  <label className="calc-toggle-box">
                    <input type="checkbox" checked={calcReflect} onChange={(e) => setCalcReflect(e.target.checked)} />
                    <span>{lt('리플렉터')}</span>
                  </label>
                  <label className="calc-toggle-box">
                    <input type="checkbox" checked={calcLightScreen} onChange={(e) => setCalcLightScreen(e.target.checked)} />
                    <span>{lt('빛의장막')}</span>
                  </label>
                  <label className="calc-toggle-box">
                    <input type="checkbox" checked={calcAuroraVeil} onChange={(e) => setCalcAuroraVeil(e.target.checked)} />
                    <span>{lt('오로라베일')}</span>
                  </label>
                  <label className="calc-toggle-box">
                    <input type="checkbox" checked={calcFriendGuard} onChange={(e) => setCalcFriendGuard(e.target.checked)} />
                    <span>{lt('프렌드가드')}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          {defenderRow && damage ? <div className="damage-box">
            <div className="damage-box-head">
              <strong>{attackerRow ? displayName(attackerRow, siteLanguage) : '-'}</strong> → <strong>{defenderRow ? displayName(defenderRow, siteLanguage) : '-'}</strong>{activeDamageMove ? ` · ${activeDamageMove}` : ''}
            </div>
            <div className="damage-summary-grid">
              <div className="damage-summary-card verdict">
                <span>{siteLanguage === 'en' ? 'Read' : siteLanguage === 'ja' ? '判定' : '판정'}</span>
                <strong>{damageVerdict}</strong>
              </div>
              <div className="damage-summary-card">
                <span>{siteLanguage === 'en' ? 'Damage' : siteLanguage === 'ja' ? 'ダメージ' : '데미지'}</span>
                <strong>{damage.min} ~ {damage.max}</strong>
              </div>
              <div className="damage-summary-card accent">
                <span>{siteLanguage === 'en' ? 'Percent' : siteLanguage === 'ja' ? '割合' : '비율'}</span>
                <strong>{damage.minPct}% ~ {damage.maxPct}%</strong>
              </div>
            </div>
          </div> : <div className="damage-box empty"><p>{activeDamageMoveIsStatus ? lt('변화기는 데미지 계산 대상이 아님') : lt('상대 엔트리에서 계산 대상 포켓몬을 먼저 채워 주세요.')}</p></div>}
        </section> : null}
        </>}
      </main>
    </div>
  )
}
