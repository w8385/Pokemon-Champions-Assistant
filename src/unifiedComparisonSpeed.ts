import { actualStat } from './statMechanics.ts'
import { applySpeedModifiers, applySpeedStage } from './speedModifiers.ts'
export function effectiveComparisonSpeed(row: {key: string; speed: number}, effort: number, nature: number, stage: number, scarf: boolean, abilityMultiplier: 1 | 1.5 | 2 = 1, abilitySlug = '') {
 if (scarf && row.key.startsWith('mega-')) return { value: null, reason: '메가폼은 메가스톤이 필요하여 스카프를 사용할 수 없습니다.' }
 if (scarf && abilitySlug === 'unburden' && abilityMultiplier !== 1) return { value: null, reason: '곡예 발동에는 현재 지닌 도구가 없어야 합니다.' }
 return { value: applySpeedModifiers(applySpeedStage(actualStat(row.speed, effort, nature), stage), {scarf, abilityMultiplier}), reason: null }
}
