import type { UiIconName } from '../shared/display/UiIcon'

export const homeRoute = { label: '홈', href: '#/', icon: 'home' } as const satisfies { label: string; href: string; icon: UiIconName }

export const routeGroups = [
  { label: '배틀', section: 'battle', links: [
    { label: '내 파티', href: '#/party', section: 'party', tab: '', icon: 'party' },
    { label: '대면', href: '#/single?tab=party', section: 'single', tab: 'party', icon: 'battle' },
  ] },
  { label: '분석 도구', section: 'tools', links: [
    { label: '계산기', href: '#/damage', section: 'quickDamage', tab: '', icon: 'calculator' },
    { label: '스피드라인', href: '#/speed-line', section: 'speedLine', tab: '', icon: 'speed' },
  ] },
  { label: '샘플', section: 'sample', links: [
    { label: '샘플 라이브러리', href: '#/sample-builder?sampleTab=library', section: 'sample', tab: 'library', icon: 'library' },
    { label: '샘플 연구소', href: '#/sample-builder?sampleTab=builder', section: 'sample', tab: 'builder', icon: 'lab' },
  ] },
  { label: '도감', section: 'dex', links: [
    { label: '도감', href: '#/dex', section: 'dex', tab: '', icon: 'dex' },
  ] },
] as const

export function routeIconFor(section: string, tab = ''): UiIconName | undefined {
  if (section === 'home') return homeRoute.icon
  if (section === 'double') return 'battle'
  for (const group of routeGroups) {
    for (const link of group.links) {
      if (link.section === section && (section !== 'sample' || (tab === 'library' ? link.tab === 'library' : link.tab === 'builder'))) return link.icon
    }
  }
  return undefined
}

export function normalizeRoute(hash: string): { section: 'home' | 'single' | 'party' | 'double' | 'sample' | 'speedLine' | 'dex' | 'quickDamage'; tab: string } {
  const route = new URL((hash.replace(/^#/, '') || '/'), 'https://route.local')
  const path = route.pathname
  if (path === '/party') return { section: 'party', tab: '' }
  if (path === '/single') return { section: 'single', tab: 'party' }
  if (path === '/single' || path === '/double') {
    const value = route.searchParams.get('tab')
    return { section: path.slice(1) as 'single' | 'double', tab: value === 'speed' && path === '/double' ? 'power' :
      value === 'party' || value === 'pick' || value === 'power' || (path === '/single' && value === 'speed') ? value : 'party' }
  }
  if (path === '/sample-builder') {
    const value = route.searchParams.get('sampleTab')
    return { section: 'sample', tab: value === 'rankers' ? 'library' : value === 'speed' || value === 'damage' || value === 'library' ? value : 'builder' }
  }
  if (path.startsWith('/sample-library/')) return { section: 'sample', tab: 'library' }
  if (path === '/speed-line') return { section: 'speedLine', tab: '' }
  if (path === '/damage') return { section: 'quickDamage', tab: '' }
  if (path === '/dex') return { section: 'dex', tab: '' }
  return { section: 'home', tab: '' }
}
