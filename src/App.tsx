import React from 'react'
import championsData from './pokemon_champions_verified_data.json'
import { CHAMPIONS_ITEM_ALIASES, CHAMPIONS_ITEM_OPTIONS, CHAMPIONS_ITEM_SPRITE_MAP, localizedChampionsItemLabel, type ChampionsItem } from './championsItems'
import { sampleMoves } from './sampleMoves'
import { dataSourcePolicy } from './dataSources'
import { defaultEvs, type EffortValues } from './myPartyChampionsSamples'
import { getTypeBadgeLabel, getTypeBadgeSrc } from './typeBadges'
import { getJaName, getJaTypes } from './jaLabels'

import type { AutocompleteHighlight, CalcMode, ConditionalPowerValue, CropRect, DamageTerrain, DamageWeather, DexDescriptionBundle, DexResultItem, DexSearchMode, DoubleBoardSlot, EffortStatKey, HoverTooltipCard, ImportExportPayload, ItemFieldTarget, MainSection, MainTab, MemberConfig, MetaListField, MoveCategory, MoveFieldTarget, MoveFilter, MoveMeta, MoveOption, NatureId, OcrImportedPartyMember, OcrStatKey, OpponentBulkPreset, OpponentOffensePreset, OpponentState, PartyMember, PartyTuning, PersistedState, RivalryMode, Row, SampleDamageTarget, SampleSpeedTarget, SampleWorkbenchTab, SavedPartyPreset, SavedSample, SearchFieldTarget, SiteLanguage, StatKey, ViewState } from './app/types'
import { dexSelectionId, localizedDexText, parseDexSelectionId } from './dex/helpers'
import { abilityDescriptionFor, getDexDescriptionsSync, getItemIndexSync, itemDescriptionFor, loadDexDescriptions, loadMoveMetaByName, loadSpriteHashIndex, loadUsageTopMovesByKey, MOVE_META_BY_NAME, moveDescriptionFor, resolveItemInfo, usageTopMovesForKey } from './dex/data'

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

const DOUBLE_SPREAD_MOVE_NAMES = new Set([
  '방전', '열풍', '탁류', '눈보라', '파도타기', '지진', '스톤샤워', '매지컬샤인', '오물웨이브', '하이퍼보이스', '폭음파', '흙탕물', '분연', '이붕',
].map(normalizeSearchText))
type DamageCalcModifiers = {
  attackMultiplier?: number
  defenseMultiplier?: number
  powerMultiplier?: number
  finalMultiplier?: number
  incomingScreenName?: string | null
  critical?: boolean
  burned?: boolean
  ignoreFirstHitDamage?: boolean
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

type OpponentOffenseConfig = {
  attackEv: number
  spAttackEv: number
  attackNature: number
  spAttackNature: number
  label: string
}

type OpponentBulkState = {
  hpEv: number
  defenseEv: number
  spDefenseEv: number
  defenseNature: number
  spDefenseNature: number
}

type OpponentOffenseState = {
  attackEv: number
  spAttackEv: number
  attackNature: number
  spAttackNature: number
}
type MovePoolState = { status: 'idle' | 'loading' | 'ready' | 'error'; moves: MoveOption[] }
type DamageMoveSelection = { key: string; move: string }
const UI_TRANSLATIONS: Record<'en' | 'ja', Record<string, string>> = {
  en: {
    '체력': 'HP', '공격': 'Attack', '방어': 'Defense', '특공': 'Sp. Atk', '특방': 'Sp. Def', '스피드': 'Speed', '특수공격': 'Sp. Atk', '특수방어': 'Sp. Def',
    '내 파티 관리': 'My Party', '상대 엔트리': 'Opponent Entry', '스피드 계산': 'Speed Calc', '대미지 계산': 'Damage Calc',
    '싱글배틀 메뉴': 'Singles Menu', '포켓몬 샘플 깎기': 'Sample Builder', '포켓몬 하나 집중 조정': 'Tune one Pokémon',
    '홈': 'Home', '정식 배포 준비': 'Release Prep', '모드 선택': 'Choose Mode', '홈페이지에서 시작할 메뉴를 고르세요.': 'Choose where to start from the homepage.', '싱글배틀': 'Singles Battle', '샘플 빌더': 'Sample Builder', '내 파티를 관리하고 상대 엔트리에 따라 스피드와 대미지를 계산할 수 있습니다.': 'Manage your party and calculate speed and damage based on opponent entries.', '포켓몬 하나를 기준으로 성격, 노력치, 기술을 조정하고 샘플로 저장할 수 있습니다.': 'Adjust one Pokémon’s nature, effort values, and moves, then save it as a sample.', '단일 포켓몬 샘플을 저장 가능한 작업 단위로 정리합니다.': 'Build and save a single Pokémon sample with its full setup.', '포켓몬 챔피언스 배틀에서 파티·선출·스피드·대미지를 한 번에 정리합니다.': 'Organize party, picks, speed, and damage for Pokémon Champions battles in one place.', '더블배틀의 행동순과 기대 대미지를 빠르게 확인할 수 있습니다.': 'Quickly check doubles turn order and expected damage.', '들어가기': 'Open', '현재 화면': 'Current View', '확정 기술 수': 'Locked Moves', '저장 샘플 수': 'Saved Samples', '샘플 개요': 'Sample Overview', '구성': 'Sections', '기본 정보': 'Basics', '기술 구성': 'Moves', '저장/적용': 'Save/Apply', '노력치 합': 'Total EVs', '파티 슬롯': 'Party Slot', '설정': 'Settings', '데이터 관리': 'Manage Data', '기준 빌드': 'Current Build', '샘플 빌드 기준으로 자동 반영': 'Auto-applies from the current sample build', '현재 기술 기준': 'Based on current move', '공격 EV': 'Attack EV', '특공 EV': 'Sp. Atk EV', '언어': 'Language', '프로젝트 링크': 'Project Links', 'GitHub 저장소': 'GitHub Repository', '연락 이메일': 'Contact Email', '기능제안/버그제보': 'Feature Requests / Bug Reports', '폼으로 제보하기': 'Open Form', '저작권 및 안내': 'Copyright & Notice', '참고 데이터베이스': 'Referenced Databases', '포켓몬 관련 명칭과 이미지에 대한 권리는 각 권리자에게 있으며, 이 프로젝트는 비공식 팬메이드 도구입니다.': 'Rights to Pokémon-related names and images belong to their respective owners. This project is an unofficial fan-made tool.', '포켓몬 및 관련 명칭은 각 권리자에게 귀속됩니다. 이 프로젝트는 비공식 팬메이드 도구입니다.': 'Pokémon and related names belong to their respective rights holders. This project is an unofficial fan-made tool.',
    '파티 저장, 스피드 비교, 상대 도구 기록, 간단 대미지 계산, 단일 샘플 깎기까지.': 'Party save, speed checks, opponent item notes, quick damage calc, and single sample building.',
    '더블배틀': 'Doubles Battle', '더블배틀 메뉴': 'Doubles Menu', '더블 계산 작업 보드': 'Doubles Planning Board', '더블 배틀 플래너': 'Doubles Battle Planner', '턴 플랜': 'Turn Plan', '속도/전장': 'Speed / Field', '아군 순풍': 'My Tailwind', '상대 순풍': 'Opponent Tailwind', '트릭룸': 'Trick Room', '트릭룸 순서': 'Trick Room Order', '기본 순서': 'Normal Order', '상대 프렌드가드': 'Opponent Friend Guard', '상대별 총 기대 대미지': 'Expected Damage by Target', '상대 대상': 'Opponent Target', '보조/자기 대상': 'Ally / Self Target', '4마리 행동순': '4-Pokémon Turn Order', '광역기 감쇠가 자동 적용됩니다.': 'Spread move reduction applies automatically.', '우선도': 'Priority', '순위': 'Rank', '계산 대기': 'Waiting for calc', '방어로 막힘': 'Blocked by Protect', '와이드가드로 차단됨': 'Blocked by Wide Guard', '내 좌측': 'My Left', '내 우측': 'My Right', '상대 좌측': 'Opp Left', '상대 우측': 'Opp Right', '사용률 상위 기술': 'Top Usage Moves',
    '상태 내보내기': 'Export State', '상태 불러오기': 'Import State', '전체 초기화': 'Reset All', '노력치 보정': 'Effort Adjustment', '닫기': 'Close', '성격': 'Nature', '백업 저장': 'Save Backup', '백업 불러오기': 'Load Backup', '전체 데이터 초기화': 'Reset All Data', '현재 작업 상태를 JSON으로 저장': 'Save current workspace as JSON', '저장한 JSON 상태 파일을 불러오기': 'Load a saved JSON state file', '파티·상대·샘플을 전부 초기화': 'Reset party, opponent, and samples',
    '최소': 'Min', '최대': 'Max', '무보정': 'Neutral', '목표': 'Target', '11배수 달성': '11x reached',
    '포켓몬 하나만 잡고 성격/능력 포인트/샘플 기술을 빠르게 깎는 전용 화면입니다.': 'A dedicated screen for tuning one Pokémon fast with nature, stat points, and sample moves.',
    '파티 한눈 요약': 'Party Overview', '내 파티': 'My Party', '상대 파티': 'Opponent Party',
    '포켓몬별 기술배치 / 노력치보정': 'Per-Pokémon move setup / effort tuning', '내 파티 초기화': 'Reset My Party', '포켓몬을 검색해서 추가하세요.': 'Search a Pokémon to add it.',
    '특성': 'Ability', '미선택': 'Unselected', '특성 검색': 'Search ability', '도구': 'Item', '메가스톤 고정': 'Mega Stone locked', '사용 가능 도구 선택': 'Choose allowed item', '사용 가능 특성 선택': 'Choose listed ability', '포켓몬 먼저 선택': 'Choose Pokémon first',
    '종 선택': 'Species', '포켓몬 선택': 'Choose Pokémon', '포켓몬 검색': 'Search Pokémon', '기술 배치': 'Move Set', '기술 슬롯': 'Move Slots', '기술풀 불러오는 중…': 'Loading move pool…', '사용 가능 기술 검색': 'Search legal moves', '기술 입력': 'Enter move',
    '시드': 'Seeded', '검증중': 'Verifying',
    '기술 데이터가 없는 포켓몬만 직접 입력합니다.': 'Only Pokémon without move data need manual input.',
    '상대 엔트리 초기화': 'Reset Opponent Entry', '검색창 하나에서 `검색 → 엔터` 반복으로 순서대로 채웁니다.': 'Fill slots in order by repeating `search → Enter` in one box.',
    '상대 엔트리 빠른 입력': 'Quick Opponent Entry', '현재 입력 슬롯': 'Current Slot', '추정 체크됨': 'Picked', '미체크': 'Unchecked', '도구 없음': 'No item', '포켓몬 미입력': 'No Pokémon', '특성 미기입': 'No ability', '도구 미기입': 'No item', '선출 추정': 'Picked guess', '상세 패널에서 공개 정보를 바로 갱신합니다.': 'Update revealed info directly in the detail panel.',
    '공개 기술': 'Revealed moves', '메모': 'Notes', '최속 가정': 'Max Speed', '스카프': 'Scarf', '랭크': 'Stage', '선출 추정 해제': 'Unmark picked', '선출 추정 체크': 'Mark picked',
    '상대 엔트리 메모': 'Opponent Notes', '단일 샘플 빌더': 'Single Sample Builder', '포켓몬 샘플 빌더': 'Pokémon Sample Builder', '도감': 'Dex', '통합검색': 'Unified Search', '도구 미선택': 'No item selected', '실수치 스피드': 'Actual Speed',
    '포켓몬/기술/특성/도구를 검색해서 핵심 정보를 빠르게 확인합니다.': 'Quickly search Pokémon, moves, abilities, and items.', '포켓몬': 'Pokémon', '기술': 'Moves', '검색 결과': 'Results', '검색 결과를 선택하면 상세 정보를 바로 확인할 수 있습니다.': 'Select a result to view details instantly.', '포켓몬 / 기술 / 특성 / 도구 검색': 'Search Pokémon / moves / abilities / items', '기술 검색': 'Search moves', '도구 검색': 'Search items', '타입': 'Type', '분류': 'Category', '명중': 'Accuracy', '변화': 'Status', '해당 특성 포켓몬': 'Pokémon with this ability', '배우는 포켓몬': 'Pokémon that learn this move', '합계': 'Total', '효과': 'Effect',
    '선택 슬롯 비우기': 'Clear selected slot',
    '간단 설명': 'Summary', '상세 설명': 'Details', '설명': 'Description', '이름': 'Name', '설명 데이터 없음': 'No description available yet.',
    '비교 상대 선택': 'Choose opponent', '비교 상대 교체': 'Change opponent', '비교 상대': 'Opponent', '1:1 비교': '1:1 comparison', '가장 경계할 상대 한 마리를 선택합니다.': 'Choose the one opponent you need to prepare for.', '결정력': 'Power index', '물리 내구력': 'Physical bulk', '특수 내구력': 'Special bulk', '상대 영향 제외': 'Excludes target', '기본 조건': 'Baseline', '계산 기준': 'Formula', '상대 의존': 'Target-dependent', '상시 보정': 'Always-on modifiers',
    '샘플 기술': 'Sample Moves', '샘플 빌드': 'Sample Build', '샘플 스피드': 'Sample Speed', '샘플 대미지 계산': 'Sample Damage', '비교 대상 없음': 'No comparison targets', '샘플 기술에서 1개 이상 등록하면 여기서 바로 비교할 수 있습니다.': 'Register at least one sample move to compare here right away.', '위 검색창에서 비교 포켓몬을 추가하면 결과가 여기에 표시됩니다.': 'Add a comparison Pokémon from the search field above to show results here.', '샘플 기술로 이동': 'Go to Sample Moves', '세부 내구 조절': 'Detailed bulk tuning', '선출 추정된 상대를 비교 대상으로 사용': 'Use picked opponents as comparison targets', '내 파티 관리처럼 직접 기술을 등록': 'Register moves directly like party management', '공격 비교': 'Offense Comparison', '내구 비교': 'Bulk Comparison', '상대 첫 공개 기술 기준': 'Uses each target\'s first revealed move', '샘플 현재 속도선': 'Sample speed line', '스피드 조건': 'Speed Conditions', '기본': 'Base', '특성 발동': 'Ability Triggered', '특성+스카프': 'Ability + Scarf', '스피드 EV': 'Speed EV', '속도 구간': 'Speed Range', '실시간 조정': 'Live tuning', '코어 1번 체크': 'Check Core #1', '샘플 이름': 'Sample Name', '현재 샘플 저장': 'Save Current Sample', '파티 슬롯에 적용': 'Apply to Party Slot', '확정': 'Confirmed', '확정 기술': 'Locked Moves', '코어': 'Core', '선택': 'Options', '유틸': 'Utility', '실전 후보': 'Practical Candidates', '코어 라인': 'Core Line', '세부 편집': 'Detail Edit', '샘플 메모': 'Sample Notes', '전체': 'All', '미확정': 'Open', '확정만': 'Locked only', '아직 없음': 'None yet', '매직넘버': 'Magic number', '최대치': 'Max value', '미지정': 'Unset', '저장한 샘플': 'Saved Samples', '저장한 파티': 'Saved Parties', '새 파티 저장': 'Save as New Party', '현재 파티 덮어쓰기': 'Overwrite Current Party', '파티 적용': 'Apply Party', '이름 변경': 'Rename', '파티 이름': 'Party Name', '아직 저장한 파티가 없습니다.': 'No saved parties yet.', '불러오기': 'Load', '삭제': 'Delete', '슬롯 비우기': 'Clear slot', '아직 저장한 샘플이 없습니다.': 'No saved samples yet.',
    '엔트리': 'Entry', '초기화 후 슬롯별 검색창에 한 마리씩 빠르게 채우는 흐름으로 정리했습니다.': 'Designed for fast one-by-one slot entry after reset.',
    '간단 대미지 계산': 'Quick Damage Calc', '상대 엔트리에서 고른 포켓몬의 도구/특성/공개 기술 메모와 같은 슬롯을 계산기가 그대로 따라갑니다.': 'The calculator mirrors the same slot and revealed info from opponent entry.', '내 기술': 'My Move', '등록 기술 없음': 'No registered moves', '수동 위력': 'Manual Power', '수동 분류': 'Manual Category', '자동 타입': 'Auto Type', '자동 위력': 'Auto Power', '자동 분류': 'Auto Category', '상대 무게에 따라 위력이 바뀌는 기술이라 직접 입력이 필요함': 'This move changes power based on target weight, so enter power manually', '상대 무게에 따라 위력이 자동 반영됨': 'Power updates automatically from the target weight', '명중 횟수에 따라 총위력이 바뀌는 기술이라 직접 입력이 필요함': 'This move changes total power based on hit count, so enter power manually', '연속타 누적 위력 기술이라 직접 입력이 필요함': 'This move has escalating multi-hit power, so enter power manually', '특정 조건에 따라 위력이 자동 반영됨': 'Power updates automatically from the selected condition', '위력 조건': 'Power condition', '타입변환 자속': 'Type-change STAB', '공격측 HP 1/3 이하': 'Attacker HP at or below 1/3', '상대 독/맹독': 'Target is poisoned', '상대 HP 만땅': 'Target at full HP', '상대보다 늦게 행동': 'Move after target', '기절한 아군 수': 'Number of fainted allies', '라이벌리 성별 관계': 'Rivalry gender relation', '같은 성별': 'Same gender', '다른 성별': 'Different gender', '부자유친 발동': 'Parental Bond active', '상대 상태이상': 'Target is statused', '일렉트릭 차지됨': 'Electromorphosis charged', '공수전환': 'Swap offense/defense', '공격측': 'Attacker', '방어측': 'Defender', '상대 기술 추가': 'Add opponent move', '추가': 'Add', '비교 포켓몬 추가': 'Add comparison Pokémon', '비교 포켓몬': 'Comparison Pokémon', '공격측 화력 랭크': 'Attacker offense stage', '방어측 내구 랭크': 'Defender bulk stage', '방어측은 내 파티 실수치를 사용함': 'Defender uses exact party battle stats', '내 쓰러진 포켓몬 수': 'Number of my fainted Pokémon', '내 능력 상승 랭크 합': 'Total of my positive stat stages', '내가 상태이상임': 'I am statused', '상대가 상태이상임': 'Target is statused', '이번 턴 먼저 맞음': 'Moved after taking a hit this turn', '타수': 'Hits', '총위력': 'Total Power', '급소': 'Critical Hit', '변화기는 대미지 계산 대상이 아님': 'Status moves do not deal direct damage', '내 화력 랭크': 'My Offensive Stage', '상대 내구 랭크': 'Opponent Defensive Stage', '상대 기본 내구 가정': 'Opponent bulk assumption', '상대 내구 프리셋': 'Opponent bulk preset', '상대 화력 프리셋': 'Opponent offense preset', '직접 조절': 'Custom', '상대 HP': 'Opponent HP', '상대 물방': 'Opponent Def', '상대 특방': 'Opponent SpD', '상대 공격': 'Opponent Attack', '상대 특수공격': 'Opponent Sp. Atk', '+방어 성격': '+Defense nature', '+특방 성격': '+Sp. Def nature', '+공격 성격': '+Attack nature', '+특수공격 성격': '+Sp. Atk nature', '화력 조건': 'Offense conditions', '전장 조건': 'Field conditions', '상대 내구': 'Opponent bulk', '화상': 'Burn', '날씨': 'Weather', '필드': 'Terrain', '리플렉터': 'Reflect', '빛의장막': 'Light Screen', '오로라베일': 'Aurora Veil', '프렌드가드': 'Friend Guard', '쾌청': 'Sun', '비': 'Rain', '모래바람': 'Sand', '싸라기눈': 'Snow', '일렉트릭필드': 'Electric Terrain', '그래스필드': 'Grassy Terrain', '사이코필드': 'Psychic Terrain', '미스트필드': 'Misty Terrain', '실속도 기준': 'Effective Speed', '내 스피드 랭크': 'My Speed Stage', '포켓몬을 검색해서 종족값, 타입, 특성, 상위 기술을 빠르게 확인합니다.': 'Quickly look up base stats, types, abilities, and top moves.', '검색 결과가 없습니다.': 'No Pokémon found.', '상위 채용 기술': 'Top usage moves', '종족값': 'Base stats', '빠른 이동': 'Quick actions', '샘플 빌더로 열기': 'Open in sample builder', '싱글 파티에 넣기': 'Add to single party',
    '내 파티 추월컷': 'My Team Speed Cutoffs', '상대 기준': 'Opponent Target', '기준 속도': 'Target Speed', '추월컷': 'Pass', '동속컷': 'Tie', '이미 추월': 'Already ahead', '불가': 'No line', '실전 상태': 'Battle State', '내가 앞섬': 'Ahead', '상대가 앞섬': 'Behind', '동속': 'Tie', '일반': 'Base', '메가': 'Mega', '내 포켓몬': 'My Pokémon', '상대 포켓몬': 'Opponent Pokémon', '기준선': 'Baseline',
    '준속': 'Neutral', '최속': 'Fast', '상한': 'Upper', '하한': 'Lower', '준속 스카프': 'Neutral Scarf', '최속 스카프': 'Fast Scarf', '선택한 상대 없음': 'No opponent selected', '스피드 비교 그래프': 'Speed Comparison Graph',
    '위력': 'Power', '공격분류': 'Category', '물리': 'Physical', '특수': 'Special', '없음': 'None', '무효': 'No effect', '상성': 'Effectiveness', '확정 1타 가능성 있음': 'Possible OHKO', '유리한 2타권': 'Favorable 2HKO', '즉시 마무리 어려움': 'Hard to finish immediately', '상대 엔트리에서 계산 대상 포켓몬을 먼저 채워 주세요.': 'Fill an opponent target first.',
    '빈 슬롯': 'Empty Slot', '현재': 'Current', '추가 가능': 'Available', '파티 관리': 'Party', '언어 선택': 'Choose language', '한국어': 'Korean', '영어': 'English', '일본어': 'Japanese', '추월컷 계산': 'Speed cutoff calc', '현재 속도': 'Current Speed', '체력 EV': 'HP EV', '방어 EV': 'Defense EV', '특수방어 EV': 'Sp. Def EV', '+방어': '+Defense', '+특수방어': '+Sp. Def', '특방+': 'Sp. Def+', '방어+': 'Defense+', '실대미지': 'Damage', '체력비율': 'HP Percent', '확정 N타': 'KO Count', '계산 상태': 'Result', '자속': 'STAB', '상대 체력': 'Opponent HP', '상대 방어': 'Opponent Defense', '상대 특수방어': 'Opponent Sp. Def', '+특수방어 성격': '+Sp. Def nature', '판정': 'Verdict', '대미지': 'Damage', '비율': 'Percent', '접기': 'Collapse', '펼치기': 'Expand', '세부 조건': 'Detailed conditions', '대미지 계산 불가': 'Damage calc unavailable', '샘플 이름 예시': 'e.g. Jolly Scarf draft', '상대 메모 예시': 'e.g. likely physical set', '엔트리 메모 예시': 'e.g. Dragapult may be Scarf / Rotom revealed Volt Switch / Mimikyu looks like late-game cleaner', '포켓몬 챔피언스 배틀 도우미': 'Pokémon Champions Battle Assistant', '파티 관리, 상대 엔트리, 스피드 계산, 대미지 계산을 한곳에서 정리하는 포켓몬 챔피언스 배틀 도구': 'A Pokémon Champions battle tool for party management, opponent entry, speed checks, and damage calculations in one place.', '포켓몬 챔피언스 배틀 도우미 대표 이미지': 'Pokémon Champions Battle Assistant preview image', '불러오기 실패: JSON 형식을 확인하세요.': 'Import failed: please check the JSON format.', '한 번에 모든 기능을 밀어넣지 않고, 지금 필요한 작업부터 시작합니다.': 'Start from the task you need now instead of dumping every feature at once.', '이 홈은 길찾기 화면입니다. 배틀 준비, 샘플 조정, 도감 확인 중 하나만 고르면 바로 들어갑니다.': 'This home screen is a routing layer. Pick battle prep, sample tuning, or dex lookup and jump straight in.', '사용 흐름': 'Workflow', '바로 시작': 'Start here', '싱글/더블 배틀 준비': 'Battle prep', '샘플 조정 / 자료 확인': 'Build & reference', '파티, 선출, 속도, 대미지 계산을 한 흐름으로 정리합니다.': 'Keep party, picks, speed, and damage in one flow.', '포켓몬 한 마리를 조정하거나 도감 정보를 빠르게 확인합니다.': 'Tune one Pokémon or look up key dex information quickly.', '싱글 배틀 운영': 'Singles workflow', '더블 배틀 운영': 'Doubles workflow', '샘플 조정': 'Sample tuning', '도감 확인': 'Dex lookup', '추천 시작점': 'Recommended start', '자주 쓰는 흐름만 앞에 두고, 세부 기능은 들어간 뒤에 보여 줍니다.': 'Only the common workflows sit up front. Detailed controls stay inside each tool.', '현재 흐름': 'Current workflow', '파티부터 채우고, 상대 공개 정보를 적은 뒤 계산 단계로 넘어갑니다.': 'Start with your party, record revealed opponent info, then move into the calculators.', '더블은 파티와 상대 정리 후 플래너에서 턴 흐름을 봅니다.': 'For doubles, set party and opponent info first, then move into the planner.', '내 포켓몬과 기술 기준을 정리합니다.': 'Set your Pokémon and move baseline first.', '상대 공개 정보와 가정을 정리합니다.': 'Record revealed opponent info and assumptions.', '추월컷과 속도선을 확인합니다.': 'Check cutoffs and speed lines.', '기술 대미지와 조건을 맞춥니다.': 'Check move damage and conditions.', '더블 기준 화력과 행동순을 정리합니다.': 'Review doubles damage and action flow.', '이 화면에서 하는 일': 'What this screen does', '입력 순서': 'Input order', '현재 기준 정보': 'Current context', '내 파티/상대 엔트리를 먼저 맞추면 계산이 덜 흔들립니다.': 'The calculator is more stable once party and opponent entry are set first.', '내 기술 선택 → 상대 기준 확인 → 화력 조건 조정 순서로 보면 됩니다.': 'Use the flow: pick your move → confirm the target baseline → adjust battle conditions.', '선택된 기술': 'Selected move',
    '노력': 'Hardy', '외로움': 'Lonely', '용감': 'Brave', '고집': 'Adamant', '개구쟁이': 'Naughty', '대담': 'Bold', '온순': 'Docile', '무사태평': 'Relaxed', '장난꾸러기': 'Impish', '촐랑': 'Lax', '겁쟁이': 'Timid', '성급': 'Hasty', '성실': 'Serious', '명랑': 'Jolly', '천진난만': 'Naive', '조심': 'Modest', '의젓': 'Mild', '냉정': 'Quiet', '수줍음': 'Bashful', '덜렁': 'Rash', '차분': 'Calm', '얌전': 'Gentle', '건방': 'Sassy', '신중': 'Careful', '변덕': 'Quirky',
  },
  ja: {
    '체력': 'HP', '공격': '攻撃', '방어': '防御', '특공': '特攻', '특방': '特防', '스피드': '素早さ', '특수공격': '特攻', '특수방어': '特防',
    '내 파티 관리': '自分のパーティ', '상대 엔트리': '相手エントリー', '스피드 계산': '素早さ計算', '대미지 계산': '火力計算',
    '싱글배틀 메뉴': 'シングルバトルメニュー', '포켓몬 샘플 깎기': 'ポケモンサンプル調整', '포켓몬 하나 집중 조정': '1匹を集中調整',
    '홈': 'ホーム', '정식 배포 준비': '正式リリース準備', '모드 선택': 'モード選択', '홈페이지에서 시작할 메뉴를 고르세요.': 'ホームから始めるメニューを選んでください。', '싱글배틀': 'シングルバトル', '샘플 빌더': 'サンプルビルダー', '내 파티를 관리하고 상대 엔트리에 따라 스피드와 대미지를 계산할 수 있습니다.': '自分のパーティを管理し、相手エントリーに応じて素早さと火力を計算できます。', '포켓몬 하나를 기준으로 성격, 노력치, 기술을 조정하고 샘플로 저장할 수 있습니다.': '1匹を基準に性格・努力値・技を調整し、サンプルとして保存できます。', '단일 포켓몬 샘플을 저장 가능한 작업 단위로 정리합니다.': '単体ポケモンサンプルを構成ごと保存できる形で整理します。', '포켓몬 챔피언스 배틀에서 파티·선출·스피드·대미지를 한 번에 정리합니다.': 'ポケモンチャンピオンズのバトル向けに、パーティ・選出・素早さ・火力をまとめて整理できます。', '더블배틀의 행동순과 기대 대미지를 빠르게 확인할 수 있습니다.': 'ダブルバトルの行動順と想定ダメージをすばやく確認できます。', '들어가기': '開く', '현재 화면': '現在の画面', '확정 기술 수': '確定技数', '저장 샘플 수': '保存サンプル数', '샘플 개요': 'サンプル概要', '구성': '構成', '기본 정보': '基本情報', '기술 구성': '技構成', '저장/적용': '保存/適用', '노력치 합': '努力値合計', '파티 슬롯': 'パーティスロット', '설정': '設定', '데이터 관리': 'データ管理', '기준 빌드': '基準ビルド', '샘플 빌드 기준으로 자동 반영': '現在のサンプル構成を自動反映', '현재 기술 기준': '現在の技基準', '공격 EV': '攻撃EV', '특공 EV': '特攻EV', '언어': '言語', '프로젝트 링크': 'プロジェクトリンク', 'GitHub 저장소': 'GitHub リポジトリ', '연락 이메일': '連絡先メール', '기능제안/버그제보': '機能提案 / バグ報告', '폼으로 제보하기': 'フォームを開く', '저작권 및 안내': '著作権と案内', '참고 데이터베이스': '参照データベース', '포켓몬 관련 명칭과 이미지에 대한 권리는 각 권리자에게 있으며, 이 프로젝트는 비공식 팬메이드 도구입니다.': 'ポケモン関連の名称と画像の権利は各権利者に帰属します。このプロジェクトは非公式のファンメイドツールです。', '포켓몬 및 관련 명칭은 각 권리자에게 귀속됩니다. 이 프로젝트는 비공식 팬메이드 도구입니다.': 'ポケモンおよび関連名称は各権利者に帰属します。このプロジェクトは非公式のファンメイドツールです。',
    '파티 저장, 스피드 비교, 상대 도구 기록, 간단 대미지 계산, 단일 샘플 깎기까지.': 'パーティ保存、素早さ比較、相手持ち物記録、簡易ダメ計、単体サンプル調整まで対応。',
    '더블배틀': 'ダブルバトル', '더블배틀 메뉴': 'ダブルバトルメニュー', '더블 계산 작업 보드': 'ダブル計算作業ボード', '더블 배틀 플래너': 'ダブルバトルプランナー', '턴 플랜': 'ターンプラン', '속도/전장': '素早さ / 盤面', '아군 순풍': '味方おいかぜ', '상대 순풍': '相手おいかぜ', '트릭룸': 'トリックルーム', '트릭룸 순서': 'トリル順', '기본 순서': '通常順', '상대 프렌드가드': '相手フレンドガード', '상대별 총 기대 대미지': '相手ごとの想定総ダメージ', '상대 대상': '相手対象', '보조/자기 대상': '味方 / 自分対象', '4마리 행동순': '4匹の行動順', '광역기 감쇠가 자동 적용됩니다.': '全体技の補正を自動適用します。', '우선도': '優先度', '순위': '順位', '계산 대기': '計算待ち', '방어로 막힘': 'まもるで防がれた', '와이드가드로 차단됨': 'ワイドガードで防がれた', '내 좌측': '自分左', '내 우측': '自分右', '상대 좌측': '相手左', '상대 우측': '相手右', '사용률 상위 기술': '使用率上位の技',
    '상태 내보내기': '状態を書き出し', '상태 불러오기': '状態を読み込み', '전체 초기화': '全体リセット', '노력치 보정': '努力値補正', '닫기': '閉じる', '성격': '性格', '백업 저장': 'バックアップ保存', '백업 불러오기': 'バックアップ読込', '전체 데이터 초기화': '全データ初期化', '현재 작업 상태를 JSON으로 저장': '現在の作業状態をJSONで保存', '저장한 JSON 상태 파일을 불러오기': '保存したJSON状態ファイルを読み込む', '파티·상대·샘플을 전부 초기화': 'パーティ・相手・サンプルをすべて初期化',
    '최소': '最小', '최대': '最大', '무보정': '補正なし', '목표': '目標', '11배수 달성': '11倍数達成',
    '포켓몬 하나만 잡고 성격/능력 포인트/샘플 기술을 빠르게 깎는 전용 화면입니다.': '1匹だけを対象に、性格・能力ポイント・サンプル技を素早く調整する専用画面です。',
    '파티 한눈 요약': 'パーティ一覧', '내 파티': '自分のパーティ', '상대 파티': '相手パーティ',
    '포켓몬별 기술배치 / 노력치보정': 'ポケモンごとの技構成 / 努力値調整', '내 파티 초기화': '自分のパーティを初期化', '포켓몬을 검색해서 추가하세요.': 'ポケモンを検索して追加してください。',
    '특성': '特性', '미선택': '未選択', '특성 검색': '特性検索', '도구': '持ち物', '메가스톤 고정': 'メガストーン固定', '사용 가능 도구 선택': '使用可能な持ち物を選択', '사용 가능 특성 선택': '使用可能な特性を選択', '포켓몬 먼저 선택': '先にポケモンを選択',
    '종 선택': 'ポケモン', '포켓몬 선택': 'ポケモン選択', '포켓몬 검색': 'ポケモン検索', '기술 배치': '技構成', '기술 슬롯': '技スロット', '기술풀 불러오는 중…': '技プール読み込み中…', '사용 가능 기술 검색': '使用可能な技を検索', '기술 입력': '技入力',
    '시드': 'シード', '검증중': '検証中',
    '기술 데이터가 없는 포켓몬만 직접 입력합니다.': '技データのないポケモンだけ手入力します。',
    '상대 엔트리 초기화': '相手エントリー初期化', '검색창 하나에서 `검색 → 엔터` 반복으로 순서대로 채웁니다.': '1つの検索欄で `検索 → Enter` を繰り返して順番に埋めます。',
    '상대 엔트리 빠른 입력': '相手エントリー高速入力', '현재 입력 슬롯': '現在の入力スロット', '추정 체크됨': '選出想定', '미체크': '未チェック', '도구 없음': '持ち物なし', '포켓몬 미입력': 'ポケモン未入力', '특성 미기입': '特性未入力', '도구 미기입': '持ち物未入力', '선출 추정': '選出想定', '상세 패널에서 공개 정보를 바로 갱신합니다.': '詳細パネルで公開情報をすぐ更新できます。',
    '공개 기술': '公開技', '메모': 'メモ', '최속 가정': '最速想定', '스카프': 'スカーフ', '랭크': 'ランク', '선출 추정 해제': '選出想定を解除', '선출 추정 체크': '選出想定をチェック',
    '상대 엔트리 메모': '相手エントリーメモ', '단일 샘플 빌더': '単体サンプルビルダー', '포켓몬 샘플 빌더': 'ポケモンサンプルビルダー', '도감': '図鑑', '통합검색': '統合検索', '도구 미선택': '持ち物未選択', '실수치 스피드': '実数値素早さ',
    '포켓몬/기술/특성/도구를 검색해서 핵심 정보를 빠르게 확인합니다.': 'ポケモン・技・特性・持ち物をすばやく検索できます。', '포켓몬': 'ポケモン', '기술': '技', '검색 결과': '検索結果', '검색 결과를 선택하면 상세 정보를 바로 확인할 수 있습니다.': '検索結果を選ぶと詳細をすぐ確認できます。', '포켓몬 / 기술 / 특성 / 도구 검색': 'ポケモン / 技 / 特性 / 持ち物を検索', '기술 검색': '技検索', '도구 검색': '持ち物検索', '타입': 'タイプ', '분류': '分類', '명중': '命中', '변화': '変化', '해당 특성 포켓몬': 'この特性のポケモン', '배우는 포켓몬': 'この技を覚えるポケモン', '합계': '合計', '효과': '効果',
    '선택 슬롯 비우기': '選択スロットを空にする',
    '간단 설명': '要約', '상세 설명': '詳細説明', '설명': '説明', '이름': '名前', '설명 데이터 없음': '説明データはまだありません。',
    '비교 상대 선택': '比較相手を選択', '비교 상대 교체': '比較相手を変更', '비교 상대': '比較相手', '1:1 비교': '1対1比較', '가장 경계할 상대 한 마리를 선택합니다.': '最も警戒する相手を1匹選択します。', '결정력': '火力指数', '물리 내구력': '物理耐久', '특수 내구력': '特殊耐久', '상대 영향 제외': '相手補正を除外', '기본 조건': '基本条件', '계산 기준': '計算式', '상대 의존': '相手依存', '상시 보정': '常時補正',
    '샘플 기술': 'サンプル技', '샘플 빌드': 'サンプルビルド', '샘플 스피드': 'サンプル素早さ', '샘플 대미지 계산': 'サンプル火力', '비교 대상 없음': '比較対象なし', '샘플 기술에서 1개 이상 등록하면 여기서 바로 비교할 수 있습니다.': 'サンプル技を1つ以上登録すると、ここですぐ比較できます。', '위 검색창에서 비교 포켓몬을 추가하면 결과가 여기에 표시됩니다.': '上の検索欄から比較ポケモンを追加すると、結果がここに表示されます。', '샘플 기술로 이동': 'サンプル技へ移動', '세부 내구 조절': '耐久の詳細調整', '선출 추정된 상대를 비교 대상으로 사용': '選出想定の相手を比較対象として使用', '내 파티 관리처럼 직접 기술을 등록': 'パーティ管理のように直接技を登録', '공격 비교': '火力比較', '내구 비교': '耐久比較', '상대 첫 공개 기술 기준': '各相手の最初の公開技を使用', '샘플 현재 속도선': 'サンプル速度ライン', '스피드 조건': '素早さ条件', '기본': '基本', '특성 발동': '特性発動', '특성+스카프': '特性+スカーフ', '스피드 EV': '素早さ努力値', '속도 구간': '速度帯', '실시간 조정': 'リアルタイム調整', '코어 1번 체크': 'コア1をチェック', '샘플 이름': 'サンプル名', '현재 샘플 저장': '現在のサンプルを保存', '파티 슬롯에 적용': 'パーティスロットに適用', '확정': '確定', '확정 기술': '確定技', '코어': 'コア', '선택': '候補', '유틸': '補助', '실전 후보': '実戦候補', '코어 라인': 'コアライン', '세부 편집': '詳細編集', '샘플 메모': 'サンプルメモ', '전체': '全部', '미확정': '未確定', '확정만': '確定のみ', '아직 없음': 'まだなし', '매직넘버': 'マジックナンバー', '최대치': '最大値', '미지정': '未指定', '저장한 샘플': '保存したサンプル', '저장한 파티': '保存したパーティ', '새 파티 저장': '新しいパーティとして保存', '현재 파티 덮어쓰기': '現在のパーティで上書き', '파티 적용': 'パーティ適用', '이름 변경': '名前変更', '파티 이름': 'パーティ名', '아직 저장한 파티가 없습니다.': '保存したパーティがまだありません。', '불러오기': '読み込み', '삭제': '削除', '슬롯 비우기': 'スロットを空にする', '아직 저장한 샘플이 없습니다.': '保存したサンプルがまだありません。',
    '엔트리': 'エントリー', '초기화 후 슬롯별 검색창에 한 마리씩 빠르게 채우는 흐름으로 정리했습니다.': '初期化後、スロットごとの検索で1匹ずつ素早く埋める流れに整理しました。',
    '간단 대미지 계산': '簡易ダメージ計算', '상대 엔트리에서 고른 포켓몬의 도구/특성/공개 기술 메모와 같은 슬롯을 계산기가 그대로 따라갑니다.': '相手エントリーで選んだポケモンの持ち物・特性・公開技メモと同じスロットを計算機がそのまま追従します。', '내 기술': '自分の技', '등록 기술 없음': '登録技なし', '수동 위력': '手動威力', '수동 분류': '手動分類', '자동 타입': '自動タイプ', '자동 위력': '自動威力', '자동 분류': '自動分類', '상대 무게에 따라 위력이 바뀌는 기술이라 직접 입력이 필요함': '相手の重さで威力が変わる技のため手動入力が必要', '상대 무게에 따라 위력이 자동 반영됨': '相手の重さに応じて威力を自動反映', '명중 횟수에 따라 총위력이 바뀌는 기술이라 직접 입력이 필요함': '命中回数で合計威力が変わる技のため手動入力が必要', '연속타 누적 위력 기술이라 직접 입력이 필요함': '連続技の累積威力が変わるため手動入力が必要', '특정 조건에 따라 위력이 자동 반영됨': '選択した条件に応じて威力を自動反映', '위력 조건': '威力条件', '타입변환 자속': 'タイプ変化STAB', '공격측 HP 1/3 이하': '攻撃側HP 1/3以下', '상대 독/맹독': '相手がどく/もうどく', '상대 HP 만땅': '相手HP満タン', '상대보다 늦게 행동': '相手より後に行動', '기절한 아군 수': 'ひんしの味方数', '라이벌리 성별 관계': 'とうそうしん性別関係', '같은 성별': '同性', '다른 성별': '異性', '부자유친 발동': 'おやこあい発動', '상대 상태이상': '相手が状態異常', '일렉트릭 차지됨': 'エレクトロモーフォーシス発動', '공수전환': '攻守切替', '공격측': '攻撃側', '방어측': '防御側', '상대 기술 추가': '相手技追加', '추가': '追加', '비교 포켓몬 추가': '比較ポケモン追加', '비교 포켓몬': '比較ポケモン', '공격측 화력 랭크': '攻撃側火力ランク', '방어측 내구 랭크': '防御側耐久ランク', '방어측은 내 파티 실수치를 사용함': '防御側は自分のパーティ実数値を使用', '내 쓰러진 포켓몬 수': '自分のひんしポケモン数', '내 능력 상승 랭크 합': '自分の能力上昇ランク合計', '내가 상태이상임': '自分が状態異常', '상대가 상태이상임': '相手が状態異常', '이번 턴 먼저 맞음': 'このターン先に攻撃を受けた', '타수': 'ヒット数', '총위력': '合計威力', '급소': '急所', '변화기는 대미지 계산 대상이 아님': '変化技はダメージ計算対象外', '내 화력 랭크': '自分の火力ランク', '상대 내구 랭크': '相手の耐久ランク', '상대 기본 내구 가정': '相手基本耐久想定', '상대 내구 프리셋': '相手耐久プリセット', '상대 화력 프리셋': '相手火力プリセット', '직접 조절': '手動調整', '상대 HP': '相手HP', '상대 물방': '相手防御', '상대 특방': '相手特防', '상대 공격': '相手攻撃', '상대 특수공격': '相手特攻', '+방어 성격': '+防御性格', '+특방 성격': '+特防性格', '+공격 성격': '+攻撃性格', '+특수공격 성격': '+特攻性格', '화력 조건': '火力条件', '전장 조건': '場条件', '상대 내구': '相手耐久', '화상': 'やけど', '날씨': '天気', '필드': 'フィールド', '리플렉터': 'リフレクター', '빛의장막': 'ひかりのかべ', '오로라베일': 'オーロラベール', '프렌드가드': 'フレンドガード', '쾌청': 'にほんばれ', '비': 'あめ', '모래바람': 'すなあらし', '싸라기눈': 'ゆき', '일렉트릭필드': 'エレキフィールド', '그래스필드': 'グラスフィールド', '사이코필드': 'サイコフィールド', '미스트필드': 'ミストフィールド', '실속도 기준': '実数値基準', '내 스피드 랭크': '自分の素早さランク', '포켓몬을 검색해서 종족값, 타입, 특성, 상위 기술을 빠르게 확인합니다.': 'ポケモンを検索して種族値・タイプ・特性・採用技をすばやく確認します。', '검색 결과가 없습니다.': '検索結果がありません。', '상위 채용 기술': '採用技', '종족값': '種族値', '빠른 이동': 'クイック移動', '샘플 빌더로 열기': 'サンプルビルダーで開く', '싱글 파티에 넣기': 'シングルパーティに入れる',
    '내 파티 추월컷': '自分の抜きライン', '상대 기준': '相手基準', '기준 속도': '基準素早さ', '추월컷': '抜き', '동속컷': '同速', '이미 추월': 'すでに上', '불가': '不可', '실전 상태': '対面状態', '내가 앞섬': '上', '상대가 앞섬': '下', '동속': '同速', '일반': '通常', '메가': 'メガ', '내 포켓몬': '自分のポケモン', '상대 포켓몬': '相手ポケモン', '기준선': '基準線',
    '준속': '準速', '최속': '最速', '상한': '上限', '하한': '下限', '준속 스카프': '準速スカーフ', '최속 스카프': '最速スカーフ', '선택한 상대 없음': '相手未選択', '스피드 비교 그래프': '素早さ比較グラフ',
    '위력': '威力', '공격분류': '攻撃分類', '물리': '物理', '특수': '特殊', '없음': 'なし', '무효': '無効', '상성': '相性', '확정 1타 가능성 있음': '一撃圏の可能性あり', '유리한 2타권': '有利な2発圏内', '즉시 마무리 어려움': '即処理は難しい', '상대 엔트리에서 계산 대상 포켓몬을 먼저 채워 주세요.': '先に相手エントリーへ計算対象のポケモンを入れてください。',
    '빈 슬롯': '空きスロット', '현재': '現在', '추가 가능': '追加可能', '언어 선택': '言語選択', '한국어': '韓国語', '영어': '英語', '일본어': '日本語', '추월컷 계산': '抜きライン計算', '현재 속도': '現在の素早さ', '체력 EV': 'HP努力値', '방어 EV': '防御努力値', '특수방어 EV': '特防努力値', '+방어': '+防御', '+특수방어': '+特防', '특방+': '特防+', '방어+': '防御+', '실대미지': '実ダメージ', '체력비율': 'HP割合', '확정 N타': '確定N発', '계산 상태': '計算状態', '자속': '一致', '상대 체력': '相手HP', '상대 방어': '相手防御', '상대 특수방어': '相手特防', '+특수방어 성격': '+特防性格', '판정': '判定', '대미지': 'ダメージ', '비율': '割合', '접기': '折りたたむ', '펼치기': '展開', '세부 조건': '詳細条件', '대미지 계산 불가': 'ダメージ計算不可', '샘플 이름 예시': '例: ようきスカーフ案', '상대 메모 예시': '例: 物理型の可能性高め', '엔트리 메모 예시': '例: ドラパルトはスカーフかも / ロトムはボルチェン公開 / ミミッキュは終盤スイーパー寄り', '포켓몬 챔피언스 배틀 도우미': 'ポケモンチャンピオンズ バトルアシスタント', '파티 관리, 상대 엔트리, 스피드 계산, 대미지 계산을 한곳에서 정리하는 포켓몬 챔피언스 배틀 도구': 'パーティ管理・相手エントリー・素早さ計算・ダメージ計算を1か所でまとめられるポケモンチャンピオンズのバトルツール。', '포켓몬 챔피언스 배틀 도우미 대표 이미지': 'ポケモンチャンピオンズ バトルアシスタントのプレビュー画像', '불러오기 실패: JSON 형식을 확인하세요.': '読み込みに失敗しました。JSON形式を確認してください。', '한 번에 모든 기능을 밀어넣지 않고, 지금 필요한 작업부터 시작합니다.': '一度にすべての機能を押しつけず、今必要な作業から始める。', '이 홈은 길찾기 화면입니다. 배틀 준비, 샘플 조정, 도감 확인 중 하나만 고르면 바로 들어갑니다.': 'このホームは案内板だ。バトル準備、サンプル調整、図鑑確認のどれか一つを選べばすぐ入れる。', '사용 흐름': '使用フロー', '바로 시작': 'ここから開始', '싱글/더블 배틀 준비': 'バトル準備', '샘플 조정 / 자료 확인': '調整 / 参照', '파티, 선출, 속도, 대미지 계산을 한 흐름으로 정리합니다.': 'パーティ、選出、素早さ、ダメージ計算を一つの流れで整理する。', '포켓몬 한 마리를 조정하거나 도감 정보를 빠르게 확인합니다.': '1匹を調整したり、図鑑情報をすばやく確認したりする。', '싱글 배틀 운영': 'シングル運用', '더블 배틀 운영': 'ダブル運用', '샘플 조정': 'サンプル調整', '도감 확인': '図鑑確認', '추천 시작점': 'おすすめの入口', '자주 쓰는 흐름만 앞에 두고, 세부 기능은 들어간 뒤에 보여 줍니다.': 'よく使う流れだけ前に出し、細かい機能は中に入ってから見せる。', '현재 흐름': '現在のフロー', '파티부터 채우고, 상대 공개 정보를 적은 뒤 계산 단계로 넘어갑니다.': 'まず自分のパーティを埋め、相手の公開情報を書いてから計算に進む。', '더블은 파티와 상대 정리 후 플래너에서 턴 흐름을 봅니다.': 'ダブルはパーティと相手情報を整えたあと、プランナーでターンの流れを見る。', '내 포켓몬과 기술 기준을 정리합니다.': '自分のポケモンと技の基準を整える。', '상대 공개 정보와 가정을 정리합니다.': '相手の公開情報と想定を整理する。', '추월컷과 속도선을 확인합니다.': '抜きラインと素早さ帯を確認する。', '기술 대미지와 조건을 맞춥니다.': '技ダメージと条件を合わせる。', '더블 기준 화력과 행동순을 정리합니다.': 'ダブル基準の火力と行動順を整理する。', '이 화면에서 하는 일': 'この画面でやること', '입력 순서': '入力順', '현재 기준 정보': '現在の基準情報', '내 파티/상대 엔트리를 먼저 맞추면 계산이 덜 흔들립니다.': '自分のパーティと相手エントリーを先に整えると計算がぶれにくい。', '내 기술 선택 → 상대 기준 확인 → 화력 조건 조정 순서로 보면 됩니다.': '自分の技選択 → 相手基準確認 → 火力条件調整の順で見ればいい。', '선택된 기술': '選択中の技',
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

function slotNumberLabel(index: number, language: SiteLanguage) {
  return language === 'en' ? `Slot ${index + 1}` : language === 'ja' ? `${index + 1}番` : `${index + 1}번`
}

function applyToSlotLabel(index: number, language: SiteLanguage) {
  return language === 'en' ? `Apply to Slot ${index + 1}` : language === 'ja' ? `${index + 1}番に適用` : `${index + 1}번 슬롯에 적용`
}

function searchSlotPlaceholder(index: number, language: SiteLanguage) {
  return language === 'en' ? `Search slot ${index + 1} and press Enter` : language === 'ja' ? `${index + 1}番スロットを検索してEnter` : `${index + 1}번 슬롯 검색 후 엔터`
}

function savedSampleCountLabel(count: number, language: SiteLanguage) {
  return language === 'en' ? String(count) : language === 'ja' ? `${count}件` : `${count}개`
}

function clonePartyMember(member: PartyMember): PartyMember {
  return {
    ...member,
    evs: { ...member.evs },
    config: { ...member.config },
    tuning: { ...member.tuning },
  }
}

function clonePartyList(party: PartyMember[]): PartyMember[] {
  return party.map(clonePartyMember)
}

function sanitizeLockedMoveSlots(input: unknown, slotCount: number): string[][] {
  if (!Array.isArray(input)) return Array.from({ length: slotCount }, () => [])
  return Array.from({ length: slotCount }, (_, idx) => {
    const value = input[idx]
    return Array.isArray(value)
      ? value.filter((move): move is string => typeof move === 'string' && move.trim().length > 0).slice(0, 4)
      : []
  })
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
  // PokéAPI has metadata but no sprite payload for the new Z-A Mega Stones yet.
  'mega-greninja': 'https://www.serebii.net/itemdex/sprites/za/greninjite.png',
  'mega-delphox': 'https://www.serebii.net/itemdex/sprites/za/delphoxite.png',
  'mega-meowstic': 'https://www.serebii.net/itemdex/sprites/za/meowsticite.png',
  'mega-starmie': 'https://www.serebii.net/itemdex/sprites/za/starminite.png',
  'mega-froslass': 'https://www.serebii.net/itemdex/sprites/za/froslassite.png',
  'mega-hawlucha': 'https://www.serebii.net/itemdex/sprites/za/hawluchanite.png',
  'mega-skarmory': 'https://www.serebii.net/itemdex/sprites/za/skarmorite.png',
  'mega-excadrill': 'https://www.serebii.net/itemdex/sprites/za/excadrite.png',
  'mega-glimmora': 'https://www.serebii.net/itemdex/sprites/za/glimmoranite.png',
  'mega-dragonite': 'https://www.serebii.net/itemdex/sprites/za/dragoninite.png',
  'mega-chandelure': 'https://www.serebii.net/itemdex/sprites/za/chandelurite.png',
  'mega-meganium': 'https://www.serebii.net/itemdex/sprites/za/meganiumite.png',
  'mega-feraligatr': 'https://www.serebii.net/itemdex/sprites/za/feraligite.png',
  'mega-emboar': 'https://www.serebii.net/itemdex/sprites/za/emboarite.png',
  'mega-scovillain': 'https://www.serebii.net/itemdex/sprites/za/scovillainite.png',
  'mega-clefable': 'https://www.serebii.net/itemdex/sprites/za/clefablite.png',
  'mega-victreebel': 'https://www.serebii.net/itemdex/sprites/za/victreebelite.png',
  'mega-chimecho': 'https://www.serebii.net/itemdex/sprites/za/chimechite.png',
  'mega-golurk': 'https://www.serebii.net/itemdex/sprites/za/golurkite.png',
  'mega-chesnaught': 'https://www.serebii.net/itemdex/sprites/za/chesnaughtite.png',
  'mega-drampa': 'https://www.serebii.net/itemdex/sprites/za/drampanite.png',
  'mega-crabominable': 'https://www.serebii.net/itemdex/sprites/za/crabominite.png',
  'mega-staraptor': 'https://www.serebii.net/itemdex/sprites/za/staraptite.png',
  'mega-metagross': 'metagrossite',
  'mega-scolipede': 'https://www.serebii.net/itemdex/sprites/za/scolipite.png',
  'mega-scrafty': 'https://www.serebii.net/itemdex/sprites/za/scraftinite.png',
  'mega-eelektross': 'https://www.serebii.net/itemdex/sprites/za/eelektrossite.png',
  'mega-pyroar': 'https://www.serebii.net/itemdex/sprites/za/pyroarite.png',
  'mega-malamar': 'https://www.serebii.net/itemdex/sprites/za/malamarite.png',
  'mega-barbaracle': 'https://www.serebii.net/itemdex/sprites/za/barbaracite.png',
  'mega-dragalge': 'https://www.serebii.net/itemdex/sprites/za/dragalgite.png',
  'mega-falinks': 'https://www.serebii.net/itemdex/sprites/za/falinksite.png',
  'mega-raichu-x': 'https://www.serebii.net/itemdex/sprites/za/raichunitex.png',
  'mega-raichu-y': 'https://www.serebii.net/itemdex/sprites/za/raichunitey.png',
  'mega-sceptile': 'sceptilite',
  'mega-blaziken': 'blazikenite',
  'mega-swampert': 'swampertite',
  'mega-mawile': 'mawilite',
  'mega-salamence': 'salamencite',
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

const OPPONENT_OFFENSE_PRESETS: Record<Exclude<OpponentOffensePreset, 'custom'>, OpponentOffenseConfig> = {
  'neutral-0': { attackEv: 0, spAttackEv: 0, attackNature: 1, spAttackNature: 1, label: '무보정 0EV' },
  'atk-32': { attackEv: 32, spAttackEv: 0, attackNature: 1, spAttackNature: 1, label: '공격 32' },
  'spa-32': { attackEv: 0, spAttackEv: 32, attackNature: 1, spAttackNature: 1, label: '특수공격 32' },
  'atk-32-plus': { attackEv: 32, spAttackEv: 0, attackNature: 1.1, spAttackNature: 1, label: '공격 32 +' },
  'spa-32-plus': { attackEv: 0, spAttackEv: 32, attackNature: 1, spAttackNature: 1.1, label: '특수공격 32 +' },
}

function sanitizeOpponentBulkPreset(value: unknown): OpponentBulkPreset {
  return value === 'neutral-0' || value === 'hp-32' || value === 'phys-32' || value === 'spdef-32' || value === 'custom'
    ? value
    : 'neutral-0'
}

function sanitizeOpponentOffensePreset(value: unknown): OpponentOffensePreset {
  return value === 'neutral-0' || value === 'atk-32' || value === 'spa-32' || value === 'atk-32-plus' || value === 'spa-32-plus' || value === 'custom'
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

function opponentOffenseStateFromPreset(preset: OpponentOffensePreset): OpponentOffenseState {
  const resolved = sanitizeOpponentOffensePreset(preset)
  const config = resolved === 'custom' ? OPPONENT_OFFENSE_PRESETS['neutral-0'] : OPPONENT_OFFENSE_PRESETS[resolved]
  return {
    attackEv: config.attackEv,
    spAttackEv: config.spAttackEv,
    attackNature: config.attackNature,
    spAttackNature: config.spAttackNature,
  }
}

function sanitizeOpponentOffenseState(raw?: Partial<OpponentOffenseState> | null, preset: OpponentOffensePreset = 'neutral-0'): OpponentOffenseState {
  const base = opponentOffenseStateFromPreset(preset)
  return {
    attackEv: clampEv(raw?.attackEv ?? base.attackEv, CHAMPIONS_EFFORT_PER_STAT_CAP),
    spAttackEv: clampEv(raw?.spAttackEv ?? base.spAttackEv, CHAMPIONS_EFFORT_PER_STAT_CAP),
    attackNature: sanitizeOpponentNatureMultiplier(raw?.attackNature ?? base.attackNature),
    spAttackNature: sanitizeOpponentNatureMultiplier(raw?.spAttackNature ?? base.spAttackNature),
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

function detectOpponentOffensePreset(state: OpponentOffenseState): OpponentOffensePreset {
  for (const [preset, config] of Object.entries(OPPONENT_OFFENSE_PRESETS) as [Exclude<OpponentOffensePreset, 'custom'>, OpponentOffenseConfig][]) {
    if (
      state.attackEv === config.attackEv &&
      state.spAttackEv === config.spAttackEv &&
      state.attackNature === config.attackNature &&
      state.spAttackNature === config.spAttackNature
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

function opponentOffenseLabel(state: OpponentOffenseState, preset: OpponentOffensePreset) {
  if (preset !== 'custom') return OPPONENT_OFFENSE_PRESETS[preset].label
  const natureBits = [
    state.attackNature > 1 ? '+공격' : null,
    state.spAttackNature > 1 ? '+특수공격' : null,
  ].filter(Boolean)
  return `공격 ${state.attackEv} · 특수공격 ${state.spAttackEv}${natureBits.length ? ` · ${natureBits.join(' / ')}` : ''}`
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
  return canonicalChampionsItemName(item).trim() === 'こだわりスカーフ'
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

const DEFAULT_NATURE_BY_KEY: Partial<Record<string, NatureId>> = {
  'mega-lopunny': 'jolly',
  'mega-delphox': 'timid',
  'garchomp': 'jolly',
  'toxapex': 'bold',
  'corviknight': 'impish',
  'kingambit': 'adamant',
}

function defaultNatureForKey(key: string): NatureId {
  if (!key) return 'jolly'
  const override = DEFAULT_NATURE_BY_KEY[key]
  if (override) return override

  const row = indexByKey.get(key) ?? null
  const curatedEntry = sampleMoves.find((entry) => entry.key === key)
  const moveOptions = moveOptionsForEntry(curatedEntry)
  const suggested = suggestedMoveGroupsForRow(row, moveOptions, {}, curatedEntry)
  const topMoves = topSuggestedMoves(suggested, 6)

  let physicalCount = 0
  let specialCount = 0
  let statusCount = 0
  for (const move of topMoves) {
    const meta = resolveMoveMeta(move, moveOptions, {})
    if (meta?.category === 'physical') physicalCount += 1
    else if (meta?.category === 'special') specialCount += 1
    else if (meta?.category === 'status') statusCount += 1
  }

  if (row) {
    const attackLead = row.attack - row.spAttack
    const specialLead = row.spAttack - row.attack
    const bulky = row.hp + Math.max(row.defense, row.spDefense) >= 180

    if (bulky && row.speed <= 80 && statusCount >= Math.max(2, physicalCount + specialCount)) {
      if (row.defense >= row.spDefense + 10) return attackLead >= 0 ? 'impish' : 'bold'
      if (row.spDefense >= row.defense + 10) return attackLead >= 0 ? 'careful' : 'calm'
    }
    if (physicalCount >= specialCount + 1 || attackLead >= 20) {
      return row.speed >= 90 ? 'jolly' : 'adamant'
    }
    if (specialCount >= physicalCount + 1 || specialLead >= 20) {
      return row.speed >= 90 ? 'timid' : 'modest'
    }
    if (bulky && row.speed <= 80) {
      if (row.defense >= row.spDefense + 10) return 'impish'
      if (row.spDefense >= row.defense + 10) return 'careful'
    }
    return row.speed >= 90
      ? (row.attack >= row.spAttack ? 'jolly' : 'timid')
      : (row.attack >= row.spAttack ? 'adamant' : 'modest')
  }

  return 'jolly'
}

const defaultPartyTuning = (): PartyTuning => ({ magicNumber: 0, maxValue: 0 })
const blankPartyMember = (): PartyMember => ({ key: '', config: { nature: 'jolly', scarf: false, speedStage: 0 }, picked: false, evs: { ...defaultEvs }, tuning: defaultPartyTuning(), item: '', ability: '' })
const defaultParty: PartyMember[] = starterKeys.map((key) => ({ key, config: { nature: defaultNatureForKey(key), scarf: false, speedStage: 0 }, picked: false, evs: { ...defaultEvs }, tuning: defaultPartyTuning(), item: normalizeItemForKey(key, ''), ability: defaultAbilityForKey(key) }))
const emptyParty: PartyMember[] = Array.from({ length: defaultParty.length }, () => blankPartyMember())
const cloneEmptyParty = () => clonePartyList(emptyParty)
const defaultSampleForge = (): PartyMember => ({ key: starterKeys[0], config: { nature: defaultNatureForKey(starterKeys[0]), scarf: false, speedStage: 0 }, picked: false, evs: { ...defaultEvs }, tuning: defaultPartyTuning(), item: normalizeItemForKey(starterKeys[0], ''), ability: defaultAbilityForKey(starterKeys[0]) })
const blankOpponent = (): OpponentState => ({
  key: '',
  item: '',
  ability: '',
  notes: '',
  revealedMoves: [],
  natureBoost: false,
  scarf: false,
  speedStage: 0,
  picked: false,
  hpEv: 0,
  defenseEv: 0,
  spDefenseEv: 0,
  speedEv: CHAMPIONS_EFFORT_PER_STAT_CAP,
  defenseNature: 1,
  spDefenseNature: 1,
})
const defaultOpponentKeys = ['rotom', 'garchomp', 'primarina', 'dragapult', 'mimikyu', 'meowscarada'].filter((key) => indexByKey.has(key))
const defaultOpponents: OpponentState[] = defaultOpponentKeys.map((key) => ({
  ...blankOpponent(),
  key,
  natureBoost: true,
}))
const blankSampleSpeedTarget = (): SampleSpeedTarget => ({
  ...blankOpponent(),
  natureBoost: true,
})
const defaultSampleSpeedTargets: SampleSpeedTarget[] = ['garchomp'].filter((key) => indexByKey.has(key)).map((key) => ({
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
const defaultSampleDamageTargets: SampleDamageTarget[] = ['garchomp'].filter((key) => indexByKey.has(key)).map((key) => ({
  ...blankSampleDamageTarget(),
  key,
}))
const emptyOpponents = Array.from({ length: MAX_OPPONENTS }, () => blankOpponent())

function firstFilledIndex<T extends { key: string }>(entries: T[], fallback = 0) {
  const idx = entries.findIndex((entry) => Boolean(entry.key))
  return idx >= 0 ? idx : fallback
}

function sanitizeBoardSlotIndex(value: unknown, entries: { key: string }[], fallback = 0) {
  const index = typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : fallback
  if (index < 0 || index >= entries.length) return fallback
  return index
}

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
  { key: 'spAttack', short: '특수공격', label: '특수공격' },
  { key: 'attack', short: '공격', label: '공격' },
  { key: 'spDefense', short: '특수방어', label: '특수방어' },
  { key: 'defense', short: '방어', label: '방어' },
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

function resolvedMovePower(meta: MoveMeta | null) {
  if (!meta) return 0
  if (meta.hitPowers?.length) return meta.hitPowers.reduce((sum, value) => sum + value, 0)
  if (meta.power != null && meta.hits) return meta.power * meta.hits
  if (meta.power != null) return meta.power
  if (meta.variablePower) return 70
  return 0
}

function autoMoveGroupsForRow(row: Row | null | undefined, moveOptions: MoveOption[], movePools: Record<string, MovePoolState>) {
  const uniqueOptions = Array.from(new Map(moveOptions.map((option) => [option.name, option])).values())
  if (!uniqueOptions.length) return null

  const preferredCategory = !row ? 'mixed'
    : row.attack >= row.spAttack + 15 ? 'physical'
      : row.spAttack >= row.attack + 15 ? 'special'
        : 'mixed'

  const evaluated = uniqueOptions.map((option) => {
    const meta = resolveMoveMeta(option.name, uniqueOptions, movePools)
    const category = meta?.category ?? null
    const type = meta?.type ?? option.type ?? null
    const power = resolvedMovePower(meta)
    const accuracy = meta?.accuracy ?? 100
    const priority = meta?.priority ?? 0
    const stab = !!(row && type && row.types.includes(type))
    return {
      name: option.name,
      category,
      type,
      power,
      accuracy,
      priority,
      stab,
      score: power
        + (stab ? 34 : 0)
        + (priority > 0 ? 18 + priority * 6 : 0)
        + ((accuracy ?? 100) / 10)
        + (preferredCategory === category ? 12 : preferredCategory !== 'mixed' && category && preferredCategory !== category ? -8 : 0),
      utilityScore: (priority > 0 ? 18 + priority * 5 : 0)
        + (stab ? 8 : 0)
        + ((accuracy ?? 100) / 10),
    }
  })

  const offense = evaluated
    .filter((move) => (move.category === 'physical' || move.category === 'special') && move.power > 0)
    .sort((a, b) => b.score - a.score || b.power - a.power || a.name.localeCompare(b.name, 'ko'))
  const utility = evaluated
    .filter((move) => move.category === 'status')
    .sort((a, b) => b.utilityScore - a.utilityScore || a.name.localeCompare(b.name, 'ko'))

  const core = offense
    .filter((move) => move.stab || move.priority > 0 || move.category === preferredCategory || preferredCategory === 'mixed')
    .slice(0, 8)
    .map((move) => move.name)
  const coreSet = new Set(core)
  const options = offense
    .filter((move) => !coreSet.has(move.name))
    .slice(0, 14)
    .map((move) => move.name)
  const utilityMoves = utility.slice(0, 10).map((move) => move.name)

  if (!core.length && !options.length && !utilityMoves.length) return null
  return {
    core,
    options,
    utility: utilityMoves,
  }
}

function mergeMoveGroupLists(...groups: (string[] | undefined)[]) {
  const seen = new Set<string>()
  const merged: string[] = []
  for (const group of groups) {
    for (const move of group ?? []) {
      if (!move || seen.has(move)) continue
      seen.add(move)
      merged.push(move)
    }
  }
  return merged
}

function suggestedMoveGroupsForRow(
  row: Row | null | undefined,
  moveOptions: MoveOption[],
  movePools: Record<string, MovePoolState>,
  curatedEntry?: typeof sampleMoves[number] | null,
) {
  const auto = autoMoveGroupsForRow(row, moveOptions, movePools)
  if (!curatedEntry && !auto) return null
  return {
    core: mergeMoveGroupLists(curatedEntry?.core, auto?.core).slice(0, 10),
    options: mergeMoveGroupLists(curatedEntry?.options, auto?.options, auto?.core).filter((move) => !mergeMoveGroupLists(curatedEntry?.core, auto?.core).includes(move)).slice(0, 16),
    utility: mergeMoveGroupLists(curatedEntry?.utility, auto?.utility).filter((move) => !mergeMoveGroupLists(curatedEntry?.core, auto?.core, curatedEntry?.options, auto?.options).includes(move)).slice(0, 12),
  }
}

function topSuggestedMoves(groups: ReturnType<typeof suggestedMoveGroupsForRow>, limit = 10) {
  if (!groups) return []
  return mergeMoveGroupLists(groups.core, groups.options, groups.utility).slice(0, limit)
}

const MOVE_NAME_ALIASES: Record<string, string> = {
  '회복': 'HP회복',
  '섀도클로': '섀도크루',
}
const MOVE_NAME_ALIASES_BY_NORMALIZED = new Map(
  Object.entries(MOVE_NAME_ALIASES).map(([name, alias]) => [normalizeSearchText(name), alias] as const),
)

let ocrMoveIndexCache: { nameKo: string; candidates: string[] }[] | null = null
let ocrItemIndexCache: { itemKey: string; candidates: string[] }[] | null = null
let ocrAbilityIndexCache: { abilityKey: string; koLabel: string; candidates: string[] }[] | null = null

function getOcrMoveIndexSync() {
  if (ocrMoveIndexCache) return ocrMoveIndexCache
  const bundle = getDexDescriptionsSync()
  if (!bundle) return []
  ocrMoveIndexCache = Object.entries(bundle.moves).map(([nameKo, description]) => ({
    nameKo,
    candidates: Array.from(new Set([
      nameKo,
      description.nameEn,
      description.nameJa,
      ...moveNameCandidates(nameKo),
    ].filter(Boolean).flatMap((entry) => [String(entry), normalizeSearchText(String(entry))]))),
  }))
  return ocrMoveIndexCache
}

function getOcrItemIndexSync() {
  if (ocrItemIndexCache) return ocrItemIndexCache
  const bundle = getDexDescriptionsSync()
  if (!bundle) return []
  ocrItemIndexCache = Object.entries(bundle.items).map(([itemKey, description]) => ({
    itemKey,
    candidates: Array.from(new Set([
      itemKey,
      description.nameKo,
      description.nameEn,
      description.nameJa,
    ].filter(Boolean).flatMap((entry) => [String(entry), normalizeSearchText(String(entry))]))),
  }))
  return ocrItemIndexCache
}

const OCR_NATURE_INDEX = NATURES.map((nature) => ({
  id: nature.id,
  candidates: Array.from(new Set([
    nature.id,
    nature.label,
    titleCaseSlug(nature.id),
  ].flatMap((entry) => [entry, normalizeSearchText(entry)]))),
}))

const OCR_EFFORT_LABELS: Record<OcrStatKey, string[]> = {
  hp: ['hp', 'h', '체력', 'hp체력'],
  attack: ['atk', 'attack', 'a', '공격'],
  defense: ['def', 'defense', 'b', '방어'],
  spAttack: ['spa', 'spatk', 'satk', 'specialattack', 'c', '특공', '특수공격'],
  spDefense: ['spd', 'spdef', 'sdef', 'specialdefense', 'd', '특방', '특수방어'],
  speed: ['spe', 'speed', 's', '스피드', '속도'],
}

const OCR_EFFORT_PATTERNS = Object.fromEntries(
  Object.entries(OCR_EFFORT_LABELS).map(([stat, labels]) => [
    stat,
    labels.map((label) => new RegExp(`(?:^|[^a-z])${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:/=-]?\\s*(\\d{1,3})`, 'i')),
  ]),
) as Record<OcrStatKey, RegExp[]>

const MAX_SPRITE_HASH_DISTANCE = 72
const ITEM_EFFECT_SUMMARIES: Record<string, Record<SiteLanguage, string>> = {
  'いのちのたま': { ko: '공격 기술의 대미지 30% 증가. 공격 후 최대 HP의 10%를 잃음.', en: 'Boosts damaging moves by 30%, then costs 10% of max HP after attacking.', ja: '攻撃技のダメージが30%上がり 攻撃後に最大HPの10%を失う。' },
  'おうじゃのしるし': { ko: '공격 기술 명중 시 10% 확률로 상대를 풀죽게 함.', en: 'Damaging moves have a 10% chance to make the target flinch.', ja: '攻撃技が当たると10%の確率で相手をひるませる。' },
  'きあいのタスキ': { ko: 'HP가 가득 찬 상태에서 기절할 공격을 받으면 HP 1로 버팀.', en: 'If at full HP, survives a would-be KO hit with 1 HP.', ja: 'HP満タンのとき ひんしになる攻撃を受けても HP1で耐える。' },
  'きせきのタネ': { ko: '풀 타입 기술 위력 20% 증가.', en: 'Boosts Grass-type move power by 20%.', ja: 'くさタイプの技の威力が20%上がる。' },
  'くろいメガネ': { ko: '악 타입 기술 위력 20% 증가.', en: 'Boosts Dark-type move power by 20%.', ja: 'あくタイプの技の威力が20%上がる。' },
  'くろおび': { ko: '격투 타입 기술 위력 20% 증가.', en: 'Boosts Fighting-type move power by 20%.', ja: 'かくとうタイプの技の威力が20%上がる。' },
  'こだわりスカーフ': { ko: '스피드 1.5배. 대신 처음 고른 기술만 계속 사용.', en: 'Raises Speed by 1.5x, but locks the user into the first move used.', ja: '素早さが1.5倍になるが 最初に選んだ技しか出せなくなる。' },
  'しろいハーブ': { ko: '한 번만 능력 하락을 원래대로 되돌리고 소모됨.', en: 'Restores lowered stats once, then is consumed.', ja: '下がった能力を一度だけ元に戻して消費される。' },
  'しんぴのしずく': { ko: '물 타입 기술 위력 20% 증가.', en: 'Boosts Water-type move power by 20%.', ja: 'みずタイプの技の威力が20%上がる。' },
  'じしゃく': { ko: '전기 타입 기술 위력 20% 증가.', en: 'Boosts Electric-type move power by 20%.', ja: 'でんきタイプの技の威力が20%上がる。' },
  'するどいくちばし': { ko: '비행 타입 기술 위력 20% 증가.', en: 'Boosts Flying-type move power by 20%.', ja: 'ひこうタイプの技の威力が20%上がる。' },
  'せんせいのツメ': { ko: '20% 확률로 같은 우선도 내에서 먼저 행동.', en: 'Gives a 20% chance to move first within the same priority bracket.', ja: '20%の確率で 同じ優先度内なら先に行動できる。' },
  'たべのこし': { ko: '턴 종료마다 최대 HP의 1/16 회복.', en: 'Restores 1/16 of max HP at the end of each turn.', ja: '毎ターン終了時に 最大HPの1/16を回復する。' },
  'でんきだま': { ko: '피카츄가 들면 공격·특수공격 2배.', en: 'When held by Pikachu, doubles Attack and Special Attack.', ja: 'ピカチュウが持つと 攻撃と特攻が2倍になる。' },
  'とけないこおり': { ko: '얼음 타입 기술 위력 20% 증가.', en: 'Boosts Ice-type move power by 20%.', ja: 'こおりタイプの技の威力が20%上がる。' },
  'どくバリ': { ko: '독 타입 기술 위력 20% 증가.', en: 'Boosts Poison-type move power by 20%.', ja: 'どくタイプの技の威力が20%上がる。' },
  'のろいのおふだ': { ko: '고스트 타입 기술 위력 20% 증가.', en: 'Boosts Ghost-type move power by 20%.', ja: 'ゴーストタイプの技の威力が20%上がる。' },
  'ひかりのこな': { ko: '상대 기술의 명중률을 10% 낮춤.', en: 'Lowers the accuracy of moves used against the holder by 10%.', ja: '相手の技の命中率を10%下げる。' },
  'まがったスプーン': { ko: '에스퍼 타입 기술 위력 20% 증가.', en: 'Boosts Psychic-type move power by 20%.', ja: 'エスパータイプの技の威力が20%上がる。' },
  'もくたん': { ko: '불꽃 타입 기술 위력 20% 증가.', en: 'Boosts Fire-type move power by 20%.', ja: 'ほのおタイプの技の威力が20%上がる。' },
  'やわらかいすな': { ko: '땅 타입 기술 위력 20% 증가.', en: 'Boosts Ground-type move power by 20%.', ja: 'じめんタイプの技の威力が20%上がる。' },
  'りゅうのキバ': { ko: '드래곤 타입 기술 위력 20% 증가.', en: 'Boosts Dragon-type move power by 20%.', ja: 'ドラゴンタイプの技の威力が20%上がる。' },
  'イトケのみ': { ko: '효과가 굉장한 물 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Water-type hit, then is consumed.', ja: '効果抜群の みず技を一度だけ半減して消費される。' },
  'オッカのみ': { ko: '효과가 굉장한 불꽃 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Fire-type hit, then is consumed.', ja: '効果抜群の ほのお技を一度だけ半減して消費される。' },
  'オボンのみ': { ko: 'HP가 절반 이하일 때 최대 HP의 25% 회복.', en: 'Restores 25% of max HP when HP drops to half or below.', ja: 'HPが半分以下になると 最大HPの25%を回復する。' },
  'カゴのみ': { ko: '잠듦 상태가 되면 즉시 잠에서 깨어나며 소모됨.', en: 'Wakes the holder immediately if it falls asleep, then is consumed.', ja: 'ねむり状態になると すぐ目を覚まして消費される。' },
  'カシブのみ': { ko: '효과가 굉장한 고스트 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Ghost-type hit, then is consumed.', ja: '効果抜群の ゴースト技を一度だけ半減して消費される。' },
  'シュカのみ': { ko: '효과가 굉장한 땅 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Ground-type hit, then is consumed.', ja: '効果抜群の じめん技を一度だけ半減して消費される。' },
  'シルクのスカーフ': { ko: '노말 타입 기술 위력 20% 증가.', en: 'Boosts Normal-type move power by 20%.', ja: 'ノーマルタイプの技の威力が20%上がる。' },
  'ソクノのみ': { ko: '효과가 굉장한 전기 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Electric-type hit, then is consumed.', ja: '効果抜群の でんき技を一度だけ半減して消費される。' },
  'ナモのみ': { ko: '효과가 굉장한 악 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Dark-type hit, then is consumed.', ja: '効果抜群の あく技を一度だけ半減して消費される。' },
  'ハバンのみ': { ko: '효과가 굉장한 드래곤 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Dragon-type hit, then is consumed.', ja: '効果抜群の ドラゴン技を一度だけ半減して消費される。' },
  'バコウのみ': { ko: '효과가 굉장한 비행 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Flying-type hit, then is consumed.', ja: '効果抜群の ひこう技を一度だけ半減して消費される。' },
  'ビアーのみ': { ko: '효과가 굉장한 독 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Poison-type hit, then is consumed.', ja: '効果抜群の どく技を一度だけ半減して消費される。' },
  'ピントレンズ': { ko: '급소 랭크 1단계 상승.', en: 'Raises the holder’s critical-hit ratio by 1 stage.', ja: '急所ランクが1段階上がる。' },
  'メタルコート': { ko: '강철 타입 기술 위력 20% 증가.', en: 'Boosts Steel-type move power by 20%.', ja: 'はがねタイプの技の威力が20%上がる。' },
  'メンタルハーブ': { ko: '도발·앵콜·트집·금지류를 한 번 해제하고 소모됨.', en: 'Clears Taunt, Encore, Torment, Disable, and similar effects once, then is consumed.', ja: 'ちょうはつ・アンコール・いちゃもん・かなしばり系を一度だけ解除して消費される。' },
  'ヤチェのみ': { ko: '효과가 굉장한 얼음 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Ice-type hit, then is consumed.', ja: '効果抜群の こおり技を一度だけ半減して消費される。' },
  'ヨプのみ': { ko: '효과가 굉장한 격투 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Fighting-type hit, then is consumed.', ja: '効果抜群の かくとう技を一度だけ半減して消費される。' },
  'ヨロギのみ': { ko: '효과가 굉장한 바위 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Rock-type hit, then is consumed.', ja: '効果抜群の いわ技を一度だけ半減して消費される。' },
  'ラムのみ': { ko: '상태이상에 걸리면 한 번 즉시 회복하고 소모됨.', en: 'Cures a status condition once, then is consumed.', ja: '状態異常になると 一度だけすぐ回復して消費される。' },
  'リリバのみ': { ko: '효과가 굉장한 강철 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Steel-type hit, then is consumed.', ja: '効果抜群の はがね技を一度だけ半減して消費される。' },
  'リンドのみ': { ko: '효과가 굉장한 풀 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Grass-type hit, then is consumed.', ja: '効果抜群の くさ技を一度だけ半減して消費される。' },
  'ロゼルのみ': { ko: '효과가 굉장한 페어리 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Fairy-type hit, then is consumed.', ja: '効果抜群の フェアリー技を一度だけ半減して消費される。' },
}
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

function protectionDamageMultiplier(attackerAbility: string, moveName: string, protectionActive: boolean) {
  if (!protectionActive) return 1
  return attackerAbility === 'piercing-drill' && moveMatchesTaggedSet(moveName, CONTACT_MOVE_NAMES) ? 0.25 : 0
}

function resolveAbilityAdjustedMoveMeta(moveName: string, moveMeta: MoveMeta | null, attackerAbility: string, weather: DamageWeather = 'none') {
  if (!moveMeta) return moveMeta
  const isDamaging = moveMeta.category === 'physical' || moveMeta.category === 'special'
  if (!isDamaging) return moveMeta
  const effectiveWeather = attackerAbility === 'mega-sol' ? 'sun' : weather
  let adjusted = moveMeta
  if (normalizeSearchText(moveName) === normalizeSearchText('웨더볼') && effectiveWeather !== 'none') {
    const weatherType = effectiveWeather === 'sun' ? 'fire' : effectiveWeather === 'rain' ? 'water' : effectiveWeather === 'sand' ? 'rock' : 'ice'
    adjusted = { ...adjusted, type: weatherType, power: 100 }
  }
  if (adjusted.type === 'normal') {
    if (attackerAbility === 'aerilate') return { ...adjusted, type: 'flying' }
    if (attackerAbility === 'pixilate') return { ...adjusted, type: 'fairy' }
    if (attackerAbility === 'refrigerate') return { ...adjusted, type: 'ice' }
    if (attackerAbility === 'dragonize') return { ...adjusted, type: 'dragon' }
  }
  if (attackerAbility === 'liquid-voice' && moveMatchesTaggedSet(moveName, SOUND_MOVE_NAMES)) {
    return { ...adjusted, type: 'water' }
  }
  return adjusted
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
  for (const candidate of moveNameCandidates(name)) {
    const meta = lookupMoveMeta(candidate)
    if (meta?.type) return meta.type
  }
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

function sanitizeMoveSlotList(input: unknown) {
  if (!Array.isArray(input)) return []
  return normalizeMoveSlots(input.filter((move): move is string => typeof move === 'string'))
}

function megaRawBaseKey(key: string) {
  if (!key.startsWith('mega-')) return key
  const raw = key.slice(5)
  if (raw.endsWith('-x') || raw.endsWith('-y')) return raw.slice(0, -2)
  return raw
}

function megaBaseKey(key: string) {
  if (!key.startsWith('mega-')) return key
  const rawBaseKey = megaRawBaseKey(key)
  if (indexByKey.has(rawBaseKey)) return rawBaseKey
  const row = indexByKey.get(key)
  if (!row) return rawBaseKey
  const koBaseName = row.name_ko.replace(/^메가/, '').replace(/\s*[XY]$/i, '').trim()
  const enBaseName = row.name_en.replace(/^Mega\s+/i, '').replace(/\s+[XY]$/i, '').trim().toLowerCase()
  const matched = rows.find((candidate) => !candidate.key.startsWith('mega-') && (
    candidate.name_ko.trim() === koBaseName
    || candidate.name_en.trim().toLowerCase() === enBaseName
  ))
  return matched?.key ?? rawBaseKey
}

function pokemonApiCandidates(key: string) {
  const candidates = [key]
  if (key.startsWith('mega-')) {
    const rawBase = megaRawBaseKey(key)
    const base = megaBaseKey(key)
    candidates.push(`${rawBase}-mega`, rawBase)
    if (base !== rawBase) candidates.push(base)
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
  if (key.startsWith('mega-')) {
    keys.push(megaBaseKey(key))
    const rawBase = megaRawBaseKey(key)
    if (rawBase !== megaBaseKey(key)) keys.push(rawBase)
  }
  const [first, ...rest] = key.split('-')
  if (['alolan', 'galarian', 'hisuian', 'paldean'].includes(first) && rest.length) keys.push(rest.join('-'))
  return Array.from(new Set(keys))
}

function megaCandidateKeysForBase(baseKey: string) {
  return rows
    .filter((row) => row.key.startsWith('mega-') && megaBaseKey(row.key) === baseKey)
    .map((row) => row.key)
    .sort((a, b) => a.localeCompare(b, 'en'))
}

function resolveCalcKeyWithMega(key: string, megaSelection: string | null) {
  const baseKey = megaBaseKey(key)
  const megaCandidates = megaCandidateKeysForBase(baseKey)
  if (!megaCandidates.length) return key
  if (megaSelection && megaCandidates.includes(megaSelection)) return megaSelection
  return baseKey
}

function megaToggleLabel(key: string, language: SiteLanguage) {
  if (key.endsWith('-x')) return language === 'en' ? 'Mega X' : language === 'ja' ? 'メガX' : '메가X'
  if (key.endsWith('-y')) return language === 'en' ? 'Mega Y' : language === 'ja' ? 'メガY' : '메가Y'
  return language === 'en' ? 'Mega' : language === 'ja' ? 'メガ' : '메가'
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

function sanitizeMemberConfig(input: unknown, key = ''): MemberConfig {
  const config = input && typeof input === 'object' ? (input as Partial<MemberConfig>) : {}
  const rawNature = typeof (config as { nature?: unknown }).nature === 'string' ? (config as { nature: NatureId }).nature : null
  const legacyNature = legacyNatureFromBoostStat((config as { natureBoostStat?: unknown }).natureBoostStat)
  return {
    nature: rawNature && natureById.has(rawNature) ? rawNature : (legacyNature || defaultNatureForKey(key)),
    // Legacy builds stored a hidden scarf flag separately from the held item.
    // Discard it so player/sample speed always follows the visible item value.
    scarf: false,
    speedStage: clampSpeedStage(config.speedStage),
  }
}

function abilityMatchesKey(key: string, ability: string) {
  const row = indexByKey.get(key)
  if (!row) return false
  const normalized = normalizeSearchText(ability)
  if (!normalized) return false
  return row.abilities.some((slug, idx) => {
    const ko = row.abilities_ko[idx] ?? ''
    return normalizeSearchText(slug) === normalized || normalizeSearchText(ko) === normalized || normalizeSearchText(titleCaseSlug(slug)) === normalized
  })
}

function sanitizeAbilityForKey(key: string, ability: unknown, fallbackToDefault = true) {
  const raw = typeof ability === 'string' ? ability : ''
  if (raw && abilityMatchesKey(key, raw)) return raw
  const row = indexByKey.get(key)
  const shouldUseDefault = fallbackToDefault || Boolean(row && row.abilities.length === 1)
  return shouldUseDefault ? defaultAbilityForKey(key) : ''
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
        config: sanitizeMemberConfig(raw.config, raw.key),
        picked: typeof raw.picked === 'boolean' ? raw.picked : false,
        evs: sanitizeEvs(raw.evs),
        tuning: sanitizePartyTuning(raw.tuning),
        item: normalizeItemForKey(raw.key, typeof raw.item === 'string' ? raw.item : ''),
        ability: sanitizeAbilityForKey(raw.key, raw.ability, true),
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
        ability: sanitizeAbilityForKey(raw.key, raw.ability, false),
        notes: typeof raw.notes === 'string' ? raw.notes : '',
        revealedMoves: Array.isArray(raw.revealedMoves)
          ? raw.revealedMoves.filter((move): move is string => typeof move === 'string')
          : [],
        natureBoost: typeof raw.natureBoost === 'boolean' ? raw.natureBoost : false,
        scarf: typeof raw.scarf === 'boolean' ? raw.scarf : false,
        speedStage: clampSpeedStage(raw.speedStage),
        picked: typeof raw.picked === 'boolean' ? raw.picked : false,
        hpEv: clampNonNegativeInt((raw as Partial<SampleDamageTarget>).hpEv ?? 0, CHAMPIONS_EFFORT_PER_STAT_CAP),
        defenseEv: clampNonNegativeInt((raw as Partial<SampleDamageTarget>).defenseEv ?? 0, CHAMPIONS_EFFORT_PER_STAT_CAP),
        spDefenseEv: clampNonNegativeInt((raw as Partial<SampleDamageTarget>).spDefenseEv ?? 0, CHAMPIONS_EFFORT_PER_STAT_CAP),
        speedEv: clampNonNegativeInt((raw as Partial<SampleDamageTarget> & { speedEv?: number }).speedEv ?? CHAMPIONS_EFFORT_PER_STAT_CAP, CHAMPIONS_EFFORT_PER_STAT_CAP),
        defenseNature: (raw as Partial<SampleDamageTarget>).defenseNature === 1.1 ? 1.1 : 1,
        spDefenseNature: (raw as Partial<SampleDamageTarget>).spDefenseNature === 1.1 ? 1.1 : 1,
      }
    })
    .filter((opponent): opponent is OpponentState => Boolean(opponent))
    .slice(0, MAX_OPPONENTS)

  return cleaned.length ? cleaned : defaultOpponents
}

function sanitizeConfirmedMovesByKey(input: unknown): Record<string, string[]> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {}
  return Object.fromEntries(
    Object.entries(input)
      .filter(([key]) => typeof key === 'string')
      .map(([key, value]) => [key, Array.isArray(value) ? value.filter((move): move is string => typeof move === 'string' && move.trim().length > 0) : []])
  )
}

function sanitizeSampleSpeedTargets(input: unknown): SampleSpeedTarget[] {
  if (!Array.isArray(input)) return defaultSampleSpeedTargets.slice(0, 1)
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
        speedEv: clampNonNegativeInt((raw as Partial<SampleDamageTarget> & { speedEv?: number }).speedEv ?? CHAMPIONS_EFFORT_PER_STAT_CAP, CHAMPIONS_EFFORT_PER_STAT_CAP),
      }
    })
    .filter((target): target is SampleSpeedTarget => Boolean(target))
    .slice(0, 1)

  return cleaned.length ? cleaned : defaultSampleSpeedTargets.slice(0, 1)
}

function sanitizeSampleDamageTargets(input: unknown): SampleDamageTarget[] {
  if (!Array.isArray(input)) return defaultSampleDamageTargets.slice(0, 1)
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
        speedEv: clampNonNegativeInt((raw as Partial<SampleDamageTarget> & { speedEv?: number }).speedEv ?? CHAMPIONS_EFFORT_PER_STAT_CAP, CHAMPIONS_EFFORT_PER_STAT_CAP),
        defenseNature: raw.defenseNature === 1.1 ? 1.1 : 1,
        spDefenseNature: raw.spDefenseNature === 1.1 ? 1.1 : 1,
        moveName: typeof raw.moveName === 'string' ? raw.moveName : '',
      }
    })
    .filter((target): target is SampleDamageTarget => Boolean(target))
    .slice(0, 1)

  return cleaned.length ? cleaned : defaultSampleDamageTargets.slice(0, 1)
}

function sanitizeSavedSamples(input: unknown): SavedSample[] {
  if (!Array.isArray(input)) return []
  return input
    .map((entry, idx) => {
      if (!entry || typeof entry !== 'object') return null
      const raw = entry as Partial<SavedSample>
      const member = sanitizeParty([raw.member])[0]
      if (!member) return null
      const lockedMoves = Array.isArray(raw.lockedMoves)
        ? raw.lockedMoves.filter((move): move is string => typeof move === 'string' && Boolean(move.trim())).slice(0, 4)
        : []
      return {
        id: typeof raw.id === 'string' ? raw.id : `sample-${idx}`,
        label: typeof raw.label === 'string' && raw.label.trim() ? raw.label : `${member.key}-${idx + 1}`,
        member,
        lockedMoves,
      }
    })
    .filter((entry): entry is SavedSample => Boolean(entry))
}

function sanitizeSavedPartyPresets(input: unknown): SavedPartyPreset[] {
  if (!Array.isArray(input)) return []
  return input
    .map((entry, idx) => {
      if (!entry || typeof entry !== 'object') return null
      const raw = entry as Partial<SavedPartyPreset>
      const party = sanitizeParty(raw.party)
      return {
        id: typeof raw.id === 'string' ? raw.id : `party-${idx}`,
        label: typeof raw.label === 'string' && raw.label.trim() ? raw.label : `Party ${idx + 1}`,
        party,
        lockedMovesBySlot: sanitizeLockedMoveSlots(raw.lockedMovesBySlot, party.length),
      }
    })
    .filter((entry): entry is SavedPartyPreset => Boolean(entry))
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
        : routePath === '/dex'
          ? 'dex'
        : routePath === '/double'
          ? 'double'
          : routePath === '/'
          ? 'home'
          : undefined
    const activeTabParam = routeUrl.searchParams.get('tab')
    const activeTab = activeTabParam === 'party' || activeTabParam === 'pick' || activeTabParam === 'speed' || activeTabParam === 'power'
      ? activeTabParam
      : undefined
    const sampleTabParam = routeUrl.searchParams.get('sampleTab')
    const sampleWorkbenchTab = sampleTabParam === 'builder' || sampleTabParam === 'speed' || sampleTabParam === 'damage'
      ? sampleTabParam
      : undefined
    const dexTabParam = routeUrl.searchParams.get('dexTab')
    const dexSearchMode = dexTabParam === 'pokemon' || dexTabParam === 'move' || dexTabParam === 'ability' || dexTabParam === 'item'
      ? dexTabParam
      : undefined
    const dexSearch = routeUrl.searchParams.get('q') ?? undefined
    const dexUnifiedSearch = routeUrl.searchParams.get('uq') ?? undefined
    const dexSelectedValue = routeUrl.searchParams.get('sel') ?? undefined
    const selectedMy = routeUrl.searchParams.get('my') !== null ? Number(routeUrl.searchParams.get('my')) : undefined
    const selectedOpp = routeUrl.searchParams.get('opp') !== null ? Number(routeUrl.searchParams.get('opp')) : undefined
    return { mainSection, activeTab, sampleWorkbenchTab, dexSearchMode, dexSearch, dexUnifiedSearch, dexSelectedValue, selectedMy, selectedOpp }
  } catch {
    return null
  }
}

function syncViewStateToUrl(viewState: ViewState) {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams()
  const routePath = viewState.mainSection === 'sample' ? '/sample-builder' : viewState.mainSection === 'single' ? '/single' : viewState.mainSection === 'double' ? '/double' : viewState.mainSection === 'dex' ? '/dex' : '/'
  if ((viewState.mainSection === 'single' || viewState.mainSection === 'double') && viewState.activeTab) params.set('tab', viewState.activeTab)
  if (viewState.mainSection === 'sample' && viewState.sampleWorkbenchTab) params.set('sampleTab', viewState.sampleWorkbenchTab)
  if (viewState.mainSection === 'dex' && viewState.dexSearchMode) params.set('dexTab', viewState.dexSearchMode)
  if (viewState.mainSection === 'dex' && viewState.dexSearch) params.set('q', viewState.dexSearch)
  if (viewState.mainSection === 'dex' && viewState.dexUnifiedSearch) params.set('uq', viewState.dexUnifiedSearch)
  if (viewState.mainSection === 'dex' && viewState.dexSelectedValue) params.set('sel', viewState.dexSelectedValue)
  if (typeof viewState.selectedMy === 'number') params.set('my', String(viewState.selectedMy))
  if (typeof viewState.selectedOpp === 'number') params.set('opp', String(viewState.selectedOpp))
  const nextHash = `${routePath}${params.toString() ? `?${params.toString()}` : ''}`
  if ((window.location.hash.replace(/^#/, '') || '/') === nextHash) return
  const url = new URL(window.location.href)
  url.hash = nextHash
  window.history.replaceState(null, '', url)
}

function actualStat(base: number, ev: number, natureMultiplierValue = 1, hp = false) {
  const evContribution = Math.max(0, Math.trunc(ev))
  if (hp) return Math.floor((((2 * base + 31) * 50) / 100) + 60) + evContribution
  const raw = Math.floor((((2 * base + 31) * 50) / 100) + 5) + evContribution
  return Math.floor(raw * natureMultiplierValue)
}

function opponentSpeedValue(row: Row, entry: Pick<OpponentState, 'speedEv' | 'natureBoost' | 'scarf' | 'speedStage' | 'item'>) {
  let value = actualStat(row.speed, entry.speedEv, entry.natureBoost ? natureMultiplier('jolly', 'speed') : 1)
  value = applySpeedStage(value, entry.speedStage)
  if (entry.scarf || isChoiceScarfItem(entry.item)) value = Math.floor(value * 1.5)
  return value
}

function partySpeedValue(row: Row, member: PartyMember) {
  let value = actualStat(row.speed, member.evs.speed, natureMultiplier(member.config.nature, 'speed'))
  if (member.config.speedStage > 0) value = Math.floor(value * ((2 + member.config.speedStage) / 2))
  else if (member.config.speedStage < 0) value = Math.floor(value * (2 / (2 + Math.abs(member.config.speedStage))))
  if (isChoiceScarfItem(member.item)) value = Math.floor(value * 1.5)
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

function buildOpponentBattleStats(row: Row, bulkConfig: OpponentBulkState, offenseConfig?: OpponentOffenseState): BattleStatBlock {
  return {
    hp: actualStat(row.hp, bulkConfig.hpEv, 1, true),
    attack: actualStat(row.attack, offenseConfig?.attackEv ?? 0, offenseConfig?.attackNature ?? 1),
    defense: actualStat(row.defense, bulkConfig.defenseEv, bulkConfig.defenseNature),
    spAttack: actualStat(row.spAttack, offenseConfig?.spAttackEv ?? 0, offenseConfig?.spAttackNature ?? 1),
    spDefense: actualStat(row.spDefense, bulkConfig.spDefenseEv, bulkConfig.spDefenseNature),
  }
}

function attackingFormRow(row: Row, ability: string): Row {
  if (ability !== 'stance-change' || row.key !== 'aegislash') return row
  return { ...row, attack: 140, spAttack: 140 }
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

function isNoEffectDamage(damage: { min: number, max: number, rolls: number[] } | null | undefined) {
  if (!damage) return false
  return damage.max <= 0 || damage.rolls.every((roll) => roll <= 0)
}

function resolveDamageVerdict(damage: { min: number, max: number, rolls: number[] }, hp: number, language: SiteLanguage) {
  if (isNoEffectDamage(damage)) {
    return language === 'en' ? 'No effect' : language === 'ja' ? '無効' : '무효'
  }
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

function resolveDamageVerdictTone(damage: { min: number, max: number, rolls: number[] } | null | undefined, hp: number | null | undefined) {
  if (!damage || !hp || isNoEffectDamage(damage)) return 'neutral'
  const verdict = resolveDamageVerdict(damage, hp, 'en')
  if (verdict.startsWith('Guaranteed')) return 'guaranteed'
  if (verdict.startsWith('Roll')) return 'possible'
  return 'neutral'
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

function isSpeedAbilityConditionActive(slug: string, weather: DamageWeather, terrain: DamageTerrain) {
  if (slug === 'swift-swim') return weather === 'rain'
  if (slug === 'sand-rush') return weather === 'sand'
  if (slug === 'chlorophyll') return weather === 'sun'
  if (slug === 'slush-rush') return weather === 'snow'
  if (slug === 'surge-surfer') return terrain === 'electric'
  return true
}

function mySpeedAbilityMarker(row: Row, member: PartyMember, language: SiteLanguage, weather: DamageWeather, terrain: DamageTerrain) {
  const sanitizedAbility = sanitizeAbilityForKey(row.key, member.ability, true)
  const ability = resolveSelectedAbility(row, sanitizedAbility, language)
  if (!ability) return null
  const effect = MY_SPEED_ABILITY_MARKERS[ability.slug]
  if (!effect) return null
  if (effect.type === 'multiplier' && !isSpeedAbilityConditionActive(ability.slug, weather, terrain)) return null
  const baseSpeed = actualStat(row.speed, member.evs.speed, natureMultiplier(member.config.nature, 'speed'))
  const totalStage = effect.type === 'stage' ? member.config.speedStage + effect.value : member.config.speedStage
  let speed = applySpeedStage(baseSpeed, totalStage)
  if (isChoiceScarfItem(member.item)) speed = Math.floor(speed * 1.5)
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

function mySpeedNeeds(row: Row, config: MemberConfig, item: string, targetSpeed: number) {
  let tieEffort: number | null = null
  let passEffort: number | null = null

  for (let points = 0; points <= CHAMPIONS_EFFORT_PER_STAT_CAP; points += 1) {
    let speed = actualStat(row.speed, points, natureMultiplier(config.nature, 'speed'))
    speed = applySpeedStage(speed, config.speedStage)
    if (isChoiceScarfItem(item)) speed = Math.floor(speed * 1.5)
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

function opponentEffortValues(entry: Pick<OpponentState, 'hpEv' | 'defenseEv' | 'spDefenseEv' | 'speedEv'>): EffortValues {
  return {
    hp: entry.hpEv,
    attack: 0,
    defense: entry.defenseEv,
    spAttack: 0,
    spDefense: entry.spDefenseEv,
    speed: entry.speedEv,
  }
}

function opponentPatchFromEffortValues(evs: EffortValues): Pick<OpponentState, 'hpEv' | 'defenseEv' | 'spDefenseEv' | 'speedEv'> {
  return {
    hpEv: evs.hp,
    defenseEv: evs.defense,
    spDefenseEv: evs.spDefense,
    speedEv: evs.speed,
  }
}

function opponentStatValue(row: Row, entry: Pick<OpponentState, 'hpEv' | 'defenseEv' | 'spDefenseEv' | 'speedEv' | 'natureBoost' | 'defenseNature' | 'spDefenseNature'>, field: keyof EffortValues) {
  switch (field) {
    case 'hp':
      return actualStat(row.hp, entry.hpEv, 1, true)
    case 'attack':
      return actualStat(row.attack, 0, 1)
    case 'defense':
      return actualStat(row.defense, entry.defenseEv, entry.defenseNature)
    case 'spAttack':
      return actualStat(row.spAttack, 0, 1)
    case 'spDefense':
      return actualStat(row.spDefense, entry.spDefenseEv, entry.spDefenseNature)
    case 'speed':
      return actualStat(row.speed, entry.speedEv, entry.natureBoost ? natureMultiplier('jolly', 'speed') : 1)
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

function abilityAdjustedTypeEffectiveness(attackType: string, defendTypes: string[], defenderAbility: string, attackerAbility = '') {
  const attackKey = attackType.toLowerCase()
  const attackerAbilityKey = attackerAbility.toLowerCase()
  const hasScrappy = attackerAbilityKey === 'scrappy' || attackerAbility === '배짱'
  const normalizedDefendTypes = hasScrappy && (attackKey === 'normal' || attackKey === 'fighting')
    ? defendTypes.filter((defendType) => defendType.toLowerCase() !== 'ghost')
    : defendTypes
  const baseEffectiveness = typeEffectiveness(attackType, normalizedDefendTypes)
  if (attackKey === 'ground' && (defenderAbility === 'levitate' || defenderAbility === '부유')) return 0
  return baseEffectiveness
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
  const isWeightMove = moveName === '로우킥' || moveName === '풀묶기' || moveName === '안다리걸기' || moveName === '안다리 걸기'
  if (!isWeightMove || typeof targetWeightKg !== 'number' || !Number.isFinite(targetWeightKg)) return moveMeta
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

function variablePowerHint(moveName: string, lt: (key: string) => string, options?: { targetWeightKnown?: boolean, resolvedPower?: number | null, totalPower?: number | null }) {
  if (CONDITIONAL_MOVE_POWER_RULES[moveName]) return lt('특정 조건에 따라 위력이 자동 반영됨')
  switch (moveName) {
    case '로우킥':
    case '안다리걸기':
    case '안다리 걸기':
    case '풀묶기':
      return typeof options?.resolvedPower === 'number'
        ? `${lt('위력')} ${options.resolvedPower}`
        : lt('상대 무게에 따라 위력이 자동 반영됨')
    case '스케일샷':
    case '트리플악셀':
      return typeof options?.totalPower === 'number'
        ? `${lt('위력')} ${options.totalPower}`
        : lt('대미지 계산 불가')
    default:
      return lt('대미지 계산 불가')
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
  if (effectiveness <= 0) return 0
  let damageAmount = Math.floor((baseAmount * roll) / 100)
  if (stabMod !== DAMAGE_MOD_SCALE) damageAmount = Math.floor((damageAmount * stabMod) / DAMAGE_MOD_SCALE)
  damageAmount = Math.floor(pokeRound(damageAmount) * effectiveness)
  if (damageAmount <= 0) return 0
  if (isBurned) damageAmount = Math.floor(damageAmount / 2)
  const finalDamage = pokeRound((damageAmount * finalMod) / DAMAGE_MOD_SCALE)
  return finalDamage <= 0 ? 0 : Math.max(1, finalDamage)
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
  const rolls = Array.from({ length: 16 }, (_, idx) => 85 + idx).map((random) => hitPowers.reduce((sum, power, hitIdx) => {
    if (modifiers?.ignoreFirstHitDamage && hitIdx === 0) return sum
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

function weatherFromAbility(ability: string): DamageWeather {
  if (ability === 'drought' || ability === '가뭄') return 'sun'
  if (ability === 'drizzle' || ability === '잔비') return 'rain'
  if (ability === 'sand-stream' || ability === '모래날림') return 'sand'
  if (ability === 'snow-warning' || ability === '싸라기눈') return 'snow'
  return 'none'
}

function deriveAutoWeatherFromAbilities(...abilities: string[]) {
  for (const ability of abilities) {
    const resolved = weatherFromAbility(ability)
    if (resolved !== 'none') return resolved
  }
  return 'none' as DamageWeather
}

function terrainFromAbility(ability: string): DamageTerrain {
  if (ability === 'electric-surge' || ability === '일렉트릭메이커') return 'electric'
  return 'none'
}

function deriveAutoTerrainFromAbilities(...abilities: string[]) {
  for (const ability of abilities) {
    const resolved = terrainFromAbility(ability)
    if (resolved !== 'none') return resolved
  }
  return 'none' as DamageTerrain
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
    'disguise': '탈',
    'dry-skin': '건조피부',
    'earth-eater': '대지먹기',
    'electric-surge': '일렉트릭메이커',
    'eelevate': '일렉트리베이트',
    'fairy-aura': '페어리오라',
    'filter': '필터',
    'flash-fire': '타오르는불꽃',
    'fluffy': '복슬복슬',
    'fire-mane': '불꽃의갈기',
    'battle-armor': '전투무장',
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
    'mega-sol': '메가솔',
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
    'shell-armor': '조가비갑옷',
    'solid-rock': '하드록',
    'strong-jaw': '옹골찬턱',
    'supreme-overlord': '대장군',
    'parental-bond': '부자유친',
    'piercing-drill': '관통드릴',
    'plus': '플러스',
    'minus': '마이너스',
    'steelworker': '강철술사',
    'steely-spirit': '강철정신',
    'stance-change': '배틀스위치',
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
  attackerAllyAbility?: string
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
  disguiseActive?: boolean
  critical?: boolean
}) {
  const { attackerAbility, attackerAllyAbility = '', attackerItem, defenderAbility, defenderItem, moveName, baseMoveType, moveType, movePower, mode, effectiveness, attackStage, defenseStage, defenderTypes, burned, attackerLowHp, targetPoisoned, defenderFullHp, movedAfterTarget, faintedAllies, rivalryMode, parentalBond, defenderStatused, electromorphosisCharged, weather, terrain, reflect, lightScreen, auroraVeil, friendGuard, disguiseActive, critical } = params
  const canonicalAttackerItem = canonicalChampionsItemName(attackerItem)
  const canonicalDefenderItem = canonicalChampionsItemName(defenderItem)
  const attackerIgnoresDefenseStage = attackerAbility === 'unaware'
  const defenderIgnoresAttackStage = defenderAbility === 'unaware'
  const criticalBlocked = critical && ['battle-armor', 'shell-armor'].includes(defenderAbility)
  const effectiveCritical = Boolean(!criticalBlocked && (critical || (attackerAbility === 'merciless' && targetPoisoned)))
  const effectiveAttackStage = defenderIgnoresAttackStage ? 0 : effectiveCritical && attackStage < 0 ? 0 : attackStage
  const effectiveDefenseStage = attackerIgnoresDefenseStage ? 0 : effectiveCritical && defenseStage > 0 ? 0 : defenseStage
  let attackMultiplier = battleStageMultiplier(effectiveAttackStage)
  let defenseMultiplier = battleStageMultiplier(effectiveDefenseStage)
  let powerMultiplier = 1
  let finalMultiplier = 1
  let adjustedEffectiveness = effectiveness
  const notes: string[] = []
  let incomingScreenName: string | null = null
  const offensiveWeather: DamageWeather = attackerAbility === 'mega-sol' ? 'sun' : weather

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

  const burnApplies = burned && mode === 'physical' && moveName !== '객기' && attackerAbility !== 'guts' && attackerAbility !== '근성' && attackerAbility !== 'water-bubble'
  if (burnApplies) notes.push('화상')

  if (effectiveCritical) notes.push(attackerAbility === 'merciless' && targetPoisoned && !critical ? `${abilityNoteLabel(attackerAbility)}(급소)` : '급소')
  if (criticalBlocked) notes.push(`${abilityNoteLabel(defenderAbility)}(급소 방지)`)

  if (mode === 'physical' && (attackerAbility === 'huge-power' || attackerAbility === 'pure-power')) {
    attackMultiplier *= 2
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (mode === 'physical' && attackerAbility === 'hustle') {
    attackMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (offensiveWeather === 'sun' && mode === 'special' && attackerAbility === 'solar-power') {
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

  if (offensiveWeather === 'sand' && moveType && ['rock', 'ground', 'steel'].includes(moveType) && attackerAbility === 'sand-force') {
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

  if (mode === 'special' && ['plus', 'minus', '플러스', '마이너스'].includes(attackerAbility) && ['plus', 'minus', '플러스', '마이너스'].includes(attackerAllyAbility)) {
    attackMultiplier *= 1.5
    notes.push(`${abilityNoteLabel(attackerAbility)}+${abilityNoteLabel(attackerAllyAbility)}`)
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

  if (moveType === 'fire' && attackerAbility === 'fire-mane') {
    attackMultiplier *= 1.5
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

  if (canonicalAttackerItem && moveType && typeBoostItems[canonicalAttackerItem] === moveType) {
    finalMultiplier *= 1.2
    notes.push(canonicalAttackerItem)
  }

  if (canonicalAttackerItem === 'いのちのたま') {
    finalMultiplier *= 1.3
    notes.push('생명의구슬')
  }

  if (offensiveWeather === 'sun') {
    if (moveType === 'fire') {
      finalMultiplier *= 1.5
      notes.push(attackerAbility === 'mega-sol' ? `${abilityNoteLabel(attackerAbility)}(쾌청)` : '쾌청')
    } else if (moveType === 'water') {
      finalMultiplier *= 0.5
      notes.push(attackerAbility === 'mega-sol' ? `${abilityNoteLabel(attackerAbility)}(쾌청)` : '쾌청')
    }
  }

  if (offensiveWeather === 'rain') {
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

  if (moveType === 'ground' && (defenderAbility === 'levitate' || defenderAbility === '부유' || defenderAbility === 'eelevate')) {
    adjustedEffectiveness = 0
    notes.push(abilityNoteLabel(defenderAbility === 'eelevate' ? defenderAbility : 'levitate'))
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

  if (adjustedEffectiveness > 0 && defenderAbility === 'fluffy') {
    if (moveMatchesTaggedSet(moveName, CONTACT_MOVE_NAMES)) {
      finalMultiplier *= 0.5
      notes.push(`${abilityNoteLabel(defenderAbility)}(접촉 반감)`)
    }
    if (moveType === 'fire') {
      finalMultiplier *= 2
      notes.push(`${abilityNoteLabel(defenderAbility)}(불꽃 약점)`)
    }
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
    if (canonicalDefenderItem === 'オッカのみ' && moveType === 'fire') {
      finalMultiplier *= 0.5
      notes.push('オッカのみ')
    }
    if (canonicalDefenderItem === 'ヤチェのみ' && moveType === 'ice') {
      finalMultiplier *= 0.5
      notes.push('ヤチェのみ')
    }
    if (canonicalDefenderItem === 'ロゼルのみ' && moveType === 'fairy') {
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

  const defenderHasActiveDisguise = Boolean(disguiseActive && (defenderAbility === 'disguise' || defenderAbility === '탈'))
  if (adjustedEffectiveness > 0 && defenderHasActiveDisguise) {
    notes.push(`${abilityNoteLabel(defenderAbility)}(첫타 무효)`)
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
    ignoreFirstHitDamage: defenderHasActiveDisguise,
    notes,
  }
}

function formatBattleIndex(value: number, language: SiteLanguage) {
  const locale = language === 'ja' ? 'ja-JP' : language === 'en' ? 'en-US' : 'ko-KR'
  return Math.round(value).toLocaleString(locale)
}

function durabilityIndices(stats: BattleStatBlock) {
  return {
    physical: stats.hp * stats.defense,
    special: stats.hp * stats.spDefense,
  }
}

function decisionPowerIndex(stats: BattleStatBlock, moveMeta: MoveMeta, stab: number, modifiers: DamageCalcModifiers) {
  if (moveMeta.category !== 'physical' && moveMeta.category !== 'special') return null
  const attackStat = moveMeta.usesDefenseAsAttack
    ? stats.defense
    : moveMeta.category === 'physical'
      ? stats.attack
      : stats.spAttack
  const totalPower = moveMeta.hitPowers?.length
    ? moveMeta.hitPowers.reduce((sum, power) => sum + power, 0)
    : (moveMeta.power ?? 0) * Math.max(1, moveMeta.hits ?? 1)
  if (!totalPower) return null
  return Math.round(
    attackStat
    * totalPower
    * stab
    * (modifiers.attackMultiplier ?? 1)
    * (modifiers.powerMultiplier ?? 1)
    * (modifiers.finalMultiplier ?? 1)
    / Math.max(0.01, modifiers.defenseMultiplier ?? 1)
  )
}

function battleIndexTooltipData(kind: 'power' | 'physical-bulk' | 'special-bulk', language: SiteLanguage, rows: HoverTooltipCard['rows']): HoverTooltipCard {
  const labels = language === 'ja'
    ? {
        powerTitle: '火力指数',
        physicalTitle: '物理耐久指数',
        specialTitle: '特殊耐久指数',
        powerDescription: '相手のタイプ相性と耐久を除き、実数値・技威力・一致補正・常時発動する特性と持ち物を反映した比較指数です。',
        bulkDescription: '現在のサンプル実数値による HP × 防御（特防）の比較指数です。',
      }
    : language === 'en'
      ? {
          powerTitle: 'Power index',
          physicalTitle: 'Physical bulk index',
          specialTitle: 'Special bulk index',
          powerDescription: 'A comparison index using the actual stat, move power, STAB, and always-on ability/item modifiers; target typing and bulk are excluded.',
          bulkDescription: 'A comparison index using the current sample stats: HP × Defense (or Sp. Def).',
        }
      : {
          powerTitle: '결정력',
          physicalTitle: '물리 내구력',
          specialTitle: '특수 내구력',
          powerDescription: '상대 상성과 내구를 제외하고 실수치·기술 위력·자속·상시 특성/도구 보정을 반영한 비교 지수입니다.',
          bulkDescription: '현재 샘플 실수치의 HP × 방어(특수방어) 비교 지수입니다.',
        }
  return {
    kind: 'index',
    title: kind === 'power' ? labels.powerTitle : kind === 'physical-bulk' ? labels.physicalTitle : labels.specialTitle,
    rows,
    description: kind === 'power' ? labels.powerDescription : labels.bulkDescription,
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

const SPECIES_SEARCH_INDEX = rows.map((row) => ({ row, candidates: speciesSearchCandidates(row) }))

function filterSpeciesOptions(query: string, options?: { includeMega?: boolean; allowLoose?: boolean }) {
  const includeMega = options?.includeMega ?? true
  const allowLoose = options?.allowLoose ?? true
  const normalized = normalizeSearchText(query.trim())
  const candidateEntries = includeMega ? SPECIES_SEARCH_INDEX : SPECIES_SEARCH_INDEX.filter(({ row }) => !row.key.startsWith('mega-'))
  if (!normalized) return candidateEntries.map(({ row }) => ({ key: row.key, label: `${row.name_ko} (${row.name_en})` }))
  return candidateEntries
    .map(({ row, candidates }) => {
      const score = candidates.reduce((best, candidate) => {
        if (candidate === normalized) return Math.min(best, 0)
        if (candidate.startsWith(normalized)) return Math.min(best, 1)
        if (candidate.includes(normalized)) return Math.min(best, 2)
        if (allowLoose && matchesLooseQuery(candidate, normalized)) return Math.min(best, 3)
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

function filterItemOptions(query: string, language: SiteLanguage = 'ko', options?: { fallbackToAll?: boolean; allowLoose?: boolean }) {
  const normalized = query.trim().toLowerCase()
  const fallbackToAll = options?.fallbackToAll ?? true
  const allowLoose = options?.allowLoose ?? true
  if (!normalized) return [...CHAMPIONS_ITEM_OPTIONS]
  const matched = [...CHAMPIONS_ITEM_OPTIONS]
    .map((item) => {
      const aliases = CHAMPIONS_ITEM_ALIASES[item] ?? []
      const candidates = [item, displayItemLabel(item, 'en'), displayItemLabel(item, 'ja'), ...aliases].map((entry) => entry.toLowerCase())
      const score = candidates.reduce((best, candidate) => {
        if (candidate === normalized) return Math.min(best, 0)
        if (candidate.startsWith(normalized)) return Math.min(best, 1)
        if (candidate.includes(normalized)) return Math.min(best, 2)
        if (allowLoose && matchesLooseQuery(candidate, normalized)) return Math.min(best, 3)
        return best
      }, Number.POSITIVE_INFINITY)
      return Number.isFinite(score) ? { item, score } : null
    })
    .filter((entry): entry is { item: ChampionsItem; score: number } => Boolean(entry))
    .sort((a, b) => a.score - b.score || a.item.localeCompare(b.item, 'ko'))
    .map((entry) => entry.item)
  return matched.length ? matched : (fallbackToAll ? [...CHAMPIONS_ITEM_OPTIONS] : [])
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

function displayTypeName(type: string | null | undefined, language: SiteLanguage) {
  if (!type) return translateText(language, '없음')
  if (language === 'en') return titleCaseSlug(type)
  if (language === 'ja') return getJaTypes([type])[0] ?? titleCaseSlug(type)
  return TYPE_KO_BY_KEY[type] ?? type
}

function displayMoveCategoryName(category: MoveCategory | null | undefined, language: SiteLanguage) {
  if (category === 'physical') return translateText(language, '물리')
  if (category === 'special') return translateText(language, '특수')
  if (category === 'status') return translateText(language, '변화')
  return translateText(language, '없음')
}

function itemEffectSummaryFor(rawItem: string, language: SiteLanguage) {
  const canonicalItem = canonicalChampionsItemName(rawItem)
  const summary = ITEM_EFFECT_SUMMARIES[canonicalItem]
  if (!summary) return ''
  return summary[language] ?? summary.ko ?? summary.en ?? ''
}

function itemTooltipData(itemName: string, language: SiteLanguage): HoverTooltipCard | null {
  const canonicalItem = canonicalChampionsItemName(itemName)
  const info = resolveItemInfo(canonicalItem)
  const knownItem = CHAMPIONS_ITEM_OPTIONS.includes(canonicalItem as ChampionsItem)
  if (!info && !knownItem) return null
  const title = info
    ? language === 'ko' ? info.entry.nameKo : language === 'ja' ? info.entry.nameJa : info.entry.nameEn
    : localizedChampionsItemLabel(canonicalItem, language)
  const subtitle = info
    ? language === 'ko' ? info.entry.nameEn : info.entry.nameKo
    : language === 'ko' ? localizedChampionsItemLabel(canonicalItem, 'en') : localizedChampionsItemLabel(canonicalItem, 'ko')
  const description = info ? localizedDexText(info.entry, language) : null
  const effectSummary = itemEffectSummaryFor(canonicalItem, language)
  return {
    kind: 'item',
    title,
    subtitle,
    rows: effectSummary ? [{ label: translateText(language, '효과'), value: effectSummary }] : [],
    description: description?.detail || description?.summary || '',
  }
}

async function dexMoveLearnerRows(name: string) {
  const embeddedMovePools = await loadEmbeddedMovePools()
  const learnerRows = rows.filter((row) => {
    return relatedMovePoolKeys(row.key).some((poolKey) => (embeddedMovePools[poolKey] ?? []).some((move) => move.name === name))
  })
  return learnerRows.sort((a, b) => displayName(a, 'ko').localeCompare(displayName(b, 'ko'), 'ko'))
}

function moveSearchCandidates(name: string) {
  const candidates = moveNameCandidates(name)
  return Array.from(new Set(candidates.flatMap((entry) => [entry, normalizeSearchText(entry)])))
}

function dexMoveIndex() {
  return Object.entries(MOVE_META_BY_NAME).map(([name, meta]) => ({ key: name, name, meta, candidates: moveSearchCandidates(name) }))
}

function filterDexMoveOptions(query: string, options?: { allowLoose?: boolean }) {
  const allowLoose = options?.allowLoose ?? true
  const normalized = normalizeSearchText(query.trim())
  const index = dexMoveIndex()
  if (!normalized) return index.map(({ candidates: _candidates, ...entry }) => entry).sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  return index
    .map(({ candidates, ...entry }) => {
      const score = candidates.reduce((best, candidate) => {
        if (candidate === normalized) return Math.min(best, 0)
        if (candidate.startsWith(normalized)) return Math.min(best, 1)
        if (candidate.includes(normalized)) return Math.min(best, 2)
        if (allowLoose && matchesLooseQuery(candidate, normalized)) return Math.min(best, 3)
        return best
      }, Number.POSITIVE_INFINITY)
      return Number.isFinite(score) ? { ...entry, score } : null
    })
    .filter((entry): entry is { key: string; name: string; meta: MoveMeta; score: number } => Boolean(entry))
    .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name, 'ko'))
}

function abilityDisplayName(abilityKey: string, abilityKo: string, language: SiteLanguage) {
  return language === 'ko' ? abilityKo : titleCaseSlug(abilityKey)
}

function abilitySearchCandidates(abilityKey: string, abilityKo: string) {
  const enLabel = titleCaseSlug(abilityKey)
  return Array.from(new Set([
    abilityKey,
    abilityKo,
    enLabel,
    normalizeSearchText(abilityKey),
    normalizeSearchText(abilityKo),
    normalizeSearchText(enLabel),
  ]))
}

function filterDexAbilityOptions(query: string, options?: { allowLoose?: boolean }) {
  const allowLoose = options?.allowLoose ?? true
  const normalized = normalizeSearchText(query.trim())
  const entries = [...ABILITY_INDEX.byKey.values()].map((entry) => ({ ...entry, pokemonKeys: [...entry.pokemonKeys].sort((a, b) => a.localeCompare(b, 'ko')) }))
  if (!normalized) return entries.sort((a, b) => a.koLabel.localeCompare(b.koLabel, 'ko'))
  return entries
    .map((entry) => {
      const score = abilitySearchCandidates(entry.key, entry.koLabel).reduce((best, candidate) => {
        if (candidate === normalized) return Math.min(best, 0)
        if (candidate.startsWith(normalized)) return Math.min(best, 1)
        if (candidate.includes(normalized)) return Math.min(best, 2)
        if (allowLoose && matchesLooseQuery(candidate, normalized)) return Math.min(best, 3)
        return best
      }, Number.POSITIVE_INFINITY)
      return Number.isFinite(score) ? { ...entry, score } : null
    })
    .filter((entry): entry is { key: string; koLabel: string; pokemonKeys: string[]; score: number } => Boolean(entry))
    .sort((a, b) => a.score - b.score || a.koLabel.localeCompare(b.koLabel, 'ko'))
}

const ABILITY_INDEX = (() => {
  const byKey = new Map<string, { key: string; koLabel: string; pokemonKeys: string[] }>()
  for (const row of rows) {
    row.abilities.forEach((abilityKey, idx) => {
      const koLabel = row.abilities_ko[idx] ?? titleCaseSlug(abilityKey)
      const existing = byKey.get(abilityKey)
      if (existing) {
        existing.pokemonKeys.push(row.key)
        return
      }
      byKey.set(abilityKey, { key: abilityKey, koLabel, pokemonKeys: [row.key] })
    })
  }
  const byNormalized = new Map<string, { key: string; koLabel: string; pokemonKeys: string[] }>()
  for (const entry of byKey.values()) {
    const pokemonKeys = Array.from(new Set(entry.pokemonKeys))
    const payload = { ...entry, pokemonKeys }
    byNormalized.set(normalizeSearchText(entry.key), payload)
    byNormalized.set(normalizeSearchText(entry.koLabel), payload)
    byNormalized.set(normalizeSearchText(titleCaseSlug(entry.key)), payload)
  }
  return { byKey, byNormalized }
})()

function getOcrAbilityIndexSync() {
  if (ocrAbilityIndexCache) return ocrAbilityIndexCache
  const bundle = getDexDescriptionsSync()
  if (!bundle) return []
  ocrAbilityIndexCache = Object.entries(bundle.abilities).map(([abilityKey, description]) => {
    const fallback = ABILITY_INDEX.byKey.get(abilityKey)
    return {
      abilityKey,
      koLabel: fallback?.koLabel ?? description.nameKo,
      candidates: Array.from(new Set([
        abilityKey,
        fallback?.koLabel,
        description.nameKo,
        description.nameEn,
        description.nameJa,
      ].filter(Boolean).flatMap((entry) => [String(entry), normalizeSearchText(String(entry))]))),
    }
  })
  return ocrAbilityIndexCache
}

function resolveAbilityInfo(rawAbility: string, row?: Row | null) {
  const normalized = normalizeSearchText(rawAbility)
  const direct = ABILITY_INDEX.byNormalized.get(normalized)
  if (direct) return direct
  if (row) {
    const idx = row.abilities.findIndex((abilityKey, abilityIdx) => {
      const ko = row.abilities_ko[abilityIdx] ?? ''
      return normalizeSearchText(abilityKey) === normalized || normalizeSearchText(ko) === normalized || normalizeSearchText(titleCaseSlug(abilityKey)) === normalized
    })
    if (idx >= 0) {
      const abilityKey = row.abilities[idx]
      return ABILITY_INDEX.byKey.get(abilityKey) ?? { key: abilityKey, koLabel: row.abilities_ko[idx] ?? titleCaseSlug(abilityKey), pokemonKeys: [row.key] }
    }
  }
  return null
}

function moveTooltipData(name: string, language: SiteLanguage): HoverTooltipCard | null {
  const meta = lookupMoveMeta(name)
  if (!meta) return null
  const description = localizedDexText(moveDescriptionFor(name), language)
  return {
    kind: 'move',
    title: name,
    accentType: meta.type,
    rows: [
      { label: translateText(language, '타입'), value: displayTypeName(meta.type, language) },
      { label: translateText(language, '분류'), value: displayMoveCategoryName(meta.category, language) },
      { label: translateText(language, '위력'), value: meta.power != null ? String(resolvedMovePower(meta)) : '-' },
      { label: translateText(language, '명중'), value: meta.accuracy != null ? `${meta.accuracy}%` : '-' },
      ...(typeof meta.priority === 'number' && meta.priority !== 0 ? [{ label: translateText(language, '우선도'), value: String(meta.priority) }] : []),
    ],
    description: description?.detail || description?.summary || '',
  }
}

function abilityTooltipData(name: string, language: SiteLanguage, row?: Row | null): HoverTooltipCard | null {
  const info = resolveAbilityInfo(name, row)
  if (!info) return null
  const localized = abilityDisplayName(info.key, info.koLabel, language)
  const description = localizedDexText(abilityDescriptionFor(info.key), language)
  const previewNames = info.pokemonKeys.slice(0, 5).map((key) => {
    const pokemonRow = indexByKey.get(key)
    return pokemonRow ? displayName(pokemonRow, language) : key
  })
  return {
    kind: 'ability',
    title: localized,
    subtitle: language === 'ko' ? info.key : info.koLabel,
    rows: [],
    description: description?.detail || description?.summary || '',
    chips: previewNames,
  }
}

function resolveSpeciesKey(raw: string, options?: { includeMega?: boolean }) {
  const normalized = normalizeSearchText(raw.trim())
  if (!normalized) return null
  return filterSpeciesOptions(normalized, options)[0]?.key ?? null
}

function defaultAbilityLabelForKey(key: string, abilityKey: string) {
  const row = indexByKey.get(key)
  if (!row) return defaultAbilityForKey(key)
  const idx = row.abilities.indexOf(abilityKey)
  return row.abilities_ko[idx] ?? defaultAbilityForKey(key)
}

function cropRect(imageWidth: number, imageHeight: number, rect: CropRect) {
  const x = Math.max(0, Math.min(imageWidth, rect.x))
  const y = Math.max(0, Math.min(imageHeight, rect.y))
  const width = Math.max(1, Math.min(imageWidth - x, rect.width))
  const height = Math.max(1, Math.min(imageHeight - y, rect.height))
  return { x, y, width, height }
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  return canvas
}

async function loadImageElement(file: File) {
  const url = URL.createObjectURL(file)
  try {
    await new Promise<void>((resolve, reject) => {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.onload = () => {
        resolve()
      }
      image.onerror = () => reject(new Error(`image load failed: ${file.name}`))
      image.src = url
      Object.assign(file, { __openclawImageEl: image })
    })
    return (file as File & { __openclawImageEl?: HTMLImageElement }).__openclawImageEl!
  } finally {
    URL.revokeObjectURL(url)
  }
}

function renderImageRegion(image: HTMLImageElement, rect: CropRect, targetWidth = rect.width, targetHeight = rect.height) {
  const safeRect = cropRect(image.naturalWidth || image.width, image.naturalHeight || image.height, rect)
  const canvas = createCanvas(targetWidth, targetHeight)
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(image, safeRect.x, safeRect.y, safeRect.width, safeRect.height, 0, 0, canvas.width, canvas.height)
  return canvas
}

function computeCanvasDHash(canvas: HTMLCanvasElement) {
  const scaled = createCanvas(16, 16)
  const ctx = scaled.getContext('2d', { willReadFrequently: true })
  if (!ctx) return ''
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 16, 16)
  ctx.drawImage(canvas, 0, 0, 16, 16)
  const { data } = ctx.getImageData(0, 0, 16, 16)
  const grayscale: number[] = []
  for (let idx = 0; idx < data.length; idx += 4) {
    grayscale.push(Math.round((data[idx] * 0.299) + (data[idx + 1] * 0.587) + (data[idx + 2] * 0.114)))
  }
  const bits: string[] = []
  for (let y = 0; y < 16; y += 1) {
    for (let x = 0; x < 15; x += 1) {
      const left = grayscale[(y * 16) + x]
      const right = grayscale[(y * 16) + x + 1]
      bits.push(left > right ? '1' : '0')
    }
  }
  let hash = ''
  for (let idx = 0; idx < bits.length; idx += 4) {
    hash += Number.parseInt(bits.slice(idx, idx + 4).join(''), 2).toString(16)
  }
  return hash
}

function hammingDistanceHex(left: string, right: string) {
  if (!left || !right || left.length !== right.length) return Number.POSITIVE_INFINITY
  let distance = 0
  for (let idx = 0; idx < left.length; idx += 1) {
    const xor = Number.parseInt(left[idx], 16) ^ Number.parseInt(right[idx], 16)
    distance += xor.toString(2).replace(/0/g, '').length
  }
  return distance
}

async function matchSpeciesBySpriteCanvas(canvas: HTMLCanvasElement) {
  const hash = computeCanvasDHash(canvas)
  const spriteHashIndex = await loadSpriteHashIndex()
  const best = spriteHashIndex.reduce<{ key: string; distance: number } | null>((currentBest, entry) => {
    const distance = hammingDistanceHex(hash, entry.hash)
    if (!Number.isFinite(distance)) return currentBest
    if (!currentBest || distance < currentBest.distance) return { key: entry.key, distance }
    return currentBest
  }, null)
  return best
}

function estimatePartyRowRects(imageWidth: number, imageHeight: number) {
  const top = imageHeight * 0.06
  const usableHeight = imageHeight * 0.88
  const rowHeight = usableHeight / 6
  return Array.from({ length: 6 }, (_, idx) => ({
    x: imageWidth * 0.02,
    y: top + (rowHeight * idx),
    width: imageWidth * 0.96,
    height: rowHeight,
  }))
}

function estimateSpriteRects(rowRect: CropRect) {
  return [
    { x: rowRect.x + (rowRect.width * 0.02), y: rowRect.y + (rowRect.height * 0.08), width: rowRect.width * 0.24, height: rowRect.height * 0.82 },
    { x: rowRect.x + (rowRect.width * 0.05), y: rowRect.y + (rowRect.height * 0.06), width: rowRect.width * 0.26, height: rowRect.height * 0.84 },
    { x: rowRect.x, y: rowRect.y + (rowRect.height * 0.04), width: rowRect.width * 0.3, height: rowRect.height * 0.88 },
  ]
}

function parseOcrNature(lines: string[]) {
  for (const line of lines) {
    const normalized = normalizeSearchText(line)
    const matched = OCR_NATURE_INDEX.find((entry) => entry.candidates.some((candidate) => scoreOcrCandidate(normalized, candidate) <= 1))
    if (matched) return matched.id
  }
  return null
}

function parseOcrEffortValues(lines: string[]) {
  const next = { ...defaultEvs }
  for (const line of lines) {
    const normalized = normalizeSearchText(line)
    for (const stat of Object.keys(OCR_EFFORT_PATTERNS) as OcrStatKey[]) {
      const patterns = OCR_EFFORT_PATTERNS[stat]
      for (const pattern of patterns) {
        const match = normalized.match(pattern)
        if (!match) continue
        next[stat] = Math.max(0, Math.min(CHAMPIONS_EFFORT_PER_STAT_CAP, Math.trunc(Number(match[1]) || 0)))
        break
      }
    }
  }
  return next
}

function cleanOcrLine(line: string) {
  return line
    .replace(/[•·●▪■□◆◇○◎]/g, ' ')
    .replace(/[|｜]/g, 'I')
    .replace(/[“”"'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function scoreOcrCandidate(source: string, candidate: string) {
  if (!source || !candidate) return Number.POSITIVE_INFINITY
  if (source === candidate) return 0
  if (source.includes(candidate)) return source.length - candidate.length <= 6 ? 1 : 2
  if (candidate.includes(source)) return 2
  if (matchesLooseQuery(source, candidate) || matchesLooseQuery(candidate, source)) return 3
  return Number.POSITIVE_INFINITY
}

function findBestOcrSpeciesMatch(line: string) {
  const normalized = normalizeSearchText(cleanOcrLine(line))
  if (!normalized) return null
  const best = SPECIES_SEARCH_INDEX.reduce<{ key: string; score: number } | null>((currentBest, entry) => {
    const score = entry.candidates.reduce((bestScore, candidate) => Math.min(bestScore, scoreOcrCandidate(normalized, candidate)), Number.POSITIVE_INFINITY)
    if (!Number.isFinite(score)) return currentBest
    if (!currentBest || score < currentBest.score) return { key: entry.row.key, score }
    return currentBest
  }, null)
  return best
}

function findBestOcrMoveMatch(line: string) {
  const normalized = normalizeSearchText(cleanOcrLine(line))
  if (!normalized) return null
  const best = getOcrMoveIndexSync().reduce<{ nameKo: string; score: number } | null>((currentBest, entry) => {
    const score = entry.candidates.reduce((bestScore, candidate) => Math.min(bestScore, scoreOcrCandidate(normalized, candidate)), Number.POSITIVE_INFINITY)
    if (!Number.isFinite(score)) return currentBest
    if (!currentBest || score < currentBest.score) return { nameKo: entry.nameKo, score }
    return currentBest
  }, null)
  return best
}

function findBestOcrAbilityMatch(line: string, key: string) {
  const normalized = normalizeSearchText(cleanOcrLine(line))
  const row = indexByKey.get(key)
  if (!normalized || !row) return null
  const best = getOcrAbilityIndexSync().reduce<{ abilityKey: string; koLabel: string; score: number } | null>((currentBest, entry) => {
    if (!row.abilities.includes(entry.abilityKey)) return currentBest
    const score = entry.candidates.reduce((bestScore, candidate) => Math.min(bestScore, scoreOcrCandidate(normalized, candidate)), Number.POSITIVE_INFINITY)
    if (!Number.isFinite(score)) return currentBest
    if (!currentBest || score < currentBest.score) return { abilityKey: entry.abilityKey, koLabel: entry.koLabel, score }
    return currentBest
  }, null)
  return best
}

function findBestOcrItemMatch(line: string) {
  const normalized = normalizeSearchText(cleanOcrLine(line))
  if (!normalized) return null
  const best = getOcrItemIndexSync().reduce<{ itemKey: string; score: number } | null>((currentBest, entry) => {
    const score = entry.candidates.reduce((bestScore, candidate) => Math.min(bestScore, scoreOcrCandidate(normalized, candidate)), Number.POSITIVE_INFINITY)
    if (!Number.isFinite(score)) return currentBest
    if (!currentBest || score < currentBest.score) return { itemKey: entry.itemKey, score }
    return currentBest
  }, null)
  return best
}

function parseOcrImportedMember(lines: string[], speciesOverride?: string | null) {
  const normalizedLines = lines.map(cleanOcrLine).filter(Boolean)
  const speciesKey = speciesOverride ?? normalizedLines.map((line) => findBestOcrSpeciesMatch(line)).find((entry) => entry && entry.score <= 2)?.key ?? null
  if (!speciesKey) return null
  const row = indexByKey.get(speciesKey)
  if (!row) return null
  const lockedMoves: string[] = []
  let item = ''
  let ability = defaultAbilityForKey(speciesKey)
  for (const line of normalizedLines) {
    const itemMatch = findBestOcrItemMatch(line)
    if (!item && itemMatch && itemMatch.score <= 2) item = itemMatch.itemKey
    const abilityMatch = findBestOcrAbilityMatch(line, speciesKey)
    if (abilityMatch && abilityMatch.score <= 2) ability = defaultAbilityLabelForKey(speciesKey, abilityMatch.abilityKey)
    const moveMatch = findBestOcrMoveMatch(line)
    if (moveMatch && moveMatch.score <= 2 && !lockedMoves.includes(moveMatch.nameKo)) lockedMoves.push(moveMatch.nameKo)
  }
  const parsedNature = parseOcrNature(normalizedLines)
  const parsedEvs = parseOcrEffortValues(normalizedLines)
  const member: PartyMember = {
    key: speciesKey,
    config: { nature: parsedNature ?? defaultNatureForKey(speciesKey), scarf: false, speedStage: 0 },
    picked: false,
    evs: parsedEvs,
    tuning: defaultPartyTuning(),
    item: normalizeItemForKey(speciesKey, item),
    ability,
  }
  return { member, lockedMoves: lockedMoves.slice(0, 4), rawLines: normalizedLines }
}

function parseOcrImportedParty(text: string): OcrImportedPartyMember[] {
  const lines = text.split(/\r?\n/).map(cleanOcrLine).filter(Boolean)
  if (!lines.length) return []
  const anchors = lines
    .map((line, idx) => {
      const species = findBestOcrSpeciesMatch(line)
      return species && species.score <= 2 ? { idx, key: species.key } : null
    })
    .filter((entry): entry is { idx: number; key: string } => entry !== null)
    .filter((entry, idx, list) => idx === 0 || entry.idx !== list[idx - 1].idx)
  if (!anchors.length) return []
  const members = anchors.slice(0, 6).map((anchor, anchorIdx) => {
    const nextIdx = anchors[anchorIdx + 1]?.idx ?? lines.length
    return parseOcrImportedMember(lines.slice(anchor.idx, nextIdx), anchor.key)
  })
  return members.filter((entry): entry is OcrImportedPartyMember => entry !== null)
}

function parseOcrImportedPartyDocuments(texts: string[]) {
  const orderedKeys: string[] = []
  const linesByKey = new Map<string, string[]>()
  for (const text of texts) {
    const lines = text.split(/\r?\n/).map(cleanOcrLine).filter(Boolean)
    if (!lines.length) continue
    const anchors = lines
      .map((line, idx) => {
        const species = findBestOcrSpeciesMatch(line)
        return species && species.score <= 2 ? { idx, key: species.key } : null
      })
      .filter((entry): entry is { idx: number; key: string } => entry !== null)
      .filter((entry, idx, list) => idx === 0 || entry.idx !== list[idx - 1].idx)
    if (!anchors.length) continue
    anchors.forEach((anchor, anchorIdx) => {
      const nextIdx = anchors[anchorIdx + 1]?.idx ?? lines.length
      const segment = lines.slice(Math.max(0, anchor.idx - 1), nextIdx)
      if (!orderedKeys.includes(anchor.key)) orderedKeys.push(anchor.key)
      linesByKey.set(anchor.key, [...(linesByKey.get(anchor.key) ?? []), ...segment])
    })
  }
  const imported = orderedKeys.slice(0, 6).map((key) => parseOcrImportedMember(linesByKey.get(key) ?? [], key))
  return imported.filter((entry): entry is OcrImportedPartyMember => entry !== null)
}

async function inferImportedPartyFromSpriteGuidedImage(file: File, recognize: (image: HTMLCanvasElement, logger?: (message: { status: string; progress?: number }) => void) => Promise<string>, status?: (message: string) => void) {
  const image = await loadImageElement(file)
  const rowRects = estimatePartyRowRects(image.naturalWidth || image.width, image.naturalHeight || image.height)
  const imported: OcrImportedPartyMember[] = []
  for (const [idx, rowRect] of rowRects.entries()) {
    const rowCanvas = renderImageRegion(image, rowRect, 1280, 200)
    const spriteMatches = (await Promise.all(
      estimateSpriteRects(rowRect)
        .map((rect) => matchSpeciesBySpriteCanvas(renderImageRegion(image, rect, 96, 96)))
    ))
      .filter((entry): entry is { key: string; distance: number } => entry !== null)
      .sort((left, right) => left.distance - right.distance)
    const bestSpriteMatch = spriteMatches[0] ?? null
    status?.(`${file.name} · ${idx + 1}/6 ${translateText('ko', 'OCR 추출 중...')}`)
    const text = await recognize(rowCanvas)
    const fallbackMember = parseOcrImportedMember(text.split(/\r?\n/), bestSpriteMatch && bestSpriteMatch.distance <= MAX_SPRITE_HASH_DISTANCE ? bestSpriteMatch.key : null)
    if (fallbackMember?.member.key) imported.push(fallbackMember)
  }
  return imported
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

function sameMoveField(a: MoveFieldTarget, key: string, slotIdx: number, scope: 'party' | 'sample' | 'opponent') {
  return a?.key === key && a?.slotIdx === slotIdx && a?.scope === scope
}

function sameItemField(a: ItemFieldTarget, scope: 'party' | 'sample' | 'opponent', idx: number) {
  return a?.scope === scope && a?.idx === idx
}

function sameMetaListField(a: MetaListField, scope: 'party' | 'sample', field: 'ability' | 'nature', idx = 0) {
  if (!a || a.scope !== scope || a.field !== field) return false
  return scope === 'party' ? ('idx' in a && a.idx === idx) : true
}

function highlightedAutocompleteIndex(state: AutocompleteHighlight, id: string) {
  return state?.id === id ? state.index : -1
}

function nextAutocompleteIndex(current: number, length: number, direction: -1 | 1) {
  if (length <= 0) return -1
  if (current < 0) return direction > 0 ? 0 : length - 1
  return (current + direction + length) % length
}

function menuLabelForTab(tab: MainTab, language: SiteLanguage = 'ko') {
  switch (tab) {
    case 'party': return translateText(language, '내 파티 관리')
    case 'pick': return translateText(language, '상대 엔트리')
    case 'speed': return translateText(language, '스피드 계산')
    case 'power': return translateText(language, '대미지 계산')
  }
}

function menuLabelForSection(section: MainSection, activeTab: MainTab, language: SiteLanguage = 'ko') {
  if (section === 'home') return translateText(language, '홈')
  if (section === 'sample') return translateText(language, '포켓몬 샘플 깎기')
  if (section === 'dex') return translateText(language, '도감')
  if (section === 'double') return translateText(language, '더블배틀 메뉴')
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
  const initialDoubleParty = React.useMemo(() => sanitizeParty(persisted?.party), [persisted])
  const initialDoubleOpponents = React.useMemo(() => sanitizeOpponents(persisted?.opponents), [persisted])
  const defaultDoubleMyLeft = React.useMemo(() => firstFilledIndex(initialDoubleParty, 0), [initialDoubleParty])
  const defaultDoubleMyRight = React.useMemo(() => initialDoubleParty.findIndex((entry, idx) => idx !== defaultDoubleMyLeft && Boolean(entry.key)) >= 0 ? initialDoubleParty.findIndex((entry, idx) => idx !== defaultDoubleMyLeft && Boolean(entry.key)) : Math.min(defaultDoubleMyLeft + 1, initialDoubleParty.length - 1), [defaultDoubleMyLeft, initialDoubleParty])
  const defaultDoubleOppLeft = React.useMemo(() => firstFilledIndex(initialDoubleOpponents, 0), [initialDoubleOpponents])
  const defaultDoubleOppRight = React.useMemo(() => initialDoubleOpponents.findIndex((entry, idx) => idx !== defaultDoubleOppLeft && Boolean(entry.key)) >= 0 ? initialDoubleOpponents.findIndex((entry, idx) => idx !== defaultDoubleOppLeft && Boolean(entry.key)) : Math.min(defaultDoubleOppLeft + 1, initialDoubleOpponents.length - 1), [defaultDoubleOppLeft, initialDoubleOpponents])
  const [doubleMyLeft, setDoubleMyLeft] = React.useState(() => sanitizeBoardSlotIndex(persisted?.doubleMyLeft, initialDoubleParty, defaultDoubleMyLeft))
  const [doubleMyRight, setDoubleMyRight] = React.useState(() => sanitizeBoardSlotIndex(persisted?.doubleMyRight, initialDoubleParty, defaultDoubleMyRight))
  const [doubleOppLeft, setDoubleOppLeft] = React.useState(() => sanitizeBoardSlotIndex(persisted?.doubleOppLeft, initialDoubleOpponents, defaultDoubleOppLeft))
  const [doubleOppRight, setDoubleOppRight] = React.useState(() => sanitizeBoardSlotIndex(persisted?.doubleOppRight, initialDoubleOpponents, defaultDoubleOppRight))
  const [doubleTrickRoom, setDoubleTrickRoom] = React.useState(() => Boolean(persisted?.doubleTrickRoom))
  const [doubleTailwindMy, setDoubleTailwindMy] = React.useState(() => Boolean(persisted?.doubleTailwindMy))
  const [doubleTailwindOpp, setDoubleTailwindOpp] = React.useState(() => Boolean(persisted?.doubleTailwindOpp))
  const [doubleFriendGuardMy, setDoubleFriendGuardMy] = React.useState(() => Boolean(persisted?.doubleFriendGuardMy))
  const [doubleFriendGuardOpp, setDoubleFriendGuardOpp] = React.useState(() => Boolean(persisted?.doubleFriendGuardOpp))
  const [doubleWideGuardMy, setDoubleWideGuardMy] = React.useState(() => Boolean(persisted?.doubleWideGuardMy))
  const [doubleWideGuardOpp, setDoubleWideGuardOpp] = React.useState(() => Boolean(persisted?.doubleWideGuardOpp))
  const [doubleAttackerSlot, setDoubleAttackerSlot] = React.useState<DoubleBoardSlot>(() => persisted?.doubleAttackerSlot === 'myLeft' || persisted?.doubleAttackerSlot === 'myRight' || persisted?.doubleAttackerSlot === 'oppLeft' || persisted?.doubleAttackerSlot === 'oppRight' ? persisted.doubleAttackerSlot : 'myLeft')
  const [doubleDefenderSlot, setDoubleDefenderSlot] = React.useState<DoubleBoardSlot>(() => persisted?.doubleDefenderSlot === 'myLeft' || persisted?.doubleDefenderSlot === 'myRight' || persisted?.doubleDefenderSlot === 'oppLeft' || persisted?.doubleDefenderSlot === 'oppRight' ? persisted.doubleDefenderSlot : 'oppLeft')
  const [doubleSpreadMove, setDoubleSpreadMove] = React.useState(() => Boolean(persisted?.doubleSpreadMove))
  const [doubleMoveName, setDoubleMoveName] = React.useState(() => typeof persisted?.doubleMoveName === 'string' ? persisted.doubleMoveName : '')
  const [doubleProtectMyLeft, setDoubleProtectMyLeft] = React.useState(() => Boolean(persisted?.doubleProtectMyLeft))
  const [doubleProtectMyRight, setDoubleProtectMyRight] = React.useState(() => Boolean(persisted?.doubleProtectMyRight))
  const [doubleProtectOppLeft, setDoubleProtectOppLeft] = React.useState(() => Boolean(persisted?.doubleProtectOppLeft))
  const [doubleProtectOppRight, setDoubleProtectOppRight] = React.useState(() => Boolean(persisted?.doubleProtectOppRight))
  const [doubleActionMoveMyLeft, setDoubleActionMoveMyLeft] = React.useState(() => typeof persisted?.doubleActionMoveMyLeft === 'string' ? persisted.doubleActionMoveMyLeft : '')
  const [doubleActionMoveMyRight, setDoubleActionMoveMyRight] = React.useState(() => typeof persisted?.doubleActionMoveMyRight === 'string' ? persisted.doubleActionMoveMyRight : '')
  const [doubleActionMoveOppLeft, setDoubleActionMoveOppLeft] = React.useState(() => typeof persisted?.doubleActionMoveOppLeft === 'string' ? persisted.doubleActionMoveOppLeft : '')
  const [doubleActionMoveOppRight, setDoubleActionMoveOppRight] = React.useState(() => typeof persisted?.doubleActionMoveOppRight === 'string' ? persisted.doubleActionMoveOppRight : '')
  const [doubleActionTargetMyLeft, setDoubleActionTargetMyLeft] = React.useState<DoubleBoardSlot>(() => persisted?.doubleActionTargetMyLeft === 'myLeft' || persisted?.doubleActionTargetMyLeft === 'myRight' || persisted?.doubleActionTargetMyLeft === 'oppLeft' || persisted?.doubleActionTargetMyLeft === 'oppRight' ? persisted.doubleActionTargetMyLeft : 'oppLeft')
  const [doubleActionTargetMyRight, setDoubleActionTargetMyRight] = React.useState<DoubleBoardSlot>(() => persisted?.doubleActionTargetMyRight === 'myLeft' || persisted?.doubleActionTargetMyRight === 'myRight' || persisted?.doubleActionTargetMyRight === 'oppLeft' || persisted?.doubleActionTargetMyRight === 'oppRight' ? persisted.doubleActionTargetMyRight : 'oppRight')
  const [doubleActionTargetOppLeft, setDoubleActionTargetOppLeft] = React.useState<DoubleBoardSlot>(() => persisted?.doubleActionTargetOppLeft === 'myLeft' || persisted?.doubleActionTargetOppLeft === 'myRight' || persisted?.doubleActionTargetOppLeft === 'oppLeft' || persisted?.doubleActionTargetOppLeft === 'oppRight' ? persisted.doubleActionTargetOppLeft : 'myLeft')
  const [doubleActionTargetOppRight, setDoubleActionTargetOppRight] = React.useState<DoubleBoardSlot>(() => persisted?.doubleActionTargetOppRight === 'myLeft' || persisted?.doubleActionTargetOppRight === 'myRight' || persisted?.doubleActionTargetOppRight === 'oppLeft' || persisted?.doubleActionTargetOppRight === 'oppRight' ? persisted.doubleActionTargetOppRight : 'myRight')
  const [doubleActionFocusSlot, setDoubleActionFocusSlot] = React.useState<DoubleBoardSlot>(() => persisted?.doubleActionFocusSlot === 'myLeft' || persisted?.doubleActionFocusSlot === 'myRight' || persisted?.doubleActionFocusSlot === 'oppLeft' || persisted?.doubleActionFocusSlot === 'oppRight' ? persisted.doubleActionFocusSlot : 'myLeft')
  const [doubleBulkEditorSlot, setDoubleBulkEditorSlot] = React.useState<DoubleBoardSlot | null>(null)
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
  const [calcFieldConditionsCollapsed, setCalcFieldConditionsCollapsed] = React.useState(() => !(
    (persisted?.calcWeather && persisted.calcWeather !== 'none')
    || (persisted?.calcTerrain && persisted.calcTerrain !== 'none')
    || persisted?.calcReflect
    || persisted?.calcLightScreen
    || persisted?.calcAuroraVeil
  ))
  const [calcBurned, setCalcBurned] = React.useState(() => Boolean(persisted?.calcBurned))
  const [calcCritical, setCalcCritical] = React.useState(() => Boolean(persisted?.calcCritical))
  const [calcAttackerLowHp, setCalcAttackerLowHp] = React.useState(() => Boolean(persisted?.calcAttackerLowHp))
  const [calcTargetPoisoned, setCalcTargetPoisoned] = React.useState(() => Boolean(persisted?.calcTargetPoisoned))
  const [calcDefenderFullHp, setCalcDefenderFullHp] = React.useState(() => Boolean(persisted?.calcDefenderFullHp))
  const [calcDefenderDisguise, setCalcDefenderDisguise] = React.useState(() => Boolean(persisted?.calcDefenderDisguise))
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
  const initialOpponentOffensePreset = React.useMemo(() => sanitizeOpponentOffensePreset(persisted?.calcOpponentOffensePreset), [persisted])
  const initialOpponentOffenseState = React.useMemo(() => sanitizeOpponentOffenseState({
    attackEv: persisted?.calcOpponentAttackEv,
    spAttackEv: persisted?.calcOpponentSpAttackEv,
    attackNature: persisted?.calcOpponentAttackNature,
    spAttackNature: persisted?.calcOpponentSpAttackNature,
  }, initialOpponentOffensePreset), [initialOpponentOffensePreset, persisted])
  const [calcOpponentBulkPreset, setCalcOpponentBulkPreset] = React.useState<OpponentBulkPreset>(initialOpponentBulkPreset)
  const [calcOpponentHpEv, setCalcOpponentHpEv] = React.useState(initialOpponentBulkState.hpEv)
  const [calcOpponentDefenseEv, setCalcOpponentDefenseEv] = React.useState(initialOpponentBulkState.defenseEv)
  const [calcOpponentSpDefenseEv, setCalcOpponentSpDefenseEv] = React.useState(initialOpponentBulkState.spDefenseEv)
  const [calcOpponentDefenseNature, setCalcOpponentDefenseNature] = React.useState(initialOpponentBulkState.defenseNature)
  const [calcOpponentSpDefenseNature, setCalcOpponentSpDefenseNature] = React.useState(initialOpponentBulkState.spDefenseNature)
  const [calcOpponentOffensePreset, setCalcOpponentOffensePreset] = React.useState<OpponentOffensePreset>(initialOpponentOffensePreset)
  const [calcOpponentAttackEv, setCalcOpponentAttackEv] = React.useState(initialOpponentOffenseState.attackEv)
  const [calcOpponentSpAttackEv, setCalcOpponentSpAttackEv] = React.useState(initialOpponentOffenseState.spAttackEv)
  const [calcOpponentAttackNature, setCalcOpponentAttackNature] = React.useState(initialOpponentOffenseState.attackNature)
  const [calcOpponentSpAttackNature, setCalcOpponentSpAttackNature] = React.useState(initialOpponentOffenseState.spAttackNature)
  const [stab, setStab] = React.useState(1.5)
  const [effectiveness, setEffectiveness] = React.useState(1)
  const [battleNote, setBattleNote] = React.useState(() => typeof persisted?.battleNote === 'string' ? persisted.battleNote : '')
  const [mainSection, setMainSection] = React.useState<MainSection>(() => viewState?.mainSection ?? persisted?.mainSection ?? 'home')
  const [activeTab, setActiveTab] = React.useState<MainTab>(() => viewState?.activeTab ?? persisted?.activeTab ?? 'party')
  const [selectedDamageMove, setSelectedDamageMove] = React.useState<DamageMoveSelection | null>(null)
  const [calcMyMegaKey, setCalcMyMegaKey] = React.useState<string | null>(null)
  const [calcOppMegaKey, setCalcOppMegaKey] = React.useState<string | null>(null)
  const [siteLanguage, setSiteLanguage] = React.useState<SiteLanguage>('ko')
  const [moveFilter, setMoveFilter] = React.useState<MoveFilter>('all')
  const [sampleMoveFilter, setSampleMoveFilter] = React.useState<MoveFilter>('core')
  const [moveSearch, setMoveSearch] = React.useState('')
  const [confirmedMovesByKey, setConfirmedMovesByKey] = React.useState<Record<string, string[]>>(() => sanitizeConfirmedMovesByKey(persisted?.confirmedMovesByKey))
  const [partySearch, setPartySearch] = React.useState<string[]>(() => sanitizeParty(persisted?.party).map((member) => searchDisplayLabel(member.key, 'ko')))
  const [opponentSearch, setOpponentSearch] = React.useState<string[]>(() => sanitizeOpponents(persisted?.opponents).map((member) => searchDisplayLabel(member.key, 'ko')))
  const [opponentItemDrafts, setOpponentItemDrafts] = React.useState<string[]>(() => sanitizeOpponents(persisted?.opponents).map((member) => displayItemLabel(visibleChampionsItem(member.key, member.item), 'ko')))
  const [opponentAbilityDrafts, setOpponentAbilityDrafts] = React.useState<string[]>(() => sanitizeOpponents(persisted?.opponents).map((member) => member.ability ?? ''))
  const [opponentMoveDraft, setOpponentMoveDraft] = React.useState('')
  const [opponentMoveInputFocused, setOpponentMoveInputFocused] = React.useState(false)
  const [calcOpponentMoveDraft, setCalcOpponentMoveDraft] = React.useState('')
  const [calcOpponentMoveInputFocused, setCalcOpponentMoveInputFocused] = React.useState(false)
  const [activeSearchField, setActiveSearchField] = React.useState<SearchFieldTarget>(null)
  const [activeMoveField, setActiveMoveField] = React.useState<MoveFieldTarget>(null)
  const [activeItemField, setActiveItemField] = React.useState<ItemFieldTarget>(null)
  const [autocompleteHighlight, setAutocompleteHighlight] = React.useState<AutocompleteHighlight>(null)
  const [activeOpponentAbilityField, setActiveOpponentAbilityField] = React.useState<number | null>(null)
  const [activeMetaListField, setActiveMetaListField] = React.useState<MetaListField>(null)
  const [languageMenuOpen, setLanguageMenuOpen] = React.useState(false)
  const [settingsMenuOpen, setSettingsMenuOpen] = React.useState(false)
  const [tuningModalIndex, setTuningModalIndex] = React.useState<number | null>(null)
  const [sampleForge, setSampleForge] = React.useState<PartyMember>(() => persisted?.sampleForge ? sanitizeParty([persisted.sampleForge])[0] ?? defaultSampleForge() : defaultSampleForge())
  const [sampleLockedMoves, setSampleLockedMoves] = React.useState<string[]>(() => persisted?.sampleLockedMoves ? sanitizeMoveSlotList(persisted.sampleLockedMoves) : sanitizeConfirmedMovesByKey(persisted?.confirmedMovesByKey)[(persisted?.sampleForge ? sanitizeParty([persisted.sampleForge])[0] ?? defaultSampleForge() : defaultSampleForge()).key] ?? [])
  const [sampleSearch, setSampleSearch] = React.useState(() => searchDisplayLabel((persisted?.sampleForge ? sanitizeParty([persisted.sampleForge])[0] : defaultSampleForge()).key, 'ko'))
  const [dexSearchMode, setDexSearchMode] = React.useState<DexSearchMode>(() => viewState?.dexSearchMode ?? 'pokemon')
  const [dexSearch, setDexSearch] = React.useState(() => viewState?.dexSearch ?? '')
  const [dexUnifiedSearch, setDexUnifiedSearch] = React.useState(() => viewState?.dexUnifiedSearch ?? '')
  const [dexUnifiedSearchDraft, setDexUnifiedSearchDraft] = React.useState(() => viewState?.dexUnifiedSearch ?? '')
  const [dexUnifiedSearchComposing, setDexUnifiedSearchComposing] = React.useState(false)
  const [dexSelectedValue, setDexSelectedValue] = React.useState<string | null>(() => viewState?.dexSelectedValue ?? null)
  const [hoverTooltip, setHoverTooltip] = React.useState<({ anchorX: number; anchorTop: number; anchorBottom: number } & HoverTooltipCard) | null>(null)
  const longPressTimerRef = React.useRef<number | null>(null)
  const longPressTriggeredRef = React.useRef(false)
  const suppressFocusTooltipRef = React.useRef(false)
  const [savedSamples, setSavedSamples] = React.useState<SavedSample[]>(() => sanitizeSavedSamples(persisted?.savedSamples))
  const [savedPartyPresets, setSavedPartyPresets] = React.useState<SavedPartyPreset[]>(() => sanitizeSavedPartyPresets(persisted?.savedPartyPresets))
  const [partyImageImportBusy, setPartyImageImportBusy] = React.useState(false)
  const [partyImageImportStatus, setPartyImageImportStatus] = React.useState('')
  const [partyPresetLabelDraft, setPartyPresetLabelDraft] = React.useState('')
  const [activePartyPresetId, setActivePartyPresetId] = React.useState<string | null>(null)
  const [sampleWorkbenchTab, setSampleWorkbenchTab] = React.useState<SampleWorkbenchTab>(() => viewState?.sampleWorkbenchTab ?? persisted?.sampleWorkbenchTab ?? 'builder')
  const [sampleSpeedTargets, setSampleSpeedTargets] = React.useState<SampleSpeedTarget[]>(() => sanitizeSampleSpeedTargets(persisted?.sampleSpeedTargets))
  const [sampleDamageTargets, setSampleDamageTargets] = React.useState<SampleDamageTarget[]>(() => sanitizeSampleDamageTargets(persisted?.sampleDamageTargets))
  const [sampleSpeedSearch, setSampleSpeedSearch] = React.useState('')
  const [sampleSpeedSearchOpen, setSampleSpeedSearchOpen] = React.useState(false)
  const [sampleDamageSearch, setSampleDamageSearch] = React.useState('')
  const [sampleDamageSearchOpen, setSampleDamageSearchOpen] = React.useState(false)
  const [sampleTuningModalOpen, setSampleTuningModalOpen] = React.useState(false)
  const [sampleLabelDraft, setSampleLabelDraft] = React.useState('')
  const [sampleDamageConditionsCollapsed, setSampleDamageConditionsCollapsed] = React.useState(true)
  const [opponentQuickSearch, setOpponentQuickSearch] = React.useState('')
  const [partyItemDrafts, setPartyItemDrafts] = React.useState<string[]>(() => sanitizeParty(persisted?.party).map((member) => displayItemLabel(visibleChampionsItem(member.key, member.item), 'ko')))
  const [sampleItemDraft, setSampleItemDraft] = React.useState(() => displayItemLabel(visibleChampionsItem((persisted?.sampleForge ? sanitizeParty([persisted.sampleForge])[0] : defaultSampleForge()).key, (persisted?.sampleForge ? sanitizeParty([persisted.sampleForge])[0] : defaultSampleForge()).item), 'ko'))
  const [dexMoveLearners, setDexMoveLearners] = React.useState<Row[]>([])
  const [dexMoveLearnersStatus, setDexMoveLearnersStatus] = React.useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [movePoolByKey, setMovePoolByKey] = React.useState<Record<string, MovePoolState>>({})
  const [asyncDataVersion, setAsyncDataVersion] = React.useState(0)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const partyImageInputRef = React.useRef<HTMLInputElement | null>(null)
  const opponentQuickInputRef = React.useRef<HTMLInputElement | null>(null)
  const [activePartyMetaEditor, setActivePartyMetaEditor] = React.useState<{ idx: number; field: 'ability' | 'nature' | 'item' } | null>(null)
  const [activeSampleMetaEditor, setActiveSampleMetaEditor] = React.useState<'ability' | 'nature' | 'item' | null>(null)
  const partyAbilityEditorRefs = React.useRef<((HTMLInputElement | HTMLSelectElement) | null)[]>([])
  const partyNatureEditorRefs = React.useRef<((HTMLInputElement | HTMLSelectElement) | null)[]>([])
  const partyItemEditorRefs = React.useRef<(HTMLInputElement | null)[]>([])
  const partySpeciesInputRefs = React.useRef<(HTMLInputElement | null)[]>([])
  const sampleAbilityEditorRef = React.useRef<HTMLSelectElement | null>(null)
  const sampleNatureEditorRef = React.useRef<HTMLSelectElement | null>(null)
  const sampleItemEditorRef = React.useRef<HTMLInputElement | null>(null)
  const tuningMember = tuningModalIndex !== null ? party[tuningModalIndex] : null
  const tuningRow = tuningMember?.key ? (indexByKey.get(tuningMember.key) ?? rows[0]) : null
  const magicCandidate = tuningMember && tuningRow ? findMagicNumberCandidate(tuningRow, tuningMember) : null
  const lt = React.useCallback((text: string) => translateText(siteLanguage, text), [siteLanguage])
  React.useEffect(() => {
    if (mainSection === 'home') return
    let cancelled = false
    void Promise.all([
      loadMoveMetaByName(),
      loadUsageTopMovesByKey(),
      loadDexDescriptions(),
    ]).then(() => {
      if (!cancelled) setAsyncDataVersion((prev) => prev + 1)
    })
    return () => {
      cancelled = true
    }
  }, [mainSection])
  React.useEffect(() => {
    if (!dexUnifiedSearchComposing) setDexUnifiedSearchDraft(dexUnifiedSearch)
  }, [dexUnifiedSearch, dexUnifiedSearchComposing])
  React.useEffect(() => {
    if (dexUnifiedSearchComposing) return
    const timeout = window.setTimeout(() => {
      setDexUnifiedSearch((prev) => prev === dexUnifiedSearchDraft ? prev : dexUnifiedSearchDraft)
    }, 120)
    return () => window.clearTimeout(timeout)
  }, [dexUnifiedSearchComposing, dexUnifiedSearchDraft])
  const deferredDexSearch = React.useDeferredValue(dexSearch)
  const deferredDexUnifiedSearch = React.useDeferredValue(dexUnifiedSearch)
  const hasDexUnifiedSearch = deferredDexUnifiedSearch.trim().length > 0
  const dexSpeciesOptions = React.useMemo(() => filterSpeciesOptions(deferredDexSearch, { includeMega: true, allowLoose: false }).slice(0, 12), [deferredDexSearch])
  const dexMoveOptions = React.useMemo(() => filterDexMoveOptions(deferredDexSearch, { allowLoose: false }).slice(0, 48), [asyncDataVersion, deferredDexSearch])
  const dexAbilityOptions = React.useMemo(() => filterDexAbilityOptions(deferredDexSearch, { allowLoose: false }).slice(0, 48), [deferredDexSearch])
  const dexItemOptions = React.useMemo(() => filterItemOptions(deferredDexSearch, siteLanguage, { fallbackToAll: false, allowLoose: false }).slice(0, 48), [deferredDexSearch, siteLanguage])
  const dexAllResults = React.useMemo<DexResultItem[]>(() => {
    const unifiedQuery = deferredDexUnifiedSearch.trim()
    if (!unifiedQuery) return []
    const speciesOptions = filterSpeciesOptions(unifiedQuery, { includeMega: true, allowLoose: false }).slice(0, 10)
    const moveOptions = filterDexMoveOptions(unifiedQuery, { allowLoose: false }).slice(0, 16)
    const abilityOptions = filterDexAbilityOptions(unifiedQuery, { allowLoose: false }).slice(0, 10)
    const itemOptions = filterItemOptions(unifiedQuery, siteLanguage, { fallbackToAll: false, allowLoose: false }).slice(0, 16)
    const pokemonResults: Extract<DexResultItem, { kind: 'pokemon' }>[] = speciesOptions
      .map((option, idx) => {
        const row = indexByKey.get(option.key)
        return row ? { id: dexSelectionId('pokemon', option.key), kind: 'pokemon' as const, key: option.key, row, score: idx + 0 } : null
      })
      .filter((entry): entry is Extract<DexResultItem, { kind: 'pokemon' }> => entry !== null)
    const moveResults: Extract<DexResultItem, { kind: 'move' }>[] = moveOptions.map((option, idx) => ({ id: dexSelectionId('move', option.key), kind: 'move' as const, key: option.key, name: option.name, meta: option.meta, score: idx + 0.15 }))
    const abilityResults: Extract<DexResultItem, { kind: 'ability' }>[] = abilityOptions.map((option, idx) => ({ id: dexSelectionId('ability', option.key), kind: 'ability' as const, key: option.key, koLabel: option.koLabel, pokemonKeys: option.pokemonKeys, score: idx + 0.3 }))
    const itemResults: Extract<DexResultItem, { kind: 'item' }>[] = itemOptions.map((item, idx) => {
      const itemText = localizedDexText(itemDescriptionFor(item), siteLanguage)
      return { id: dexSelectionId('item', item), kind: 'item' as const, key: item, item, previewText: itemText?.summary || itemText?.detail || '', score: idx + 0.45 }
    })
    return ([...pokemonResults, ...moveResults, ...abilityResults, ...itemResults] as DexResultItem[])
      .sort((a, b) => a.score - b.score || a.kind.localeCompare(b.kind) || a.key.localeCompare(b.key, 'ko'))
      .slice(0, 40)
  }, [asyncDataVersion, deferredDexUnifiedSearch, siteLanguage])
  const dexResultKeys = React.useMemo(() => {
    if (hasDexUnifiedSearch) return dexAllResults.map((result) => result.id)
    if (dexSearchMode === 'pokemon') return dexSpeciesOptions.map((option) => option.key)
    if (dexSearchMode === 'move') return dexMoveOptions.map((option) => option.key)
    if (dexSearchMode === 'ability') return dexAbilityOptions.map((option) => option.key)
    return dexItemOptions
  }, [dexAbilityOptions, dexAllResults, dexItemOptions, dexMoveOptions, dexSearchMode, dexSpeciesOptions, hasDexUnifiedSearch])
  const dexSelectedAllResult = React.useMemo(() => {
    if (!hasDexUnifiedSearch || !dexSelectedValue) return null
    const direct = dexAllResults.find((result) => result.id === dexSelectedValue)
    if (direct) return direct
    const parsed = parseDexSelectionId(dexSelectedValue)
    if (!parsed) return null
    if (parsed.kind === 'pokemon') {
      const row = indexByKey.get(parsed.key)
      return row ? { id: dexSelectionId('pokemon', parsed.key), kind: 'pokemon' as const, key: parsed.key, row, score: 0 } : null
    }
    if (parsed.kind === 'move') {
      const meta = MOVE_META_BY_NAME[parsed.key]
      return meta ? { id: dexSelectionId('move', parsed.key), kind: 'move' as const, key: parsed.key, name: parsed.key, meta, score: 0 } : null
    }
    if (parsed.kind === 'ability') {
      const resolved = ABILITY_INDEX.byKey.get(parsed.key)
      return resolved ? { id: dexSelectionId('ability', parsed.key), kind: 'ability' as const, key: resolved.key, koLabel: resolved.koLabel, pokemonKeys: resolved.pokemonKeys, score: 0 } : null
    }
    const itemIndex = getItemIndexSync()
    return itemIndex?.byKey.has(parsed.key)
      ? { id: dexSelectionId('item', parsed.key), kind: 'item' as const, key: parsed.key, item: parsed.key, previewText: '', score: 0 }
      : null
  }, [dexAllResults, dexSelectedValue, hasDexUnifiedSearch])
  const dexSelectedRow = dexSelectedAllResult?.kind === 'pokemon'
    ? dexSelectedAllResult.row
    : dexSearchMode === 'pokemon' && dexSelectedValue
      ? (indexByKey.get(dexSelectedValue) ?? null)
      : null
  const dexSelectedMove = dexSelectedAllResult?.kind === 'move'
    ? { key: dexSelectedAllResult.key, name: dexSelectedAllResult.name, meta: dexSelectedAllResult.meta }
    : dexSearchMode === 'move' && dexSelectedValue
      ? (dexMoveOptions.find((option) => option.key === dexSelectedValue) ?? (MOVE_META_BY_NAME[dexSelectedValue] ? { key: dexSelectedValue, name: dexSelectedValue, meta: MOVE_META_BY_NAME[dexSelectedValue] } : null))
      : null
  const dexSelectedMoveName = dexSelectedMove?.name ?? ''
  const dexSelectedAbility = dexSelectedAllResult?.kind === 'ability'
    ? { key: dexSelectedAllResult.key, koLabel: dexSelectedAllResult.koLabel, pokemonKeys: dexSelectedAllResult.pokemonKeys }
    : dexSearchMode === 'ability' && dexSelectedValue
      ? (dexAbilityOptions.find((option) => option.key === dexSelectedValue) ?? null)
      : null
  const dexSelectedItem = dexSelectedAllResult?.kind === 'item' ? dexSelectedAllResult.item : dexSearchMode === 'item' && dexSelectedValue ? dexSelectedValue : null
  const dexTopMoves = React.useMemo(() => dexSelectedRow ? usageTopMovesForKey(dexSelectedRow.key, 10) : [], [asyncDataVersion, dexSelectedRow])
  const dexSelectedMoveDescription = React.useMemo(() => dexSelectedMove ? moveDescriptionFor(dexSelectedMove.name) : null, [dexSelectedMove])
  const dexSelectedAbilityDescription = React.useMemo(() => dexSelectedAbility ? abilityDescriptionFor(dexSelectedAbility.key) : null, [dexSelectedAbility])
  const dexSelectedItemDescription = React.useMemo(() => dexSelectedItem ? itemDescriptionFor(dexSelectedItem) : null, [dexSelectedItem])
  const dexSelectedMoveText = React.useMemo(() => localizedDexText(dexSelectedMoveDescription, siteLanguage), [dexSelectedMoveDescription, siteLanguage])
  const dexSelectedAbilityText = React.useMemo(() => localizedDexText(dexSelectedAbilityDescription, siteLanguage), [dexSelectedAbilityDescription, siteLanguage])
  const dexSelectedItemText = React.useMemo(() => localizedDexText(dexSelectedItemDescription, siteLanguage), [dexSelectedItemDescription, siteLanguage])
  const dexSelectedItemEffectSummary = React.useMemo(() => dexSelectedItem ? itemEffectSummaryFor(dexSelectedItem, siteLanguage) : '', [dexSelectedItem, siteLanguage])

  React.useEffect(() => {
    setParty((prev) => {
      let changed = false
      const next = prev.map((member) => {
        const ability = sanitizeAbilityForKey(member.key, member.ability, true)
        if (ability === member.ability) return member
        changed = true
        return { ...member, ability }
      })
      return changed ? next : prev
    })
  }, [])

  React.useEffect(() => {
    setSampleForge((prev) => {
      const ability = sanitizeAbilityForKey(prev.key, prev.ability, true)
      return ability === prev.ability ? prev : { ...prev, ability }
    })
  }, [])

  React.useEffect(() => {
    let nextAbilities: string[] | null = null
    setOpponents((prev) => {
      let changed = false
      const next = prev.map((member, idx) => {
        const ability = sanitizeAbilityForKey(member.key, member.ability, false)
        if (ability === member.ability) return member
        changed = true
        if (!nextAbilities) nextAbilities = prev.map((item) => item.ability)
        nextAbilities[idx] = ability
        return { ...member, ability }
      })
      return changed ? next : prev
    })
    if (nextAbilities) setOpponentAbilityDrafts(nextAbilities)
  }, [])

  React.useEffect(() => {
    let cancelled = false
    if (!dexSelectedMoveName) {
      setDexMoveLearners([])
      setDexMoveLearnersStatus('idle')
      return
    }
    setDexMoveLearnersStatus('loading')
    dexMoveLearnerRows(dexSelectedMoveName)
      .then((rows) => {
        if (cancelled) return
        setDexMoveLearners(rows)
        setDexMoveLearnersStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setDexMoveLearners([])
        setDexMoveLearnersStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [dexSelectedMoveName])

  const hideHoverTooltip = React.useCallback(() => setHoverTooltip(null), [])
  const showHoverTooltipAtElement = React.useCallback((element: HTMLElement, card: HoverTooltipCard | null | undefined) => {
    if (!card) return
    const rect = element.getBoundingClientRect()
    setHoverTooltip({
      ...card,
      anchorX: rect.left + (rect.width / 2),
      anchorTop: rect.top,
      anchorBottom: rect.bottom,
    })
  }, [])
  const showHoverTooltip = React.useCallback((event: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>, card: HoverTooltipCard | null | undefined) => {
    showHoverTooltipAtElement(event.currentTarget, card)
  }, [showHoverTooltipAtElement])
  const bindTooltip = React.useCallback((card: HoverTooltipCard | null | undefined) => card ? {
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => showHoverTooltip(event, card),
    onMouseLeave: hideHoverTooltip,
    onFocus: (event: React.FocusEvent<HTMLElement>) => showHoverTooltip(event, card),
    onBlur: hideHoverTooltip,
  } : {}, [hideHoverTooltip, showHoverTooltip])
  const clearLongPressTimer = React.useCallback(() => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  React.useEffect(() => {
    if (!dexResultKeys.length) {
      if (dexSelectedValue !== null) setDexSelectedValue(null)
      return
    }
    if (!dexSelectedValue || !dexResultKeys.includes(dexSelectedValue)) {
      setDexSelectedValue(dexResultKeys[0])
    }
  }, [dexResultKeys, dexSelectedValue])

  const openDexPokemonDetail = React.useCallback((key: string) => {
    hideHoverTooltip()
    if (hasDexUnifiedSearch) {
      const nextLabel = searchDisplayLabel(key, siteLanguage)
      setDexUnifiedSearchDraft((prev) => prev || nextLabel)
      setDexUnifiedSearch((prev) => prev || nextLabel)
      setDexSelectedValue(dexSelectionId('pokemon', key))
      return
    }
    setDexSearch(searchDisplayLabel(key, siteLanguage))
    setDexSearchMode('pokemon')
    setDexSelectedValue(key)
  }, [hasDexUnifiedSearch, hideHoverTooltip, siteLanguage])

  const openDexMoveDetail = React.useCallback((name: string) => {
    hideHoverTooltip()
    if (hasDexUnifiedSearch) {
      setDexUnifiedSearchDraft((prev) => prev || name)
      setDexUnifiedSearch((prev) => prev || name)
      setDexSelectedValue(dexSelectionId('move', name))
      return
    }
    setDexSearch(name)
    setDexSearchMode('move')
    setDexSelectedValue(name)
  }, [hasDexUnifiedSearch, hideHoverTooltip])

  const openDexAbilityDetail = React.useCallback((ability: string, row?: Row | null) => {
    const resolved = resolveAbilityInfo(ability, row)
    if (!resolved) return
    hideHoverTooltip()
    if (hasDexUnifiedSearch) {
      setDexUnifiedSearchDraft((prev) => prev || resolved.koLabel)
      setDexUnifiedSearch((prev) => prev || resolved.koLabel)
      setDexSelectedValue(dexSelectionId('ability', resolved.key))
      return
    }
    setDexSearch(resolved.koLabel)
    setDexSearchMode('ability')
    setDexSelectedValue(resolved.key)
  }, [hasDexUnifiedSearch, hideHoverTooltip])

  const bindNavigableTooltip = React.useCallback((card: HoverTooltipCard | null | undefined, onNavigate: () => void) => ({
    ...bindTooltip(card),
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      if (!card || event.pointerType !== 'touch') return
      suppressFocusTooltipRef.current = true
      longPressTriggeredRef.current = false
      clearLongPressTimer()
      const element = event.currentTarget
      longPressTimerRef.current = window.setTimeout(() => {
        longPressTriggeredRef.current = true
        showHoverTooltipAtElement(element, card)
      }, 420)
    },
    onPointerUp: () => {
      clearLongPressTimer()
      window.setTimeout(() => {
        suppressFocusTooltipRef.current = false
      }, 0)
    },
    onPointerCancel: () => {
      clearLongPressTimer()
      suppressFocusTooltipRef.current = false
    },
    onPointerLeave: () => {
      clearLongPressTimer()
      suppressFocusTooltipRef.current = false
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      if (suppressFocusTooltipRef.current) return
      if (!card) return
      showHoverTooltip(event, card)
    },
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      if (longPressTriggeredRef.current) {
        event.preventDefault()
        event.stopPropagation()
        longPressTriggeredRef.current = false
        return
      }
      onNavigate()
    },
  }), [bindTooltip, clearLongPressTimer, showHoverTooltip, showHoverTooltipAtElement])

  React.useEffect(() => () => clearLongPressTimer(), [clearLongPressTimer])

  React.useEffect(() => {
    if (!hoverTooltip || typeof window === 'undefined') return
    const close = () => setHoverTooltip(null)
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    window.addEventListener('pointerdown', close)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
      window.removeEventListener('pointerdown', close)
      window.removeEventListener('keydown', handleKey)
    }
  }, [hoverTooltip])

  const tooltipWidth = 280
  const tooltipHeight = hoverTooltip?.kind === 'ability' ? 190 : hoverTooltip?.kind === 'item' ? 210 : 170
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 720
  const tooltipPlacement = hoverTooltip && hoverTooltip.anchorBottom + tooltipHeight + 18 <= viewportHeight ? 'bottom' : 'top'
  const tooltipLeft = hoverTooltip ? Math.max(12, Math.min(viewportWidth - tooltipWidth - 12, hoverTooltip.anchorX - (tooltipWidth / 2))) : 0
  const tooltipTop = hoverTooltip ? (tooltipPlacement === 'bottom'
    ? Math.min(viewportHeight - tooltipHeight - 12, hoverTooltip.anchorBottom + 12)
    : Math.max(12, hoverTooltip.anchorTop - tooltipHeight - 12)) : 0
  const doublePartyOptions = React.useMemo(() => party.map((member, idx) => ({ idx, member, row: member.key ? (indexByKey.get(member.key) ?? rows[0]) : null })), [party])
  const doubleOpponentOptions = React.useMemo(() => opponents.map((entry, idx) => ({ idx, entry, row: entry.key ? (indexByKey.get(entry.key) ?? rows[0]) : null })), [opponents])
  const doubleBoardSlots = React.useMemo(() => ({
    myLeft: doublePartyOptions[doubleMyLeft] ?? null,
    myRight: doublePartyOptions[doubleMyRight] ?? null,
    oppLeft: doubleOpponentOptions[doubleOppLeft] ?? null,
    oppRight: doubleOpponentOptions[doubleOppRight] ?? null,
  }), [doubleMyLeft, doubleMyRight, doubleOppLeft, doubleOppRight, doubleOpponentOptions, doublePartyOptions])
  const doubleSlotMeta = React.useMemo(() => ({
    myLeft: { label: lt('내 좌측'), option: doubleBoardSlots.myLeft, side: 'my' as const },
    myRight: { label: lt('내 우측'), option: doubleBoardSlots.myRight, side: 'my' as const },
    oppLeft: { label: lt('상대 좌측'), option: doubleBoardSlots.oppLeft, side: 'opp' as const },
    oppRight: { label: lt('상대 우측'), option: doubleBoardSlots.oppRight, side: 'opp' as const },
  }), [doubleBoardSlots, lt])
  const doubleSlotDisplayName = React.useCallback((slot: DoubleBoardSlot) => {
    const meta = doubleSlotMeta[slot]
    return meta.option?.row ? displayName(meta.option.row, siteLanguage) : meta.label
  }, [doubleSlotMeta, siteLanguage])
  const doubleDamageAttackerMeta = doubleSlotMeta[doubleAttackerSlot]
  const doubleDamageDefenderMeta = doubleSlotMeta[doubleDefenderSlot]
  const doubleOpponentIndexBySlot: Partial<Record<DoubleBoardSlot, number>> = { oppLeft: doubleOppLeft, oppRight: doubleOppRight }
  const updateDoubleOpponentBulk = React.useCallback((slot: DoubleBoardSlot, patch: Partial<Pick<OpponentState, 'hpEv' | 'defenseEv' | 'spDefenseEv' | 'speedEv' | 'natureBoost' | 'scarf' | 'speedStage' | 'defenseNature' | 'spDefenseNature'>>) => {
    const idx = doubleOpponentIndexBySlot[slot]
    if (idx === undefined) return
    setOpponents((prev) => prev.map((entry, entryIdx) => entryIdx === idx ? { ...entry, ...patch } : entry))
  }, [doubleOpponentIndexBySlot, setOpponents])
  const updateDoubleOpponentEffortFromPointer = React.useCallback((slot: DoubleBoardSlot, stat: Extract<EffortStatKey, 'hp' | 'defense' | 'spDefense' | 'speed'>, availableCap: number, clientX: number, element: HTMLDivElement) => {
    const idx = doubleOpponentIndexBySlot[slot]
    if (idx === undefined) return
    const rect = element.getBoundingClientRect()
    if (rect.width <= 0) return
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const nextValue = Math.round(ratio * availableCap)
    setOpponents((prev) => prev.map((entry, entryIdx) => {
      if (entryIdx !== idx) return entry
      const evs = applyChampionsEffort(opponentEffortValues(entry), stat, nextValue)
      return { ...entry, ...opponentPatchFromEffortValues(evs) }
    }))
  }, [doubleOpponentIndexBySlot, setOpponents])
  const nudgeDoubleOpponentEffort = React.useCallback((slot: DoubleBoardSlot, stat: Extract<EffortStatKey, 'hp' | 'defense' | 'spDefense' | 'speed'>, delta: number, availableCap: number) => {
    const idx = doubleOpponentIndexBySlot[slot]
    if (idx === undefined) return
    setOpponents((prev) => prev.map((entry, entryIdx) => {
      if (entryIdx !== idx) return entry
      const current = opponentEffortValues(entry)[stat]
      const evs = applyChampionsEffort(opponentEffortValues(entry), stat, Math.max(0, Math.min(availableCap, current + delta)))
      return { ...entry, ...opponentPatchFromEffortValues(evs) }
    }))
  }, [doubleOpponentIndexBySlot, setOpponents])
  const doubleProtectBySlot: Record<DoubleBoardSlot, boolean> = { myLeft: doubleProtectMyLeft, myRight: doubleProtectMyRight, oppLeft: doubleProtectOppLeft, oppRight: doubleProtectOppRight }
  const doubleActionMoveBySlot: Record<DoubleBoardSlot, string> = { myLeft: doubleActionMoveMyLeft, myRight: doubleActionMoveMyRight, oppLeft: doubleActionMoveOppLeft, oppRight: doubleActionMoveOppRight }
  const setDoubleActionMoveBySlot: Record<DoubleBoardSlot, (value: string) => void> = { myLeft: setDoubleActionMoveMyLeft, myRight: setDoubleActionMoveMyRight, oppLeft: setDoubleActionMoveOppLeft, oppRight: setDoubleActionMoveOppRight }
  const doubleActionTargetBySlot: Record<DoubleBoardSlot, DoubleBoardSlot> = { myLeft: doubleActionTargetMyLeft, myRight: doubleActionTargetMyRight, oppLeft: doubleActionTargetOppLeft, oppRight: doubleActionTargetOppRight }
  const setDoubleActionTargetBySlot: Record<DoubleBoardSlot, (value: DoubleBoardSlot) => void> = { myLeft: setDoubleActionTargetMyLeft, myRight: setDoubleActionTargetMyRight, oppLeft: setDoubleActionTargetOppLeft, oppRight: setDoubleActionTargetOppRight }
  const doubleAttackerMoves = React.useMemo(() => {
    if (!doubleDamageAttackerMeta.option) return [] as string[]
    return (doubleDamageAttackerMeta.side === 'my'
      ? (confirmedMovesByKey[doubleDamageAttackerMeta.option.member.key] ?? [])
      : doubleDamageAttackerMeta.option.entry.revealedMoves
    ).filter(Boolean)
  }, [confirmedMovesByKey, doubleDamageAttackerMeta])
  const buildDoubleDamageContext = React.useCallback((attackerSlot: DoubleBoardSlot, defenderSlot: DoubleBoardSlot, moveName: string, spreadMove: boolean) => {
    const attackerMeta = doubleSlotMeta[attackerSlot]
    const defenderMeta = doubleSlotMeta[defenderSlot]
    if (!attackerMeta.option?.row || !defenderMeta.option?.row || !moveName) return null
    const attackerRow = attackerMeta.option.row
    const defenderRow = defenderMeta.option.row
    const attackerAbility = attackerMeta.side === 'my' ? (attackerMeta.option.member.ability || defaultAbilityForKey(attackerMeta.option.member.key)) : attackerMeta.option.entry.ability
    const defenderAbility = defenderMeta.side === 'my' ? (defenderMeta.option.member.ability || defaultAbilityForKey(defenderMeta.option.member.key)) : defenderMeta.option.entry.ability
    const attackerAllySlot: DoubleBoardSlot | null = attackerSlot === 'myLeft' ? 'myRight' : attackerSlot === 'myRight' ? 'myLeft' : attackerSlot === 'oppLeft' ? 'oppRight' : 'oppLeft'
    const attackerAllyMeta = attackerAllySlot ? doubleSlotMeta[attackerAllySlot] : null
    const attackerAllyAbility = attackerAllyMeta?.option?.row
      ? (attackerAllyMeta.side === 'my'
        ? (attackerAllyMeta.option.member.ability || defaultAbilityForKey(attackerAllyMeta.option.member.key))
        : attackerAllyMeta.option.entry.ability)
      : ''
    const resolvedAttackerRow = attackingFormRow(attackerRow, attackerAbility)
    const attackerStats = attackerMeta.side === 'my'
      ? buildPartyBattleStats(resolvedAttackerRow, attackerMeta.option.member)
      : buildOpponentBattleStats(resolvedAttackerRow, { hpEv: 0, defenseEv: 0, spDefenseEv: 0, defenseNature: 1, spDefenseNature: 1 }, { attackEv: 0, spAttackEv: 0, attackNature: 1, spAttackNature: 1 })
    const defenderStats = defenderMeta.side === 'my'
      ? buildPartyBattleStats(defenderRow, defenderMeta.option.member)
      : buildOpponentBattleStats(defenderRow, {
        hpEv: defenderMeta.option.entry.hpEv,
        defenseEv: defenderMeta.option.entry.defenseEv,
        spDefenseEv: defenderMeta.option.entry.spDefenseEv,
        defenseNature: defenderMeta.option.entry.defenseNature,
        spDefenseNature: defenderMeta.option.entry.spDefenseNature,
      }, { attackEv: 0, spAttackEv: 0, attackNature: 1, spAttackNature: 1 })
    const moveOptions = attackerMeta.side === 'my' ? moveOptionsForEntry(sampleMoves.find((entry) => entry.key === attackerMeta.option.member.key)) : moveOptionsForEntry(sampleMoves.find((entry) => entry.key === attackerMeta.option.entry.key))
    const baseMoveMeta = resolveMoveMeta(moveName, moveOptions, movePoolByKey)
    const moveMeta = resolveAbilityAdjustedMoveMeta(moveName, baseMoveMeta, attackerAbility)
    const moveType = moveMeta?.type ?? resolveMoveType(moveName, moveOptions, movePoolByKey) ?? null
    const mode = moveMeta?.category === 'physical' || moveMeta?.category === 'special' ? moveMeta.category : 'physical'
    const effectiveTypes = resolveAbilityAdjustedTypes(defenderRow.types, defenderAbility, 'none', 'none')
    const effectiveness = moveType ? abilityAdjustedTypeEffectiveness(moveType, effectiveTypes, defenderAbility, attackerAbility) : 1
    const guardedByWide = spreadMove && attackerMeta.side !== defenderMeta.side && (defenderMeta.side === 'my' ? doubleWideGuardMy : doubleWideGuardOpp)
    const protectedTarget = doubleProtectBySlot[defenderSlot]
    const protectionMultiplier = protectionDamageMultiplier(attackerAbility, moveName, guardedByWide || protectedTarget)
    const piercesProtection = protectionMultiplier > 0 && protectionMultiplier < 1
    const blockedByProtection = protectionMultiplier === 0
    const friendGuard = attackerMeta.side !== defenderMeta.side && (defenderMeta.side === 'my' ? doubleFriendGuardMy : doubleFriendGuardOpp)
    const modifiers = blockedByProtection ? null : resolveDamageModifiers({
      attackerAbility,
      attackerAllyAbility,
      attackerItem: attackerMeta.side === 'my' ? attackerMeta.option.member.item : attackerMeta.option.entry.item,
      defenderAbility,
      defenderItem: defenderMeta.side === 'my' ? defenderMeta.option.member.item : defenderMeta.option.entry.item,
      moveName,
      baseMoveType: moveMeta?.type ?? moveType,
      moveType,
      movePower: moveMeta?.power ?? 0,
      mode,
      effectiveness,
      attackStage: 0,
      defenseStage: 0,
      defenderTypes: effectiveTypes,
      burned: false,
      attackerLowHp: false,
      targetPoisoned: false,
      defenderFullHp: true,
      movedAfterTarget: false,
      faintedAllies: 0,
      rivalryMode: 'neutral',
      parentalBond: false,
      defenderStatused: false,
      electromorphosisCharged: false,
      weather: 'none',
      terrain: 'none',
      reflect: false,
      lightScreen: false,
      auroraVeil: false,
      friendGuard,
      critical: false,
    })
    if (modifiers && spreadMove) modifiers.finalMultiplier = (modifiers.finalMultiplier ?? 1) * 0.75
    if (modifiers && piercesProtection) {
      modifiers.finalMultiplier = (modifiers.finalMultiplier ?? 1) * protectionMultiplier
      modifiers.notes.push(`${abilityNoteLabel(attackerAbility)}(방어 관통 1/4)`)
    }
    const damage = blockedByProtection ? null : calcDamage(attackerStats, defenderStats, moveMeta?.power ?? 0, mode, moveType && attackerRow.types.includes(moveType) ? 1.5 : 1, effectiveness, moveMeta, modifiers ?? undefined)
    const reason = blockedByProtection && guardedByWide ? lt('와이드가드로 차단됨') : blockedByProtection && protectedTarget ? lt('방어로 막힘') : moveMeta?.category === 'status' ? lt('변화기는 대미지 계산 대상이 아님') : null
    return { attackerRow, defenderRow, defenderHp: defenderStats.hp, moveType, moveMeta, damage, reason, guardedByWide, protectedTarget, friendGuard, effectiveness }
  }, [doubleFriendGuardMy, doubleFriendGuardOpp, doubleProtectBySlot, doubleSlotMeta, doubleWideGuardMy, doubleWideGuardOpp, lt, movePoolByKey])
  const doubleDamageContext = React.useMemo(() => buildDoubleDamageContext(doubleAttackerSlot, doubleDefenderSlot, doubleMoveName, doubleSpreadMove), [buildDoubleDamageContext, doubleAttackerSlot, doubleDefenderSlot, doubleMoveName, doubleSpreadMove])
  const doubleSpeedOrder = React.useMemo(() => {
    const entries = ([
      { slot: 'myLeft' as const, side: 'my' as const, label: lt('내 좌측'), option: doubleBoardSlots.myLeft, tailwind: doubleTailwindMy },
      { slot: 'myRight' as const, side: 'my' as const, label: lt('내 우측'), option: doubleBoardSlots.myRight, tailwind: doubleTailwindMy },
      { slot: 'oppLeft' as const, side: 'opp' as const, label: lt('상대 좌측'), option: doubleBoardSlots.oppLeft, tailwind: doubleTailwindOpp },
      { slot: 'oppRight' as const, side: 'opp' as const, label: lt('상대 우측'), option: doubleBoardSlots.oppRight, tailwind: doubleTailwindOpp },
    ]).map((entry, idx) => {
      if (!entry.option?.row) return { ...entry, idx, name: lt('미선택'), speed: null as number | null, effectiveSpeed: null as number | null, sprite: null as string | null }
      const speed = entry.side === 'my'
        ? partySpeedValue(entry.option.row, entry.option.member)
        : opponentSpeedValue(entry.option.row, entry.option.entry)
      const effectiveSpeed = entry.tailwind ? speed * 2 : speed
      return { ...entry, idx, name: displayName(entry.option.row, siteLanguage), speed, effectiveSpeed, sprite: entry.option.row.sprite ?? null }
    })
    return entries.slice().sort((a, b) => {
      const aSpeed = a.effectiveSpeed ?? (doubleTrickRoom ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY)
      const bSpeed = b.effectiveSpeed ?? (doubleTrickRoom ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY)
      if (aSpeed === bSpeed) return a.idx - b.idx
      return doubleTrickRoom ? aSpeed - bSpeed : bSpeed - aSpeed
    })
  }, [doubleBoardSlots, doubleTailwindMy, doubleTailwindOpp, doubleTrickRoom, lt, siteLanguage])
  const doubleSpeedBySlot = React.useMemo(() => Object.fromEntries(doubleSpeedOrder.map((entry) => [entry.slot, entry.effectiveSpeed])) as Partial<Record<DoubleBoardSlot, number | null>>, [doubleSpeedOrder])
  const doubleBoardStateCards = React.useMemo(() => {
    const slotOrder: DoubleBoardSlot[] = ['myLeft', 'myRight', 'oppLeft', 'oppRight']
    return slotOrder.map((slot) => {
      const meta = doubleSlotMeta[slot]
      const option = meta.option
      const row = option?.row ?? null
      if (meta.side === 'my' && option && 'member' in option) {
        const key = option.member.key ?? ''
        return {
          slot,
          side: meta.side,
          label: meta.label,
          row,
          name: row ? displayName(row, siteLanguage) : lt('미선택'),
          item: displayItemLabel(visibleChampionsItem(key, option.member.item ?? ''), siteLanguage),
          ability: option.member.ability || defaultAbilityForKey(key) || '',
          moves: (confirmedMovesByKey[key] ?? []).filter(Boolean),
          speed: doubleSpeedBySlot[slot],
          protected: doubleProtectBySlot[slot],
          tailwind: doubleTailwindMy,
        }
      }
      const key = option && 'entry' in option ? option.entry.key ?? '' : ''
      return {
        slot,
        side: meta.side,
        label: meta.label,
        row,
        name: row ? displayName(row, siteLanguage) : lt('미선택'),
        item: displayItemLabel(visibleChampionsItem(key, option && 'entry' in option ? option.entry.item ?? '' : ''), siteLanguage),
        ability: option && 'entry' in option ? option.entry.ability || '' : '',
        moves: (option && 'entry' in option ? option.entry.revealedMoves : []).filter(Boolean),
        speed: doubleSpeedBySlot[slot],
        protected: doubleProtectBySlot[slot],
        tailwind: doubleTailwindOpp,
      }
    })
  }, [confirmedMovesByKey, doubleProtectBySlot, doubleSlotMeta, doubleSpeedBySlot, doubleTailwindMy, doubleTailwindOpp, lt, siteLanguage])
  const FRIEND_GUARD_NAMES = new Set(['프렌드가드', 'Friend Guard', 'フレンドガード'])
  const doubleFriendGuardAvailableOpp = React.useMemo(() => doubleBoardStateCards.some((card) => card.side === 'opp' && FRIEND_GUARD_NAMES.has(card.ability || '')), [doubleBoardStateCards])
  const doubleActionOptionsBySlot = React.useMemo(() => {
    return Object.fromEntries(doubleBoardStateCards.map((card) => [card.slot, card.moves])) as Record<DoubleBoardSlot, string[]>
  }, [doubleBoardStateCards])
  const doubleTargetOptionsBySlot = React.useMemo(() => ({
    myLeft: ['oppLeft', 'oppRight'] as DoubleBoardSlot[],
    myRight: ['oppLeft', 'oppRight'] as DoubleBoardSlot[],
    oppLeft: ['myLeft', 'myRight'] as DoubleBoardSlot[],
    oppRight: ['myLeft', 'myRight'] as DoubleBoardSlot[],
  }), [])
  const doubleActionOrder = React.useMemo(() => {
    return (['myLeft', 'myRight', 'oppLeft', 'oppRight'] as DoubleBoardSlot[]).map((slot, idx) => {
      const meta = doubleSlotMeta[slot]
      const option = meta.option
      const row = option?.row ?? null
      const moves = doubleActionOptionsBySlot[slot] ?? []
      const selectedMove = doubleActionMoveBySlot[slot] && moves.includes(doubleActionMoveBySlot[slot]) ? doubleActionMoveBySlot[slot] : ''
      let key = ''
      let moveOptions: { name: string, type: string | null }[] = []
      if (meta.side === 'my' && option && 'member' in option) {
        key = option.member.key ?? ''
        moveOptions = movePoolByKey[key]?.moves?.length ? movePoolByKey[key].moves : moveOptionsForEntry(sampleMoves.find((entry) => entry.key === key))
      } else {
        key = option && 'entry' in option ? option.entry.key ?? '' : ''
        moveOptions = moves.map((name) => ({ name, type: lookupMoveMeta(name)?.type ?? null }))
      }
      const moveMeta = selectedMove ? resolveMoveMeta(selectedMove, moveOptions, movePoolByKey) : null
      return {
        slot,
        idx,
        label: meta.label,
        side: meta.side,
        name: row ? displayName(row, siteLanguage) : lt('미선택'),
        sprite: row?.sprite ?? null,
        selectedMove,
        priority: moveMeta?.priority ?? 0,
        speed: doubleSpeedBySlot[slot] ?? null,
      }
    }).sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority
      const aSpeed = a.speed ?? (doubleTrickRoom ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY)
      const bSpeed = b.speed ?? (doubleTrickRoom ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY)
      if (aSpeed !== bSpeed) return doubleTrickRoom ? aSpeed - bSpeed : bSpeed - aSpeed
      return a.idx - b.idx
    })
  }, [doubleActionMoveBySlot, doubleActionOptionsBySlot, doubleSlotMeta, doubleSpeedBySlot, doubleTrickRoom, lt, movePoolByKey, siteLanguage])
  const doubleFocusedActionTarget = doubleActionTargetBySlot[doubleActionFocusSlot]
  const doubleFocusedActionMeta = doubleSlotMeta[doubleActionFocusSlot]
  const doubleFocusedTargetMeta = doubleSlotMeta[doubleFocusedActionTarget]
  const doubleFocusedActionMove = doubleActionMoveBySlot[doubleActionFocusSlot] || ''
  const doubleActionCards = React.useMemo(() => {
    return (['myLeft', 'myRight', 'oppLeft', 'oppRight'] as DoubleBoardSlot[]).map((slot) => {
      const meta = doubleSlotMeta[slot]
      const card = doubleBoardStateCards.find((entry) => entry.slot === slot)
      const targetOptions = doubleTargetOptionsBySlot[slot] ?? []
      const selectedMove = doubleActionMoveBySlot[slot] || ''
      const selectedSpreadMove = DOUBLE_SPREAD_MOVE_NAMES.has(normalizeSearchText(selectedMove))
      const enemyTargets = targetOptions.filter((targetSlot) => doubleSlotMeta[targetSlot].side !== meta.side)
      const moveRows = (doubleActionOptionsBySlot[slot] ?? []).map((move) => {
        const lookup = lookupMoveMeta(move)
        const priority = lookup?.priority ?? 0
        const spreadMove = DOUBLE_SPREAD_MOVE_NAMES.has(normalizeSearchText(move))
        const targetPreview = (targetSlot: DoubleBoardSlot) => {
          const preview = buildDoubleDamageContext(slot, targetSlot, move, spreadMove)
          const previewText = preview?.reason
            ? preview.reason
            : preview?.damage
              ? `${preview.damage.minPct}% ~ ${preview.damage.maxPct}%`
              : lt('계산 대기')
          return {
            targetSlot,
            label: doubleSlotDisplayName(targetSlot),
            selected: selectedMove === move && doubleActionTargetBySlot[slot] === targetSlot,
            previewText,
          }
        }
        return {
          move,
          type: lookup?.type ?? null,
          priority,
          selected: selectedMove === move,
          spreadMove,
          enemyTargets: enemyTargets.map(targetPreview),
        }
      })
      const selectedRow = moveRows.find((entry) => entry.selected) ?? moveRows[0] ?? null
      return {
        slot,
        meta,
        card,
        moveRows,
        enemyTargets: selectedRow?.enemyTargets ?? [],
        spreadMove: selectedRow?.spreadMove ?? selectedSpreadMove,
      }
    })
  }, [buildDoubleDamageContext, doubleActionMoveBySlot, doubleActionOptionsBySlot, doubleActionTargetBySlot, doubleBoardStateCards, doubleSlotDisplayName, doubleSlotMeta, doubleTargetOptionsBySlot, lt])
  const doubleCombinedDamageSummary = React.useMemo(() => {
    const attackers: DoubleBoardSlot[] = ['myLeft', 'myRight']
    const defenders: DoubleBoardSlot[] = ['oppLeft', 'oppRight']
    return defenders.map((defenderSlot) => {
      const contributions = attackers.map((attackerSlot) => {
        const moveName = doubleActionMoveBySlot[attackerSlot] || ''
        const spreadMove = DOUBLE_SPREAD_MOVE_NAMES.has(normalizeSearchText(moveName))
        const selectedTarget = doubleActionTargetBySlot[attackerSlot]
        const hitsDefender = spreadMove ? true : selectedTarget === defenderSlot
        const preview = moveName && hitsDefender ? buildDoubleDamageContext(attackerSlot, defenderSlot, moveName, spreadMove) : null
        return {
          attackerSlot,
          attackerLabel: doubleSlotDisplayName(attackerSlot),
          moveName,
          spreadMove,
          selectedTarget,
          hitsDefender,
          preview,
        }
      })
      const damageEntries = contributions.filter((entry) => entry.preview?.damage)
      const min = damageEntries.reduce((sum, entry) => sum + (entry.preview?.damage?.min ?? 0), 0)
      const max = damageEntries.reduce((sum, entry) => sum + (entry.preview?.damage?.max ?? 0), 0)
      const defenderHp = contributions.find((entry) => entry.preview?.defenderHp)?.preview?.defenderHp ?? null
      const minPct = defenderHp ? Math.round((min / defenderHp) * 1000) / 10 : null
      const maxPct = defenderHp ? Math.round((max / defenderHp) * 1000) / 10 : null
      const blocked = contributions
        .filter((entry) => entry.moveName && entry.hitsDefender && !entry.preview?.damage)
        .map((entry) => ({
          attackerLabel: entry.attackerLabel,
          reason: entry.preview?.reason ?? lt('계산 대기'),
        }))
        .filter((entry) => entry.reason !== lt('변화기는 대미지 계산 대상이 아님'))
      const combinedDamage = damageEntries.length ? { min, max, rolls: [min, max] } : null
      const verdictTone = resolveDamageVerdictTone(combinedDamage, defenderHp)
      return {
        defenderSlot,
        defenderLabel: doubleSlotDisplayName(defenderSlot),
        defenderSprite: doubleSlotMeta[defenderSlot].option?.row?.sprite ?? null,
        contributions,
        hasDamage: damageEntries.length > 0,
        totalText: damageEntries.length ? `${min} ~ ${max}` : '—',
        totalPctText: damageEntries.length && minPct !== null && maxPct !== null ? `${minPct}% ~ ${maxPct}%` : '—',
        verdictTone,
        blocked,
      }
    })
  }, [buildDoubleDamageContext, doubleActionMoveBySlot, doubleSlotDisplayName, doubleSlotMeta, lt])
  React.useEffect(() => {
    if (!doubleFriendGuardAvailableOpp && doubleFriendGuardOpp) setDoubleFriendGuardOpp(false)
  }, [doubleFriendGuardAvailableOpp, doubleFriendGuardOpp])
  React.useEffect(() => {
    ;(['myLeft', 'myRight', 'oppLeft', 'oppRight'] as DoubleBoardSlot[]).forEach((slot) => {
      const options = doubleActionOptionsBySlot[slot] ?? []
      const current = doubleActionMoveBySlot[slot]
      if (!options.length) {
        if (current) setDoubleActionMoveBySlot[slot]('')
        return
      }
      if (!current || !options.includes(current)) setDoubleActionMoveBySlot[slot](options[0])
    })
  }, [doubleActionMoveBySlot, doubleActionOptionsBySlot, setDoubleActionMoveBySlot])
  React.useEffect(() => {
    ;(['myLeft', 'myRight', 'oppLeft', 'oppRight'] as DoubleBoardSlot[]).forEach((slot) => {
      const options = doubleTargetOptionsBySlot[slot] ?? []
      const current = doubleActionTargetBySlot[slot]
      if (!options.includes(current)) setDoubleActionTargetBySlot[slot](options[0])
    })
  }, [doubleActionTargetBySlot, doubleTargetOptionsBySlot, setDoubleActionTargetBySlot])
  React.useEffect(() => {
    if (doubleAttackerSlot !== doubleActionFocusSlot) setDoubleAttackerSlot(doubleActionFocusSlot)
    if (doubleDefenderSlot !== doubleFocusedActionTarget) setDoubleDefenderSlot(doubleFocusedActionTarget)
    if (doubleMoveName !== doubleFocusedActionMove) setDoubleMoveName(doubleFocusedActionMove)
  }, [doubleActionFocusSlot, doubleAttackerSlot, doubleDefenderSlot, doubleFocusedActionMove, doubleFocusedActionTarget, doubleMoveName])
  const setAutocompleteMenuOpen = React.useCallback((id: string) => {
    setAutocompleteHighlight((prev) => (prev?.id === id ? prev : { id, index: 0 }))
  }, [])
  const moveAutocompleteMenuHighlight = React.useCallback((id: string, length: number, direction: -1 | 1) => {
    setAutocompleteHighlight((prev) => ({ id, index: nextAutocompleteIndex(prev?.id === id ? prev.index : -1, length, direction) }))
  }, [])
  const closeAutocompleteMenu = React.useCallback((id?: string) => {
    setAutocompleteHighlight((prev) => (!id || prev?.id === id ? null : prev))
  }, [])

  React.useEffect(() => {
    if (!doubleAttackerMoves.length) {
      if (doubleMoveName) setDoubleMoveName('')
      return
    }
    if (!doubleAttackerMoves.includes(doubleMoveName)) setDoubleMoveName(doubleAttackerMoves[0])
  }, [doubleAttackerMoves, doubleMoveName])

  React.useEffect(() => {
    if (!doubleMoveName) return
    setDoubleSpreadMove(DOUBLE_SPREAD_MOVE_NAMES.has(normalizeSearchText(doubleMoveName)))
  }, [doubleMoveName])

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    const siteTitle = lt('포켓몬 챔피언스 배틀 도우미')
    const siteDescription = lt('파티 관리, 상대 엔트리, 스피드 계산, 대미지 계산을 한곳에서 정리하는 포켓몬 챔피언스 배틀 도구')
    const siteImageAlt = lt('포켓몬 챔피언스 배틀 도우미 대표 이미지')
    document.title = siteTitle
    const setNamedMeta = (name: string, content: string) => {
      const target = document.querySelector(`meta[name="${name}"]`)
      if (target) target.setAttribute('content', content)
    }
    const setPropertyMeta = (property: string, content: string) => {
      const target = document.querySelector(`meta[property="${property}"]`)
      if (target) target.setAttribute('content', content)
    }
    setNamedMeta('description', siteDescription)
    setNamedMeta('twitter:title', siteTitle)
    setNamedMeta('twitter:description', siteDescription)
    setPropertyMeta('og:title', siteTitle)
    setPropertyMeta('og:description', siteDescription)
    setPropertyMeta('og:image:alt', siteImageAlt)
  }, [lt])

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
      calcDefenderDisguise,
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
      calcOpponentOffensePreset,
      calcOpponentAttackEv,
      calcOpponentSpAttackEv,
      calcOpponentAttackNature,
      calcOpponentSpAttackNature,
      battleNote,
      confirmedMovesByKey,
      mainSection,
      activeTab,
      sampleForge,
      sampleLockedMoves,
      savedSamples,
      savedPartyPresets,
      sampleWorkbenchTab,
      sampleSpeedTargets,
      sampleDamageTargets,
      doubleMyLeft,
      doubleMyRight,
      doubleOppLeft,
      doubleOppRight,
      doubleTrickRoom,
      doubleTailwindMy,
      doubleTailwindOpp,
      doubleFriendGuardMy,
      doubleFriendGuardOpp,
      doubleWideGuardMy,
      doubleWideGuardOpp,
      doubleAttackerSlot,
      doubleDefenderSlot,
      doubleSpreadMove,
      doubleMoveName,
      doubleProtectMyLeft,
      doubleProtectMyRight,
      doubleProtectOppLeft,
      doubleProtectOppRight,
      doubleActionMoveMyLeft,
      doubleActionMoveMyRight,
      doubleActionMoveOppLeft,
      doubleActionMoveOppRight,
      doubleActionTargetMyLeft,
      doubleActionTargetMyRight,
      doubleActionTargetOppLeft,
      doubleActionTargetOppRight,
      doubleActionFocusSlot,
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [party, opponents, selectedMy, selectedOpp, calcSwapSides, calcAttackStage, calcDefenseStage, calcHitCount, calcWeather, calcTerrain, calcBurned, calcCritical, calcAttackerLowHp, calcTargetPoisoned, calcDefenderFullHp, calcDefenderDisguise, calcMovedAfterTarget, calcFaintedAllies, calcRivalryMode, calcParentalBond, calcDefenderStatused, calcElectromorphosisCharged, calcReflect, calcLightScreen, calcAuroraVeil, calcFriendGuard, calcTypeChangeStab, calcConditionalPowerValues, calcOpponentBulkPreset, calcOpponentHpEv, calcOpponentDefenseEv, calcOpponentSpDefenseEv, calcOpponentDefenseNature, calcOpponentSpDefenseNature, calcOpponentOffensePreset, calcOpponentAttackEv, calcOpponentSpAttackEv, calcOpponentAttackNature, calcOpponentSpAttackNature, battleNote, confirmedMovesByKey, mainSection, activeTab, sampleForge, sampleLockedMoves, savedSamples, savedPartyPresets, sampleWorkbenchTab, sampleSpeedTargets, sampleDamageTargets, doubleMyLeft, doubleMyRight, doubleOppLeft, doubleOppRight, doubleTrickRoom, doubleTailwindMy, doubleTailwindOpp, doubleFriendGuardMy, doubleFriendGuardOpp, doubleWideGuardMy, doubleWideGuardOpp, doubleAttackerSlot, doubleDefenderSlot, doubleSpreadMove, doubleMoveName, doubleProtectMyLeft, doubleProtectMyRight, doubleProtectOppLeft, doubleProtectOppRight, doubleActionMoveMyLeft, doubleActionMoveMyRight, doubleActionMoveOppLeft, doubleActionMoveOppRight, doubleActionTargetMyLeft, doubleActionTargetMyRight, doubleActionTargetOppLeft, doubleActionTargetOppRight, doubleActionFocusSlot])

  React.useEffect(() => {
    syncViewStateToUrl({
      mainSection,
      activeTab: mainSection === 'single' || mainSection === 'double' ? activeTab : undefined,
      sampleWorkbenchTab: mainSection === 'sample' ? sampleWorkbenchTab : undefined,
      dexSearchMode: mainSection === 'dex' ? dexSearchMode : undefined,
      dexSearch: mainSection === 'dex' ? deferredDexSearch.trim() : undefined,
      dexUnifiedSearch: mainSection === 'dex' ? deferredDexUnifiedSearch.trim() : undefined,
      dexSelectedValue: mainSection === 'dex' ? dexSelectedValue ?? undefined : undefined,
      selectedMy,
      selectedOpp,
    })
  }, [mainSection, activeTab, sampleWorkbenchTab, dexSearchMode, deferredDexSearch, deferredDexUnifiedSearch, dexSelectedValue, selectedMy, selectedOpp])

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [mainSection, activeTab, sampleWorkbenchTab, dexSearchMode])

  const myMember = party[selectedMy] ?? party[0]
  const oppMember = opponents[selectedOpp] ?? opponents[0]
  const sampleRow = indexByKey.get(sampleForge.key) ?? rows[0]
  const sampleMagicCandidate = sampleRow ? findMagicNumberCandidate(sampleRow, sampleForge) : null
  const calcMyKey = resolveCalcKeyWithMega(myMember.key, calcMyMegaKey)
  const calcOppKey = oppMember.key ? resolveCalcKeyWithMega(oppMember.key, calcOppMegaKey) : ''
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
  const opponentOffenseState = React.useMemo<OpponentOffenseState>(() => ({
    attackEv: calcOpponentAttackEv,
    spAttackEv: calcOpponentSpAttackEv,
    attackNature: calcOpponentAttackNature,
    spAttackNature: calcOpponentSpAttackNature,
  }), [calcOpponentAttackEv, calcOpponentSpAttackEv, calcOpponentAttackNature, calcOpponentSpAttackNature])
  const myBattleStats = buildPartyBattleStats(myRow, myMember)
  const oppBattleStats = oppRow ? buildOpponentBattleStats(oppRow, opponentBulkState, opponentOffenseState) : null
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
    setCalcMyMegaKey(myMember.key.startsWith('mega-') ? myMember.key : null)
    if (myMember.key.startsWith('mega-') && !megaCandidates.includes(myMember.key)) setCalcMyMegaKey(megaCandidates[0] ?? null)
    if (!megaCandidates.length) setCalcMyMegaKey(null)
  }, [myMember.key])

  React.useEffect(() => {
    const megaCandidates = megaCandidateKeysForBase(megaBaseKey(oppMember.key))
    setCalcOppMegaKey(oppMember.key.startsWith('mega-') ? oppMember.key : null)
    if (oppMember.key.startsWith('mega-') && !megaCandidates.includes(oppMember.key)) setCalcOppMegaKey(megaCandidates[0] ?? null)
    if (!megaCandidates.length) setCalcOppMegaKey(null)
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
  const mySpeedAbilityLine = myRow ? mySpeedAbilityMarker(myRow, myMember, siteLanguage, calcWeather, calcTerrain) : null
  const oppSpeed = oppRow ? opponentSpeedValue(oppRow, oppMember) : null
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
  const speedBandLabelSideClass = (idx: number, total: number, left: number) => {
    if (total <= 2) return left > 70 ? 'label-left' : 'label-right'
    if (idx === total - 1) return 'label-left'
    if (idx % 2 === 1) return 'label-left'
    return 'label-right'
  }
  const myMoveSet = sampleMoves.find((entry) => entry.key === myMember.key)
  const myMovePool = movePoolByKey[myMember.key]
  const myMoveOptions = myMovePool?.moves?.length ? myMovePool.moves : moveOptionsForEntry(myMoveSet)
  const oppMoveSet = sampleMoves.find((entry) => entry.key === oppMember.key)
  const oppMovePool = movePoolByKey[oppMember.key]
  const oppMoveOptions = oppMovePool?.moves?.length ? oppMovePool.moves : moveOptionsForEntry(oppMoveSet)
  const oppTopSuggestedMoves = usageTopMovesForKey(oppMember.key)
  const myCalcAbility = calcMyKey === myMember.key ? myMember.ability : defaultAbilityForKey(calcMyKey)
  const oppCalcAbility = calcOppKey === oppMember.key ? oppMember.ability : defaultAbilityForKey(calcOppKey)
  const selectedMyAbility = resolveSelectedAbility(myRow, myCalcAbility, siteLanguage)
  const selectedOppAbility = oppRow ? resolveSelectedAbility(oppRow, oppCalcAbility, siteLanguage) : null
  const attackFromOpponent = calcSwapSides && Boolean(oppRow)
  const attackerRow = attackFromOpponent ? oppRow : myRow
  const defenderRow = attackFromOpponent ? myRow : oppRow
  const attackerMemberKey = attackFromOpponent ? oppMember.key : myMember.key
  const attackerAbilityValue = attackFromOpponent
    ? (selectedOppAbility?.slug ?? sanitizeAbilityForKey(attackerRow?.key ?? oppMember.key, oppMember.ability, false))
    : (selectedMyAbility?.slug ?? sanitizeAbilityForKey(attackerRow?.key ?? myMember.key, myMember.ability, true))
  const defenderAbilityValue = attackFromOpponent
    ? (selectedMyAbility?.slug ?? sanitizeAbilityForKey(defenderRow?.key ?? myMember.key, myMember.ability, true))
    : (selectedOppAbility?.slug ?? sanitizeAbilityForKey(defenderRow?.key ?? oppMember.key, oppMember.ability, false))
  const selectedAttackAbility = attackFromOpponent ? selectedOppAbility : selectedMyAbility
  const selectedDefenseAbility = attackFromOpponent ? selectedMyAbility : selectedOppAbility
  const attackerBattleStats = attackFromOpponent
    ? (oppRow ? buildOpponentBattleStats(attackingFormRow(oppRow, attackerAbilityValue), opponentBulkState, opponentOffenseState) : null)
    : buildPartyBattleStats(attackingFormRow(myRow, attackerAbilityValue), myMember)
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
    ? normalizeConditionalPowerValue(
        activeDamageMoveRule,
        activeDamageMove === '객기' && calcBurned
          ? true
          : (calcConditionalPowerValues[activeDamageMove] ?? activeDamageMoveRule.defaultValue),
      )
    : null
  const activeDamageMoveMeta = applyConditionalMovePower(
    activeDamageMove,
    applyTargetWeightMovePower(
      activeDamageMove,
      resolveAbilityAdjustedMoveMeta(
        activeDamageMove,
        resolveMultiHitMeta(activeDamageMove, activeDamageMoveBaseMeta, activeDamageMoveHitCount, attackerAbilityValue),
        attackerAbilityValue,
        calcWeather,
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

  React.useEffect(() => {
    if (!activeDamageMoveHitOptions?.length) return
    setCalcHitCount((prev) => (activeDamageMoveHitOptions.includes(prev) ? prev : activeDamageMoveHitOptions[0]))
  }, [activeDamageMove, activeDamageMoveHitOptions])
  const attackerAbilitySlug = attackerAbilityValue
  const defenderAbilitySlug = defenderAbilityValue
  const autoWeatherFromAbilities = React.useMemo(() => deriveAutoWeatherFromAbilities(attackerAbilitySlug, defenderAbilitySlug), [attackerAbilitySlug, defenderAbilitySlug])
  const autoTerrainFromAbilities = React.useMemo(() => deriveAutoTerrainFromAbilities(attackerAbilitySlug, defenderAbilitySlug), [attackerAbilitySlug, defenderAbilitySlug])
  const autoWeatherRef = React.useRef<DamageWeather>('none')
  React.useEffect(() => {
    const previousAutoWeather = autoWeatherRef.current
    if (autoWeatherFromAbilities === 'none') {
      if (calcWeather === previousAutoWeather && previousAutoWeather !== 'none') setCalcWeather('none')
      autoWeatherRef.current = 'none'
      return
    }
    if (calcWeather === 'none' || calcWeather === previousAutoWeather) {
      if (calcWeather !== autoWeatherFromAbilities) setCalcWeather(autoWeatherFromAbilities)
      autoWeatherRef.current = autoWeatherFromAbilities
      return
    }
    autoWeatherRef.current = autoWeatherFromAbilities
  }, [autoWeatherFromAbilities, calcWeather])
  const autoTerrainRef = React.useRef<DamageTerrain>('none')
  React.useEffect(() => {
    const previousAutoTerrain = autoTerrainRef.current
    if (autoTerrainFromAbilities === 'none') {
      if (calcTerrain === previousAutoTerrain && previousAutoTerrain !== 'none') setCalcTerrain('none')
      autoTerrainRef.current = 'none'
      return
    }
    if (calcTerrain === 'none' || calcTerrain === previousAutoTerrain) {
      if (calcTerrain !== autoTerrainFromAbilities) setCalcTerrain(autoTerrainFromAbilities)
      autoTerrainRef.current = autoTerrainFromAbilities
      return
    }
    autoTerrainRef.current = autoTerrainFromAbilities
  }, [autoTerrainFromAbilities, calcTerrain])
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
  const showDefenderDisguiseToggle = defenderAbilitySlug === 'disguise' || defenderAbilitySlug === '탈'
  React.useEffect(() => {
    if (showDefenderDisguiseToggle) {
      setCalcDefenderDisguise(true)
    }
  }, [showDefenderDisguiseToggle])
  const autoStab = resolveStabMultiplier(effectiveAttackerTypes, activeDamageMoveType, attackerAbilitySlug, calcTypeChangeStab)
  const autoEffectiveness = activeDamageMoveType && defenderRow ? abilityAdjustedTypeEffectiveness(activeDamageMoveType, effectiveDefenderTypes, defenderAbilitySlug, attackerAbilitySlug) : 1
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
      next[idx] = { ...member, key, ability: defaultAbilityForKey(key), item: normalizeItemForKey(key, member.item), config: { ...member.config, nature: defaultNatureForKey(key) } }
      setParty(next)
      setPartyItemDrafts((prev) => {
        const nextDrafts = [...prev]
        nextDrafts[idx] = displayItemLabel(visibleChampionsItem(key, next[idx].item), siteLanguage)
        return nextDrafts
      })
      const nextSearch = [...partySearch]
      nextSearch[idx] = searchDisplayLabel(key, siteLanguage)
      setPartySearch(nextSearch)
      const nextEmptyIdx = next.findIndex((entry, entryIdx) => entryIdx > idx && !entry.key)
      if (nextEmptyIdx >= 0) {
        window.setTimeout(() => {
          setActiveSearchField({ side: 'party', idx: nextEmptyIdx })
          setAutocompleteMenuOpen(`party-species-${nextEmptyIdx}`)
          partySpeciesInputRefs.current[nextEmptyIdx]?.focus()
        }, 0)
      }
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
      setSampleForge((prev) => ({ ...prev, key, ability: defaultAbilityForKey(key), item: normalizeItemForKey(key, prev.item), config: { ...prev.config, nature: defaultNatureForKey(key) } }))
      setSampleLockedMoves(confirmedMovesByKey[key] ?? [])
      setSampleItemDraft(displayItemLabel(visibleChampionsItem(key, normalizeItemForKey(key, sampleForge.item)), siteLanguage))
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
  const effectiveCalcMode = activeDamageMoveCategory ?? 'special'
  const effectiveMovePower = activeDamageMovePower ?? 0
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
    disguiseActive: calcDefenderDisguise,
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
    friendGuard: false,
  })
  const damageMovePreviews = registeredDamageMoves.map((moveName) => {
    const baseMeta = resolveMoveMeta(moveName, attackerMoveOptions, movePoolByKey)
    const hitOptions = multiHitOptions(moveName)
    const hitCount = moveName === activeDamageMove && hitOptions?.includes(calcHitCount)
      ? calcHitCount
      : (hitOptions?.[0] ?? null)
    const rule = CONDITIONAL_MOVE_POWER_RULES[moveName] ?? null
    const conditionValue = rule
      ? normalizeConditionalPowerValue(
          rule,
          moveName === '객기' && calcBurned
            ? true
            : (calcConditionalPowerValues[moveName] ?? rule.defaultValue),
        )
      : null
    const moveMeta = applyConditionalMovePower(
      moveName,
      applyTargetWeightMovePower(
        moveName,
        resolveAbilityAdjustedMoveMeta(
          moveName,
          resolveMultiHitMeta(moveName, baseMeta, hitCount, attackerAbilityValue),
          attackerAbilityValue,
          calcWeather,
        ),
        defenderWeightKg,
      ),
      conditionValue,
    )
    const moveType = moveMeta?.type ?? null
    const moveCategory = moveMeta?.category === 'physical' || moveMeta?.category === 'special' ? moveMeta.category : null
    const movePower = typeof moveMeta?.power === 'number' ? moveMeta.power : null
    if (!attackerBattleStats || !defenderBattleStats || !defenderRow || !moveCategory || movePower === null || moveMeta?.category === 'status') {
      return { moveName, moveType, damage: null, verdict: null }
    }
    const moveEffectiveness = moveType ? abilityAdjustedTypeEffectiveness(moveType, effectiveDefenderTypes, defenderAbilitySlug, attackerAbilitySlug) : effectiveness
    const modifiers = resolveDamageModifiers({
      attackerAbility: attackerAbilitySlug,
      attackerItem: attackFromOpponent ? oppMember.item : myMember.item,
      defenderAbility: defenderAbilitySlug,
      defenderItem: attackFromOpponent ? myMember.item : oppMember.item,
      moveName,
      baseMoveType: baseMeta?.type ?? null,
      moveType,
      movePower,
      mode: moveCategory,
      effectiveness: moveEffectiveness,
      attackStage: calcAttackStage,
      defenseStage: calcDefenseStage,
      defenderTypes: effectiveDefenderTypes,
      burned: calcBurned,
      attackerLowHp: calcAttackerLowHp,
      targetPoisoned: calcTargetPoisoned,
      defenderFullHp: calcDefenderFullHp,
      disguiseActive: calcDefenderDisguise,
      movedAfterTarget: calcMovedAfterTarget,
      faintedAllies: calcFaintedAllies,
      rivalryMode: calcRivalryMode,
      parentalBond: calcParentalBond,
      defenderStatused: calcDefenderStatused,
      electromorphosisCharged: calcElectromorphosisCharged,
      critical: calcCritical || Boolean(moveMeta?.alwaysCrit),
      weather: calcWeather,
      terrain: calcTerrain,
      reflect: calcReflect,
      lightScreen: calcLightScreen,
      auroraVeil: calcAuroraVeil,
      friendGuard: false,
    })
    const previewDamage = calcDamage(
      attackerBattleStats,
      defenderBattleStats,
      movePower,
      moveCategory,
      moveType ? resolveStabMultiplier(effectiveAttackerTypes, moveType, attackerAbilitySlug, calcTypeChangeStab) : stab,
      modifiers.effectiveness,
      moveMeta,
      modifiers,
    )
    if (!previewDamage) return { moveName, moveType, damage: null, verdict: null }
    return {
      moveName,
      moveType,
      damage: previewDamage,
      verdict: resolveDamageVerdict(previewDamage, defenderBattleStats.hp, siteLanguage),
    }
  })
  const damageMovePreviewByName = new Map(damageMovePreviews.map((preview) => [preview.moveName, preview]))
  const activeFieldConditionLabels = [
    calcWeather !== 'none' ? lt(calcWeather === 'sun' ? '쾌청' : calcWeather === 'rain' ? '비' : calcWeather === 'sand' ? '모래바람' : '싸라기눈') : null,
    calcTerrain !== 'none' ? lt(calcTerrain === 'electric' ? '일렉트릭필드' : calcTerrain === 'grassy' ? '그래스필드' : calcTerrain === 'psychic' ? '사이코필드' : '미스트필드') : null,
    calcReflect ? lt('리플렉터') : null,
    calcLightScreen ? lt('빛의장막') : null,
    calcAuroraVeil ? lt('오로라베일') : null,
  ].filter((value): value is string => Boolean(value))
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
  const applyOpponentOffensePresetSelection = (preset: OpponentOffensePreset) => {
    setCalcOpponentOffensePreset(preset)
    if (preset === 'custom') return
    const next = opponentOffenseStateFromPreset(preset)
    setCalcOpponentAttackEv(next.attackEv)
    setCalcOpponentSpAttackEv(next.spAttackEv)
    setCalcOpponentAttackNature(next.attackNature)
    setCalcOpponentSpAttackNature(next.spAttackNature)
  }
  const updateOpponentOffenseState = (patch: Partial<OpponentOffenseState>) => {
    const nextState = sanitizeOpponentOffenseState({ ...opponentOffenseState, ...patch }, 'custom')
    setCalcOpponentAttackEv(nextState.attackEv)
    setCalcOpponentSpAttackEv(nextState.spAttackEv)
    setCalcOpponentAttackNature(nextState.attackNature)
    setCalcOpponentSpAttackNature(nextState.spAttackNature)
    setCalcOpponentOffensePreset(detectOpponentOffensePreset(nextState))
  }
  const sampleMoveSet = sampleMoves.find((entry) => entry.key === sampleForge.key)
  const sampleMovePool = movePoolByKey[sampleForge.key]
  const sampleMoveOptions = sampleMovePool?.moves?.length ? sampleMovePool.moves : moveOptionsForEntry(sampleMoveSet)
  const sampleSpeciesMenuId = 'sample-species-0'
  const sampleSpeciesOptions = filterSpeciesOptions(sampleSearch ?? '', { includeMega: true }).slice(0, 8)
  const sampleItemMenuId = 'sample-item-0'
  const sampleItemOptions = filterItemOptions(sampleItemDraft || '', siteLanguage).slice(0, 8)
  const sampleMoveType = (moveName: string) => resolveMoveType(moveName, sampleMoveOptions, movePoolByKey)
  const sampleRegisteredMoves = [...sampleLockedMoves]
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
    setSampleLockedMoves((prev) => {
      const current = [...prev]
      while (current.length < 4) current.push('')
      current[slotIdx] = top.name
      return normalizeMoveSlots(current)
    })
    focusSampleSlot(nextOpenSampleSlot(nextMoves, slotIdx))
    return true
  }
  const selectSampleMoveOption = (slotIdx: number, moveName: string) => {
    const nextMoves = [...sampleRegisteredMoves]
    nextMoves[slotIdx] = moveName
    setSampleLockedMoves((prev) => {
      const current = [...prev]
      while (current.length < 4) current.push('')
      current[slotIdx] = moveName
      return normalizeMoveSlots(current)
    })
    focusSampleSlot(nextOpenSampleSlot(nextMoves, slotIdx))
  }
  const applySampleCandidateMove = (move: string, preferredSlotIdx: number) => {
    const nextMoves = [...sampleRegisteredMoves]
    const existingIdx = nextMoves.indexOf(move)
    if (existingIdx >= 0) nextMoves[existingIdx] = ''
    nextMoves[preferredSlotIdx] = move
    setSampleLockedMoves((prev) => {
      const current = [...prev]
      const existingIdx = current.indexOf(move)
      while (current.length < 4) current.push('')
      if (existingIdx >= 0) current[existingIdx] = ''
      current[preferredSlotIdx] = move
      return normalizeMoveSlots(current)
    })
    focusSampleSlot(nextOpenSampleSlot(nextMoves, preferredSlotIdx))
  }
  const sampleTopSuggestedMoves = usageTopMovesForKey(sampleForge.key)
  const sampleCuratedMoveBuckets = [
    { id: 'core' as const, label: lt('코어'), moves: sampleMoveSet?.core ?? [] },
    { id: 'options' as const, label: lt('선택'), moves: sampleMoveSet?.options ?? [] },
    { id: 'utility' as const, label: lt('유틸'), moves: sampleMoveSet?.utility ?? [] },
  ].filter((bucket) => bucket.moves.length)
  const sampleVisibleMoveBuckets = sampleCuratedMoveBuckets.filter((bucket) => sampleMoveFilter === 'all' || sampleMoveFilter === bucket.id)
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
  const sampleSpeedAbilityLine = sampleRow ? mySpeedAbilityMarker(sampleRow, sampleCalcMember, siteLanguage, calcWeather, calcTerrain) : null
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
      needs: mySpeedNeeds(sampleRow, sampleCalcConfig, sampleCalcMember.item, scenario.speed),
      result: sampleSpeedValueNow > scenario.speed ? lt('내가 앞섬') : sampleSpeedValueNow < scenario.speed ? lt('상대가 앞섬') : lt('동속'),
    }))
    return { idx, member, row, cutoffs }
  }).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
  const sampleDamageMoveChoices = Array.from(new Set(sampleRegisteredMoves.filter((move): move is string => Boolean(move.trim()))))
  const sampleAttackerStats = buildPartyBattleStats(sampleRow, sampleCalcMember)
  const sampleDamageSearchResults = filterSpeciesOptions(sampleDamageSearch, { includeMega: true })
    .filter((option) => !sampleDamageTargets.some((target) => target.key === option.key))
    .slice(0, 8)
  React.useEffect(() => {
    setSampleDamageTargets((prev) => {
      let changed = false
      const next = prev.map((entry) => {
        const fallbackMove = sampleDamageMoveChoices[0] ?? ''
        const nextMoveName = entry.moveName && sampleDamageMoveChoices.includes(entry.moveName) ? entry.moveName : fallbackMove
        if (nextMoveName === entry.moveName) return entry
        changed = true
        return { ...entry, moveName: nextMoveName }
      })
      return changed ? next : prev
    })
  }, [sampleDamageMoveChoices])

  React.useEffect(() => {
    const missingWeightTargets = sampleDamageTargets
      .map((member) => member.key ? (indexByKey.get(member.key) ?? null) : null)
      .filter((row): row is Row => Boolean(row && typeof row.id === 'number' && typeof row.key === 'string'))
      .filter((row) => typeof row.weightKg !== 'number' && typeof weightByKey[row.key] !== 'number')
    if (!missingWeightTargets.length) return
    let cancelled = false
    Array.from(new Map(missingWeightTargets.map((row) => [row.key, row])).values()).forEach((row) => {
      fetchPokemonWeightKg(row.id)
        .then((weightKg) => {
          if (cancelled) return
          setWeightByKey((prev) => prev[row.key] === weightKg ? prev : { ...prev, [row.key]: weightKg })
        })
        .catch(() => undefined)
    })
    return () => {
      cancelled = true
    }
  }, [sampleDamageTargets, weightByKey])
  const sampleAttackerAbilityValue = sampleRow ? (resolveSelectedAbility(sampleRow, sampleForge.ability, siteLanguage)?.slug ?? sanitizeAbilityForKey(sampleForge.key, sampleForge.ability, true)) : sampleForge.ability
  const damageSampleAttackerStats = buildPartyBattleStats(attackingFormRow(sampleRow, sampleAttackerAbilityValue), sampleCalcMember)
  const sampleBulkIndices = durabilityIndices(buildPartyBattleStats(sampleRow, sampleCalcMember))
  const sampleBaselineWeather = deriveAutoWeatherFromAbilities(sampleAttackerAbilityValue)
  const sampleBaselineTerrain = deriveAutoTerrainFromAbilities(sampleAttackerAbilityValue)
  const sampleDecisionPowerIndices = sampleDamageMoveChoices.map((moveName) => {
    const moveMetaBase = resolveMoveMeta(moveName, sampleMoveOptions, movePoolByKey)
    const defaultHitCount = multiHitOptions(moveName)?.[0] ?? null
    const moveRule = CONDITIONAL_MOVE_POWER_RULES[moveName] ?? null
    const moveMeta = applyConditionalMovePower(
      moveName,
      resolveAbilityAdjustedMoveMeta(
        moveName,
        resolveMultiHitMeta(moveName, moveMetaBase, defaultHitCount, sampleAttackerAbilityValue),
        sampleAttackerAbilityValue,
        sampleBaselineWeather,
      ),
      moveRule?.defaultValue,
    )
    if (!moveMeta || (moveMeta.category !== 'physical' && moveMeta.category !== 'special') || !moveMeta.type) {
      return { moveName, moveMeta, value: null, attackStat: null, stab: 1, notes: [] as string[] }
    }
    const attackerTypes = resolveAbilityAdjustedTypes(sampleRow.types, sampleAttackerAbilityValue, sampleBaselineWeather, sampleBaselineTerrain)
    const stab = resolveStabMultiplier(attackerTypes, moveMeta.type, sampleAttackerAbilityValue, true)
    const modifiers = resolveDamageModifiers({
      attackerAbility: sampleAttackerAbilityValue,
      attackerItem: sampleCalcMember.item,
      defenderAbility: '',
      defenderItem: '',
      moveName,
      baseMoveType: moveMetaBase?.type ?? moveMeta.type,
      moveType: moveMeta.type,
      movePower: moveMeta.power ?? null,
      mode: moveMeta.category,
      effectiveness: 1,
      attackStage: 0,
      defenseStage: 0,
      defenderTypes: [],
      burned: false,
      attackerLowHp: false,
      targetPoisoned: false,
      defenderFullHp: false,
      movedAfterTarget: false,
      faintedAllies: 0,
      rivalryMode: 'neutral',
      parentalBond: sampleAttackerAbilityValue === 'parental-bond',
      defenderStatused: false,
      electromorphosisCharged: false,
      weather: sampleBaselineWeather,
      terrain: sampleBaselineTerrain,
      reflect: false,
      lightScreen: false,
      auroraVeil: false,
      friendGuard: false,
      critical: false,
    })
    const attackStat = moveMeta.usesDefenseAsAttack
      ? damageSampleAttackerStats.defense
      : moveMeta.category === 'physical'
        ? damageSampleAttackerStats.attack
        : damageSampleAttackerStats.spAttack
    return {
      moveName,
      moveMeta,
      value: decisionPowerIndex(damageSampleAttackerStats, moveMeta, stab, modifiers),
      attackStat,
      stab,
      notes: modifiers.notes,
    }
  })
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
  const sampleShowDefenderDisguiseToggle = sampleDamageDefenderAbilitySlugs.some((ability) => ability === 'disguise' || ability === '탈')
  const sampleDamageOffenseConditionLabels = [
    calcTypeChangeStab && sampleUsesTypeChangeStabAbility ? lt('타입변환 자속') : null,
    calcCritical ? lt('급소') : null,
    calcBurned ? lt('화상') : null,
    calcAttackerLowHp && sampleShowAttackerLowHpToggle ? lt('공격측 HP 1/3 이하') : null,
    calcTargetPoisoned && sampleShowTargetPoisonedToggle ? lt('상대 독/맹독') : null,
    calcMovedAfterTarget && sampleShowMovedAfterTargetToggle ? lt('상대보다 늦게 행동') : null,
    calcDefenderStatused && sampleShowDefenderStatusedToggle ? lt('상대 상태이상') : null,
    calcParentalBond && sampleShowParentalBondToggle ? lt('부자유친 발동') : null,
    calcElectromorphosisCharged && sampleShowElectromorphosisToggle ? lt('일렉트릭 차지됨') : null,
    calcDefenderFullHp && sampleShowDefenderFullHpToggle ? lt('상대 HP 만땅') : null,
    calcDefenderDisguise && sampleShowDefenderDisguiseToggle ? '탈 intact' : null,
    calcAttackStage !== 0 ? `${lt('공격측 화력 랭크')} ${calcAttackStage > 0 ? `+${calcAttackStage}` : calcAttackStage}` : null,
    calcDefenseStage !== 0 ? `${lt('방어측 내구 랭크')} ${calcDefenseStage > 0 ? `+${calcDefenseStage}` : calcDefenseStage}` : null,
    sampleShowFaintedAlliesInput && calcFaintedAllies > 0 ? `${lt('기절한 아군 수')} ${calcFaintedAllies}` : null,
    sampleShowRivalryModeInput && calcRivalryMode !== 'neutral' ? `${lt('라이벌리 성별 관계')} ${lt(calcRivalryMode === 'same' ? '같은 성별' : '다른 성별')}` : null,
  ].filter((value): value is string => Boolean(value))
  const sampleDamageFieldConditionLabels = [
    calcWeather !== 'none' ? lt(calcWeather === 'sun' ? '쾌청' : calcWeather === 'rain' ? '비' : calcWeather === 'sand' ? '모래바람' : '싸라기눈') : null,
    calcTerrain !== 'none' ? lt(calcTerrain === 'electric' ? '일렉트릭필드' : calcTerrain === 'grassy' ? '그래스필드' : calcTerrain === 'psychic' ? '사이코필드' : '미스트필드') : null,
    calcReflect ? lt('리플렉터') : null,
    calcLightScreen ? lt('빛의장막') : null,
    calcAuroraVeil ? lt('오로라베일') : null,
    calcFriendGuard ? lt('프렌드가드') : null,
  ].filter((value): value is string => Boolean(value))
  React.useEffect(() => {
    if (sampleShowDefenderDisguiseToggle) {
      setCalcDefenderDisguise(true)
    }
  }, [sampleShowDefenderDisguiseToggle])
  const sampleDamageCalcs = sampleDamageTargets.map((member, idx) => {
    const row = member.key ? (indexByKey.get(member.key) ?? null) : null
    const defenderAbilityValue = row ? (resolveSelectedAbility(row, member.ability, siteLanguage)?.slug ?? sanitizeAbilityForKey(member.key, member.ability, false)) : member.ability
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
          calcWeather,
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
          ? lt('변화기는 대미지 계산 대상이 아님')
          : (!movePower || !moveCategory || !moveType)
            ? lt('대미지 계산 불가')
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
      return { idx, member, row, moveName, moveCategory, movePower, attackStatLabel: moveCategory === 'physical' ? '공격' : '특수공격', attackStatValue: moveCategory === 'physical' ? damageSampleAttackerStats.attack : damageSampleAttackerStats.spAttack, defenderStats, damage: null, verdict: unavailableReason, moveRule, moveConditionValue, moveHitOptions, moveHitCount, moveHitSummary: multiHitSummary(moveName, moveMeta, moveHitCount), targetWeightKnown: typeof targetWeightKg === 'number', unavailableReason }
    }
    const effectivenessValue = abilityAdjustedTypeEffectiveness(moveType, effectiveDefenderTypes, defenderAbilityValue, attackerAbilityValue)
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
      disguiseActive: calcDefenderDisguise,
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
    const attackStatValue = moveCategory === 'physical' ? damageSampleAttackerStats.attack : damageSampleAttackerStats.spAttack
    const damage = calcDamage(damageSampleAttackerStats, defenderStats, movePower, moveCategory, resolveStabMultiplier(effectiveAttackerTypes, moveType, sampleAttackerAbilityValue, calcTypeChangeStab), modifierPack.effectiveness, moveMeta, modifierPack)
    return { idx, member, row, moveName, moveCategory, movePower, attackStatLabel, attackStatValue, defenderStats, damage, verdict: damage ? resolveDamageVerdict(damage, defenderStats.hp, siteLanguage) : lt('대미지 계산 불가'), moveRule, moveConditionValue, moveHitOptions, moveHitCount, moveHitSummary: multiHitSummary(moveName, moveMeta, moveHitCount), targetWeightKnown: typeof targetWeightKg === 'number', unavailableReason: damage ? null : lt('대미지 계산 불가') }
  })

  const addSampleSpeedTarget = (key: string) => {
    setSampleSpeedTargets([{ ...blankSampleSpeedTarget(), key }])
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
    setSampleDamageTargets([{ ...blankSampleDamageTarget(), key, moveName: sampleDamageMoveChoices[0] ?? '' }])
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
    if (sampleWorkbenchTab !== 'builder') {
      setSampleWorkbenchTab('builder')
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
      return
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const applyMemberToPartySlot = (member: PartyMember, slotIdx: number, lockedMoves?: string[]) => {
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
    if (member.key) {
      setConfirmedMovesByKey((prev) => ({
        ...prev,
        [member.key]: (lockedMoves ?? prev[member.key] ?? []).filter(Boolean).slice(0, 4),
      }))
    }
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

  const applyPartyPreset = (presetParty: PartyMember[], presetLockedMovesBySlot: string[][], presetId?: string | null) => {
    const nextParty = clonePartyList(sanitizeParty(presetParty))
    const nextLockedMovesBySlot = sanitizeLockedMoveSlots(presetLockedMovesBySlot, nextParty.length)
    const nextConfirmedMovesByKey = Object.fromEntries(
      nextParty
        .map((member, idx) => [member.key, nextLockedMovesBySlot[idx] ?? []] as const)
        .filter(([key]) => Boolean(key))
    )
    setParty(nextParty)
    setConfirmedMovesByKey(nextConfirmedMovesByKey)
    setPartySearch(nextParty.map((member) => searchDisplayLabel(member.key, siteLanguage)))
    setPartyItemDrafts(nextParty.map((member) => displayItemLabel(visibleChampionsItem(member.key, member.item), siteLanguage)))
    setSelectedMy(0)
    setActivePartyMetaEditor(null)
    setActiveMetaListField(null)
    setActiveItemField((prev) => prev?.scope === 'party' ? null : prev)
    setActiveMoveField((prev) => prev?.scope === 'party' ? null : prev)
    setTuningModalIndex(null)
    setActivePartyPresetId(presetId ?? null)
  }

  const buildPartyPresetLockedMoves = () => party.map((member) => {
    if (!member.key) return []
    return (confirmedMovesByKey[member.key] ?? []).filter(Boolean).slice(0, 4)
  })

  const saveNewPartyPreset = () => {
    const label = partyPresetLabelDraft.trim() || `${lt('파티 이름')} ${savedPartyPresets.length + 1}`
    const nextPreset: SavedPartyPreset = {
      id: `party-${Date.now()}`,
      label,
      party: clonePartyList(party),
      lockedMovesBySlot: buildPartyPresetLockedMoves(),
    }
    setSavedPartyPresets((prev) => [nextPreset, ...prev])
    setActivePartyPresetId(nextPreset.id)
    setPartyPresetLabelDraft('')
  }

  const overwriteActivePartyPreset = () => {
    if (!activePartyPresetId) {
      saveNewPartyPreset()
      return
    }
    setSavedPartyPresets((prev) => prev.map((entry) => entry.id === activePartyPresetId ? {
      ...entry,
      label: partyPresetLabelDraft.trim() || entry.label,
      party: clonePartyList(party),
      lockedMovesBySlot: buildPartyPresetLockedMoves(),
    } : entry))
    setPartyPresetLabelDraft('')
  }

  const renamePartyPreset = (preset: SavedPartyPreset) => {
    if (typeof window === 'undefined') return
    const nextLabel = window.prompt(lt('파티 이름'), preset.label)?.trim()
    if (!nextLabel) return
    setSavedPartyPresets((prev) => prev.map((entry) => entry.id === preset.id ? { ...entry, label: nextLabel } : entry))
  }

  const saveCurrentSample = () => {
    const label = sampleLabelDraft.trim() || `${displayName(sampleRow, siteLanguage)} · ${natureLabel(sampleForge.config.nature, siteLanguage)}`
    const saved: SavedSample = {
      id: `sample-${Date.now()}`,
      label,
      member: { ...sampleForge, evs: { ...sampleForge.evs }, config: { ...sampleForge.config }, tuning: { ...sampleForge.tuning } },
      lockedMoves: sampleLockedMoves.filter(Boolean).slice(0, 4),
    }
    setSavedSamples((prev) => [saved, ...prev])
    setSampleLabelDraft('')
  }

  const applySampleToPartySlot = (slotIdx: number) => {
    applyMemberToPartySlot(sampleForge, slotIdx, sampleLockedMoves.filter(Boolean).slice(0, 4))
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
            <div className={`effort-gauge-track ${statThemeClass(stat.key)}`} tabIndex={0} role="slider" aria-label={`${lt(stat.label)} effort points`} aria-valuemin={0} aria-valuemax={availableCap} aria-valuenow={currentEffort} onKeyDown={(e) => { if (e.target !== e.currentTarget) return; if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeSampleEffort(stat.key, -1, availableCap) } if (e.key === 'ArrowRight') { e.preventDefault(); nudgeSampleEffort(stat.key, 1, availableCap) } }} onPointerDown={(e) => { e.preventDefault(); focusEffortRange(e.currentTarget); e.currentTarget.setPointerCapture(e.pointerId); updateSampleEffortFromPointer(stat.key, availableCap, e.clientX, e.currentTarget) }} onPointerMove={(e) => { if ((e.buttons & 1) !== 1) return; updateSampleEffortFromPointer(stat.key, availableCap, e.clientX, e.currentTarget) }} onPointerUp={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId) }}>
              <div className={`effort-gauge-cells ${statThemeClass(stat.key)}`} aria-hidden="true">{Array.from({ length: CHAMPIONS_EFFORT_PER_STAT_CAP }, (_, cellIdx) => { const point = cellIdx + 1; const reachable = point <= availableCap; const filled = point <= currentEffort; const magicPoint = magicPoints.includes(point); const currentPoint = point === currentEffort && currentEffort > 0; const checkpointPoint = EFFORT_CHECKPOINTS.includes(point as 11 | 22 | 32); const targetPoint = point === targetEffort; return <span key={`${scope}-sample-effort-cell-${stat.key}-${point}`} className={['effort-gauge-cell', reachable ? 'reachable' : 'locked', filled ? 'filled' : '', magicPoint ? 'magic' : '', currentPoint ? 'current' : '', checkpointPoint ? 'checkpoint' : '', targetPoint ? 'target' : ''].filter(Boolean).join(' ')} title={`${lt(stat.label)} ${point}pt`} /> })}</div>
              <input type="range" className="effort-gauge-range" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} step={1} value={currentEffort} onKeyDown={(e) => { if (e.target !== e.currentTarget) return; if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeSampleEffort(stat.key, -1, availableCap) } if (e.key === 'ArrowRight') { e.preventDefault(); nudgeSampleEffort(stat.key, 1, availableCap) } }} onChange={(e) => setSampleForge((prev) => ({ ...prev, evs: applyChampionsEffort(prev.evs, stat.key, e.target.value) }))} />
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

  const clearOpponentSlot = (idx: number) => {
    setOpponents((prev) => prev.map((member, memberIdx) => memberIdx === idx ? { ...emptyOpponents[idx], revealedMoves: [...emptyOpponents[idx].revealedMoves] } : member))
    setOpponentSearch((prev) => prev.map((value, valueIdx) => valueIdx === idx ? '' : value))
    setOpponentItemDrafts((prev) => prev.map((value, valueIdx) => valueIdx === idx ? '' : value))
    setOpponentAbilityDrafts((prev) => prev.map((value, valueIdx) => valueIdx === idx ? '' : value))
    setActiveOpponentAbilityField((prev) => prev === idx ? null : prev)
    setActiveSearchField((prev) => sameSearchTarget(prev, 'opponent', idx) ? null : prev)
    setActiveItemField((prev) => sameItemField(prev, 'opponent', idx) ? null : prev)
    setActiveMoveField((prev) => prev?.scope === 'opponent' && prev.key === opponents[idx]?.key ? null : prev)
    if (selectedOpp === idx) setSelectedOpp(0)
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
    setCalcDefenderDisguise(false)
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
    setSampleLockedMoves([])
    setSampleItemDraft(displayItemLabel(visibleChampionsItem(defaultSampleForge().key, defaultSampleForge().item), siteLanguage))
    setSampleSearch(searchDisplayLabel(defaultSampleForge().key, siteLanguage))
    setSavedSamples([])
    setSavedPartyPresets([])
    setPartyPresetLabelDraft('')
    setActivePartyPresetId(null)
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
      calcDefenderDisguise,
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
      calcOpponentOffensePreset,
      calcOpponentAttackEv,
      calcOpponentSpAttackEv,
      calcOpponentAttackNature,
      calcOpponentSpAttackNature,
      battleNote,
      confirmedMovesByKey,
      mainSection,
      sampleForge,
      sampleLockedMoves,
      savedSamples,
      savedPartyPresets,
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
      setCalcDefenderDisguise(Boolean(parsed.calcDefenderDisguise))
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
      const nextOffensePreset = sanitizeOpponentOffensePreset(parsed.calcOpponentOffensePreset)
      const nextOffenseState = sanitizeOpponentOffenseState({
        attackEv: parsed.calcOpponentAttackEv,
        spAttackEv: parsed.calcOpponentSpAttackEv,
        attackNature: parsed.calcOpponentAttackNature,
        spAttackNature: parsed.calcOpponentSpAttackNature,
      }, nextOffensePreset)
      setCalcOpponentOffensePreset(nextOffensePreset)
      setCalcOpponentAttackEv(nextOffenseState.attackEv)
      setCalcOpponentSpAttackEv(nextOffenseState.spAttackEv)
      setCalcOpponentAttackNature(nextOffenseState.attackNature)
      setCalcOpponentSpAttackNature(nextOffenseState.spAttackNature)
      setBattleNote(typeof parsed.battleNote === 'string' ? parsed.battleNote : '')
      const nextConfirmedMovesByKey = sanitizeConfirmedMovesByKey(parsed.confirmedMovesByKey)
      setConfirmedMovesByKey(nextConfirmedMovesByKey)
      setMainSection(parsed.mainSection ?? 'home')
      const nextSampleForge = parsed.sampleForge ? sanitizeParty([parsed.sampleForge])[0] ?? defaultSampleForge() : defaultSampleForge()
      setSampleForge(nextSampleForge)
      setSampleLockedMoves(parsed.sampleLockedMoves ? sanitizeMoveSlotList(parsed.sampleLockedMoves) : nextConfirmedMovesByKey[nextSampleForge.key] ?? [])
      setSampleItemDraft(displayItemLabel(visibleChampionsItem(nextSampleForge.key, nextSampleForge.item), siteLanguage))
      setSampleSearch(searchDisplayLabel(nextSampleForge.key, siteLanguage))
      setSavedSamples(sanitizeSavedSamples(parsed.savedSamples))
      setSavedPartyPresets(sanitizeSavedPartyPresets(parsed.savedPartyPresets))
      setActivePartyPresetId(null)
      setSampleLabelDraft('')
    } catch {
      if (typeof window !== 'undefined') window.alert(lt('불러오기 실패: JSON 형식을 확인하세요.'))
    } finally {
      event.target.value = ''
    }
  }

  const applyOcrImportedParty = React.useCallback((imported: OcrImportedPartyMember[]) => {
    const nextParty = cloneEmptyParty()
    const nextConfirmedMovesByKey = { ...confirmedMovesByKey }
    imported.slice(0, nextParty.length).forEach((entry, idx) => {
      nextParty[idx] = clonePartyMember(entry.member)
      nextConfirmedMovesByKey[entry.member.key] = entry.lockedMoves
    })
    setParty(nextParty)
    setConfirmedMovesByKey(nextConfirmedMovesByKey)
    setPartySearch(nextParty.map((member) => searchDisplayLabel(member.key, siteLanguage)))
    setPartyItemDrafts(nextParty.map((member) => displayItemLabel(visibleChampionsItem(member.key, member.item), siteLanguage)))
    setSelectedMy(firstFilledIndex(nextParty, 0))
  }, [confirmedMovesByKey, siteLanguage])

  const importPartyFromImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length || partyImageImportBusy) return
    try {
      setPartyImageImportBusy(true)
      setPartyImageImportStatus(lt('OCR 준비 중...'))
      const Tesseract = await import('tesseract.js')
      const recognize = async (image: File | HTMLCanvasElement, fileLabel: string) => {
        const result = await Tesseract.recognize(image, 'jpn+eng+kor', {
          logger: (message) => {
            if (message.status === 'recognizing text' && typeof message.progress === 'number') {
              setPartyImageImportStatus(`${fileLabel} · ${lt('OCR 추출 중...')} ${Math.round(message.progress * 100)}%`)
            }
          },
        })
        return result.data.text
      }
      const documents: string[] = []
      for (const file of files) {
        setPartyImageImportStatus(`${file.name} · ${lt('레이아웃 OCR 분석 중...')}`)
        const text = await recognize(file, file.name)
        documents.push(text)
      }
      const imported = parseOcrImportedPartyDocuments(documents)
      if (!imported.length) {
        setPartyImageImportStatus(lt('사진에서 파티를 찾지 못했습니다.'))
        if (typeof window !== 'undefined') window.alert(lt('사진에서 포켓몬 이름을 찾지 못했습니다. 조금 더 선명한 스크린샷으로 다시 시도해 주세요.'))
        return
      }
      const summary = imported.slice(0, 6).map((entry) => {
        const nature = natureChipLabel(entry.member.config.nature, siteLanguage)
        const moves = entry.lockedMoves.slice(0, 2).join(', ')
        return `${searchDisplayLabel(entry.member.key, siteLanguage)}${nature ? ` · ${nature}` : ''}${moves ? ` · ${moves}` : ''}`
      }).join('\n')
      if (typeof window !== 'undefined') {
        const confirmed = window.confirm(`${lt('다음 파티를 가져올까요?')}\n${summary}`)
        if (!confirmed) {
          setPartyImageImportStatus(lt('사진 IMPORT가 취소되었습니다.'))
          return
        }
      }
      applyOcrImportedParty(imported)
      setPartyImageImportStatus(`${lt('사진 IMPORT 완료')} · ${imported.length}${lt('마리 반영')}`)
    } catch (error) {
      console.error(error)
      setPartyImageImportStatus(lt('사진 IMPORT 실패'))
      if (typeof window !== 'undefined') window.alert(lt('사진 IMPORT에 실패했습니다. 잠시 후 다시 시도해 주세요.'))
    } finally {
      setPartyImageImportBusy(false)
      event.target.value = ''
    }
  }

  return (
    <div className="app-shell">
      <header>
        <div className="header-top-row">
          <div className="header-title-row">
            <div className="header-title-stack">
              <div className="header-main-row">
                <div>
                  <h1>{lt('포켓몬 챔피언스 배틀 도우미')}</h1>
                  <p>{mainSection === 'home' ? lt('포켓몬 챔피언스 배틀에서 파티·선출·스피드·대미지를 한 번에 정리합니다.') : menuLabelForSection(mainSection, activeTab, siteLanguage)}</p>
                </div>
                <div className="header-utility-row">
                  <div className="header-icon-actions">
                  <div className="language-menu-wrap header-language-wrap">
                    <button type="button" className="icon-button" aria-label={lt('언어 선택')} title={lt('언어')} onClick={() => { setLanguageMenuOpen((prev) => !prev); setSettingsMenuOpen(false) }}>
                      <LanguageIcon />
                    </button>
                    {languageMenuOpen ? (
                      <div className="language-menu">
                        <button type="button" className={`language-menu-item ${siteLanguage === 'ko' ? 'active' : ''}`} onClick={() => { setSiteLanguage('ko'); setLanguageMenuOpen(false) }}>{lt('한국어')}</button>
                        <button type="button" className={`language-menu-item ${siteLanguage === 'ja' ? 'active' : ''}`} onClick={() => { setSiteLanguage('ja'); setLanguageMenuOpen(false) }}>{lt('일본어')}</button>
                        <button type="button" className={`language-menu-item ${siteLanguage === 'en' ? 'active' : ''}`} onClick={() => { setSiteLanguage('en'); setLanguageMenuOpen(false) }}>{lt('영어')}</button>
                      </div>
                    ) : null}
                  </div>
                  <div className="settings-menu-wrap">
                    <button type="button" className="icon-button" aria-label={lt('설정')} title={lt('설정')} onClick={() => { setSettingsMenuOpen((prev) => !prev); setLanguageMenuOpen(false) }}>
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
              </div>
              <div className="header-primary-tabs" role="tablist" aria-label={lt('모드 선택')}>
                <button type="button" className={`header-primary-tab ${mainSection === 'home' ? 'active' : ''}`} onClick={() => setMainSection('home')}>{lt('홈')}</button>
                <button type="button" className={`header-primary-tab ${mainSection === 'single' ? 'active' : ''}`} onClick={() => { setMainSection('single'); if (!['party', 'pick', 'speed', 'power'].includes(activeTab)) setActiveTab('party') }}>{lt('싱글배틀 메뉴')}</button>
                <button type="button" className={`header-primary-tab ${mainSection === 'double' ? 'active' : ''}`} onClick={() => { setMainSection('double'); if (!['party', 'pick', 'power'].includes(activeTab)) setActiveTab('party'); if (activeTab === 'speed') setActiveTab('power') }}>{lt('더블배틀 메뉴')}</button>
                <button type="button" className={`header-primary-tab ${mainSection === 'sample' ? 'active' : ''}`} onClick={() => setMainSection('sample')}>{lt('포켓몬 샘플 깎기')}</button>
                <button type="button" className={`header-primary-tab ${mainSection === 'dex' ? 'active' : ''}`} onClick={() => setMainSection('dex')}>{lt('도감')}</button>
              </div>
            </div>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden-file" onChange={importState} />
        <input ref={partyImageInputRef} type="file" accept="image/*" multiple className="hidden-file" onChange={importPartyFromImage} />
      </header>

      {doubleBulkEditorSlot !== null ? (() => {
        const modalSlot = doubleBulkEditorSlot
        const modalMeta = doubleSlotMeta[modalSlot]
        if (modalMeta.side !== 'opp' || !modalMeta.option?.entry || !modalMeta.option?.row) return null
        const modalEntry = modalMeta.option.entry
        const modalRow = modalMeta.option.row
        const modalName = displayName(modalRow, siteLanguage)
        const modalEvs = opponentEffortValues(modalEntry)
        const visibleStats = EFFORT_STAT_OPTIONS.filter((stat): stat is { key: Extract<EffortStatKey, 'hp' | 'defense' | 'spDefense' | 'speed'>, short: string, label: string } => stat.key === 'hp' || stat.key === 'defense' || stat.key === 'spDefense' || stat.key === 'speed')
        return <div className="modal-backdrop" onClick={() => setDoubleBulkEditorSlot(null)}>
          <div className="modal-card double-opponent-modal" onClick={(e) => e.stopPropagation()}>
            <div className="row-between modal-header double-opponent-modal-header">
              <div className="double-opponent-modal-title-wrap">
                {modalRow.sprite ? <img src={modalRow.sprite} alt={modalName} className="double-opponent-modal-sprite" /> : null}
                <div className="double-opponent-modal-title-copy">
                  <h2>{modalName} · {lt('노력치 보정')}</h2>
                </div>
              </div>
              <button type="button" className="action-button double-opponent-modal-close" onClick={() => setDoubleBulkEditorSlot(null)}>{lt('닫기')}</button>
            </div>
            <div className="modal-grid double-opponent-modal-grid">
              <label className="double-opponent-modal-control double-opponent-modal-control-check">
                <span>{lt('최속 가정')}</span>
                <input type="checkbox" checked={modalEntry.natureBoost} onChange={(e) => updateDoubleOpponentBulk(modalSlot, { natureBoost: e.target.checked })} />
              </label>
              <label className="double-opponent-modal-control double-opponent-modal-control-check">
                <span>{lt('스카프')}</span>
                <input type="checkbox" checked={modalEntry.scarf} onChange={(e) => updateDoubleOpponentBulk(modalSlot, { scarf: e.target.checked })} />
              </label>
              <label className="double-opponent-modal-control">
                <span>{lt('랭크')}</span>
                <select value={modalEntry.speedStage} onChange={(e) => updateDoubleOpponentBulk(modalSlot, { speedStage: clampSpeedStage(e.target.value) })}>
                  {SPEED_STAGE_OPTIONS.map((n) => <option key={`double-bulk-modal-stage-${modalSlot}-${n}`} value={n}>{n >= 0 ? `+${n}` : n}</option>)}
                </select>
              </label>
            </div>
            <div className="pick-summary-badges double-opponent-modal-chips">
              <label className={`double-opponent-modal-toggle-chip ${modalEntry.defenseNature === 1.1 ? 'active' : ''}`}>
                <input type="checkbox" checked={modalEntry.defenseNature === 1.1} onChange={(e) => updateDoubleOpponentBulk(modalSlot, { defenseNature: e.target.checked ? 1.1 : 1 })} />
                <span>{lt('+방어 성격')}</span>
              </label>
              <label className={`double-opponent-modal-toggle-chip ${modalEntry.spDefenseNature === 1.1 ? 'active' : ''}`}>
                <input type="checkbox" checked={modalEntry.spDefenseNature === 1.1} onChange={(e) => updateDoubleOpponentBulk(modalSlot, { spDefenseNature: e.target.checked ? 1.1 : 1 })} />
                <span>{lt('+특방 성격')}</span>
              </label>
              <span className="double-opponent-modal-total-meta">{lt('노력치 합')} {totalEffortPoints(modalEvs)}</span>
            </div>
            <div className="drag-stat-list double-opponent-drag-stat-list">
              {visibleStats.map((stat) => {
                const currentEffort = modalEvs[stat.key]
                const availableCap = Math.min(CHAMPIONS_EFFORT_PER_STAT_CAP, remainingEffortPoints(modalEvs, stat.key))
                const additionalAvailable = Math.max(0, availableCap - currentEffort)
                const actualValue = opponentStatValue(modalRow, modalEntry, stat.key)
                return <div key={`double-opponent-effort-${modalSlot}-${stat.key}`} className={`drag-stat-card ${statThemeClass(stat.key)}`}>
                  <div className="row-between"><strong>{lt(stat.label)}</strong><span>{actualValue}</span></div>
                  <div className="effort-gauge-wrap" role="group" aria-label={`${lt(stat.label)} effort points`}>
                    <div className={`effort-gauge-track ${statThemeClass(stat.key)}`} tabIndex={0} role="slider" aria-label={`${lt(stat.label)} effort points`} aria-valuemin={0} aria-valuemax={availableCap} aria-valuenow={currentEffort} onKeyDown={(e) => { if (e.target !== e.currentTarget) return; if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeDoubleOpponentEffort(modalSlot, stat.key, -1, availableCap) } if (e.key === 'ArrowRight') { e.preventDefault(); nudgeDoubleOpponentEffort(modalSlot, stat.key, 1, availableCap) } }} onPointerDown={(e) => { e.preventDefault(); focusEffortRange(e.currentTarget); e.currentTarget.setPointerCapture(e.pointerId); updateDoubleOpponentEffortFromPointer(modalSlot, stat.key, availableCap, e.clientX, e.currentTarget) }} onPointerMove={(e) => { if ((e.buttons & 1) !== 1) return; updateDoubleOpponentEffortFromPointer(modalSlot, stat.key, availableCap, e.clientX, e.currentTarget) }} onPointerUp={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId) }}>
                      <div className={`effort-gauge-cells ${statThemeClass(stat.key)}`} aria-hidden="true">{Array.from({ length: CHAMPIONS_EFFORT_PER_STAT_CAP }, (_, cellIdx) => { const point = cellIdx + 1; const reachable = point <= availableCap; const filled = point <= currentEffort; const currentPoint = point === currentEffort && currentEffort > 0; const checkpointPoint = EFFORT_CHECKPOINTS.includes(point as 11 | 22 | 32); return <span key={`double-opponent-effort-cell-${modalSlot}-${stat.key}-${point}`} className={['effort-gauge-cell', reachable ? 'reachable' : 'locked', filled ? 'filled' : '', currentPoint ? 'current' : '', checkpointPoint ? 'checkpoint' : ''].filter(Boolean).join(' ')} title={`${lt(stat.label)} ${point}pt`} /> })}</div>
                      <input type="range" className="effort-gauge-range" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} step={1} value={currentEffort} onKeyDown={(e) => { if (e.target !== e.currentTarget) return; if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeDoubleOpponentEffort(modalSlot, stat.key, -1, availableCap) } if (e.key === 'ArrowRight') { e.preventDefault(); nudgeDoubleOpponentEffort(modalSlot, stat.key, 1, availableCap) } }} onChange={(e) => { const evs = applyChampionsEffort(modalEvs, stat.key, e.target.value); updateDoubleOpponentBulk(modalSlot, opponentPatchFromEffortValues(evs)) }} />
                    </div>
                    <div className={`effort-gauge-scale ${statThemeClass(stat.key)}`}>{EFFORT_CHECKPOINTS.map((checkpoint) => <div key={`double-opponent-effort-scale-${modalSlot}-${stat.key}-${checkpoint}`} className="effort-gauge-scale-item"><span>{checkpoint}pt</span><small>{opponentStatValue(modalRow, { ...modalEntry, ...opponentPatchFromEffortValues({ ...modalEvs, [stat.key]: checkpoint }) }, stat.key)}</small></div>)}</div>
                  </div>
                  <div className="effort-cell-toolbar"><button type="button" className="mini-action" onClick={() => nudgeDoubleOpponentEffort(modalSlot, stat.key, -1, availableCap)} disabled={currentEffort <= 0}>-1</button><button type="button" className="mini-action" onClick={() => { const evs = applyChampionsEffort(modalEvs, stat.key, 0); updateDoubleOpponentBulk(modalSlot, opponentPatchFromEffortValues(evs)) }} disabled={currentEffort <= 0}>{lt('최소')}</button><button type="button" className="mini-action" onClick={() => { const evs = applyChampionsEffort(modalEvs, stat.key, availableCap); updateDoubleOpponentBulk(modalSlot, opponentPatchFromEffortValues(evs)) }} disabled={currentEffort >= availableCap}>{lt('최대')}</button><button type="button" className="mini-action" onClick={() => nudgeDoubleOpponentEffort(modalSlot, stat.key, 1, availableCap)} disabled={currentEffort >= availableCap}>+1</button></div>
                  <div className="row-between effort-cell-meta"><span className="muted-inline">{lt('현재')} {currentEffort}pt · {lt('추가 가능')} {additionalAvailable}pt</span></div>
                </div>
              })}
            </div>
          </div>
        </div>
      })() : null}

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
                      <div className={`effort-gauge-track ${statThemeClass(stat.key)}`} tabIndex={0} role="slider" aria-label={`${lt(stat.label)} effort points`} aria-valuemin={0} aria-valuemax={availableCap} aria-valuenow={currentEffort} onKeyDown={(e) => { if (e.target !== e.currentTarget) return; if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeTuningEffort(tuningModalIndex, stat.key, -1, availableCap) } if (e.key === 'ArrowRight') { e.preventDefault(); nudgeTuningEffort(tuningModalIndex, stat.key, 1, availableCap) } }} onPointerDown={(e) => { e.preventDefault(); focusEffortRange(e.currentTarget); e.currentTarget.setPointerCapture(e.pointerId); updateTuningEffortFromPointer(tuningModalIndex, stat.key, availableCap, e.clientX, e.currentTarget) }} onPointerMove={(e) => { if ((e.buttons & 1) !== 1) return; updateTuningEffortFromPointer(tuningModalIndex, stat.key, availableCap, e.clientX, e.currentTarget) }} onPointerUp={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId) }}>
                        <div className={`effort-gauge-cells ${statThemeClass(stat.key)}`} aria-hidden="true">{Array.from({ length: CHAMPIONS_EFFORT_PER_STAT_CAP }, (_, cellIdx) => { const point = cellIdx + 1; const reachable = point <= availableCap; const filled = point <= currentEffort; const magicPoint = magicPoints.includes(point); const currentPoint = point === currentEffort && currentEffort > 0; const checkpointPoint = EFFORT_CHECKPOINTS.includes(point as 11 | 22 | 32); const targetPoint = point === targetEffort; return <span key={`effort-cell-${stat.key}-${point}`} className={['effort-gauge-cell', reachable ? 'reachable' : 'locked', filled ? 'filled' : '', magicPoint ? 'magic' : '', currentPoint ? 'current' : '', checkpointPoint ? 'checkpoint' : '', targetPoint ? 'target' : ''].filter(Boolean).join(' ')} title={`${lt(stat.label)} ${point}pt`} /> })}</div>
                        <input type="range" className="effort-gauge-range" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} step={1} value={currentEffort} onKeyDown={(e) => { if (e.target !== e.currentTarget) return; if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeTuningEffort(tuningModalIndex, stat.key, -1, availableCap) } if (e.key === 'ArrowRight') { e.preventDefault(); nudgeTuningEffort(tuningModalIndex, stat.key, 1, availableCap) } }} onChange={(e) => { const next = [...party]; next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, e.target.value) }; setParty(next) }} />
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
                    <div className={`effort-gauge-track ${statThemeClass(stat.key)}`} tabIndex={0} role="slider" aria-label={`${lt(stat.label)} effort points`} aria-valuemin={0} aria-valuemax={availableCap} aria-valuenow={currentEffort} onKeyDown={(e) => { if (e.target !== e.currentTarget) return; if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeSampleEffort(stat.key, -1, availableCap) } if (e.key === 'ArrowRight') { e.preventDefault(); nudgeSampleEffort(stat.key, 1, availableCap) } }} onPointerDown={(e) => { e.preventDefault(); focusEffortRange(e.currentTarget); e.currentTarget.setPointerCapture(e.pointerId); updateSampleEffortFromPointer(stat.key, availableCap, e.clientX, e.currentTarget) }} onPointerMove={(e) => { if ((e.buttons & 1) !== 1) return; updateSampleEffortFromPointer(stat.key, availableCap, e.clientX, e.currentTarget) }} onPointerUp={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId) }}>
                      <div className={`effort-gauge-cells ${statThemeClass(stat.key)}`} aria-hidden="true">{Array.from({ length: CHAMPIONS_EFFORT_PER_STAT_CAP }, (_, cellIdx) => { const point = cellIdx + 1; const reachable = point <= availableCap; const filled = point <= currentEffort; const magicPoint = magicPoints.includes(point); const currentPoint = point === currentEffort && currentEffort > 0; const checkpointPoint = EFFORT_CHECKPOINTS.includes(point as 11 | 22 | 32); const targetPoint = point === targetEffort; return <span key={`sample-effort-cell-${stat.key}-${point}`} className={['effort-gauge-cell', reachable ? 'reachable' : 'locked', filled ? 'filled' : '', magicPoint ? 'magic' : '', currentPoint ? 'current' : '', checkpointPoint ? 'checkpoint' : '', targetPoint ? 'target' : ''].filter(Boolean).join(' ')} title={`${lt(stat.label)} ${point}pt`} /> })}</div>
                      <input type="range" className="effort-gauge-range" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} step={1} value={currentEffort} onKeyDown={(e) => { if (e.target !== e.currentTarget) return; if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeSampleEffort(stat.key, -1, availableCap) } if (e.key === 'ArrowRight') { e.preventDefault(); nudgeSampleEffort(stat.key, 1, availableCap) } }} onChange={(e) => setSampleForge((prev) => ({ ...prev, evs: applyChampionsEffort(prev.evs, stat.key, e.target.value) }))} />
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
        <>
          <section className="panel wide home-hero-panel home-surface-panel">
            <div className="home-hero-layout">
              <div className="home-hero-copy-block">
                <span className="home-kicker">{lt('바로 시작')}</span>
                <h2>{lt('포켓몬 챔피언스 배틀 도우미')}</h2>
                <p className="muted home-hero-lede">{lt('한 번에 모든 기능을 밀어넣지 않고, 지금 필요한 작업부터 시작합니다.')}</p>
                <p className="muted home-hero-body">{lt('이 홈은 길찾기 화면입니다. 배틀 준비, 샘플 조정, 도감 확인 중 하나만 고르면 바로 들어갑니다.')}</p>
              </div>
              <aside className="home-principles-card">
                <span className="home-section-label">{lt('사용 흐름')}</span>
                <ul className="home-principles-list">
                  <li>
                    <strong>{lt('추천 시작점')}</strong>
                    <p>{lt('자주 쓰는 흐름만 앞에 두고, 세부 기능은 들어간 뒤에 보여 줍니다.')}</p>
                  </li>
                  <li>
                    <strong>{lt('싱글/더블 배틀 준비')}</strong>
                    <p>{lt('파티, 선출, 속도, 대미지 계산을 한 흐름으로 정리합니다.')}</p>
                  </li>
                  <li>
                    <strong>{lt('샘플 조정 / 자료 확인')}</strong>
                    <p>{lt('포켓몬 한 마리를 조정하거나 도감 정보를 빠르게 확인합니다.')}</p>
                  </li>
                </ul>
              </aside>
            </div>
          </section>

          <section className="panel wide home-route-panel home-surface-panel">
            <div className="home-route-groups">
              <section className="home-route-group">
                <div className="home-route-group-head">
                  <span className="home-section-label">{lt('싱글/더블 배틀 준비')}</span>
                  <p className="muted">{lt('파티, 선출, 속도, 대미지 계산을 한 흐름으로 정리합니다.')}</p>
                </div>
                <div className="home-route-grid home-route-grid-compact">
                  <button type="button" className="home-route-card calm" onClick={() => { setMainSection('single'); setActiveTab('party') }}>
                    <div className="home-route-card-copy">
                      <span className="home-route-eyebrow">{lt('싱글 배틀 운영')}</span>
                      <strong>{lt('싱글배틀')}</strong>
                      <p>{lt('내 파티를 관리하고 상대 엔트리에 따라 스피드와 대미지를 계산할 수 있습니다.')}</p>
                    </div>
                  </button>
                  <button type="button" className="home-route-card calm" onClick={() => { setMainSection('double'); setActiveTab('party') }}>
                    <div className="home-route-card-copy">
                      <span className="home-route-eyebrow">{lt('더블 배틀 운영')}</span>
                      <strong>{lt('더블배틀')}</strong>
                      <p>{lt('더블배틀의 행동순과 기대 대미지를 빠르게 확인할 수 있습니다.')}</p>
                    </div>
                  </button>
                </div>
              </section>

              <section className="home-route-group">
                <div className="home-route-group-head">
                  <span className="home-section-label">{lt('샘플 조정 / 자료 확인')}</span>
                  <p className="muted">{lt('포켓몬 한 마리를 조정하거나 도감 정보를 빠르게 확인합니다.')}</p>
                </div>
                <div className="home-route-grid home-route-grid-compact">
                  <button type="button" className="home-route-card calm" onClick={() => setMainSection('sample')}>
                    <div className="home-route-card-copy">
                      <span className="home-route-eyebrow">{lt('샘플 조정')}</span>
                      <strong>{lt('포켓몬 샘플 빌더')}</strong>
                      <p>{lt('포켓몬 하나를 기준으로 성격, 노력치, 기술을 조정하고 샘플로 저장할 수 있습니다.')}</p>
                    </div>
                  </button>
                  <button type="button" className="home-route-card calm" onClick={() => setMainSection('dex')}>
                    <div className="home-route-card-copy">
                      <span className="home-route-eyebrow">{lt('도감 확인')}</span>
                      <strong>{lt('도감')}</strong>
                      <p>{lt('포켓몬을 검색해서 종족값, 타입, 특성, 상위 기술을 빠르게 확인합니다.')}</p>
                    </div>
                  </button>
                </div>
              </section>
            </div>
          </section>

          <div className="home-footer-text-block home-footer-text-block-quiet">
            <div className="home-footer-text-row home-footer-links-quiet">
              <span className="home-footer-label">{lt('프로젝트 링크')}</span>
              <div className="home-link-list text-only">
                <a href="https://github.com/w8385/Pokemon-Champions-Assistant" target="_blank" rel="noreferrer">GitHub — Pokemon-Champions-Assistant</a>
                <a href="https://forms.gle/Yrav9HB7Fzdffh3Q8" target="_blank" rel="noreferrer">{lt('기능제안/버그제보')}</a>
                <a href="mailto:me@w8385.dev">me@w8385.dev</a>
              </div>
            </div>
            <div className="home-footer-text-row">
              <span className="home-footer-label">{lt('저작권 및 안내')}</span>
              <p className="muted home-footer-copy">{lt('포켓몬 관련 명칭과 이미지에 대한 권리는 각 권리자에게 있으며, 이 프로젝트는 비공식 팬메이드 도구입니다.')}</p>
              <div className="home-reference-list-wrap">
                <span className="home-reference-label">{lt('참고 데이터베이스')}</span>
                <div className="home-reference-list">
                  <span className="pick-badge">PokéAPI</span>
                  <span className="pick-badge">veekun</span>
                  <span className="pick-badge">PokemonDB</span>
                  <span className="pick-badge">Serebii</span>
                  <span className="pick-badge">Smogon Dex</span>
                  <span className="pick-badge">Pikalytics</span>
                  <span className="pick-badge">champs.pokedb.tokyo</span>
                </div>
              </div>
            </div>
          </div>
        </>
        ) : null}
        {mainSection !== 'home' && mainSection !== 'dex' ? <section className="panel wide workflow-shell-panel">
          <div className="row-between section-head workflow-shell-head">
            <div>
              <span className="home-section-label">{lt('현재 흐름')}</span>
              <h2>{mainSection === 'single' ? lt('싱글배틀') : mainSection === 'double' ? lt('더블배틀') : mainSection === 'sample' ? lt('포켓몬 샘플 깎기') : lt('도감')}</h2>
              {mainSection === 'single' ? <p className="muted">{lt('파티부터 채우고, 상대 공개 정보를 적은 뒤 계산 단계로 넘어갑니다.')}</p> : null}
              {mainSection === 'double' ? <p className="muted">{lt('더블은 파티와 상대 정리 후 플래너에서 턴 흐름을 봅니다.')}</p> : null}
            </div>
          </div>
          {mainSection === 'single' || mainSection === 'double' ? (
            <div className={`workflow-step-shell ${mainSection === 'single' ? 'single' : 'double'}`}>
              <button type="button" className={`workflow-step-card ${activeTab === 'party' ? 'active' : ''}`} onClick={() => setActiveTab('party')}>
                <span className="workflow-step-number">01</span>
                <div className="workflow-step-copy">
                  <strong>{lt('내 파티 관리')}</strong>
                  <p>{lt('내 포켓몬과 기술 기준을 정리합니다.')}</p>
                </div>
              </button>
              <button type="button" className={`workflow-step-card ${activeTab === 'pick' ? 'active' : ''}`} onClick={() => setActiveTab('pick')}>
                <span className="workflow-step-number">02</span>
                <div className="workflow-step-copy">
                  <strong>{lt('상대 엔트리')}</strong>
                  <p>{lt('상대 공개 정보와 가정을 정리합니다.')}</p>
                </div>
              </button>
              {mainSection === 'single' ? (
                <>
                  <button type="button" className={`workflow-step-card ${activeTab === 'speed' ? 'active' : ''}`} onClick={() => setActiveTab('speed')}>
                    <span className="workflow-step-number">03</span>
                    <div className="workflow-step-copy">
                      <strong>{lt('스피드 계산')}</strong>
                      <p>{lt('추월컷과 속도선을 확인합니다.')}</p>
                    </div>
                  </button>
                  <button type="button" className={`workflow-step-card ${activeTab === 'power' ? 'active' : ''}`} onClick={() => setActiveTab('power')}>
                    <span className="workflow-step-number">04</span>
                    <div className="workflow-step-copy">
                      <strong>{lt('대미지 계산')}</strong>
                      <p>{lt('기술 대미지와 조건을 맞춥니다.')}</p>
                    </div>
                  </button>
                </>
              ) : (
                <button type="button" className={`workflow-step-card ${activeTab === 'power' ? 'active' : ''}`} onClick={() => setActiveTab('power')}>
                  <span className="workflow-step-number">03</span>
                  <div className="workflow-step-copy">
                    <strong>{lt('더블 배틀 플래너')}</strong>
                    <p>{lt('더블 기준 화력과 행동순을 정리합니다.')}</p>
                  </div>
                </button>
              )}
            </div>
          ) : mainSection === 'sample' ? (
            <div className="tab-bar section-menu-tabs">
              {([
                ['builder', lt('샘플 빌드')],
                ['speed', lt('샘플 스피드')],
                ['damage', lt('샘플 대미지 계산')],
              ] as const).map(([value, label]) => (
                <button key={`sample-workbench-tab-${value}`} type="button" className={`tab-chip sample-filter-chip ${sampleWorkbenchTab === value ? 'active' : ''}`} onClick={() => setSampleWorkbenchTab(value)}>{label}</button>
              ))}
            </div>
          ) : null}
        </section> : null}

        {mainSection === 'dex' ? <>
          <section className="panel wide">
            <div className="section-head">
              <div>
                <h2>{lt('도감')}</h2>
              </div>
            </div>
            <div className="dex-tab-panel">
              <div className="dex-unified-search-card">
                <div className="section-head compact">
                  <div>
                    <strong>{lt('통합검색')}</strong>
                    <p className="muted">{lt('포켓몬/기술/특성/도구를 검색해서 핵심 정보를 빠르게 확인합니다.')}</p>
                  </div>
                </div>
                <div className="dex-search-autocomplete">
                  <input
                    value={dexUnifiedSearchDraft}
                    placeholder={lt('포켓몬 / 기술 / 특성 / 도구 검색')}
                    onChange={(e) => {
                      setDexUnifiedSearchDraft(e.target.value)
                    }}
                    onCompositionStart={() => setDexUnifiedSearchComposing(true)}
                    onCompositionEnd={(e) => {
                      const nextValue = e.currentTarget.value
                      setDexUnifiedSearchComposing(false)
                      setDexUnifiedSearchDraft(nextValue)
                      setDexUnifiedSearch(nextValue)
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter' || !dexAllResults.length) return
                      setDexSelectedValue(dexAllResults[0].id)
                    }}
                  />
                </div>
              </div>
              <div className="tab-bar section-menu-tabs dex-mode-tabs">
                {([
                  ['pokemon', lt('포켓몬')],
                  ['move', lt('기술')],
                  ['ability', lt('특성')],
                  ['item', lt('도구')],
                ] as [DexSearchMode, string][]).map(([mode, label]) => (
                  <button key={`dex-mode-${mode}`} type="button" className={`tab-chip ${dexSearchMode === mode ? 'active' : ''}`} onClick={() => setDexSearchMode(mode)}>{label}</button>
                ))}
              </div>
            </div>
          </section>
          <section className="panel wide dex-content-panel">
          <div className="dex-browser-layout">
            <div className="dex-browser-sidebar">
              <div className="dex-search-autocomplete dex-tab-search-box">
                <input
                  value={dexSearch}
                  placeholder={dexSearchMode === 'pokemon' ? lt('포켓몬 검색') : dexSearchMode === 'move' ? lt('기술 검색') : dexSearchMode === 'ability' ? lt('특성 검색') : lt('도구 검색')}
                  onChange={(e) => setDexSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' || !dexResultKeys.length) return
                    setDexSelectedValue(dexResultKeys[0])
                  }}
                />
              </div>
              <div className="dex-results-card">
                <div className="row-between section-head compact">
                  <div>
                    <h2>{lt('검색 결과')}</h2>
                    <p className="muted">{lt('검색 결과를 선택하면 상세 정보를 바로 확인할 수 있습니다.')}</p>
                  </div>
                </div>
                <div className="dex-results-list">
                  {hasDexUnifiedSearch ? dexAllResults.map((result) => {
                    if (result.kind === 'pokemon') {
                      return <button key={result.id} type="button" className={`dex-result-item ${dexSelectedValue === result.id ? 'active' : ''}`} onClick={() => setDexSelectedValue(result.id)}>
                        <div className="row-between compact-gap">
                          <span className="pick-badge subtle">{lt('포켓몬')}</span>
                        </div>
                        <div className="dex-pokemon-preview-row">
                          {result.row.sprite ? <img src={result.row.sprite} alt={searchDisplayLabel(result.key, siteLanguage)} className="dex-result-sprite" /> : <div className="dex-result-sprite placeholder" />}
                          <div className="dex-pokemon-preview-body">
                            <div>
                              <strong>{searchDisplayLabel(result.key, siteLanguage)}</strong>
                              <div className="muted dex-result-subline">{result.row.name_en}</div>
                            </div>
                            <div className="type-badge-wrap dex-result-typebadges">
                              {result.row.types.map((type) => <TypeBadgeImage key={`dex-all-row-type-icon-${result.key}-${type}`} type={type} />)}
                            </div>
                          </div>
                        </div>
                      </button>
                    }
                    if (result.kind === 'move') {
                      return <button key={result.id} type="button" className={`dex-result-item ${dexSelectedValue === result.id ? 'active' : ''}`} onClick={() => setDexSelectedValue(result.id)}>
                        <div className="row-between compact-gap">
                          <span className="pick-badge subtle">{lt('기술')}</span>
                        </div>
                      <div className="dex-move-preview-row">
                          {result.meta.type ? <TypeBadgeImage type={result.meta.type} /> : null}
                          <div className="dex-pokemon-preview-body">
                            <strong>{result.name}</strong>
                            <span className="muted">{displayTypeName(result.meta.type, siteLanguage)} · {displayMoveCategoryName(result.meta.category, siteLanguage)}{result.meta.power != null ? ` · ${lt('위력')} ${resolvedMovePower(result.meta)}` : ''}{result.meta.pp != null ? ` · PP ${result.meta.pp}` : ''}</span>
                          </div>
                        </div>
                      </button>
                    }
                    if (result.kind === 'ability') {
                      const previewRows = result.pokemonKeys
                        .map((key) => indexByKey.get(key) ?? null)
                        .filter((row): row is Row => Boolean(row))
                      return <button key={result.id} type="button" className={`dex-result-item ${dexSelectedValue === result.id ? 'active' : ''}`} onClick={() => setDexSelectedValue(result.id)}>
                        <div className="row-between compact-gap">
                          <span className="pick-badge subtle">{lt('특성')}</span>
                        </div>
                        <div className="dex-ability-result-card">
                          <div className="dex-ability-result-copy">
                            <strong>{abilityDisplayName(result.key, result.koLabel, siteLanguage)}</strong>
                            <span className="muted">{result.pokemonKeys.length}{siteLanguage === 'en' ? ' Pokémon' : siteLanguage === 'ja' ? '匹' : '마리'}</span>
                          </div>
                          {previewRows.length ? <div className="dex-ability-result-sprites" aria-hidden="true">
                            {previewRows.map((row) => row.sprite ? <img key={`dex-all-ability-result-sprite-${result.key}-${row.key}`} src={row.sprite} alt="" className="dex-ability-result-sprite" /> : null)}
                          </div> : null}
                        </div>
                      </button>
                    }
                    return <button key={result.id} type="button" className={`dex-result-item ${dexSelectedValue === result.id ? 'active' : ''}`} onClick={() => setDexSelectedValue(result.id)} {...bindTooltip(itemTooltipData(result.item, siteLanguage))}>
                      <div className="row-between compact-gap">
                        <span className="pick-badge subtle">{lt('도구')}</span>
                      </div>
                      <div className="dex-move-preview-row">
                        <img src={itemSpriteSrc('', result.item)} alt={displayItemLabel(result.item, siteLanguage)} className="dex-item-preview-sprite" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} />
                        <div className="dex-pokemon-preview-body dex-item-result-body">
                          <strong>{displayItemLabel(result.item, siteLanguage)}</strong>
                          {result.previewText ? <span className="muted">{result.previewText}</span> : null}
                        </div>
                      </div>
                    </button>
                  }) : null}
                  {dexSearchMode === 'pokemon' ? dexSpeciesOptions.map((option) => {
                    const row = indexByKey.get(option.key)
                    if (!row) return null
                    return <button key={`dex-pokemon-${option.key}`} type="button" className={`dex-result-item ${dexSelectedValue === option.key ? 'active' : ''}`} onClick={() => setDexSelectedValue(option.key)}>
                      <div className="dex-pokemon-preview-row">
                        {row.sprite ? <img src={row.sprite} alt={searchDisplayLabel(option.key, siteLanguage)} className="dex-result-sprite" /> : <div className="dex-result-sprite placeholder" />}
                        <div className="dex-pokemon-preview-body">
                          <div>
                            <strong>{searchDisplayLabel(option.key, siteLanguage)}</strong>
                            <div className="muted dex-result-subline">{row.name_en}</div>
                          </div>
                          <div className="type-badge-wrap dex-result-typebadges">
                            {row.types.map((type) => <TypeBadgeImage key={`dex-row-type-icon-${option.key}-${type}`} type={type} />)}
                          </div>
                        </div>
                      </div>
                    </button>
                  }) : null}
                  {dexSearchMode === 'move' ? dexMoveOptions.map((option) => <button key={`dex-move-${option.key}`} type="button" className={`dex-result-item ${dexSelectedValue === option.key ? 'active' : ''}`} onClick={() => setDexSelectedValue(option.key)}>
                    <div className="dex-move-preview-row">
                      {option.meta.type ? <TypeBadgeImage type={option.meta.type} /> : null}
                      <div className="dex-pokemon-preview-body">
                        <strong>{option.name}</strong>
                        <span className="muted">{displayTypeName(option.meta.type, siteLanguage)} · {displayMoveCategoryName(option.meta.category, siteLanguage)}{option.meta.power != null ? ` · ${lt('위력')} ${resolvedMovePower(option.meta)}` : ''}{option.meta.pp != null ? ` · PP ${option.meta.pp}` : ''}</span>
                      </div>
                    </div>
                  </button>) : null}
                  {dexSearchMode === 'ability' ? dexAbilityOptions.map((option) => {
                    const previewRows = option.pokemonKeys
                      .map((key) => indexByKey.get(key) ?? null)
                      .filter((row): row is Row => Boolean(row))
                    return <button key={`dex-ability-${option.key}`} type="button" className={`dex-result-item ${dexSelectedValue === option.key ? 'active' : ''}`} onClick={() => setDexSelectedValue(option.key)}>
                      <div className="dex-ability-result-card">
                        <div className="dex-ability-result-copy">
                          <strong>{abilityDisplayName(option.key, option.koLabel, siteLanguage)}</strong>
                          <span className="muted">{option.pokemonKeys.length}{siteLanguage === 'en' ? ' Pokémon' : siteLanguage === 'ja' ? '匹' : '마리'}</span>
                        </div>
                        {previewRows.length ? <div className="dex-ability-result-sprites" aria-hidden="true">
                          {previewRows.map((row) => row.sprite ? <img key={`dex-ability-result-sprite-${option.key}-${row.key}`} src={row.sprite} alt="" className="dex-ability-result-sprite" /> : null)}
                        </div> : null}
                      </div>
                    </button>
                  }) : null}
                  {dexSearchMode === 'item' ? dexItemOptions.map((item) => {
                    const itemText = localizedDexText(itemDescriptionFor(item), siteLanguage)
                    const itemPreviewText = itemText?.summary || itemText?.detail || ''
                    return <button key={`dex-item-${item}`} type="button" className={`dex-result-item ${dexSelectedValue === item ? 'active' : ''}`} onClick={() => setDexSelectedValue(item)} {...bindTooltip(itemTooltipData(item, siteLanguage))}>
                      <div className="dex-move-preview-row">
                        <img src={itemSpriteSrc('', item)} alt={displayItemLabel(item, siteLanguage)} className="dex-item-preview-sprite" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} />
                        <div className="dex-pokemon-preview-body dex-item-result-body">
                          <strong>{displayItemLabel(item, siteLanguage)}</strong>
                          {itemPreviewText ? <span className="muted">{itemPreviewText}</span> : null}
                        </div>
                      </div>
                    </button>
                  }) : null}
                  {!dexResultKeys.length ? <div className="dex-empty-state muted">{lt('검색 결과가 없습니다.')}</div> : null}
                </div>
              </div>
            </div>

            <div className="dex-browser-detail">
              {dexSelectedRow ? <div className="dex-detail-card">
                <div className="dex-detail-head">
                  <div className="dex-detail-identity">
                    {dexSelectedRow.sprite ? <img src={dexSelectedRow.sprite} alt={displayName(dexSelectedRow, siteLanguage)} className="dex-detail-sprite" /> : null}
                    <div>
                      <h3>{displayName(dexSelectedRow, siteLanguage)}</h3>
                      <p className="muted">{dexSelectedRow.name_en}</p>
                    </div>
                  </div>
                  <div className="pick-summary-badges">
                    {displayTypes(dexSelectedRow, siteLanguage).map((type, idx) => <span key={`dex-type-${dexSelectedRow.key}-${idx}`} className="pick-badge">{type}</span>)}
                  </div>
                </div>
                <div className="dex-detail-grid">
                  <div className="dex-detail-panel">
                    <strong>{lt('종족값')}</strong>
                    <div className="dex-stat-table" role="table" aria-label={lt('종족값')}>
                      {[
                        ['HP', dexSelectedRow.hp],
                        ['A', dexSelectedRow.attack],
                        ['B', dexSelectedRow.defense],
                        ['C', dexSelectedRow.spAttack],
                        ['D', dexSelectedRow.spDefense],
                        ['S', dexSelectedRow.speed],
                      ].map(([label, value]) => <div key={`dex-stat-${dexSelectedRow.key}-${label}`} className="dex-stat-row" role="row">
                        <span className="dex-stat-label" role="cell">{label}</span>
                        <div className="dex-stat-bar-track" role="cell" aria-hidden="true">
                          <span className="dex-stat-bar-fill" style={{ width: `${Math.max(10, Math.min(100, Number(value) / 255 * 100))}%` }} />
                        </div>
                        <strong className="dex-stat-value" role="cell">{value}</strong>
                      </div>)}
                      <div className="dex-stat-row total" role="row">
                        <span className="dex-stat-label" role="cell">{lt('합계')}</span>
                        <div className="dex-stat-bar-track" role="cell" aria-hidden="true">
                          <span className="dex-stat-bar-fill total" style={{ width: `${Math.max(14, Math.min(100, (dexSelectedRow.hp + dexSelectedRow.attack + dexSelectedRow.defense + dexSelectedRow.spAttack + dexSelectedRow.spDefense + dexSelectedRow.speed) / 780 * 100))}%` }} />
                        </div>
                        <strong className="dex-stat-value" role="cell">{dexSelectedRow.hp + dexSelectedRow.attack + dexSelectedRow.defense + dexSelectedRow.spAttack + dexSelectedRow.spDefense + dexSelectedRow.speed}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="dex-detail-panel">
                    <strong>{lt('특성')}</strong>
                    <div className="pick-summary-badges">
                      {displayAbilities(dexSelectedRow, siteLanguage).map((ability, idx) => <button key={`dex-ability-${dexSelectedRow.key}-${idx}`} type="button" className="pick-badge subtle dex-chip-button" {...bindNavigableTooltip(abilityTooltipData(ability, siteLanguage, dexSelectedRow), () => openDexAbilityDetail(ability, dexSelectedRow))}>{ability}</button>)}
                    </div>
                  </div>
                  <div className="dex-detail-panel">
                    <strong>{lt('상위 채용 기술')}</strong>
                    <div className="pick-summary-badges">
                      {dexTopMoves.length ? dexTopMoves.map((move, idx) => <button key={`dex-move-chip-${dexSelectedRow.key}-${idx}`} type="button" className="pick-badge dex-chip-button" {...bindNavigableTooltip(moveTooltipData(move, siteLanguage), () => openDexMoveDetail(move))}>{move}</button>) : <span className="pick-badge">-</span>}
                    </div>
                  </div>
                  <div className="dex-detail-panel">
                    <strong>{lt('빠른 이동')}</strong>
                    <div className="pick-summary-badges">
                      <button type="button" className="chip-button" onClick={() => {
                        setSampleForge((prev) => ({ ...prev, key: dexSelectedRow.key, ability: defaultAbilityForKey(dexSelectedRow.key) }))
                        setSampleSearch(searchDisplayLabel(dexSelectedRow.key, siteLanguage))
                        setSampleItemDraft(displayItemLabel(visibleChampionsItem(dexSelectedRow.key, ''), siteLanguage))
                        setMainSection('sample')
                      }}>{lt('샘플 빌더로 열기')}</button>
                      <button type="button" className="chip-button" onClick={() => {
                        const key = dexSelectedRow.key
                        setParty((prev) => prev.map((member, idx) => idx === 0 ? { ...member, key, ability: defaultAbilityForKey(key) } : member))
                        setPartySearch((prev) => prev.map((value, idx) => idx === 0 ? searchDisplayLabel(key, siteLanguage) : value))
                        setPartyItemDrafts((prev) => prev.map((value, idx) => idx === 0 ? displayItemLabel(visibleChampionsItem(key, ''), siteLanguage) : value))
                        setMainSection('single')
                        setActiveTab('party')
                      }}>{lt('싱글 파티에 넣기')}</button>
                    </div>
                  </div>
                </div>
              </div> : null}

              {dexSelectedMove ? <div className="dex-detail-card">
                <div className="dex-detail-head">
                  <div className="dex-detail-identity compact">
                    <div>
                      <h3>{dexSelectedMove.name}</h3>
                      <p className="muted">{displayTypeName(dexSelectedMove.meta.type, siteLanguage)} · {displayMoveCategoryName(dexSelectedMove.meta.category, siteLanguage)}</p>
                    </div>
                  </div>
                </div>
                <div className="dex-detail-grid single-column">
                  <div className="dex-detail-panel">
                    <strong>{lt('기본 정보')}</strong>
                    <div className="pick-summary-badges">
                      <span className="pick-badge">{lt('타입')} {displayTypeName(dexSelectedMove.meta.type, siteLanguage)}</span>
                      <span className="pick-badge">{lt('분류')} {displayMoveCategoryName(dexSelectedMove.meta.category, siteLanguage)}</span>
                      <span className="pick-badge">{lt('위력')} {dexSelectedMove.meta.power != null ? resolvedMovePower(dexSelectedMove.meta) : '-'}</span>
                      <span className="pick-badge">PP {dexSelectedMove.meta.pp != null ? dexSelectedMove.meta.pp : '-'}</span>
                      <span className="pick-badge">{lt('명중')} {dexSelectedMove.meta.accuracy != null ? `${dexSelectedMove.meta.accuracy}%` : '-'}</span>
                      <span className="pick-badge">{lt('우선도')} {dexSelectedMove.meta.priority ?? 0}</span>
                    </div>
                  </div>
                  <div className="dex-detail-panel">
                    <strong>{lt('이름')}</strong>
                    <div className="pick-summary-badges">
                      {dexSelectedMoveDescription?.nameEn ? <span className="pick-badge">EN {dexSelectedMoveDescription.nameEn}</span> : null}
                      {dexSelectedMoveDescription?.nameJa ? <span className="pick-badge">JP {dexSelectedMoveDescription.nameJa}</span> : null}
                    </div>
                  </div>
                  <div className="dex-detail-panel">
                    <strong>{lt('설명')}</strong>
                    <p className="dex-description-copy">{dexSelectedMoveText?.detail || dexSelectedMoveText?.summary || lt('설명 데이터 없음')}</p>
                  </div>
                  <div className="dex-detail-panel">
                    <strong>{lt('배우는 포켓몬')}</strong>
                    <div className="pick-summary-badges">
                      {dexMoveLearnersStatus === 'loading' ? <span className="pick-badge">Loading…</span> : null}
                      {dexMoveLearnersStatus === 'error' ? <span className="pick-badge">-</span> : null}
                      {dexMoveLearnersStatus === 'ready' ? dexMoveLearners.map((row) => <button key={`dex-move-learner-${dexSelectedMove.key}-${row.key}`} type="button" className="pick-badge subtle dex-ability-pokemon-chip dex-chip-button" onClick={() => openDexPokemonDetail(row.key)}>
                        {row.sprite ? <img src={row.sprite} alt={displayName(row, siteLanguage)} className="dex-ability-pokemon-sprite" /> : null}
                        <span>{displayName(row, siteLanguage)}</span>
                      </button>) : null}
                    </div>
                  </div>
                </div>
              </div> : null}

              {dexSelectedAbility ? <div className="dex-detail-card">
                <div className="dex-detail-head">
                  <div className="dex-detail-identity compact">
                    <div>
                      <h3>{abilityDisplayName(dexSelectedAbility.key, dexSelectedAbility.koLabel, siteLanguage)}</h3>
                      <p className="muted">{dexSelectedAbility.key}</p>
                    </div>
                  </div>
                  <div className="pick-summary-badges">
                    <span className="pick-badge">{dexSelectedAbility.pokemonKeys.length}{siteLanguage === 'en' ? ' Pokémon' : siteLanguage === 'ja' ? '匹' : '마리'}</span>
                  </div>
                </div>
                <div className="dex-detail-grid single-column">
                  <div className="dex-detail-panel">
                    <strong>{lt('이름')}</strong>
                    <div className="pick-summary-badges">
                      {dexSelectedAbilityDescription?.nameKo ? <span className="pick-badge">KO {dexSelectedAbilityDescription.nameKo}</span> : null}
                      {dexSelectedAbilityDescription?.nameEn ? <span className="pick-badge">EN {dexSelectedAbilityDescription.nameEn}</span> : null}
                      {dexSelectedAbilityDescription?.nameJa ? <span className="pick-badge">JP {dexSelectedAbilityDescription.nameJa}</span> : null}
                    </div>
                  </div>
                  <div className="dex-detail-panel">
                    <strong>{lt('설명')}</strong>
                    <p className="dex-description-copy">{dexSelectedAbilityText?.detail || dexSelectedAbilityText?.summary || lt('설명 데이터 없음')}</p>
                  </div>
                  <div className="dex-detail-panel">
                    <strong>{lt('해당 특성 포켓몬')}</strong>
                    <div className="pick-summary-badges">
                      {dexSelectedAbility.pokemonKeys.map((key) => {
                        const row = indexByKey.get(key)
                        if (!row) return null
                        return <button key={`dex-ability-pokemon-${key}`} type="button" className="pick-badge subtle dex-ability-pokemon-chip dex-chip-button" onClick={() => openDexPokemonDetail(key)}>
                          {row.sprite ? <img src={row.sprite} alt={displayName(row, siteLanguage)} className="dex-ability-pokemon-sprite" /> : null}
                          <span>{displayName(row, siteLanguage)}</span>
                        </button>
                      })}
                    </div>
                  </div>
                </div>
              </div> : null}

              {dexSelectedItem ? <div className="dex-detail-card">
                <div className="dex-detail-head">
                  <div className="dex-detail-identity compact">
                    <img src={itemSpriteSrc('', dexSelectedItem)} alt={displayItemLabel(dexSelectedItem, siteLanguage)} className="dex-detail-item-sprite" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} />
                    <div>
                      <h3>{displayItemLabel(dexSelectedItem, siteLanguage)}</h3>
                      <p className="muted">{dexSelectedItem}</p>
                    </div>
                  </div>
                </div>
                <div className="dex-detail-grid single-column">
                  <div className="dex-detail-panel">
                    <strong>{lt('이름')}</strong>
                    <div className="pick-summary-badges">
                      <span className="pick-badge">KO {displayItemLabel(dexSelectedItem, 'ko')}</span>
                      <span className="pick-badge">EN {displayItemLabel(dexSelectedItem, 'en')}</span>
                      <span className="pick-badge">JP {displayItemLabel(dexSelectedItem, 'ja')}</span>
                    </div>
                  </div>
                  {dexSelectedItemEffectSummary ? <div className="dex-detail-panel">
                    <strong>{lt('효과')}</strong>
                    <p className="dex-description-copy">{dexSelectedItemEffectSummary}</p>
                  </div> : null}
                  <div className="dex-detail-panel">
                    <strong>{lt('설명')}</strong>
                    <p className="dex-description-copy">{dexSelectedItemText?.detail || dexSelectedItemText?.summary || lt('설명 데이터 없음')}</p>
                  </div>
                </div>
              </div> : null}

              {!dexSelectedRow && !dexSelectedMove && !dexSelectedAbility && !dexSelectedItem ? <div className="dex-detail-card dex-placeholder-card">
                <p className="muted">{lt('검색 결과를 선택하면 상세 정보를 바로 확인할 수 있습니다.')}</p>
              </div> : null}
            </div>
          </div>
        </section>
        </> : null}

        {(mainSection === 'single' && (activeTab === 'speed' || activeTab === 'power')) ? (
          <section className="panel wide party-overview-panel">
            <h2>{lt('파티 한눈 요약')}</h2>
            <div className="team-strip-grid">
              <div className="team-strip-group ally">
                <p className="muted">{lt('내 파티')}</p>
                <div className="team-strip">
                  {party.map((member, idx) => {
                    const row = member.key ? (indexByKey.get(member.key) ?? rows[0]) : null
                    return <button key={`team-my-${idx}`} type="button" className={`team-pill ${selectedMy === idx ? 'active' : ''}`} onClick={() => setSelectedMy(idx)}>{row ? displayName(row, siteLanguage) : emptySlotLabel(idx, siteLanguage)}</button>
                  })}
                </div>
              </div>
              <div className="team-strip-group enemy">
                <p className="muted">{lt('상대 파티')}</p>
                <div className="team-strip">
                  {opponents.map((member, idx) => {
                    const row = member.key ? (indexByKey.get(member.key) ?? rows[0]) : null
                    const label = opponentSearch[idx] || (row ? displayName(row, siteLanguage) : emptySlotLabel(idx, siteLanguage))
                    return <button key={`team-opp-${idx}`} type="button" className={`team-pill enemy ${selectedOpp === idx ? 'active' : ''}`} onClick={() => setSelectedOpp(idx)}>{label}</button>
                  })}
                </div>
                <div className="team-strip-actions enemy">
                  <button type="button" className="action-button subtle" onClick={() => clearOpponentSlot(selectedOpp)}>{lt('선택 슬롯 비우기')}</button>
                  <button type="button" className="action-button danger" onClick={resetOpponentsForFreshEntry}>{lt('상대 엔트리 초기화')}</button>
                </div>
                <div className="quick-opponent-search-bar compact embedded">
                  <label className="species-picker">
                    {lt('상대 엔트리 빠른 입력')}
                    <div className="autocomplete">
                      <input
                        value={opponentQuickSearch}
                        placeholder={searchSlotPlaceholder(selectedOpp, siteLanguage)}
                        onFocus={() => {
                          setActiveSearchField({ side: 'opponentQuick', idx: 0 })
                          setAutocompleteMenuOpen('opponent-quick-species-0')
                        }}
                        onBlur={() => {
                          setTimeout(() => setActiveSearchField((prev) => sameSearchTarget(prev, 'opponentQuick', 0) ? null : prev), 120)
                          setTimeout(() => closeAutocompleteMenu('opponent-quick-species-0'), 120)
                        }}
                        onChange={(e) => {
                          setOpponentQuickSearch(e.target.value)
                          setActiveSearchField({ side: 'opponentQuick', idx: 0 })
                          setAutocompleteMenuOpen('opponent-quick-species-0')
                        }}
                        onKeyDown={(e) => {
                          const options = filterSpeciesOptions(opponentQuickSearch, { includeMega: false }).slice(0, 8)
                          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                            e.preventDefault()
                            moveAutocompleteMenuHighlight('opponent-quick-species-0', options.length, e.key === 'ArrowDown' ? 1 : -1)
                            return
                          }
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const highlightedOption = options[highlightedAutocompleteIndex(autocompleteHighlight, 'opponent-quick-species-0')]
                            commitOpponentQuickSearch(highlightedOption?.key)
                            closeAutocompleteMenu('opponent-quick-species-0')
                          }
                        }}
                      />
                      {sameSearchTarget(activeSearchField, 'opponentQuick', 0) ? (
                        <div className="autocomplete-menu unified-dropdown-menu">
                          {filterSpeciesOptions(opponentQuickSearch, { includeMega: false }).slice(0, 8).map((option, optionIdx) => (
                            <button key={`speed-power-opp-quick-${option.key}`} type="button" className={`autocomplete-item ${highlightedAutocompleteIndex(autocompleteHighlight, 'opponent-quick-species-0') === optionIdx ? 'active' : ''}`} onMouseDown={() => commitOpponentQuickSearch(option.key)}>
                              {searchDisplayLabel(option.key, siteLanguage)}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </label>
                  <div className="quick-opponent-hint compact">
                    <strong>{lt('현재 입력 슬롯')}</strong>
                    <span>{selectedOpp + 1} / {MAX_OPPONENTS}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {(mainSection === 'double' && activeTab === 'power') ? <section className="panel wide">
          <div className="row-between section-head">
            <div>
              <h2>{lt('더블 계산 작업 보드')}</h2>
            </div>
          </div>

          <div className="double-layout-grid">
            <div className="double-layout-main">
              <article className="double-layout-card double-planner-main-card">
                <div className="double-layout-card-head">
                  <strong>{lt('턴 플랜')}</strong>
                  <span className={`pick-badge ${doubleTrickRoom ? 'verdict-badge' : ''}`}>{doubleTrickRoom ? lt('트릭룸 순서') : lt('기본 순서')}</span>
                </div>
                <div className="double-planner-context">
                  <div className="double-state-sections compact single">
                    <div className="double-state-card">
                      <strong>{lt('속도/전장')}</strong>
                      <div className="double-toggle-grid double-toggle-grid-field">
                        <label className="calc-toggle-box"><input type="checkbox" checked={doubleTailwindMy} onChange={(e) => setDoubleTailwindMy(e.target.checked)} /><span>{lt('아군 순풍')}</span></label>
                        <label className="calc-toggle-box"><input type="checkbox" checked={doubleTrickRoom} onChange={(e) => setDoubleTrickRoom(e.target.checked)} /><span>{lt('트릭룸')}</span></label>
                        <label className="calc-toggle-box"><input type="checkbox" checked={doubleTailwindOpp} onChange={(e) => setDoubleTailwindOpp(e.target.checked)} /><span>{lt('상대 순풍')}</span></label>
                        {doubleFriendGuardAvailableOpp ? <label className="calc-toggle-box double-toggle-grid-field-extra"><input type="checkbox" checked={doubleFriendGuardOpp} onChange={(e) => setDoubleFriendGuardOpp(e.target.checked)} /><span>{lt('상대 프렌드가드')}</span></label> : null}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="double-inline-subcard double-damage-summary-card">
                  <div className="double-layout-card-head compact">
                    <strong>{lt('상대별 총 기대 대미지')}</strong>
                  </div>
                  <div className="double-combined-damage-grid">
                    {doubleCombinedDamageSummary.map((entry) => <div key={`double-combined-${entry.defenderSlot}`} className="double-combined-damage-item">
                      <div className="double-combined-damage-head">
                        <div className="double-combined-damage-defender">
                          {entry.defenderSprite ? <img src={entry.defenderSprite} alt={entry.defenderLabel} className="double-combined-damage-sprite" /> : null}
                          <div className="double-combined-damage-defender-copy">
                            <label className="double-side-select enemy compact">
                              <select className="double-side-select-input enemy" value={entry.defenderSlot === 'oppLeft' ? doubleOppLeft : doubleOppRight} onChange={(e) => entry.defenderSlot === 'oppLeft' ? setDoubleOppLeft(Number(e.target.value)) : setDoubleOppRight(Number(e.target.value))}>
                                {doubleOpponentOptions.map((option) => <option key={`double-damage-target-${entry.defenderSlot}-${option.idx}`} value={option.idx}>{option.row ? displayName(option.row, siteLanguage) : `${lt('엔트리')} ${option.idx + 1}`}</option>)}
                              </select>
                            </label>
                          </div>
                        </div>
                        <div className="double-combined-damage-head-meta">
                          <span className={`double-combined-damage-raw-inline verdict-${entry.verdictTone}`}>{entry.totalText}</span>
                          <label className="calc-toggle-box double-slot-protect-toggle compact">
                            <input
                              type="checkbox"
                              checked={entry.defenderSlot === 'oppLeft' ? doubleProtectOppLeft : doubleProtectOppRight}
                              onChange={(e) => entry.defenderSlot === 'oppLeft' ? setDoubleProtectOppLeft(e.target.checked) : setDoubleProtectOppRight(e.target.checked)}
                            />
                            <span>{lt('방어')}</span>
                          </label>
                        </div>
                      </div>
                      <div className={`double-combined-damage-total verdict-${entry.verdictTone}`}>{entry.totalPctText}</div>
                      <div className="double-combined-damage-actions">
                        <button
                          type="button"
                          className={`pick-chip ${doubleBulkEditorSlot === entry.defenderSlot ? 'active' : ''}`}
                          onClick={() => setDoubleBulkEditorSlot(entry.defenderSlot)}
                        >
                          {lt('노력치 보정')}
                        </button>
                      </div>
                      {entry.blocked.length ? <div className="double-combined-damage-notes">
                        {entry.blocked.map((note) => <span key={`double-combined-note-${entry.defenderSlot}-${note.attackerLabel}`}>{note.attackerLabel} · {note.reason}</span>)}
                      </div> : null}
                    </div>)}
                  </div>
                </div>
                <div className="double-attack-grid">
                  {doubleActionCards.filter((entry) => entry.meta.side === 'my').map(({ slot, meta, card, moveRows, enemyTargets, spreadMove }) => {
                    const isEnemy = meta.side === 'opp'
                    return <div key={`double-focus-editor-${slot}`} className={`double-attacker-card ${isEnemy ? 'enemy' : 'ally'}`}>
                    <div className="double-focus-editor-head">
                      <div className="double-focus-editor-identity">
                        {card?.row?.sprite ? <img src={card.row.sprite} alt={card.name || meta.label} className="double-focus-editor-sprite" /> : null}
                        <label className={`double-side-select compact ${isEnemy ? 'enemy' : ''}`}>
                          <select className={`double-side-select-input ${isEnemy ? 'enemy' : ''}`} value={slot === 'myLeft' ? doubleMyLeft : doubleMyRight} onChange={(e) => slot === 'myLeft' ? setDoubleMyLeft(Number(e.target.value)) : setDoubleMyRight(Number(e.target.value))}>
                            {doublePartyOptions.map((option) => <option key={`double-attacker-select-${slot}-${option.idx}`} value={option.idx}>{option.row ? displayName(option.row, siteLanguage) : `${lt('파티 슬롯')} ${option.idx + 1}`}</option>)}
                          </select>
                        </label>
                      </div>
                      <div className="double-speed-value-inline">{card?.speed ?? '—'}</div>
                    </div>
                    <div className="double-focus-editor-section">
                      <div className="double-move-grid-2x2">
                        {moveRows.length ? moveRows.map(({ move, type, priority, selected }) => <button
                          key={`double-move-cell-${slot}-${move}`}
                          type="button"
                          className={`double-move-cell ${selected ? 'active' : ''}`}
                          onClick={() => {
                            setDoubleActionFocusSlot(slot)
                            setDoubleActionMoveBySlot[slot](move)
                          }}
                        >
                          <span className="double-move-row-title">{move}</span>
                          <span className="double-move-row-meta">
                            {type ? <SmallTypeBadgeImage type={type} /> : null}
                            <span>{lt('우선도')} {priority >= 0 ? `+${priority}` : priority}</span>
                          </span>
                        </button>) : <span className="double-action-empty">{lt('등록 기술 없음')}</span>}
                      </div>
                    </div>
                    {!spreadMove && enemyTargets.length ? <div className="double-focus-editor-section">
                      <span className="double-action-card-label">{lt('상대 대상')}</span>
                      <div className="double-target-chip-row">
                        {enemyTargets.map((entry) => <button
                          key={`double-action-enemy-target-${slot}-${entry.targetSlot}`}
                          type="button"
                          className={`double-target-chip ${entry.selected ? 'active enemy' : ''}`}
                          onClick={() => {
                            setDoubleActionFocusSlot(slot)
                            setDoubleActionTargetBySlot[slot](entry.targetSlot)
                          }}
                        >{entry.label}</button>)}
                      </div>
                    </div> : null}
                    {spreadMove ? <div className="double-spread-note">{lt('광역기 감쇠가 자동 적용됩니다.')}</div> : null}
                  </div>})}
                </div>
                <div className="double-inline-subcard">
                  <div className="double-layout-card-head compact">
                    <strong>{lt('4마리 행동순')}</strong>
                  </div>
                  <div className="double-speed-preview-list">
                    {doubleActionOrder.map((entry, idx) => <div key={`double-order-${entry.slot}`} className={`double-speed-preview-item ${entry.side === 'opp' ? 'opp' : 'my'}`}>
                      <span>{idx + 1}{lt('순위')} · {entry.label}</span>
                      <div className="double-order-main with-sprite">
                        {entry.sprite ? <img src={entry.sprite} alt={entry.name} className="double-order-sprite" /> : null}
                        <strong>{entry.name}</strong>
                      </div>
                      <div className="double-speed-value-inline">{entry.speed ?? '—'}</div>
                    </div>)}
                  </div>
                </div>
              </article>
            </div>

          </div>

        </section> : null}

        {((mainSection === 'single' && activeTab === 'party') || (mainSection === 'double' && activeTab === 'party')) ? <section className="panel wide">
          <div className="party-columns party-manage-columns">
            <div className="section-head row-between">
              <h2>{lt('내 파티 관리')}</h2>
              <div className="inline-controls compact-actions">
                <button type="button" className="action-button" onClick={() => partyImageInputRef.current?.click()} disabled={partyImageImportBusy}>{partyImageImportBusy ? lt('OCR 추출 중...') : lt('사진 IMPORT')}</button>
                <button type="button" className="action-button danger" onClick={resetPartyForFreshEntry}>{lt('내 파티 초기화')}</button>
              </div>
            </div>
            <div className="party-preset-board">
              <div className="party-preset-board-head row-between">
                <strong>{lt('저장한 파티')}</strong>
                <span className="muted-inline">{savedSampleCountLabel(savedPartyPresets.length, siteLanguage)}</span>
              </div>
              <div className="party-preset-controls">
                <input
                  value={partyPresetLabelDraft}
                  onChange={(e) => setPartyPresetLabelDraft(e.target.value)}
                  placeholder={lt('파티 이름')}
                />
                <button type="button" className="pick-chip" onClick={saveNewPartyPreset}>{lt('새 파티 저장')}</button>
                <button type="button" className={`pick-chip ${activePartyPresetId ? '' : 'disabled'}`} onClick={overwriteActivePartyPreset} disabled={!activePartyPresetId}>{lt('현재 파티 덮어쓰기')}</button>
              </div>
              <span className="muted-inline">{lt('여러 스크린샷의 이름/상세 영역을 합쳐 종·도구·특성·기술·성격·노력치를 최대한 복원합니다.')}</span>
              {partyImageImportStatus ? <span className="muted-inline">{partyImageImportStatus}</span> : null}
              <div className="party-preset-grid">
                {savedPartyPresets.length ? savedPartyPresets.map((preset) => {
                  const leadMembers = preset.party.filter((member) => member.key).slice(0, 6)
                  return <div key={preset.id} className={`party-preset-card ${activePartyPresetId === preset.id ? 'active' : ''}`}>
                    <button type="button" className="party-preset-card-main" onClick={() => applyPartyPreset(preset.party, preset.lockedMovesBySlot, preset.id)}>
                      <div className="party-preset-sprite-row">
                        {leadMembers.length ? leadMembers.map((member, idx) => {
                          const row = indexByKey.get(member.key) ?? rows[0]
                          return row?.sprite ? <img key={`${preset.id}-${member.key}-${idx}`} src={row.sprite} alt={displayName(row, siteLanguage)} className="party-preset-sprite" /> : null
                        }) : <span className="muted-inline">—</span>}
                      </div>
                      <strong>{preset.label}</strong>
                      <span className="muted-inline">{leadMembers.length}/6</span>
                    </button>
                    <div className="party-preset-card-actions">
                      <button type="button" className="pick-chip" onClick={() => applyPartyPreset(preset.party, preset.lockedMovesBySlot, preset.id)}>{lt('파티 적용')}</button>
                      <button type="button" className="pick-chip" onClick={() => renamePartyPreset(preset)}>{lt('이름 변경')}</button>
                      <button type="button" className="pick-chip" onClick={() => {
                        setSavedPartyPresets((prev) => prev.filter((entry) => entry.id !== preset.id))
                        setActivePartyPresetId((prev) => prev === preset.id ? null : prev)
                      }}>{lt('삭제')}</button>
                    </div>
                  </div>
                }) : <p className="muted">{lt('아직 저장한 파티가 없습니다.')}</p>}
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
                const memberTopSuggestedMoves = usageTopMovesForKey(member.key)
                const partySpeciesMenuId = `party-species-${idx}`
                const partySpeciesOptions = filterSpeciesOptions(partySearch[idx] ?? '').slice(0, 8)
                const partyItemMenuId = `party-item-${idx}`
                const partyItemOptions = filterItemOptions(partyItemDrafts[idx] || '', siteLanguage).slice(0, 8)
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
                            <label className="species-picker party-inline-species-picker">
                              <div className="autocomplete" onClick={(e) => e.stopPropagation()}>
                                <input
                                  ref={(element) => { partySpeciesInputRefs.current[idx] = element }}
                                  value={partySearch[idx] ?? ''}
                                  className="party-inline-species-input"
                                  placeholder={row ? lt('포켓몬 검색') : emptySlotLabel(idx, siteLanguage)}
                                  onFocus={() => {
                                    setActiveSearchField({ side: 'party', idx })
                                    setAutocompleteMenuOpen(partySpeciesMenuId)
                                  }}
                                  onBlur={() => {
                                    setTimeout(() => setActiveSearchField((prev) => sameSearchTarget(prev, 'party', idx) ? null : prev), 120)
                                    setTimeout(() => closeAutocompleteMenu(partySpeciesMenuId), 120)
                                  }}
                                  onChange={(e) => {
                                    const next = [...partySearch]
                                    next[idx] = e.target.value
                                    setPartySearch(next)
                                    setActiveSearchField({ side: 'party', idx })
                                    setAutocompleteMenuOpen(partySpeciesMenuId)
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                                      e.preventDefault()
                                      moveAutocompleteMenuHighlight(partySpeciesMenuId, partySpeciesOptions.length, e.key === 'ArrowDown' ? 1 : -1)
                                      return
                                    }
                                    if (e.key !== 'Enter') return
                                    const highlightedOption = partySpeciesOptions[highlightedAutocompleteIndex(autocompleteHighlight, partySpeciesMenuId)]
                                    const committed = highlightedOption ? (selectSpecies('party', idx, highlightedOption.key), true) : commitTopSpeciesOption('party', idx, partySearch[idx] ?? '')
                                    if (committed) {
                                      e.preventDefault()
                                      closeAutocompleteMenu(partySpeciesMenuId)
                                    }
                                  }}
                                />
                                {sameSearchTarget(activeSearchField, 'party', idx) ? (
                                  <div className="autocomplete-menu unified-dropdown-menu">
                                    {partySpeciesOptions.map((option, optionIdx) => (
                                      <button key={option.key} type="button" className={`autocomplete-item ${highlightedAutocompleteIndex(autocompleteHighlight, partySpeciesMenuId) === optionIdx ? 'active' : ''}`} onMouseDown={() => selectSpecies('party', idx, option.key)}>
                                        {searchDisplayLabel(option.key, siteLanguage)}
                                      </button>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            </label>
                            {row ? <div className="type-line">
                              <span className="type-badge-wrap">{row.types.map((type) => <TypeBadgeImage key={type} type={type} />)}</span>
                            </div> : null}
                          </div>
                        </div>
                      </div>
                    </div>
                    {row ? <div className="party-meta-grid" onClick={(e) => e.stopPropagation()}>
                      <div className="party-meta-chip party-meta-chip-editor">
                        <button type="button" className="party-meta-chip-button" onClick={() => setActivePartyMetaEditor((prev) => prev?.idx === idx && prev.field === 'ability' ? null : { idx, field: 'ability' })}>
                          <span>{lt('특성')}</span>
                          <strong {...bindTooltip(activeAbility ? abilityTooltipData(activeAbility, siteLanguage, row) : null)}>{activeAbility || lt('미선택')}</strong>
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
                          {...bindTooltip(abilityTooltipData(ability, siteLanguage, row))}
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
                        <button type="button" className="party-meta-chip-button" onClick={() => setActivePartyMetaEditor((prev) => prev?.idx === idx && prev.field === 'item' ? null : { idx, field: 'item' })} {...bindTooltip(currentItem ? itemTooltipData(currentItem, siteLanguage) : null)}>
                          <span>{lt('도구')}</span>
                          <div className="item-meta-row">
                            <img src={itemSpriteSrc(member.key, currentItem)} alt={displayItemLabel(currentItem || '도구', siteLanguage)} className="item-sprite" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} />
                            <strong>{currentItem ? displayItemLabel(currentItem, siteLanguage) : lt('미선택')}</strong>
                          </div>
                        </button>
                        {activePartyMetaEditor?.idx === idx && activePartyMetaEditor.field === 'item' ? <div className="party-meta-popover">
                          <div className="meta-item-input-row">
                          <input ref={(el) => { partyItemEditorRefs.current[idx] = el }} autoFocus value={fixedMegaStone ? displayItemLabel(fixedMegaStone, siteLanguage) : partyItemDrafts[idx] || ''} placeholder={fixedMegaStone ? lt('메가스톤 고정') : lt('사용 가능 도구 선택')} disabled={Boolean(fixedMegaStone)} onFocus={() => {
                            if (fixedMegaStone) return
                            setActiveItemField({ scope: 'party', idx })
                            setAutocompleteMenuOpen(partyItemMenuId)
                          }} onBlur={() => {
                            setTimeout(() => setActiveItemField((prev) => sameItemField(prev, 'party', idx) ? null : prev), 120)
                            setTimeout(() => closeAutocompleteMenu(partyItemMenuId), 120)
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
                            setAutocompleteMenuOpen(partyItemMenuId)
                          }} onKeyDown={(e) => {
                            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                              e.preventDefault()
                              moveAutocompleteMenuHighlight(partyItemMenuId, partyItemOptions.length, e.key === 'ArrowDown' ? 1 : -1)
                              return
                            }
                            if (e.key !== 'Enter') return
                            e.preventDefault()
                            const highlightedItem = partyItemOptions[highlightedAutocompleteIndex(autocompleteHighlight, partyItemMenuId)]
                            if (highlightedItem) {
                              selectPartyItemOption(idx, member, highlightedItem)
                              closeAutocompleteMenu(partyItemMenuId)
                              return
                            }
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
                            closeAutocompleteMenu(partyItemMenuId)
                            setActivePartyMetaEditor(null)
                          }} />
                          {!fixedMegaStone && (partyItemDrafts[idx] || currentItem) ? <button type="button" className="meta-item-clear-button" aria-label="clear item" onMouseDown={(e) => {
                            e.preventDefault()
                            clearPartyItemInput(idx, member)
                          }}>×</button> : null}
                          </div>
                          {!fixedMegaStone && sameItemField(activeItemField, 'party', idx) ? <div className="move-autocomplete-menu unified-dropdown-menu">
                            {partyItemOptions.map((item, optionIdx) => (
                              <button key={`party-item-suggest-${idx}-${item}`} type="button" className={`move-autocomplete-item item-autocomplete-item ${highlightedAutocompleteIndex(autocompleteHighlight, partyItemMenuId) === optionIdx ? 'active' : ''}`} onMouseDown={() => selectPartyItemOption(idx, member, item)}>
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
                    {row ? <div className="stat-preview-list">
                      {EFFORT_STAT_OPTIONS.map((stat) => (
                        <button key={stat.key} type="button" className={`stat-preview-row stat-preview-button ${statThemeClass(stat.key)}`} onClick={(e) => {
                          e.stopPropagation()
                          setTuningModalIndex(idx)
                        }}>
                          <div className="stat-preview-topline">
                            <span>{lt(stat.label)}</span>
                            <strong>{partyStatValue(row, member, stat.key)}</strong>
                          </div>
                          <div className="stat-preview-bar"><span style={{ width: statGaugePercent(partyStatValue(row, member, stat.key)) }} /></div>
                          <div className="stat-preview-meta">
                            <span className="stat-preview-ev">EV +{member.evs[stat.key]}</span>
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
                        {registeredMoves.map((move, moveIdx) => {
                          const moveType = findMoveType(move)
                          return <label key={`registered-move-${member.key}-${moveIdx}`} className={`registered-move-slot ${moveTypeThemeClass(moveType)} ${memberMovePool?.status === 'loading' ? 'move-pool-loading' : ''}`}>
                            <div className="registered-move-slot-head">
                              <span>{moveIdx + 1}번</span>
                              {moveType ? <SmallTypeBadgeImage type={moveType} /> : null}
                            </div>
                            <input
                              value={move}
                              {...bindTooltip(move ? moveTooltipData(move, siteLanguage) : null)}
                              placeholder={memberMovePool?.status === 'loading' ? lt('기술풀 불러오는 중…') : memberMoveOptions.length ? lt('사용 가능 기술 검색') : lt('기술 입력')}
                              onFocus={() => {
                                setActiveMoveField({ key: member.key, slotIdx: moveIdx, scope: 'party' })
                                setAutocompleteMenuOpen(`party-move-${member.key}-${moveIdx}`)
                              }}
                              onBlur={() => {
                                setTimeout(() => setActiveMoveField((prev) => sameMoveField(prev, member.key, moveIdx, 'party') ? null : prev), 120)
                                setTimeout(() => closeAutocompleteMenu(`party-move-${member.key}-${moveIdx}`), 120)
                              }}
                              onChange={(e) => {
                                setConfirmedMoveSlot(member.key, moveIdx, e.target.value)
                                setActiveMoveField({ key: member.key, slotIdx: moveIdx, scope: 'party' })
                                setAutocompleteMenuOpen(`party-move-${member.key}-${moveIdx}`)
                              }}
                              onKeyDown={(e) => {
                                const moveSuggestions = filterMoveOptions(move, memberMoveOptions).slice(0, 8)
                                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                                  e.preventDefault()
                                  moveAutocompleteMenuHighlight(`party-move-${member.key}-${moveIdx}`, moveSuggestions.length, e.key === 'ArrowDown' ? 1 : -1)
                                  return
                                }
                                if (e.key !== 'Enter') return
                                const highlightedMove = moveSuggestions[highlightedAutocompleteIndex(autocompleteHighlight, `party-move-${member.key}-${moveIdx}`)]
                                const committed = highlightedMove ? (selectMoveOption(member.key, moveIdx, highlightedMove.name), true) : commitTopMoveOption(member.key, moveIdx, move, memberMoveOptions)
                                if (committed) {
                                  e.preventDefault()
                                  setActiveMoveField(null)
                                  closeAutocompleteMenu(`party-move-${member.key}-${moveIdx}`)
                                }
                              }}
                            />
                            {sameMoveField(activeMoveField, member.key, moveIdx, 'party') && memberMoveOptions.length ? (
                              <div className="move-autocomplete-menu unified-dropdown-menu">
                                {filterMoveOptions(move, memberMoveOptions).slice(0, 8).map((option, optionIdx) => (
                                  <button key={`party-move-suggest-${member.key}-${moveIdx}-${option.name}`} type="button" className={`move-autocomplete-item ${moveTypeThemeClass(option.type)} ${highlightedAutocompleteIndex(autocompleteHighlight, `party-move-${member.key}-${moveIdx}`) === optionIdx ? 'active' : ''}`} onMouseDown={() => selectMoveOption(member.key, moveIdx, option.name)} {...bindTooltip(moveTooltipData(option.name, siteLanguage))}>
                                    <span className="move-autocomplete-main">
                                      {option.type ? <SmallTypeBadgeImage type={option.type} /> : null}
                                      <span>{option.name}</span>
                                    </span>
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </label>
                        })}
                      </div>
                      {memberTopSuggestedMoves.length ? <div className="sample-track-card top-move-chip-card">
                        <div className="row-between sample-track-head compact-gap">
                          <strong>{lt('사용률 상위 기술')}</strong>
                          <span className="muted-inline">Top {Math.min(10, memberTopSuggestedMoves.length)}</span>
                        </div>
                        <div className="move-chip-wrap">
                          {memberTopSuggestedMoves.map((move) => {
                            const locked = registeredMoves.includes(move)
                            const moveType = findMoveType(move)
                            return <button key={`party-top-${member.key}-${move}`} type="button" className={`move-chip core ${locked ? 'confirmed' : ''} ${moveTypeThemeClass(moveType)}`} onClick={() => applyMoveToSlot(member.key, move)} {...bindTooltip(moveTooltipData(move, siteLanguage))}>{moveType ? <SmallTypeBadgeImage type={moveType} /> : null}<span>{move}</span></button>
                          })}
                        </div>
                      </div> : null}
                    </div> : null}
                  </div>
                )
              })}
            </div>
          </div>
        </section> : null}

        {mainSection === 'home' ? null : ((mainSection === 'single' && activeTab === 'pick') || (mainSection === 'double' && activeTab === 'pick')) ? <>
        <section className="panel wide">
          <div className="row-between section-head">
            <div>
              <h2>{lt('상대 엔트리')}</h2>
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
                  placeholder={searchSlotPlaceholder(selectedOpp, siteLanguage)}
                  onFocus={() => {
                    setActiveSearchField({ side: 'opponentQuick', idx: 0 })
                    setAutocompleteMenuOpen('opponent-quick-species-0')
                  }}
                  onBlur={() => {
                    setTimeout(() => setActiveSearchField((prev) => sameSearchTarget(prev, 'opponentQuick', 0) ? null : prev), 120)
                    setTimeout(() => closeAutocompleteMenu('opponent-quick-species-0'), 120)
                  }}
                  onChange={(e) => {
                    setOpponentQuickSearch(e.target.value)
                    setActiveSearchField({ side: 'opponentQuick', idx: 0 })
                    setAutocompleteMenuOpen('opponent-quick-species-0')
                  }}
                  onKeyDown={(e) => {
                    const options = filterSpeciesOptions(opponentQuickSearch, { includeMega: false }).slice(0, 8)
                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                      e.preventDefault()
                      moveAutocompleteMenuHighlight('opponent-quick-species-0', options.length, e.key === 'ArrowDown' ? 1 : -1)
                      return
                    }
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const highlightedOption = options[highlightedAutocompleteIndex(autocompleteHighlight, 'opponent-quick-species-0')]
                      commitOpponentQuickSearch(highlightedOption?.key)
                      closeAutocompleteMenu('opponent-quick-species-0')
                    }
                  }}
                />
                {sameSearchTarget(activeSearchField, 'opponentQuick', 0) ? (
                  <div className="autocomplete-menu unified-dropdown-menu">
                      {filterSpeciesOptions(opponentQuickSearch, { includeMega: false }).slice(0, 8).map((option, optionIdx) => (
                      <button key={option.key} type="button" className={`autocomplete-item ${highlightedAutocompleteIndex(autocompleteHighlight, 'opponent-quick-species-0') === optionIdx ? 'active' : ''}`} onMouseDown={() => commitOpponentQuickSearch(option.key)}>
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
                  <small {...bindTooltip(member.item ? itemTooltipData(member.item, siteLanguage) : null)}>{member.item ? displayItemLabel(member.item, siteLanguage) : lt('도구 없음')}</small>
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
                    <span {...bindTooltip(member.item ? itemTooltipData(member.item, siteLanguage) : null)}>{member.item ? displayItemLabel(member.item, siteLanguage) : lt('도구 미기입')}</span>
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
                      onFocus={() => {
                        setActiveSearchField({ side: 'opponent', idx: selectedOpp })
                        setAutocompleteMenuOpen(`opponent-species-${selectedOpp}`)
                      }}
                      onBlur={() => {
                        setTimeout(() => setActiveSearchField((prev) => sameSearchTarget(prev, 'opponent', selectedOpp) ? null : prev), 120)
                        setTimeout(() => closeAutocompleteMenu(`opponent-species-${selectedOpp}`), 120)
                      }}
                      onChange={(e) => {
                        const next = [...opponentSearch]
                        next[selectedOpp] = e.target.value
                        setOpponentSearch(next)
                        setActiveSearchField({ side: 'opponent', idx: selectedOpp })
                        setAutocompleteMenuOpen(`opponent-species-${selectedOpp}`)
                      }}
                      onKeyDown={(e) => {
                        const options = filterSpeciesOptions(opponentSearch[selectedOpp] ?? '', { includeMega: false }).slice(0, 8)
                        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                          e.preventDefault()
                          moveAutocompleteMenuHighlight(`opponent-species-${selectedOpp}`, options.length, e.key === 'ArrowDown' ? 1 : -1)
                          return
                        }
                        if (e.key !== 'Enter') return
                        const highlightedOption = options[highlightedAutocompleteIndex(autocompleteHighlight, `opponent-species-${selectedOpp}`)]
                        const committed = highlightedOption ? (selectSpecies('opponent', selectedOpp, highlightedOption.key), true) : commitTopSpeciesOption('opponent', selectedOpp, opponentSearch[selectedOpp] ?? '')
                        if (committed) {
                          e.preventDefault()
                          closeAutocompleteMenu(`opponent-species-${selectedOpp}`)
                        }
                      }}
                    />
                    {sameSearchTarget(activeSearchField, 'opponent', selectedOpp) ? (
                      <div className="autocomplete-menu unified-dropdown-menu">
                        {filterSpeciesOptions(opponentSearch[selectedOpp] ?? '', { includeMega: false }).slice(0, 8).map((option, optionIdx) => (
                          <button key={option.key} type="button" className={`autocomplete-item ${highlightedAutocompleteIndex(autocompleteHighlight, `opponent-species-${selectedOpp}`) === optionIdx ? 'active' : ''}`} onMouseDown={() => selectSpecies('opponent', selectedOpp, option.key)}>
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
                        onFocus={() => {
                          if (!oppMember.key) return
                          setActiveItemField({ scope: 'opponent', idx: selectedOpp })
                          setAutocompleteMenuOpen(`opponent-item-${selectedOpp}`)
                        }}
                        onBlur={() => {
                          setTimeout(() => setActiveItemField((prev) => sameItemField(prev, 'opponent', selectedOpp) ? null : prev), 120)
                          setTimeout(() => closeAutocompleteMenu(`opponent-item-${selectedOpp}`), 120)
                          commitOpponentItemInput(selectedOpp)
                        }}
                        onChange={(e) => {
                          const nextDrafts = [...opponentItemDrafts]
                          nextDrafts[selectedOpp] = e.target.value
                          setOpponentItemDrafts(nextDrafts)
                          setActiveItemField({ scope: 'opponent', idx: selectedOpp })
                          setAutocompleteMenuOpen(`opponent-item-${selectedOpp}`)
                        }}
                        onKeyDown={(e) => {
                          const options = filterItemOptions(opponentItemDrafts[selectedOpp] || '', siteLanguage).slice(0, 8)
                          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                            e.preventDefault()
                            moveAutocompleteMenuHighlight(`opponent-item-${selectedOpp}`, options.length, e.key === 'ArrowDown' ? 1 : -1)
                            return
                          }
                          if (e.key !== 'Enter') return
                          e.preventDefault()
                          const highlightedItem = options[highlightedAutocompleteIndex(autocompleteHighlight, `opponent-item-${selectedOpp}`)]
                          if (highlightedItem) {
                            selectOpponentItemOption(selectedOpp, highlightedItem)
                            closeAutocompleteMenu(`opponent-item-${selectedOpp}`)
                            return
                          }
                          commitOpponentItemInput(selectedOpp)
                          setActiveItemField(null)
                          closeAutocompleteMenu(`opponent-item-${selectedOpp}`)
                        }}
                      />
                      {oppMember.key && (opponentItemDrafts[selectedOpp] || oppMember.item) ? <button type="button" className="meta-item-clear-button" aria-label="clear item" onMouseDown={(e) => {
                        e.preventDefault()
                        clearOpponentItemInput(selectedOpp)
                      }}>×</button> : null}
                    </div>
                    {oppMember.key && sameItemField(activeItemField, 'opponent', selectedOpp) ? <div className="move-autocomplete-menu unified-dropdown-menu">
                      {filterItemOptions(opponentItemDrafts[selectedOpp] || '', siteLanguage).slice(0, 8).map((item, optionIdx) => (
                        <button key={`opp-item-suggest-${selectedOpp}-${item}`} type="button" className={`move-autocomplete-item item-autocomplete-item ${highlightedAutocompleteIndex(autocompleteHighlight, `opponent-item-${selectedOpp}`) === optionIdx ? 'active' : ''}`} onMouseDown={() => selectOpponentItemOption(selectedOpp, item)}>
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
                    {...bindTooltip(oppMember.ability ? abilityTooltipData(oppMember.ability, siteLanguage, oppRow) : null)}
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
                          }} {...bindTooltip(moveTooltipData(move, siteLanguage))}>
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
                      <div className="damage-opponent-move-meta">
                        <strong>{lt('공개 기술')}</strong>
                        <span>{oppMember.revealedMoves.length} / 4</span>
                      </div>
                      {oppMember.key && oppTopSuggestedMoves.length ? <details className="damage-top-move-strip">
                        <summary className="damage-top-move-strip-summary">
                          <span className="damage-top-move-strip-summary-copy">
                            <strong>{lt('사용률 상위 기술')}</strong>
                            <span className="muted-inline">Top {Math.min(10, oppTopSuggestedMoves.length)}</span>
                          </span>
                          <span className="damage-top-move-strip-summary-status muted-inline">{lt('현재')} {oppMember.revealedMoves.length} / 4</span>
                        </summary>
                        <div className="move-chip-wrap damage-top-move-strip-chips">
                          {oppTopSuggestedMoves.map((move) => {
                            const moveType = resolveMoveType(move, oppMoveOptions, movePoolByKey)
                            const locked = oppMember.revealedMoves.includes(move)
                            return (
                              <button
                                key={`opp-top-move-${oppMember.key}-${move}`}
                                type="button"
                                className={`move-chip core ${locked ? 'confirmed quiet-confirmed' : ''} ${moveTypeThemeClass(moveType)}`}
                                onClick={() => addOpponentRevealedMove(move)}
                                disabled={locked || oppMember.revealedMoves.length >= 4}
                                {...bindTooltip(moveTooltipData(move, siteLanguage))}
                              >
                                {move}
                              </button>
                            )
                          })}
                        </div>
                      </details> : null}
                      <label className="damage-opponent-move-entry">
                        <span>{lt('상대 기술 추가')}</span>
                        <div className="damage-opponent-move-input-row">
                          <input
                            value={opponentMoveDraft}
                            placeholder={lt('사용 가능 기술 검색')}
                            disabled={!oppMember.key || oppMember.revealedMoves.length >= 4}
                            onFocus={() => {
                              setOpponentMoveInputFocused(true)
                              setAutocompleteMenuOpen(`opp-entry-move-${selectedOpp}`)
                            }}
                            onBlur={() => {
                              setTimeout(() => setOpponentMoveInputFocused(false), 120)
                              setTimeout(() => closeAutocompleteMenu(`opp-entry-move-${selectedOpp}`), 120)
                            }}
                            onChange={(e) => {
                              setOpponentMoveDraft(e.target.value)
                              setAutocompleteMenuOpen(`opp-entry-move-${selectedOpp}`)
                            }}
                            onKeyDown={(e) => {
                              const options = filterMoveOptions(opponentMoveDraft, oppMoveOptions)
                                .filter((option) => !oppMember.revealedMoves.includes(option.name))
                                .slice(0, 8)
                              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                                e.preventDefault()
                                moveAutocompleteMenuHighlight(`opp-entry-move-${selectedOpp}`, options.length, e.key === 'ArrowDown' ? 1 : -1)
                                return
                              }
                              if (e.key !== 'Enter') return
                              e.preventDefault()
                              const highlightedMove = options[highlightedAutocompleteIndex(autocompleteHighlight, `opp-entry-move-${selectedOpp}`)]
                              if (highlightedMove) {
                                addOpponentRevealedMove(highlightedMove.name)
                                setOpponentMoveDraft('')
                                setOpponentMoveInputFocused(false)
                                closeAutocompleteMenu(`opp-entry-move-${selectedOpp}`)
                                return
                              }
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
                      {oppMember.key && opponentMoveInputFocused && opponentMoveDraft && oppMoveOptions.length ? <div className="move-autocomplete-menu unified-dropdown-menu damage-opponent-move-menu">
                        {filterMoveOptions(opponentMoveDraft, oppMoveOptions)
                          .filter((option) => !oppMember.revealedMoves.includes(option.name))
                          .slice(0, 8)
                          .map((option, optionIdx) => (
                            <button key={`opp-entry-move-suggest-${oppMember.key}-${option.name}`} type="button" className={`move-autocomplete-item ${highlightedAutocompleteIndex(autocompleteHighlight, `opp-entry-move-${selectedOpp}`) === optionIdx ? 'active' : ''}`} onMouseDown={() => {
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
                  <textarea value={oppMember.notes} placeholder={lt('상대 메모 예시')} onChange={(e) => {
                    const next = [...opponents]
                    next[selectedOpp] = { ...oppMember, notes: e.target.value }
                    setOpponents(next)
                  }} />
                </label>
                <div className="inline-controls">
                  <label>
                    {lt('스피드 EV')}
                    <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={oppMember.speedEv} onChange={(e) => {
                      const next = [...opponents]
                      next[selectedOpp] = { ...oppMember, speedEv: clampNonNegativeInt(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) }
                      setOpponents(next)
                    }} />
                  </label>
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
            placeholder={lt('엔트리 메모 예시')}
            onChange={(e) => setBattleNote(e.target.value)}
          />
        </section>
        </> : mainSection === 'sample' ? <>
        <section className="panel wide sample-workbench-panel">
          <div className="sample-content-panel">
          {sampleWorkbenchTab === 'builder' ? <>
            <div className="sample-builder-grid compact-sample-builder-grid">
            <div id="sample-builder-card" className="sample-main-card flat-sample-main-card">
              <div className="sample-panel-header sample-panel-header-main">
              <div className="sample-hero sample-hero-attached">
                {sampleRow.sprite ? <img src={sampleRow.sprite} alt={displayName(sampleRow, siteLanguage)} className="entry-sprite large" /> : null}
                <div className="sample-hero-copy">
                  <div className="autocomplete sample-species-search sample-hero-search">
                    <input
                      className="sample-species-search-input sample-hero-search-input"
                      value={sampleSearch}
                      placeholder={lt('포켓몬 검색')}
                      onFocus={() => {
                        setActiveSearchField({ side: 'sample', idx: 0 })
                        setAutocompleteMenuOpen(sampleSpeciesMenuId)
                      }}
                      onBlur={() => {
                        setTimeout(() => setActiveSearchField((prev) => sameSearchTarget(prev, 'sample', 0) ? null : prev), 120)
                        setTimeout(() => closeAutocompleteMenu(sampleSpeciesMenuId), 120)
                      }}
                      onChange={(e) => {
                        setSampleSearch(e.target.value)
                        setActiveSearchField({ side: 'sample', idx: 0 })
                        setAutocompleteMenuOpen(sampleSpeciesMenuId)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                          e.preventDefault()
                          moveAutocompleteMenuHighlight(sampleSpeciesMenuId, sampleSpeciesOptions.length, e.key === 'ArrowDown' ? 1 : -1)
                          return
                        }
                        if (e.key !== 'Enter') return
                        const highlightedOption = sampleSpeciesOptions[highlightedAutocompleteIndex(autocompleteHighlight, sampleSpeciesMenuId)]
                        const committed = highlightedOption ? (selectSpecies('sample', 0, highlightedOption.key), true) : commitTopSpeciesOption('sample', 0, sampleSearch)
                        if (committed) {
                          e.preventDefault()
                          closeAutocompleteMenu(sampleSpeciesMenuId)
                        }
                      }}
                    />
                    {sameSearchTarget(activeSearchField, 'sample', 0) ? (
                      <div className="autocomplete-menu unified-dropdown-menu">
                        {sampleSpeciesOptions.map((option, optionIdx) => (
                          <button key={option.key} type="button" className={`autocomplete-item ${highlightedAutocompleteIndex(autocompleteHighlight, sampleSpeciesMenuId) === optionIdx ? 'active' : ''}`} onMouseDown={() => selectSpecies('sample', 0, option.key)}>
                            {searchDisplayLabel(option.key, siteLanguage)}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="summary-line sample-type-line">
                    <span className="type-badge-wrap">{sampleRow.types.map((type) => <TypeBadgeImage key={type} type={type} />)}</span>
                  </div>
                </div>
              </div>
              </div>
              <div className="party-meta-grid sample-meta-grid">
                <div className="party-meta-chip party-meta-chip-editor">
                  <button type="button" className="party-meta-chip-button" onClick={() => setActiveSampleMetaEditor((prev) => prev === 'ability' ? null : 'ability')}>
                    <span>{lt('특성')}</span>
                    <strong {...bindTooltip(sampleAbility ? abilityTooltipData(sampleAbility, siteLanguage, sampleRow) : null)}>{sampleAbility || lt('미선택')}</strong>
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
                    {...bindTooltip(abilityTooltipData(ability, siteLanguage, sampleRow))}
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
                  <button type="button" className="party-meta-chip-button" onClick={() => setActiveSampleMetaEditor((prev) => prev === 'item' ? null : 'item')} {...bindTooltip(sampleCurrentItem ? itemTooltipData(sampleCurrentItem, siteLanguage) : null)}>
                    <span>{lt('도구')}</span>
                    <div className="item-meta-row">
                      <img src={itemSpriteSrc(sampleForge.key, sampleCurrentItem)} alt={displayItemLabel(sampleCurrentItem || '도구', siteLanguage)} className="item-sprite" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} />
                      <strong>{sampleCurrentItem ? displayItemLabel(sampleCurrentItem, siteLanguage) : lt('미선택')}</strong>
                    </div>
                  </button>
                  {activeSampleMetaEditor === 'item' ? <div className="party-meta-popover">
                    <div className="meta-item-input-row">
                    <input ref={sampleItemEditorRef} autoFocus value={sampleFixedMegaStone ? displayItemLabel(sampleFixedMegaStone, siteLanguage) : sampleItemDraft} placeholder={sampleFixedMegaStone ? lt('메가스톤 고정') : lt('사용 가능 도구 선택')} disabled={Boolean(sampleFixedMegaStone)} onFocus={() => {
                      if (sampleFixedMegaStone) return
                      setActiveItemField({ scope: 'sample', idx: 0 })
                      setAutocompleteMenuOpen(sampleItemMenuId)
                    }} onChange={(e) => {
                      setSampleItemDraft(e.target.value)
                      if (!sampleFixedMegaStone) {
                        setActiveItemField({ scope: 'sample', idx: 0 })
                        setAutocompleteMenuOpen(sampleItemMenuId)
                      }
                    }} onBlur={() => {
                      setTimeout(() => setActiveItemField((prev) => sameItemField(prev, 'sample', 0) ? null : prev), 120)
                      setTimeout(() => closeAutocompleteMenu(sampleItemMenuId), 120)
                      const resolved = resolveItemInput(sampleForge.key, sampleItemDraft, siteLanguage)
                      setSampleForge((prev) => ({ ...prev, item: resolved }))
                      setSampleItemDraft(displayItemLabel(resolved, siteLanguage))
                      setTimeout(() => setActiveSampleMetaEditor((prev) => prev === 'item' ? null : prev), 120)
                    }} onKeyDown={(e) => {
                      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        e.preventDefault()
                        moveAutocompleteMenuHighlight(sampleItemMenuId, sampleItemOptions.length, e.key === 'ArrowDown' ? 1 : -1)
                        return
                      }
                      if (e.key !== 'Enter') return
                      e.preventDefault()
                      const highlightedItem = sampleItemOptions[highlightedAutocompleteIndex(autocompleteHighlight, sampleItemMenuId)]
                      if (highlightedItem) {
                        selectSampleItemOption(highlightedItem)
                        closeAutocompleteMenu(sampleItemMenuId)
                        return
                      }
                      const resolved = resolveItemInput(sampleForge.key, sampleItemDraft, siteLanguage)
                      setSampleForge((prev) => ({ ...prev, item: resolved }))
                      setSampleItemDraft(displayItemLabel(resolved, siteLanguage))
                      setActiveItemField(null)
                      closeAutocompleteMenu(sampleItemMenuId)
                      setActiveSampleMetaEditor(null)
                    }} />
                    {!sampleFixedMegaStone && (sampleItemDraft || sampleCurrentItem) ? <button type="button" className="meta-item-clear-button" aria-label="clear item" onMouseDown={(e) => {
                      e.preventDefault()
                      clearSampleItemInput()
                    }}>×</button> : null}
                    </div>
                    {!sampleFixedMegaStone && sameItemField(activeItemField, 'sample', 0) ? <div className="move-autocomplete-menu unified-dropdown-menu">
                      {sampleItemOptions.map((item, optionIdx) => (
                        <button key={`sample-item-suggest-${item}`} type="button" className={`move-autocomplete-item item-autocomplete-item ${highlightedAutocompleteIndex(autocompleteHighlight, sampleItemMenuId) === optionIdx ? 'active' : ''}`} onMouseDown={() => selectSampleItemOption(item)}>
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
                {EFFORT_STAT_OPTIONS.map((stat) => (
                  <button key={stat.key} type="button" className={`stat-preview-row stat-preview-button sample-stat-preview-row ${statThemeClass(stat.key)}`} onClick={() => setSampleTuningModalOpen(true)}>
                    <div className="stat-preview-topline sample-stat-topline">
                      <span>{lt(stat.label)}</span>
                      <strong>{partyStatValue(sampleRow, sampleForge, stat.key)}</strong>
                    </div>
                    <div className="stat-preview-bar"><span style={{ width: statGaugePercent(partyStatValue(sampleRow, sampleForge, stat.key)) }} /></div>
                    <div className="stat-preview-meta">
                      <span className="stat-preview-ev sample-stat-ev">EV +{sampleForge.evs[stat.key]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div id="sample-moves-card" className="move-card flat-sample-move-card">
              <>
                  <div className="sample-tracking-cluster">
                    <div className="sample-track-workspace">
                      <div className="sample-track-main-column">
                        <div className="sample-track-card sample-track-editor-card">
                          <div className="row-between sample-track-head">
                            <strong>{lt('기술 배치')}</strong>
                            <div className="pick-summary-badges sample-slot-target-badges">
                              <span className="pick-badge sample-slot-target-badge active">{activeSampleMoveSlotIdx + 1}번 슬롯</span>
                              {sampleMovePool?.status === 'loading' ? <span className="pick-badge move-pool-status-badge loading">{lt('기술풀 불러오는 중…')}</span> : null}
                              <button type="button" className="pick-badge sample-slot-clear-badge sample-slot-clear-action" onClick={() => setSampleLockedMoves((prev) => {
                                const current = [...prev]
                                while (current.length < 4) current.push('')
                                current[activeSampleMoveSlotIdx] = ''
                                return normalizeMoveSlots(current)
                              })}>{lt('슬롯 비우기')}</button>
                            </div>
                          </div>
                          <div className="registered-move-grid sample-registered-move-grid sample-track-input-grid">
                            {sampleRegisteredMoves.map((move, moveIdx) => (
                              <label key={`sample-registered-move-${sampleForge.key}-${moveIdx}`} className={`registered-move-slot sample-registered-move-slot ${moveTypeThemeClass(sampleMoveType(move))} ${activeSampleMoveSlotIdx === moveIdx ? 'active-target' : ''} ${sampleMovePool?.status === 'loading' ? 'move-pool-loading' : ''}`}>
                                <span>{moveIdx + 1}번</span>
                                <input
                                  value={move}
                                  {...bindTooltip(move ? moveTooltipData(move, siteLanguage) : null)}
                                  placeholder={sampleMovePool?.status === 'loading' ? lt('기술풀 불러오는 중…') : sampleMoveOptions.length ? lt('사용 가능 기술 검색') : lt('기술 입력')}
                                  onFocus={() => {
                                    setActiveMoveField({ key: sampleForge.key, slotIdx: moveIdx, scope: 'sample' })
                                    setAutocompleteMenuOpen(`sample-move-${sampleForge.key}-${moveIdx}`)
                                  }}
                                  onBlur={() => {
                                    setTimeout(() => setActiveMoveField((prev) => sameMoveField(prev, sampleForge.key, moveIdx, 'sample') ? null : prev), 120)
                                    setTimeout(() => closeAutocompleteMenu(`sample-move-${sampleForge.key}-${moveIdx}`), 120)
                                  }}
                                  onChange={(e) => {
                                    setSampleLockedMoves((prev) => {
                                      const current = [...prev]
                                      while (current.length < 4) current.push('')
                                      current[moveIdx] = e.target.value
                                      return normalizeMoveSlots(current)
                                    })
                                    setActiveMoveField({ key: sampleForge.key, slotIdx: moveIdx, scope: 'sample' })
                                    setAutocompleteMenuOpen(`sample-move-${sampleForge.key}-${moveIdx}`)
                                  }}
                                  onKeyDown={(e) => {
                                    const moveSuggestions = filterMoveOptions(move, sampleMoveOptions).slice(0, 8)
                                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                                      e.preventDefault()
                                      moveAutocompleteMenuHighlight(`sample-move-${sampleForge.key}-${moveIdx}`, moveSuggestions.length, e.key === 'ArrowDown' ? 1 : -1)
                                      return
                                    }
                                    if (e.key !== 'Enter') return
                                    const highlightedMove = moveSuggestions[highlightedAutocompleteIndex(autocompleteHighlight, `sample-move-${sampleForge.key}-${moveIdx}`)]
                                    const committed = highlightedMove ? (selectSampleMoveOption(moveIdx, highlightedMove.name), true) : commitSampleMoveOption(moveIdx, move)
                                    if (committed) {
                                      e.preventDefault()
                                      closeAutocompleteMenu(`sample-move-${sampleForge.key}-${moveIdx}`)
                                    }
                                  }}
                                />
                                {sameMoveField(activeMoveField, sampleForge.key, moveIdx, 'sample') && sampleMoveOptions.length ? (
                                  <div className="move-autocomplete-menu unified-dropdown-menu">
                                    {filterMoveOptions(move, sampleMoveOptions).slice(0, 8).map((option, optionIdx) => (
                                      <button key={`sample-move-suggest-${sampleForge.key}-${moveIdx}-${option.name}`} type="button" className={`move-autocomplete-item ${moveTypeThemeClass(option.type)} ${highlightedAutocompleteIndex(autocompleteHighlight, `sample-move-${sampleForge.key}-${moveIdx}`) === optionIdx ? 'active' : ''}`} onMouseDown={() => selectSampleMoveOption(moveIdx, option.name)} {...bindTooltip(moveTooltipData(option.name, siteLanguage))}>
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
                        {sampleCuratedMoveBuckets.length ? <div className="sample-track-card top-move-chip-card sample-track-secondary-section">
                          <div className="row-between sample-track-head compact-gap sample-candidate-head">
                            <strong>{lt('실전 후보')}</strong>
                            <div className="tab-bar sample-filter-bar sample-candidate-filter-bar">
                              {([
                                { value: 'core', label: lt('코어'), count: sampleCuratedMoveBuckets.find((bucket) => bucket.id === 'core')?.moves.length ?? 0 },
                                { value: 'options', label: lt('선택'), count: sampleCuratedMoveBuckets.find((bucket) => bucket.id === 'options')?.moves.length ?? 0 },
                                { value: 'utility', label: lt('유틸'), count: sampleCuratedMoveBuckets.find((bucket) => bucket.id === 'utility')?.moves.length ?? 0 },
                                { value: 'all', label: lt('전체'), count: sampleCuratedMoveBuckets.reduce((sum, bucket) => sum + bucket.moves.length, 0) },
                              ] as { value: MoveFilter; label: string; count: number }[])
                                .filter((option) => option.value === 'all' || option.count > 0)
                                .map((option) => (
                                  <button key={`sample-candidate-filter-${option.value}`} type="button" className={`tab-chip sample-filter-chip ${sampleMoveFilter === option.value ? 'active' : ''}`} onClick={() => setSampleMoveFilter(option.value)}>
                                    {option.label}
                                    <strong>{option.count}</strong>
                                  </button>
                                ))}
                            </div>
                          </div>
                          <div className="sample-candidate-bucket-grid">
                            {sampleVisibleMoveBuckets.map((bucket) => (
                              <section key={`sample-candidate-bucket-${bucket.id}`} className={`sample-candidate-bucket ${bucket.id}`}>
                                <div className="row-between sample-candidate-bucket-head compact-gap">
                                  <span className={`pick-badge sample-candidate-kind-badge ${bucket.id}`}>{bucket.label}</span>
                                  <span className="muted-inline">{bucket.moves.length}</span>
                                </div>
                                <div className="move-chip-wrap">
                                  {bucket.moves.map((move) => {
                                    const locked = sampleConfirmedMoves.includes(move)
                                    return (
                                      <button
                                        key={`sample-top-move-${sampleForge.key}-${bucket.id}-${move}`}
                                        type="button"
                                        className={`move-chip core ${locked ? 'confirmed' : ''} ${moveTypeThemeClass(sampleMoveType(move))}`}
                                        onClick={() => applySampleCandidateMove(move, activeSampleMoveSlotIdx)}
                                        {...bindTooltip(moveTooltipData(move, siteLanguage))}
                                      >
                                        {move}
                                      </button>
                                    )
                                  })}
                                </div>
                              </section>
                            ))}
                          </div>
                        </div> : sampleTopSuggestedMoves.length ? <div className="sample-track-card top-move-chip-card sample-track-secondary-section">
                          <div className="row-between sample-track-head compact-gap">
                            <strong>{lt('사용률 상위 기술')}</strong>
                            <span className="muted-inline">Top {Math.min(10, sampleTopSuggestedMoves.length)}</span>
                          </div>
                          <div className="move-chip-wrap">
                            {sampleTopSuggestedMoves.map((move) => {
                              const locked = sampleConfirmedMoves.includes(move)
                              return (
                                <button
                                  key={`sample-top-move-${sampleForge.key}-${move}`}
                                  type="button"
                                  className={`move-chip core ${locked ? 'confirmed' : ''} ${moveTypeThemeClass(sampleMoveType(move))}`}
                                  onClick={() => applySampleCandidateMove(move, activeSampleMoveSlotIdx)}
                                  {...bindTooltip(moveTooltipData(move, siteLanguage))}
                                >
                                  {move}
                                </button>
                              )
                            })}
                          </div>
                        </div> : sampleMovePool?.status === 'loading' ? null : <div className="sample-empty-state">{lt('기술 데이터가 없는 포켓몬만 직접 입력합니다.')}</div>}
                      </div>
                    </div>
                  </div>
                </>
            </div>
          </div>
          </> : sampleWorkbenchTab === 'speed' ? <div className="sample-builder-grid compact-sample-builder-grid sample-single-pane-grid">
            <div className="sample-main-card flat-sample-main-card">
              <div className="sample-damage-top-panel sample-speed-top-panel">
                <div className="sample-speed-toolbar sample-workbench-toolbar">
                  <div className="sample-speed-inline-controls sample-current-build-toolbar sample-current-build-toolbar-speed">
                    <div className="sample-speed-control-card sample-current-build-card sample-current-build-card-embedded sample-workbench-section-block">
                      <span className="sample-current-build-label sample-workbench-section-label">{lt('기준 빌드')}</span>
                      <div className="sample-compare-hero">
                        {sampleRow.sprite ? <img src={sampleRow.sprite} alt={displayName(sampleRow, siteLanguage)} className="sample-compare-sprite" /> : null}
                        <div>
                          <strong>{displayName(sampleRow, siteLanguage)}</strong>
                          <p className="sample-current-build-copy">{lt('샘플 빌드 기준으로 자동 반영')}</p>
                        </div>
                      </div>
                      {renderSampleForgeEffortGrid('speed')}
                      <div className="sample-current-build-summary" aria-label={lt('현재 기준 정보')}>
                        <span><small>{lt('성격')}</small><strong>{natureChipLabel(sampleForge.config.nature, siteLanguage)}</strong></span>
                        <span><small>{lt('특성')}</small><strong>{sampleAbility || lt('미지정')}</strong></span>
                        <span {...bindTooltip(sampleCurrentItem ? itemTooltipData(sampleCurrentItem, siteLanguage) : null)}><small>{lt('도구')}</small><strong>{sampleCurrentItem ? displayItemLabel(sampleCurrentItem, siteLanguage) : lt('도구 미선택')}</strong></span>
                      </div>
                      <div className="combat-index-strip" aria-label={`${lt('물리 내구력')} / ${lt('특수 내구력')}`}>
                        <span tabIndex={0} {...bindTooltip(battleIndexTooltipData('physical-bulk', siteLanguage, [{ label: lt('계산 기준'), value: `${sampleAttackerStats.hp} × ${sampleAttackerStats.defense}` }]))}>
                          <small>{lt('물리 내구력')}</small><strong>{formatBattleIndex(sampleBulkIndices.physical, siteLanguage)}</strong>
                        </span>
                        <span tabIndex={0} {...bindTooltip(battleIndexTooltipData('special-bulk', siteLanguage, [{ label: lt('계산 기준'), value: `${sampleAttackerStats.hp} × ${sampleAttackerStats.spDefense}` }]))}>
                          <small>{lt('특수 내구력')}</small><strong>{formatBattleIndex(sampleBulkIndices.special, siteLanguage)}</strong>
                        </span>
                      </div>
                    </div>
                    <label className="sample-speed-slider-field sample-speed-stage-inline-card sample-workbench-section-block">
                      <span className="sample-workbench-section-label">{lt('내 스피드 랭크')}</span>
                      <select value={sampleForge.config.speedStage} onChange={(e) => setSampleForge((prev) => ({ ...prev, config: { ...prev.config, speedStage: clampSpeedStage(e.target.value) } }))}>
                        {[6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6].map((stage) => <option key={`sample-speed-self-stage-${stage}`} value={stage}>{stage > 0 ? `+${stage}` : stage}</option>)}
                      </select>
                    </label>
                  </div>
                </div>
              </div>
              <label className="sample-speed-slider-field sample-damage-search-field sample-speed-control-card sample-workbench-section-block sample-compare-adder-block sample-damage-compare-adder-standalone">
                <div className="sample-compare-adder-head">
                  <span className="sample-workbench-section-label">{lt(sampleSpeedCalcs.length ? '비교 상대 교체' : '비교 상대 선택')}</span>
                </div>
                <div className="sample-compare-adder-subhead">
                  <div className="sample-compare-adder-state">
                    <span className="sample-compare-adder-state-label">{lt('현재')}</span>
                    <div className="pick-summary-badges sample-damage-adder-badges sample-damage-adder-badges-quiet">
                      <span className="pick-badge quiet">{lt('1:1 비교')}</span>
                    </div>
                  </div>
                  <p className="sample-compare-adder-copy">{lt('가장 경계할 상대 한 마리를 선택합니다.')}</p>
                </div>
                <input value={sampleSpeedSearch} placeholder={lt('포켓몬 검색')} onFocus={() => { setSampleSpeedSearchOpen(true); setAutocompleteMenuOpen('sample-speed-add') }} onBlur={() => { setTimeout(() => setSampleSpeedSearchOpen(false), 120); setTimeout(() => closeAutocompleteMenu('sample-speed-add'), 120) }} onChange={(e) => { setSampleSpeedSearch(e.target.value); setSampleSpeedSearchOpen(true); setAutocompleteMenuOpen('sample-speed-add') }} onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault()
                    moveAutocompleteMenuHighlight('sample-speed-add', sampleSpeedSearchResults.length, e.key === 'ArrowDown' ? 1 : -1)
                    return
                  }
                  if (e.key !== 'Enter') return
                  const highlightedOption = sampleSpeedSearchResults[highlightedAutocompleteIndex(autocompleteHighlight, 'sample-speed-add')]
                  if (highlightedOption) {
                    e.preventDefault()
                    addSampleSpeedTarget(highlightedOption.key)
                    closeAutocompleteMenu('sample-speed-add')
                  }
                }} />
                {sampleSpeedSearchOpen && sampleSpeedSearchResults.length ? <div className="autocomplete-menu unified-dropdown-menu sample-damage-search-menu">
                  {sampleSpeedSearchResults.map((option, optionIdx) => <button key={`sample-speed-add-${option.key}`} type="button" className={`autocomplete-item ${highlightedAutocompleteIndex(autocompleteHighlight, 'sample-speed-add') === optionIdx ? 'active' : ''}`} onMouseDown={() => addSampleSpeedTarget(option.key)}>{searchDisplayLabel(option.key, siteLanguage)}</button>)}
                </div> : null}
              </label>
              <div className="sample-overview-stack sample-workbench-section sample-compare-targets-section">
                <div className="row-between sample-workbench-section-head">
                  <span className="sample-workbench-section-label">{lt('비교 상대')}</span>
                </div>
                {sampleSpeedCalcs.length ? sampleSpeedCalcs.map((entry) => (
                  <div key={`sample-speed-target-${entry.idx}`} className="sample-overview-card sample-damage-target-card sample-workbench-wide-card sample-damage-compare-card">
                    <div className="row-between sample-compare-card-head">
                      <div className="sample-compare-hero sample-compare-hero-compact">
                        {entry.row.sprite ? <img src={entry.row.sprite} alt={displayName(entry.row, siteLanguage)} className="sample-compare-sprite" /> : null}
                        <strong>{displayName(entry.row, siteLanguage)}</strong>
                      </div>
                      <button type="button" className="pick-chip" onClick={() => removeSampleSpeedTarget(entry.idx)}>{lt('삭제')}</button>
                    </div>
                    <div className="sample-speed-rank-row">
                      <label>
                        <span>{lt('랭크')}</span>
                        <select value={entry.member.speedStage} onChange={(e) => updateSampleSpeedTarget(entry.idx, { speedStage: clampSpeedStage(e.target.value) })}>
                          {[6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6].map((stage) => <option key={`sample-speed-stage-${entry.idx}-${stage}`} value={stage}>{stage > 0 ? `+${stage}` : stage}</option>)}
                        </select>
                      </label>
                    </div>
                    <div className="sample-workbench-card-body sample-speed-card-body sample-speed-card-body-full">
                      <div className="sample-workbench-mainpanel">
                        <div className="sample-speed-cut-grid sample-speed-cut-grid-wide">
                          {entry.cutoffs.map((cutoff) => (
                            <div key={`sample-speed-cutoff-${entry.idx}-${cutoff.id}`} className={`sample-speed-cut-card ${cutoff.result === lt('내가 앞섬') ? 'ahead' : cutoff.result === lt('동속') ? 'tie' : 'behind'}`}>
                              <div className="sample-speed-cut-head">
                                <span className="sample-speed-cut-label">{cutoff.label}</span>
                                <span className="sample-speed-cut-value">{lt('현재 속도')} <strong>{cutoff.speed}</strong></span>
                              </div>
                              <strong className={`sample-speed-verdict ${cutoff.result === lt('내가 앞섬') ? 'ahead' : cutoff.result === lt('동속') ? 'tie' : 'behind'}`}>{cutoff.result}</strong>
                              <div className="sample-speed-cut-meta">
                                <span>{lt('동속컷')} <strong>{cutoff.needs.tieEffort ?? '-'}</strong></span>
                                <span>{lt('추월컷')} <strong>{cutoff.needs.passEffort ?? '-'}</strong></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )) : <div className="sample-empty-state sample-damage-empty-state">
                  <div className="sample-damage-empty-state-copy">
                    <strong>{lt('비교 대상 없음')}</strong>
                    <p>{lt('가장 경계할 상대 한 마리를 선택합니다.')}</p>
                  </div>
                  <div className="pick-summary-badges sample-damage-empty-state-badges">
                    <span className="pick-badge quiet">{lt('1:1 비교')}</span>
                  </div>
                </div>}
              </div>
            </div>
          </div> : <div className="sample-builder-grid compact-sample-builder-grid sample-single-pane-grid">
            <div className="sample-main-card flat-sample-main-card">
              <div className="sample-damage-top-panel">
                <div className="sample-damage-adder sample-workbench-toolbar">
                  <div className="sample-speed-inline-controls sample-current-build-toolbar">
                    <div className="sample-speed-control-card sample-current-build-card sample-current-build-card-embedded sample-workbench-section-block">
                    <span className="sample-current-build-label sample-workbench-section-label">{lt('기준 빌드')}</span>
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
                      <span className="pick-badge" {...bindTooltip(sampleCurrentItem ? itemTooltipData(sampleCurrentItem, siteLanguage) : null)}>{sampleCurrentItem ? displayItemLabel(sampleCurrentItem, siteLanguage) : lt('도구 미선택')}</span>
                      <span className="pick-badge">{lt('공격')} {sampleAttackerStats.attack}</span>
                      <span className="pick-badge">{lt('특수공격')} {sampleAttackerStats.spAttack}</span>
                    </div>
                    <div className="combat-index-strip" aria-label={`${lt('물리 내구력')} / ${lt('특수 내구력')}`}>
                      <span tabIndex={0} {...bindTooltip(battleIndexTooltipData('physical-bulk', siteLanguage, [{ label: lt('계산 기준'), value: `${sampleAttackerStats.hp} × ${sampleAttackerStats.defense}` }]))}>
                        <small>{lt('물리 내구력')}</small><strong>{formatBattleIndex(sampleBulkIndices.physical, siteLanguage)}</strong>
                      </span>
                      <span tabIndex={0} {...bindTooltip(battleIndexTooltipData('special-bulk', siteLanguage, [{ label: lt('계산 기준'), value: `${sampleAttackerStats.hp} × ${sampleAttackerStats.spDefense}` }]))}>
                        <small>{lt('특수 내구력')}</small><strong>{formatBattleIndex(sampleBulkIndices.special, siteLanguage)}</strong>
                      </span>
                    </div>
                  </div>
                  </div>
                </div>
                <div className="sample-power-index-panel sample-workbench-wide-card sample-workbench-section">
                  <div className="row-between sample-workbench-section-head">
                    <strong>{lt('결정력')}</strong>
                    <span className="muted-inline">{lt('상대 영향 제외')} · {lt('기본 조건')}</span>
                  </div>
                  <div className="sample-power-index-grid">
                    {sampleDecisionPowerIndices.length ? sampleDecisionPowerIndices.map((entry) => {
                      const totalPower = entry.moveMeta?.hitPowers?.length
                        ? entry.moveMeta.hitPowers.reduce((sum, power) => sum + power, 0)
                        : (entry.moveMeta?.power ?? 0) * Math.max(1, entry.moveMeta?.hits ?? 1)
                      const formula = entry.attackStat && totalPower
                        ? `${entry.attackStat} × ${totalPower} × ${entry.stab}`
                        : '—'
                      return <div
                        key={`sample-power-index-${entry.moveName}`}
                        className="sample-power-index-card"
                        tabIndex={0}
                        {...bindTooltip(battleIndexTooltipData('power', siteLanguage, [
                          { label: lt('기술'), value: entry.moveName },
                          { label: lt('계산 기준'), value: formula },
                          ...(entry.notes.length ? [{ label: lt('상시 보정'), value: entry.notes.join(' · ') }] : []),
                        ]))}
                      >
                        <span className="sample-power-index-name">{entry.moveName}</span>
                        <strong>{entry.value == null ? lt('상대 의존') : formatBattleIndex(entry.value, siteLanguage)}</strong>
                        <small>{entry.moveMeta ? `${lt('위력')} ${totalPower || '—'} · ${displayMoveCategoryName(entry.moveMeta.category, siteLanguage)}` : lt('대미지 계산 불가')}</small>
                      </div>
                    }) : <div className="sample-empty-state">{lt('등록 기술 없음')}</div>}
                  </div>
                </div>
                <div className="sample-damage-shared-controls sample-workbench-wide-card sample-damage-conditions-panel sample-workbench-section sample-damage-top-conditions">
                  <div className="row-between sample-damage-conditions-head sample-workbench-section-head">
                    <strong>{lt('세부 조건')}</strong>
                    <button type="button" className={`pick-chip ${sampleDamageConditionsCollapsed ? '' : 'active'}`} onClick={() => setSampleDamageConditionsCollapsed((prev) => !prev)} aria-expanded={!sampleDamageConditionsCollapsed}>{sampleDamageConditionsCollapsed ? lt('펼치기') : lt('접기')}</button>
                  </div>
                  <div className="sample-damage-conditions-summary-grid" aria-label={lt('현재 기준 정보')}>
                    <div className="sample-damage-conditions-summary-card">
                      <span className="sample-damage-conditions-summary-label">{lt('화력 조건')}</span>
                      <div className="pick-summary-badges sample-damage-conditions-summary-badges">
                        {sampleDamageOffenseConditionLabels.length
                          ? sampleDamageOffenseConditionLabels.map((label) => <span key={`sample-damage-offense-summary-${label}`} className="pick-badge">{label}</span>)
                          : <span className="pick-badge quiet">{lt('기본')}</span>}
                      </div>
                    </div>
                    <div className="sample-damage-conditions-summary-card">
                      <span className="sample-damage-conditions-summary-label">{lt('전장 조건')}</span>
                      <div className="pick-summary-badges sample-damage-conditions-summary-badges">
                        {sampleDamageFieldConditionLabels.length
                          ? sampleDamageFieldConditionLabels.map((label) => <span key={`sample-damage-field-summary-${label}`} className="pick-badge">{label}</span>)
                          : <span className="pick-badge quiet">{lt('기본')}</span>}
                      </div>
                    </div>
                  </div>
                  {!sampleDamageConditionsCollapsed ? <div className="sample-damage-conditions-box damage-control-groups">
                  <div className="damage-control-group">
                    <div className="damage-control-group-title">{lt('화력 조건')}</div>
                    <div className="calc-grid damage-calc-grid compact offense-grid">
                      {sampleUsesTypeChangeStabAbility ? <label className="calc-toggle-box"><input type="checkbox" checked={calcTypeChangeStab} onChange={(e) => setCalcTypeChangeStab(e.target.checked)} /><span>{lt('타입변환 자속')}</span></label> : null}
                      <div className="calc-inline-pair">
                        <label className="calc-toggle-box"><input type="checkbox" checked={calcCritical} onChange={(e) => setCalcCritical(e.target.checked)} /><span>{lt('급소')}</span></label>
                        <label className="calc-toggle-box"><input type="checkbox" checked={calcBurned} onChange={(e) => setCalcBurned(e.target.checked)} /><span>{lt('화상')}</span></label>
                      </div>
                      {sampleShowAttackerLowHpToggle || sampleShowTargetPoisonedToggle ? <div className="calc-inline-pair">
                        {sampleShowAttackerLowHpToggle ? <label className="calc-toggle-box"><input type="checkbox" checked={calcAttackerLowHp} onChange={(e) => setCalcAttackerLowHp(e.target.checked)} /><span>{lt('공격측 HP 1/3 이하')}</span></label> : null}
                        {sampleShowTargetPoisonedToggle ? <label className="calc-toggle-box"><input type="checkbox" checked={calcTargetPoisoned} onChange={(e) => setCalcTargetPoisoned(e.target.checked)} /><span>{lt('상대 독/맹독')}</span></label> : null}
                      </div> : null}
                      {sampleShowMovedAfterTargetToggle || sampleShowDefenderStatusedToggle ? <div className="calc-inline-pair">
                        {sampleShowMovedAfterTargetToggle ? <label className="calc-toggle-box"><input type="checkbox" checked={calcMovedAfterTarget} onChange={(e) => setCalcMovedAfterTarget(e.target.checked)} /><span>{lt('상대보다 늦게 행동')}</span></label> : null}
                        {sampleShowDefenderStatusedToggle ? <label className="calc-toggle-box"><input type="checkbox" checked={calcDefenderStatused} onChange={(e) => setCalcDefenderStatused(e.target.checked)} /><span>{lt('상대 상태이상')}</span></label> : null}
                      </div> : null}
                      {sampleShowFaintedAlliesInput || sampleShowRivalryModeInput ? <div className="calc-inline-pair">
                        {sampleShowFaintedAlliesInput ? <label>{lt('기절한 아군 수')}<input type="number" min={0} max={5} value={calcFaintedAllies} onChange={(e) => setCalcFaintedAllies(Math.max(0, Math.min(5, Math.trunc(Number(e.target.value) || 0))))} /></label> : null}
                        {sampleShowRivalryModeInput ? <label>{lt('라이벌리 성별 관계')}<select value={calcRivalryMode} onChange={(e) => setCalcRivalryMode(e.target.value as RivalryMode)}><option value="neutral">{lt('없음')}</option><option value="same">{lt('같은 성별')}</option><option value="opposite">{lt('다른 성별')}</option></select></label> : null}
                      </div> : null}
                      {sampleShowParentalBondToggle || sampleShowElectromorphosisToggle ? <div className="calc-inline-pair">
                        {sampleShowParentalBondToggle ? <label className="calc-toggle-box"><input type="checkbox" checked={calcParentalBond} onChange={(e) => setCalcParentalBond(e.target.checked)} /><span>{lt('부자유친 발동')}</span></label> : null}
                        {sampleShowElectromorphosisToggle ? <label className="calc-toggle-box"><input type="checkbox" checked={calcElectromorphosisCharged} onChange={(e) => setCalcElectromorphosisCharged(e.target.checked)} /><span>{lt('일렉트릭 차지됨')}</span></label> : null}
                      </div> : null}
                      <div className="calc-inline-pair">
                        <label>{lt('공격측 화력 랭크')}<select value={calcAttackStage} onChange={(e) => setCalcAttackStage(clampBattleStage(e.target.value))}>{[6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6].map((stage) => <option key={`sample-damage-atk-stage-${stage}`} value={stage}>{stage > 0 ? `+${stage}` : stage}</option>)}</select></label>
                        <label>{lt('방어측 내구 랭크')}<select value={calcDefenseStage} onChange={(e) => setCalcDefenseStage(clampBattleStage(e.target.value))}>{[6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6].map((stage) => <option key={`sample-damage-def-stage-${stage}`} value={stage}>{stage > 0 ? `+${stage}` : stage}</option>)}</select></label>
                      </div>
                      {sampleShowDefenderFullHpToggle || sampleShowDefenderDisguiseToggle ? <div className="calc-inline-pair">
                        {sampleShowDefenderFullHpToggle ? <label className="calc-toggle-box"><input type="checkbox" checked={calcDefenderFullHp} onChange={(e) => setCalcDefenderFullHp(e.target.checked)} /><span>{lt('상대 HP 만땅')}</span></label> : null}
                        {sampleShowDefenderDisguiseToggle ? <label className="calc-toggle-box"><input type="checkbox" checked={calcDefenderDisguise} onChange={(e) => setCalcDefenderDisguise(e.target.checked)} /><span>{lt('상대 탈 intact')}</span></label> : null}
                      </div> : null}
                    </div>
                  </div>
                  <div className="damage-control-group">
                    <div className="damage-control-group-title">{lt('전장 조건')}</div>
                    <div className="calc-grid damage-calc-grid compact field-grid">
                      <div className="calc-inline-pair">
                        <label>{lt('날씨')}<select value={calcWeather} onChange={(e) => setCalcWeather(e.target.value as DamageWeather)}><option value="none">{lt('없음')}</option><option value="sun">{lt('쾌청')}</option><option value="rain">{lt('비')}</option><option value="sand">{lt('모래바람')}</option><option value="snow">{lt('싸라기눈')}</option></select></label>
                        <label>{lt('필드')}<select value={calcTerrain} onChange={(e) => setCalcTerrain(e.target.value as DamageTerrain)}><option value="none">{lt('없음')}</option><option value="electric">{lt('일렉트릭필드')}</option><option value="grassy">{lt('그래스필드')}</option><option value="psychic">{lt('사이코필드')}</option><option value="misty">{lt('미스트필드')}</option></select></label>
                      </div>
                      <div className="calc-inline-pair">
                        <label className="calc-toggle-box"><input type="checkbox" checked={calcReflect} onChange={(e) => setCalcReflect(e.target.checked)} /><span>{lt('리플렉터')}</span></label>
                        <label className="calc-toggle-box"><input type="checkbox" checked={calcLightScreen} onChange={(e) => setCalcLightScreen(e.target.checked)} /><span>{lt('빛의장막')}</span></label>
                      </div>
                      <div className="calc-inline-pair">
                        <label className="calc-toggle-box"><input type="checkbox" checked={calcAuroraVeil} onChange={(e) => setCalcAuroraVeil(e.target.checked)} /><span>{lt('오로라베일')}</span></label>
                        <label className="calc-toggle-box"><input type="checkbox" checked={calcFriendGuard} onChange={(e) => setCalcFriendGuard(e.target.checked)} /><span>{lt('프렌드가드')}</span></label>
                      </div>
                    </div>
                  </div>
                  </div> : null}
                </div>
              </div>
              <label className="sample-speed-slider-field sample-damage-search-field sample-speed-control-card sample-workbench-section-block sample-compare-adder-block sample-damage-compare-adder-standalone">
                    <div className="sample-compare-adder-head">
                      <span className="sample-workbench-section-label">{lt(sampleDamageCalcs.length ? '비교 상대 교체' : '비교 상대 선택')}</span>
                    </div>
                    <div className="sample-compare-adder-subhead">
                      <div className="sample-compare-adder-state">
                        <span className="sample-compare-adder-state-label">{lt('현재')}</span>
                        <div className="pick-summary-badges sample-damage-adder-badges sample-damage-adder-badges-quiet">
                          <span className="pick-badge quiet">{lt('샘플 기술')} {sampleDamageMoveChoices.length}/4</span>
                          <span className="pick-badge quiet">{lt('1:1 비교')}</span>
                        </div>
                      </div>
                      <p className="sample-compare-adder-copy">{sampleDamageMoveChoices.length ? lt('가장 경계할 상대 한 마리를 선택합니다.') : lt('샘플 기술에서 1개 이상 등록하면 여기서 바로 비교할 수 있습니다.')}</p>
                    </div>
                    <input value={sampleDamageSearch} placeholder={lt('포켓몬 검색')} onFocus={() => { setSampleDamageSearchOpen(true); setAutocompleteMenuOpen('sample-damage-add') }} onBlur={() => { setTimeout(() => setSampleDamageSearchOpen(false), 120); setTimeout(() => closeAutocompleteMenu('sample-damage-add'), 120) }} onChange={(e) => { setSampleDamageSearch(e.target.value); setSampleDamageSearchOpen(true); setAutocompleteMenuOpen('sample-damage-add') }} onKeyDown={(e) => {
                      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        e.preventDefault()
                        moveAutocompleteMenuHighlight('sample-damage-add', sampleDamageSearchResults.length, e.key === 'ArrowDown' ? 1 : -1)
                        return
                      }
                      if (e.key !== 'Enter') return
                      const highlightedOption = sampleDamageSearchResults[highlightedAutocompleteIndex(autocompleteHighlight, 'sample-damage-add')]
                      if (highlightedOption) {
                        e.preventDefault()
                        addSampleDamageTarget(highlightedOption.key)
                        closeAutocompleteMenu('sample-damage-add')
                      }
                    }} />
                    {sampleDamageSearchOpen && sampleDamageSearchResults.length ? <div className="autocomplete-menu unified-dropdown-menu sample-damage-search-menu">
                      {sampleDamageSearchResults.map((option, optionIdx) => <button key={`sample-damage-add-${option.key}`} type="button" className={`autocomplete-item ${highlightedAutocompleteIndex(autocompleteHighlight, 'sample-damage-add') === optionIdx ? 'active' : ''}`} onMouseDown={() => addSampleDamageTarget(option.key)}>{searchDisplayLabel(option.key, siteLanguage)}</button>)}
                    </div> : null}
                    {!sampleDamageMoveChoices.length ? <div className="sample-inline-helper sample-damage-adder-helper sample-damage-adder-helper-compact">
                      <button type="button" className="pick-chip" onClick={() => setSampleWorkbenchTab('builder')}>{lt('샘플 기술로 이동')}</button>
                    </div> : null}
              </label>
              <div className="sample-overview-stack sample-workbench-section sample-compare-targets-section">
                <div className="row-between sample-workbench-section-head">
                  <span className="sample-workbench-section-label">{lt('비교 상대')}</span>
                </div>
                {sampleDamageCalcs.length ? sampleDamageCalcs.map((entry) => {
                  const bulkPresetKey = detectOpponentBulkPreset({ hpEv: entry.member.hpEv, defenseEv: entry.member.defenseEv, spDefenseEv: entry.member.spDefenseEv, defenseNature: entry.member.defenseNature, spDefenseNature: entry.member.spDefenseNature })
                  const bulkPresetLabel = bulkPresetKey === 'custom' ? lt('직접 조절') : OPPONENT_BULK_PRESETS[bulkPresetKey].label
                  const verdictTone = resolveDamageVerdictTone(entry.damage, entry.defenderStats?.hp ?? null)
                  const [verdictPrimary, verdictDetail] = (entry.verdict || '').split(' · ')
                  const damageValueText = entry.damage ? (isNoEffectDamage(entry.damage) ? lt('무효') : `${entry.damage.min} ~ ${entry.damage.max}`) : '—'
                  const damageHelperText = entry.damage
                    ? (isNoEffectDamage(entry.damage)
                      ? '\u00A0'
                      : entry.moveHitSummary
                        ? `${lt('총위력')} ${entry.moveHitSummary.totalPower}`
                        : entry.movePower
                          ? `${lt('위력')} ${entry.movePower}`
                          : '\u00A0')
                    : entry.unavailableReason || '\u00A0'
                  const percentValueText = entry.damage ? (isNoEffectDamage(entry.damage) ? lt('무효') : `${entry.damage.minPct}% ~ ${entry.damage.maxPct}%`) : '—'
                  const percentHelperText = entry.damage && !isNoEffectDamage(entry.damage) && entry.defenderStats
                    ? `${lt('상대 체력')} ${entry.defenderStats.hp}`
                    : entry.defenderStats
                      ? `${lt('상대 체력')} ${entry.defenderStats.hp}`
                      : '\u00A0'
                  return (
                  <div key={`sample-damage-target-${entry.idx}`} className="sample-overview-card sample-damage-target-card sample-workbench-wide-card sample-damage-compare-card">
                    <div className="row-between sample-compare-card-head">
                      <div className="sample-compare-hero sample-compare-hero-compact">
                        {entry.row?.sprite ? <img src={entry.row.sprite} alt={displayName(entry.row, siteLanguage)} className="sample-compare-sprite" /> : null}
                        <strong>{entry.row ? displayName(entry.row, siteLanguage) : lt('비교 대상 없음')}</strong>
                      </div>
                      <button type="button" className="pick-chip" onClick={() => removeSampleDamageTarget(entry.idx)}>{lt('삭제')}</button>
                    </div>
                    {entry.defenderStats ? <div className="combat-index-strip opponent-combat-index-strip" aria-label={`${lt('물리 내구력')} / ${lt('특수 내구력')}`}>
                      <span tabIndex={0} {...bindTooltip(battleIndexTooltipData('physical-bulk', siteLanguage, [{ label: lt('계산 기준'), value: `${entry.defenderStats.hp} × ${entry.defenderStats.defense}` }]))}>
                        <small>{lt('물리 내구력')}</small><strong>{formatBattleIndex(durabilityIndices(entry.defenderStats).physical, siteLanguage)}</strong>
                      </span>
                      <span tabIndex={0} {...bindTooltip(battleIndexTooltipData('special-bulk', siteLanguage, [{ label: lt('계산 기준'), value: `${entry.defenderStats.hp} × ${entry.defenderStats.spDefense}` }]))}>
                        <small>{lt('특수 내구력')}</small><strong>{formatBattleIndex(durabilityIndices(entry.defenderStats).special, siteLanguage)}</strong>
                      </span>
                    </div> : null}
                    <div className="sample-workbench-card-body sample-damage-card-body">
                      <div className="sample-workbench-sidepanel">
                        <div className="sample-damage-target-summary-strip">
                          <div className="sample-damage-target-summary-card">
                            <span className="sample-damage-target-summary-label">{lt('기술 구성')}</span>
                            <strong>{entry.member.moveName || lt('등록 기술 없음')}</strong>
                          </div>
                          <div className="sample-damage-target-summary-card">
                            <span className="sample-damage-target-summary-label">{lt('상대 내구 프리셋')}</span>
                            <strong>{bulkPresetLabel}</strong>
                          </div>
                        </div>
                        <div className="sample-damage-target-controls sample-damage-target-controls-wide sample-damage-target-controls-stacked">
                          <div className="sample-damage-control-section sample-damage-control-section-primary">
                            <label>
                              {lt('기술 구성')}
                              <select value={entry.member.moveName || ''} onChange={(e) => updateSampleDamageTarget(entry.idx, { moveName: e.target.value })}>
                                {!sampleDamageMoveChoices.length ? <option value="">{lt('등록 기술 없음')}</option> : null}
                                {sampleDamageMoveChoices.map((move) => <option key={`sample-damage-move-${entry.idx}-${move}`} value={move}>{move}</option>)}
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
                            {(entry.moveRule || entry.moveHitOptions?.length || entry.moveName === '로우킥' || entry.moveName === '안다리걸기' || entry.moveName === '안다리 걸기' || entry.moveName === '풀묶기' || entry.moveName === '트리플악셀') ? <div className="calc-lock-box sample-damage-inline-hint">{variablePowerHint(entry.moveName, lt, { targetWeightKnown: entry.targetWeightKnown, resolvedPower: entry.movePower, totalPower: entry.moveHitSummary?.totalPower ?? null })}</div> : null}
                          </div>
                          <div className="sample-damage-control-section">
                            <label>
                              {lt('상대 내구 프리셋')}
                              <select value={bulkPresetKey} onChange={(e) => applySampleDamageBulkPresetSelection(entry.idx, e.target.value as OpponentBulkPreset)}>
                                {Object.entries(OPPONENT_BULK_PRESETS).map(([key, preset]) => <option key={`sample-damage-bulk-preset-${entry.idx}-${key}`} value={key}>{preset.label}</option>)}
                                <option value="custom">{lt('직접 조절')}</option>
                              </select>
                            </label>
                            <details className="sample-damage-bulk-details" open={bulkPresetKey === 'custom' ? true : undefined}>
                              <summary className="sample-damage-bulk-summary">
                                <span className="sample-damage-bulk-summary-copy">
                                  <strong>{lt('세부 내구 조절')}</strong>
                                  <span className="muted-inline">{bulkPresetLabel}</span>
                                </span>
                                <span className="pick-badge">{lt('체력')} {entry.member.hpEv} / {lt('방어')} {entry.member.defenseEv} / {lt('특수방어')} {entry.member.spDefenseEv}</span>
                              </summary>
                              <div className="sample-damage-bulk-editor">
                                <label className="sample-bulk-hp-row">
                                  {lt('체력 EV')}
                                  <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={entry.member.hpEv} onChange={(e) => updateSampleDamageTarget(entry.idx, { hpEv: clampNonNegativeInt(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                                </label>
                                <div className="sample-bulk-split-grid">
                                  <div className="sample-bulk-pair-row">
                                    <label>
                                      {lt('방어')}
                                      <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={entry.member.defenseEv} onChange={(e) => updateSampleDamageTarget(entry.idx, { defenseEv: clampNonNegativeInt(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                                    </label>
                                    <label className="sample-bulk-check-label">
                                      <span>{lt('방어+')}</span>
                                      <input type="checkbox" checked={entry.member.defenseNature > 1} onChange={(e) => updateSampleDamageTarget(entry.idx, { defenseNature: e.target.checked ? 1.1 : 1 })} />
                                    </label>
                                  </div>
                                  <div className="sample-bulk-pair-row">
                                    <label>
                                      {lt('특방')}
                                      <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={entry.member.spDefenseEv} onChange={(e) => updateSampleDamageTarget(entry.idx, { spDefenseEv: clampNonNegativeInt(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                                    </label>
                                    <label className="sample-bulk-check-label">
                                      <span>{lt('특방+')}</span>
                                      <input type="checkbox" checked={entry.member.spDefenseNature > 1} onChange={(e) => updateSampleDamageTarget(entry.idx, { spDefenseNature: e.target.checked ? 1.1 : 1 })} />
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </details>
                          </div>
                        </div>
                      </div>
                      <div className="sample-workbench-mainpanel">
                        <div className="sample-damage-context-card">
                          <div className="sample-damage-context-row primary">
                            <span className="sample-damage-context-label">{lt('선택된 기술')}</span>
                            <strong>{entry.moveName || lt('등록 기술 없음')}</strong>
                          </div>
                          <div className="sample-damage-context-grid">
                            <div className="sample-damage-context-row">
                              <span className="sample-damage-context-label">{entry.attackStatLabel}</span>
                              <strong>{entry.attackStatValue}</strong>
                            </div>
                            {entry.defenderStats ? <>
                              <div className="sample-damage-context-row">
                                <span className="sample-damage-context-label">{lt('상대 체력')}</span>
                                <strong>{entry.defenderStats.hp}</strong>
                              </div>
                              <div className="sample-damage-context-row">
                                <span className="sample-damage-context-label">{lt('상대 방어')}</span>
                                <strong>{entry.defenderStats.defense}</strong>
                              </div>
                              <div className="sample-damage-context-row">
                                <span className="sample-damage-context-label">{lt('상대 특수방어')}</span>
                                <strong>{entry.defenderStats.spDefense}</strong>
                              </div>
                            </> : null}
                          </div>
                        </div>
                        <div className="sample-damage-metric-grid">
                          <div className={`sample-damage-metric-box verdict ${entry.damage ? `verdict-${verdictTone}` : 'unavailable'}`}>
                            <span className="sample-damage-metric-label">{entry.damage ? lt('판정') : lt('계산 상태')}</span>
                            <div className="sample-damage-metric-copy">
                              <strong>{entry.damage ? (verdictPrimary || entry.verdict) : (entry.unavailableReason || entry.verdict)}</strong>
                              <small className="sample-damage-metric-helper">{entry.damage ? (verdictDetail || '\u00A0') : '\u00A0'}</small>
                            </div>
                          </div>
                          <div className={`sample-damage-metric-box ${entry.damage ? '' : 'unavailable-secondary'}`}>
                            <span className="sample-damage-metric-label">{lt('실대미지')}</span>
                            <div className="sample-damage-metric-copy">
                              <strong>{damageValueText}</strong>
                              <small className="sample-damage-metric-helper">{damageHelperText}</small>
                            </div>
                          </div>
                          <div className={`sample-damage-metric-box enemy ${entry.damage ? '' : 'unavailable-secondary'}`}>
                            <span className="sample-damage-metric-label">{lt('체력비율')}</span>
                            <div className="sample-damage-metric-copy">
                              <strong>{percentValueText}</strong>
                              <small className="sample-damage-metric-helper">{percentHelperText}</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}) : <div className="sample-empty-state sample-damage-empty-state">
                  <div className="sample-damage-empty-state-copy">
                    <strong>{lt('비교 대상 없음')}</strong>
                    <p>{sampleDamageMoveChoices.length ? lt('가장 경계할 상대 한 마리를 선택합니다.') : lt('샘플 기술에서 1개 이상 등록하면 여기서 바로 비교할 수 있습니다.')}</p>
                  </div>
                  <div className="pick-summary-badges sample-damage-empty-state-badges">
                    <span className="pick-badge">{lt('샘플 기술')} {sampleDamageMoveChoices.length}/4</span>
                    <span className="pick-badge quiet">{lt('1:1 비교')}</span>
                  </div>
                  {!sampleDamageMoveChoices.length ? <button type="button" className="pick-chip" onClick={() => setSampleWorkbenchTab('builder')}>{lt('샘플 기술로 이동')}</button> : null}
                </div>}
              </div>
            </div>
          </div>}
          </div>
        </section>
        <section className="panel wide">
          <div className="sample-builder-action-card">
            <div className="sample-builder-action-head">
              <strong>{lt('저장/적용')}</strong>
              <div className="pick-summary-badges sample-slot-target-badges">
                <span className="pick-badge">{sampleConfirmedMoves.length}/4</span>
                <span className="pick-badge">{lt('저장 샘플 수')} {savedSamples.length}</span>
              </div>
            </div>
            <div className="sample-builder-save-row">
              <input className="sample-label-input sample-builder-label-input" value={sampleLabelDraft} placeholder={lt('샘플 이름 예시')} onChange={(e) => setSampleLabelDraft(e.target.value)} />
              <button type="button" className="action-button sample-save-button sample-builder-save-button" onClick={saveCurrentSample}>{lt('현재 샘플 저장')}</button>
            </div>
            <div className="sample-builder-slot-grid">
              {party.map((member, idx) => {
                const row = member.key ? (indexByKey.get(member.key) ?? rows[0]) : null
                return (
                  <button
                    key={`sample-builder-slot-${idx}`}
                    type="button"
                    className={`sample-builder-slot-chip ${selectedMy === idx ? 'active' : ''}`}
                    onClick={() => setSelectedMy(idx)}
                  >
                    <span>{slotNumberLabel(idx, siteLanguage)}</span>
                    <strong>{row ? displayName(row, siteLanguage) : lt('빈 슬롯')}</strong>
                  </button>
                )
              })}
            </div>
            <button type="button" className="action-button sample-builder-apply-button" onClick={() => applySampleToPartySlot(selectedMy)}>{applyToSlotLabel(selectedMy, siteLanguage)}</button>
          </div>
        </section>
        <section id="sample-saved-card" className="panel wide">
          <details className="saved-sample-list flat-saved-sample-list sample-drawer sample-managed-drawer" open>
            <summary className="sample-drawer-summary sample-managed-summary">
              <span>{lt('저장한 샘플')}</span>
              <div className="pick-summary-badges saved-sample-summary-badges">
                {savedSamples[0] ? <span className="pick-badge saved-sample-latest-badge">{savedSamples[0].label}</span> : null}
                <span className="pick-badge">{savedSampleCountLabel(savedSamples.length, siteLanguage)}</span>
              </div>
            </summary>
            <div className="saved-sample-drawer-body sample-saved-grid">
            {savedSamples.length ? savedSamples.map((entry) => {
              const savedRow = indexByKey.get(entry.member.key) ?? rows[0]
              const savedItem = visibleChampionsItem(entry.member.key, entry.member.item)
              const savedMoves = entry.lockedMoves.filter(Boolean).slice(0, 4)
              return (
                <div key={entry.id} className="saved-sample-item sample-saved-card-item sample-saved-grid-card">
                  <div className="sample-saved-card-top">
                    <div className="sample-saved-card-hero">
                      {savedRow?.sprite ? <img src={savedRow.sprite} alt={displayName(savedRow, siteLanguage)} className="sample-saved-card-sprite" /> : null}
                      <div className="sample-saved-card-copy">
                        <strong>{entry.label}</strong>
                        <p className="muted">{displayName(savedRow, siteLanguage)} · {natureLabel(entry.member.config.nature, siteLanguage)}</p>
                      </div>
                    </div>
                    <span className="pick-badge sample-saved-slot-badge">{applyToSlotLabel(selectedMy, siteLanguage)}</span>
                  </div>
                  <div className="pick-summary-badges sample-saved-item-badges sample-saved-rich-badges">
                    {savedItem ? <span className="pick-badge item-badge-inline" {...bindTooltip(itemTooltipData(savedItem, siteLanguage))}>
                      <img src={itemSpriteSrc(entry.member.key, savedItem)} alt={displayItemLabel(savedItem, siteLanguage)} className="item-sprite" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} />
                      {displayItemLabel(savedItem, siteLanguage)}
                    </span> : null}
                    <span className="pick-badge">{lt('실수치 스피드')} {partyStatValue(savedRow, entry.member, 'speed')}</span>
                    <span className="pick-badge">{lt('노력치 합')} {Object.values(entry.member.evs).reduce((sum, value) => sum + value, 0)}</span>
                    <span className="pick-badge">{lt('확정 기술 수')} {savedMoves.length}/4</span>
                  </div>
                  <div className="sample-saved-move-row">
                    {savedMoves.length ? savedMoves.map((move) => <span key={`${entry.id}-${move}`} className={`move-chip core confirmed sample-saved-move-chip ${moveTypeThemeClass(resolveMoveType(move, moveOptionsForEntry(sampleMoves.find((sample) => sample.key === entry.member.key)), movePoolByKey))}`}>{move}</span>) : <span className="muted-inline">{lt('아직 없음')}</span>}
                  </div>
                  <div className="sample-saved-actions">
                    <button type="button" className="pick-chip" onClick={() => {
                      setSampleForge({ ...entry.member, evs: { ...entry.member.evs }, config: { ...entry.member.config }, tuning: { ...entry.member.tuning } })
                      setSampleLockedMoves(entry.lockedMoves.filter(Boolean).slice(0, 4))
                      setSampleItemDraft(displayItemLabel(visibleChampionsItem(entry.member.key, entry.member.item), siteLanguage))
                      setSampleSearch(searchDisplayLabel(entry.member.key, siteLanguage))
                      setActiveSampleMetaEditor(null)
                    }}>{lt('불러오기')}</button>
                    <button type="button" className="action-button sample-saved-apply-button" onClick={() => applyMemberToPartySlot(entry.member, selectedMy, entry.lockedMoves)}>{lt('파티 슬롯에 적용')}</button>
                    <button type="button" className="pick-chip" onClick={() => setSavedSamples((prev) => prev.filter((saved) => saved.id !== entry.id))}>{lt('삭제')}</button>
                  </div>
                </div>
              )
            }) : <p className="muted">{lt('아직 저장한 샘플이 없습니다.')}</p>}
            </div>
          </details>
        </section>
        </> : <>
        {(mainSection === 'single' && activeTab === 'speed') ? <section className="panel wide">
          <div className="row-between section-head">
            <div>
              <h2>{lt('내 파티 추월컷')}</h2>
              <p className="muted calc-screen-summary">{lt('내 파티/상대 엔트리를 먼저 맞추면 계산이 덜 흔들립니다.')}</p>
            </div>
          </div>
          {oppRow ? <>
            <div className="speed-scenario-ladder">
              <div className="speed-compare-head-grid">
                <div className="speed-inline-head speed-context-card">
                  <div className="speed-target-head">
                    {myRow.sprite ? <img src={myRow.sprite} alt={displayName(myRow, siteLanguage)} className="pick-slot-sprite" /> : null}
                    <div>
                      <span className="speed-context-role">{lt('내 포켓몬')}</span>
                      <strong>{displayName(myRow, siteLanguage)}</strong>
                      <div className="speed-context-meta">
                        <span>{lt('실수치 스피드')} <strong>{mySpeed}</strong></span>
                        {isChoiceScarfItem(myMember.item) ? <span className="pick-badge icon-badge"><img src={itemSpriteSrc(myMember.key, '구애스카프')} alt={lt('스카프')} className="pick-badge-item-icon" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} /></span> : null}
                        {mySpeedAbilityLine ? <span>{mySpeedAbilityLine.label} <strong>{mySpeedAbilityLine.speed}</strong></span> : null}
                      </div>
                      {myMegaCandidates.length ? <div className="calc-toggle-row">
                        <button type="button" className={`pick-chip ${!calcMyMegaKey ? 'active' : ''}`} onClick={() => setCalcMyMegaKey(null)}>{lt('일반')}</button>
                        {myMegaCandidates.map((megaKey) => <button key={`my-speed-mega-${megaKey}`} type="button" className={`pick-chip ${calcMyMegaKey === megaKey ? 'active' : ''}`} onClick={() => setCalcMyMegaKey(megaKey)}>{megaToggleLabel(megaKey, siteLanguage)}</button>)}
                      </div> : null}
                    </div>
                  </div>
                </div>
                <div className="speed-ladder-head speed-target-card enemy speed-context-card">
                  <div className="speed-target-head">
                    {oppRow.sprite ? <img src={oppRow.sprite} alt={displayName(oppRow, siteLanguage)} className="pick-slot-sprite" /> : null}
                    <div>
                      <span className="speed-context-role">{lt('상대 포켓몬')}</span>
                      <strong>{displayName(oppRow, siteLanguage)}</strong>
                      <div className="speed-context-meta">
                        <span>{lt('준속')}–{lt('최속')} <strong>{opponentSpeedScenarios[0]?.speedAtMax}–{opponentSpeedScenarios[1]?.speedAtMax}</strong></span>
                      </div>
                      {oppMegaCandidates.length ? <div className="calc-toggle-row">
                        <button type="button" className={`pick-chip ${!calcOppMegaKey ? 'active' : ''}`} onClick={() => setCalcOppMegaKey(null)}>{lt('일반')}</button>
                        {oppMegaCandidates.map((megaKey) => <button key={`opp-speed-mega-${megaKey}`} type="button" className={`pick-chip ${calcOppMegaKey === megaKey ? 'active' : ''}`} onClick={() => setCalcOppMegaKey(megaKey)}>{megaToggleLabel(megaKey, siteLanguage)}</button>)}
                      </div> : null}
                    </div>
                  </div>
                </div>
              </div>
                <div className="speed-plane-card">
                  <div className="speed-plane-header">
                    <strong>{lt('스피드 비교 그래프')}</strong>
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
                        const labelSideClass = speedBandLabelSideClass(idx, opponentSpeedBands.length, left)
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

        {(mainSection === 'single' && activeTab === 'power') ? <section className="panel wide">
          <div className="row-between section-head">
            <h2>{lt('대미지 계산')}</h2>
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
                    <button type="button" className={`pick-chip ${!calcMyMegaKey ? 'active' : ''}`} onClick={() => setCalcMyMegaKey(null)}>{lt('일반')}</button>
                    {myMegaCandidates.map((megaKey) => <button key={`my-damage-mega-${megaKey}`} type="button" className={`pick-chip ${calcMyMegaKey === megaKey ? 'active' : ''}`} onClick={() => setCalcMyMegaKey(megaKey)}>{megaToggleLabel(megaKey, siteLanguage)}</button>)}
                  </div> : null}
                </div>
              </div>
              <div className="damage-side-moves damage-side-moves-player">
                {myRegisteredDamageMoves.length ? myRegisteredDamageMoves.map((move) => {
                  const moveType = resolveMoveType(move, myMoveOptions, movePoolByKey)
                  const active = !attackFromOpponent && activeDamageMove === move
                  const preview = !attackFromOpponent ? damageMovePreviewByName.get(move) : null
                  return (
                    <button
                      key={`damage-move-my-${myMember.key}-${move}`}
                      type="button"
                      className={`move-chip core damage-move-chip ${moveTypeThemeClass(moveType)} ${active ? 'confirmed' : ''}`}
                      onClick={() => {
                        setCalcSwapSides(false)
                        setSelectedDamageMove({ key: myMember.key, move })
                      }}
                      {...bindTooltip(moveTooltipData(move, siteLanguage))}
                    >
                      <span className="damage-move-card-head">
                        {moveType ? <SmallTypeBadgeImage type={moveType} /> : null}
                        <strong>{move}</strong>
                      </span>
                      {preview?.damage ? <span className="damage-move-card-result">
                        <strong>{isNoEffectDamage(preview.damage) ? lt('무효') : `${preview.damage.minPct}% ~ ${preview.damage.maxPct}%`}</strong>
                        <small>{isNoEffectDamage(preview.damage) ? '0' : `${preview.damage.min} ~ ${preview.damage.max}`} · {preview.verdict}</small>
                      </span> : <small className="damage-move-card-empty">{active ? lt('대미지 계산 불가') : '—'}</small>}
                    </button>
                  )
                }) : <div className="damage-side-empty">{lt('등록 기술 없음')}</div>}
              </div>
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
                    <button type="button" className={`pick-chip ${!calcOppMegaKey ? 'active' : ''}`} onClick={() => setCalcOppMegaKey(null)}>{lt('일반')}</button>
                    {oppMegaCandidates.map((megaKey) => <button key={`opp-damage-mega-${megaKey}`} type="button" className={`pick-chip ${calcOppMegaKey === megaKey ? 'active' : ''}`} onClick={() => setCalcOppMegaKey(megaKey)}>{megaToggleLabel(megaKey, siteLanguage)}</button>)}
                  </div> : null}
                </div>
              </div>
              <div className="damage-side-moves damage-side-moves-opponent">
                {opponentRegisteredDamageMoves.length ? opponentRegisteredDamageMoves.map((move) => {
                  const moveType = resolveMoveType(move, oppMoveOptions, movePoolByKey)
                  const active = attackFromOpponent && activeDamageMove === move
                  const preview = attackFromOpponent ? damageMovePreviewByName.get(move) : null
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
                        {...bindTooltip(moveTooltipData(move, siteLanguage))}
                      >
                        <span className="damage-move-card-head">
                          {moveType ? <SmallTypeBadgeImage type={moveType} /> : null}
                          <strong>{move}</strong>
                        </span>
                        {preview?.damage ? <span className="damage-move-card-result">
                          <strong>{isNoEffectDamage(preview.damage) ? lt('무효') : `${preview.damage.minPct}% ~ ${preview.damage.maxPct}%`}</strong>
                          <small>{isNoEffectDamage(preview.damage) ? '0' : `${preview.damage.min} ~ ${preview.damage.max}`} · {preview.verdict}</small>
                        </span> : <small className="damage-move-card-empty">{active ? lt('대미지 계산 불가') : '—'}</small>}
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
                  <div className="damage-opponent-move-meta">
                    <strong>{lt('공개 기술')}</strong>
                    <span>{opponentRegisteredDamageMoves.length} / 4</span>
                  </div>
                  {oppMember.key && oppTopSuggestedMoves.length ? <details className="damage-top-move-strip">
                    <summary className="damage-top-move-strip-summary">
                      <span className="damage-top-move-strip-summary-copy">
                        <strong>{lt('사용률 상위 기술')}</strong>
                        <span className="muted-inline">Top {Math.min(10, oppTopSuggestedMoves.length)}</span>
                      </span>
                      <span className="damage-top-move-strip-summary-status muted-inline">{lt('현재')} {opponentRegisteredDamageMoves.length} / 4</span>
                    </summary>
                    <div className="move-chip-wrap damage-top-move-strip-chips">
                      {oppTopSuggestedMoves.map((move) => {
                        const moveType = resolveMoveType(move, oppMoveOptions, movePoolByKey)
                        const locked = opponentRegisteredDamageMoves.includes(move)
                        return <button key={`damage-top-opp-${oppMember.key}-${move}`} type="button" className={`move-chip core ${locked ? 'confirmed quiet-confirmed' : ''} ${moveTypeThemeClass(moveType)}`} onClick={() => addOpponentRevealedMove(move)} disabled={locked || opponentRegisteredDamageMoves.length >= 4} {...bindTooltip(moveTooltipData(move, siteLanguage))}>{move}</button>
                      })}
                    </div>
                  </details> : null}
                  <label className="damage-opponent-move-entry">
                    <span>{lt('상대 기술 추가')}</span>
                    <div className="damage-opponent-move-input-row">
                      <input
                        value={calcOpponentMoveDraft}
                        placeholder={lt('사용 가능 기술 검색')}
                        disabled={!oppMember.key || opponentRegisteredDamageMoves.length >= 4}
                        onFocus={() => {
                          setCalcOpponentMoveInputFocused(true)
                          setAutocompleteMenuOpen(`calc-opp-move-${selectedOpp}`)
                        }}
                        onBlur={() => {
                          setTimeout(() => setCalcOpponentMoveInputFocused(false), 120)
                          setTimeout(() => closeAutocompleteMenu(`calc-opp-move-${selectedOpp}`), 120)
                        }}
                        onChange={(e) => {
                          setCalcOpponentMoveDraft(e.target.value)
                          setAutocompleteMenuOpen(`calc-opp-move-${selectedOpp}`)
                        }}
                        onKeyDown={(e) => {
                          const options = filterMoveOptions(calcOpponentMoveDraft, oppMoveOptions)
                            .filter((option) => !opponentRegisteredDamageMoves.includes(option.name))
                            .slice(0, 8)
                          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                            e.preventDefault()
                            moveAutocompleteMenuHighlight(`calc-opp-move-${selectedOpp}`, options.length, e.key === 'ArrowDown' ? 1 : -1)
                            return
                          }
                          if (e.key !== 'Enter') return
                          e.preventDefault()
                          const highlightedMove = options[highlightedAutocompleteIndex(autocompleteHighlight, `calc-opp-move-${selectedOpp}`)]
                          if (highlightedMove) {
                            addOpponentRevealedMove(highlightedMove.name)
                            setCalcOpponentMoveDraft('')
                            setCalcOpponentMoveInputFocused(false)
                            closeAutocompleteMenu(`calc-opp-move-${selectedOpp}`)
                            return
                          }
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
                  {oppMember.key && calcOpponentMoveInputFocused && calcOpponentMoveDraft && oppMoveOptions.length ? <div className="move-autocomplete-menu unified-dropdown-menu damage-opponent-move-menu">
                    {filterMoveOptions(calcOpponentMoveDraft, oppMoveOptions)
                      .filter((option) => !opponentRegisteredDamageMoves.includes(option.name))
                      .slice(0, 8)
                      .map((option, optionIdx) => (
                        <button key={`calc-opp-move-suggest-${oppMember.key}-${option.name}`} type="button" className={`move-autocomplete-item ${highlightedAutocompleteIndex(autocompleteHighlight, `calc-opp-move-${selectedOpp}`) === optionIdx ? 'active' : ''}`} onMouseDown={() => {
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
          <div className="damage-surface-card damage-control-surface separated">
            {activeDamageMoveMeta?.variablePower && !activeDamageMoveHitOptions?.length ? <div className="pick-summary-badges damage-auto-badges">
              <span className="pick-badge warn">{variablePowerHint(activeDamageMove, lt, { targetWeightKnown: typeof calcTargetWeightKg === 'number', resolvedPower: activeDamageMovePower, totalPower: activeDamageMoveHitSummary?.totalPower ?? null })}</span>
            </div> : null}
            {activeDamageMove ? <div className="damage-fact-panel" aria-label={lt('현재 기준 정보')}>
              <div className="damage-fact-panel-head">
                <span>{lt('현재 기술 기준')}</span>
                <strong>{activeDamageMove}</strong>
              </div>
              <dl className="damage-fact-grid">
                <div><dt>{lt('타입')}</dt><dd>{activeDamageMoveType ? displayTypeName(activeDamageMoveType, siteLanguage) : '—'}</dd></div>
                <div><dt>{lt('분류')}</dt><dd>{activeDamageMoveCategory ? lt(activeDamageMoveCategory === 'physical' ? '물리' : '특수') : '—'}</dd></div>
                <div><dt>{lt('위력')}</dt><dd>{activeDamageMovePower ?? '—'}</dd></div>
                <div><dt>{lt('특성')}</dt><dd>{selectedAttackAbility?.label ?? abilityNoteLabel(attackerAbilitySlug) ?? '—'}</dd></div>
                <div><dt>{lt('자속')}</dt><dd>{activeDamageMoveType ? autoStab : '—'}</dd></div>
                <div><dt>{lt('상성')}</dt><dd>{activeDamageMoveType ? `${damageModifiers.effectiveness}x` : '—'}</dd></div>
              </dl>
              {damageModifiers.notes.length ? <div className="damage-applied-modifiers" aria-label={lt('적용 조건')}>
                {damageModifiers.notes.map((note) => <span key={`damage-modifier-${note}`}>{note}</span>)}
              </div> : null}
            </div> : <div className="damage-data-empty">{lt('계산할 기술을 선택해 주세요.')}</div>}
            {activeDamageMoveMeta ? <div className="damage-control-groups">
              <div className="damage-control-group">
                <div className="damage-control-group-title">{lt('화력 조건')}</div>
                <div className="calc-grid damage-calc-grid compact offense-grid">
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
                  </label> : null}
                  {usesTypeChangeStabAbility ? <label className="calc-toggle-box">
                    <input type="checkbox" checked={calcTypeChangeStab} onChange={(e) => setCalcTypeChangeStab(e.target.checked)} />
                    <span>{lt('타입변환 자속')} {autoStab}</span>
                  </label> : null}
                  <div className="calc-inline-pair">
                    {activeDamageMoveAlwaysCrit ? <div className="calc-lock-box">{lt('급소')}</div> : <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcCritical} onChange={(e) => setCalcCritical(e.target.checked)} />
                      <span>{lt('급소')}</span>
                    </label>}
                    <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcBurned} onChange={(e) => setCalcBurned(e.target.checked)} />
                      <span>{lt('화상')}</span>
                    </label>
                  </div>
                  {attackFromOpponent ? <>
                    <label>
                      {lt('상대 화력 프리셋')}
                      <select value={calcOpponentOffensePreset} onChange={(e) => applyOpponentOffensePresetSelection(e.target.value as OpponentOffensePreset)}>
                        {Object.entries(OPPONENT_OFFENSE_PRESETS).map(([key, preset]) => <option key={`opp-offense-preset-${key}`} value={key}>{preset.label}</option>)}
                        <option value="custom">{lt('직접 조절')}</option>
                      </select>
                    </label>
                    <div className="calc-inline-pair calc-stat-pair">
                      <label>
                        {lt('상대 공격')}
                        <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={calcOpponentAttackEv} onChange={(e) => updateOpponentOffenseState({ attackEv: clampEv(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                      </label>
                      <label className="calc-toggle-box calc-toggle-box-compact">
                        <input type="checkbox" checked={calcOpponentAttackNature > 1} onChange={(e) => updateOpponentOffenseState({ attackNature: e.target.checked ? 1.1 : 1 })} />
                        <span>{lt('+공격 성격')}</span>
                      </label>
                    </div>
                    <div className="calc-inline-pair calc-stat-pair">
                      <label>
                        {lt('상대 특수공격')}
                        <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={calcOpponentSpAttackEv} onChange={(e) => updateOpponentOffenseState({ spAttackEv: clampEv(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                      </label>
                      <label className="calc-toggle-box calc-toggle-box-compact">
                        <input type="checkbox" checked={calcOpponentSpAttackNature > 1} onChange={(e) => updateOpponentOffenseState({ spAttackNature: e.target.checked ? 1.1 : 1 })} />
                        <span>{lt('+특수공격 성격')}</span>
                      </label>
                    </div>
                  </> : null}
                  {showAttackerLowHpToggle || showTargetPoisonedToggle ? <div className="calc-inline-pair">
                    {showAttackerLowHpToggle ? <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcAttackerLowHp} onChange={(e) => setCalcAttackerLowHp(e.target.checked)} />
                      <span>{lt('공격측 HP 1/3 이하')}</span>
                    </label> : null}
                    {showTargetPoisonedToggle ? <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcTargetPoisoned} onChange={(e) => setCalcTargetPoisoned(e.target.checked)} />
                      <span>{lt('상대 독/맹독')}</span>
                    </label> : null}
                  </div> : null}
                  {showMovedAfterTargetToggle || showDefenderStatusedToggle ? <div className="calc-inline-pair">
                    {showMovedAfterTargetToggle ? <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcMovedAfterTarget} onChange={(e) => setCalcMovedAfterTarget(e.target.checked)} />
                      <span>{lt('상대보다 늦게 행동')}</span>
                    </label> : null}
                    {showDefenderStatusedToggle ? <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcDefenderStatused} onChange={(e) => setCalcDefenderStatused(e.target.checked)} />
                      <span>{lt('상대 상태이상')}</span>
                    </label> : null}
                  </div> : null}
                  {showFaintedAlliesInput || showRivalryModeInput ? <div className="calc-inline-pair">
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
                  </div> : null}
                  {showParentalBondToggle || showElectromorphosisToggle ? <div className="calc-inline-pair">
                    {showParentalBondToggle ? <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcParentalBond} onChange={(e) => setCalcParentalBond(e.target.checked)} />
                      <span>{lt('부자유친 발동')}</span>
                    </label> : null}
                    {showElectromorphosisToggle ? <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcElectromorphosisCharged} onChange={(e) => setCalcElectromorphosisCharged(e.target.checked)} />
                      <span>{lt('일렉트릭 차지됨')}</span>
                    </label> : null}
                  </div> : null}
                  <label>
                    {lt('공격측 화력 랭크')}
                    <select value={calcAttackStage} onChange={(e) => setCalcAttackStage(clampBattleStage(e.target.value))}>
                      {[6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6].map((stage) => <option key={`atk-stage-${stage}`} value={stage}>{stage > 0 ? `+${stage}` : stage}</option>)}
                    </select>
                  </label>
                </div>
              </div>
              <button
                type="button"
                className={`damage-advanced-toggle ${calcFieldConditionsCollapsed ? '' : 'active'}`}
                onClick={() => setCalcFieldConditionsCollapsed((prev) => !prev)}
                aria-expanded={!calcFieldConditionsCollapsed}
              >
                <span>
                  <strong>{lt('세부 조건')}</strong>
                  <small>{activeFieldConditionLabels.length ? activeFieldConditionLabels.join(' · ') : lt('상대 내구')} · {calcDefenseStage > 0 ? `+${calcDefenseStage}` : calcDefenseStage}</small>
                </span>
                <b>{calcFieldConditionsCollapsed ? '＋' : '－'}</b>
              </button>
              {!calcFieldConditionsCollapsed ? <>
              <div className="damage-control-group">
                <div className="damage-control-group-title">{lt('방어측')}</div>
                <div className="calc-grid damage-calc-grid compact defender-grid">
                  {attackFromOpponent ? <div className="calc-lock-box">{lt('방어측은 내 파티 실수치를 사용함')}</div> : <>
                    <div className="calc-inline-pair">
                      <label>
                        {lt('상대 내구 프리셋')}
                        <select value={calcOpponentBulkPreset} onChange={(e) => applyOpponentBulkPresetSelection(e.target.value as OpponentBulkPreset)}>
                          {Object.entries(OPPONENT_BULK_PRESETS).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}
                          <option value="custom">{lt('직접 조절')}</option>
                        </select>
                      </label>
                      <label>
                        {lt('방어측 내구 랭크')}
                        <select value={calcDefenseStage} onChange={(e) => setCalcDefenseStage(clampBattleStage(e.target.value))}>
                          {[6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6].map((stage) => <option key={`def-stage-${stage}`} value={stage}>{stage > 0 ? `+${stage}` : stage}</option>)}
                        </select>
                      </label>
                    </div>
                    <div className="calc-inline-pair">
                      <label>
                        {lt('상대 체력')}
                        <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={calcOpponentHpEv} onChange={(e) => updateOpponentBulkState({ hpEv: clampEv(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                      </label>
                      {showDefenderFullHpToggle ? <label className="calc-toggle-box">
                        <input type="checkbox" checked={calcDefenderFullHp} onChange={(e) => setCalcDefenderFullHp(e.target.checked)} />
                        <span>{lt('상대 HP 만땅')}</span>
                      </label> : null}
                    </div>
                    <div className="calc-inline-pair calc-stat-pair">
                      <label>
                        {lt('상대 방어')}
                        <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={calcOpponentDefenseEv} onChange={(e) => updateOpponentBulkState({ defenseEv: clampEv(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                      </label>
                      <label className="calc-toggle-box calc-toggle-box-compact">
                        <input type="checkbox" checked={calcOpponentDefenseNature > 1} onChange={(e) => updateOpponentBulkState({ defenseNature: e.target.checked ? 1.1 : 1 })} />
                        <span>{lt('+방어 성격')}</span>
                      </label>
                    </div>
                    <div className="calc-inline-pair calc-stat-pair">
                      <label>
                        {lt('상대 특수방어')}
                        <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={calcOpponentSpDefenseEv} onChange={(e) => updateOpponentBulkState({ spDefenseEv: clampEv(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                      </label>
                      <label className="calc-toggle-box calc-toggle-box-compact">
                        <input type="checkbox" checked={calcOpponentSpDefenseNature > 1} onChange={(e) => updateOpponentBulkState({ spDefenseNature: e.target.checked ? 1.1 : 1 })} />
                        <span>{lt('+특수방어 성격')}</span>
                      </label>
                    </div>
                  </>}
                  {showDefenderDisguiseToggle ? <label className="calc-toggle-box">
                    <input type="checkbox" checked={calcDefenderDisguise} onChange={(e) => setCalcDefenderDisguise(e.target.checked)} />
                    <span>{lt('상대 탈 intact')}</span>
                  </label> : null}
                </div>
              </div>
              <div className="damage-control-group damage-control-group-secondary">
                <div className="damage-control-group-title">{lt('전장 조건')}</div>
                <div className="calc-grid damage-calc-grid compact field-grid">
                  <div className="calc-inline-pair">
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
                  </div>
                  <div className="calc-inline-pair">
                    <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcReflect} onChange={(e) => setCalcReflect(e.target.checked)} />
                      <span>{lt('리플렉터')}</span>
                    </label>
                    <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcLightScreen} onChange={(e) => setCalcLightScreen(e.target.checked)} />
                      <span>{lt('빛의장막')}</span>
                    </label>
                  </div>
                  <label className="calc-toggle-box span-2">
                    <input type="checkbox" checked={calcAuroraVeil} onChange={(e) => setCalcAuroraVeil(e.target.checked)} />
                    <span>{lt('오로라베일')}</span>
                  </label>
                </div>
              </div>
              </> : null}
            </div> : null}
          </div>
        </section> : null}
        </>}
        {hoverTooltip ? <div className={`floating-hover-tooltip ${tooltipPlacement} ${hoverTooltip.kind === 'item' ? 'item-tooltip' : ''}`} style={{ left: tooltipLeft, top: tooltipTop }} aria-hidden="true">
          <div className="floating-hover-tooltip-head">
            <div>
              <strong>{hoverTooltip.title}</strong>
              {hoverTooltip.subtitle ? <p>{hoverTooltip.subtitle}</p> : null}
            </div>
            {hoverTooltip.accentType ? <span className="floating-hover-tooltip-type"><TypeBadgeImage type={hoverTooltip.accentType} /></span> : null}
          </div>
          {hoverTooltip.rows.length ? <div className={`floating-hover-tooltip-body ${hoverTooltip.kind === 'item' ? 'item-tooltip-effect-body' : ''}`}>
            {hoverTooltip.rows.map((row) => <div key={`tooltip-row-${hoverTooltip.kind}-${row.label}`} className="floating-hover-tooltip-row">
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>)}
          </div> : null}
          {hoverTooltip.description ? <div className="floating-hover-tooltip-description">
            <span>{hoverTooltip.kind === 'item' ? lt('설명') : lt('효과')}</span>
            <p>{hoverTooltip.description}</p>
          </div> : null}
          {hoverTooltip.chips?.length ? <div className="floating-hover-tooltip-chips">
            {hoverTooltip.chips.map((chip) => <span key={`tooltip-chip-${hoverTooltip.kind}-${chip}`} className="floating-hover-tooltip-chip">{chip}</span>)}
          </div> : null}
        </div> : null}
      </main>
    </div>
  )
}
