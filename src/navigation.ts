export const routeGroups = [
  { label: '배틀 준비', section: 'battle', links: [
    { label: '싱글배틀', href: '#/single?tab=party', section: 'single', tab: 'party' },
    { label: '내 파티 관리', href: '#/party', section: 'party', tab: '' },
  ] },
  { label: '샘플', section: 'sample', links: [
    { label: '샘플 빌더', href: '#/sample-builder?sampleTab=builder', section: 'sample', tab: 'builder' },
    { label: '샘플 라이브러리', href: '#/sample-builder?sampleTab=library', section: 'sample', tab: 'library' },
  ] },
  { label: '도구/자료', section: 'tools', links: [
    { label: '간단 대미지', href: '#/damage', section: 'quickDamage', tab: '' },
    { label: '실능 스피드라인', href: '#/speed-line', section: 'speedLine', tab: '' },
    { label: '도감', href: '#/dex', section: 'dex', tab: '' },
  ] },
] as const

export function normalizeRoute(hash: string): { section: 'home' | 'single' | 'party' | 'double' | 'sample' | 'speedLine' | 'dex' | 'quickDamage'; tab: string } {
  const route = new URL((hash.replace(/^#/, '') || '/'), 'https://route.local')
  const path = route.pathname
  if (path === '/party') return { section: 'party', tab: '' }
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
