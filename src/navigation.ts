export const routeGroups = [
  { label: '배틀 준비', section: 'battle', links: [
    { label: '싱글배틀', href: '#/single?tab=party', section: 'single', tab: 'party' },
    { label: '더블배틀', href: '#/double?tab=party', section: 'double', tab: 'party' },
  ] },
  { label: '샘플', section: 'sample', links: [
    { label: '샘플 빌더', href: '#/sample-builder?sampleTab=builder', section: 'sample', tab: 'builder' },
    { label: '크리에이터 라이브러리', href: '#/sample-builder?sampleTab=library', section: 'sample', tab: 'library' },
    { label: '랭커 샘플', href: '#/sample-builder?sampleTab=rankers', section: 'sample', tab: 'rankers' },
  ] },
  { label: '도구/자료', section: 'tools', links: [
    { label: '실능 스피드라인', href: '#/speed-line', section: 'speedLine', tab: '' },
    { label: '도감', href: '#/dex', section: 'dex', tab: '' },
  ] },
] as const

export function normalizeRoute(hash: string): { section: 'home' | 'single' | 'double' | 'sample' | 'speedLine' | 'dex'; tab: string } {
  const route = new URL((hash.replace(/^#/, '') || '/'), 'https://route.local')
  const path = route.pathname
  if (path === '/single' || path === '/double') {
    const value = route.searchParams.get('tab')
    return { section: path.slice(1) as 'single' | 'double', tab: value === 'speed' && path === '/double' ? 'power' :
      value === 'party' || value === 'pick' || value === 'power' || (path === '/single' && value === 'speed') ? value : 'party' }
  }
  if (path === '/sample-builder') {
    const value = route.searchParams.get('sampleTab')
    return { section: 'sample', tab: value === 'speed' || value === 'damage' || value === 'library' || value === 'rankers' ? value : 'builder' }
  }
  if (path === '/speed-line') return { section: 'speedLine', tab: '' }
  if (path === '/dex') return { section: 'dex', tab: '' }
  return { section: 'home', tab: '' }
}
