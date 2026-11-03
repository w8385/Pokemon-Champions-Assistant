import { normalizeRoute } from './navigation.ts'
import { parseLibraryContext, writeLibraryContext } from './libraryViewRoute.ts'
import { parseSpeedLineState, writeSpeedLineState } from '../features/speedline/speedLineState.ts'
import type { MainSection, MainTab, SampleWorkbenchTab, ViewState } from './types'

export function parseViewStateFromUrl(): ViewState | null {
  if (typeof window === 'undefined') return null
  try {
    const rawHash = window.location.hash.replace(/^#/, '').trim()
    const normalizedHash = rawHash || '/'
    const routeUrl = new URL(normalizedHash.startsWith('/') ? normalizedHash : `/${normalizedHash}`, 'https://openclaw.local')
    const normalizedRoute = normalizeRoute(window.location.hash)
    const routePath = routeUrl.pathname.replace(/\/+$/, '') || '/'
    const mainSection: MainSection | undefined = routePath === '/damage' ? 'quickDamage' : routePath === '/single'
      ? 'single'
      : routePath === '/party'
        ? 'party'
      : routePath === '/speed-line'
        ? 'speedLine'
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
    const activeTab = mainSection === 'double' && activeTabParam === 'speed' ? 'power'
      : activeTabParam === 'party' || activeTabParam === 'pick' || activeTabParam === 'speed' || activeTabParam === 'power'
        ? activeTabParam
        : undefined
    const sampleTabParam = routeUrl.searchParams.get('sampleTab')
    const sampleWorkbenchTab = sampleTabParam === 'builder' || sampleTabParam === 'speed' || sampleTabParam === 'damage' || sampleTabParam === 'library' || sampleTabParam === 'rankers'
      ? sampleTabParam === 'rankers' ? 'library' : sampleTabParam
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
    const librarySourceId = routePath.startsWith('/sample-library/') ? decodeURIComponent(routePath.slice('/sample-library/'.length)) : null
    const libraryContext = parseLibraryContext(routeUrl.searchParams, librarySourceId)
    const speedLineUrl = routePath === '/speed-line' ? parseSpeedLineState(routeUrl.searchParams) : undefined
    return { mainSection: mainSection ?? normalizedRoute.section, activeTab: mainSection === 'single' || mainSection === 'double' ? normalizedRoute.tab as MainTab : activeTab,
      speedLineState: speedLineUrl?.state, speedLineWarnings: speedLineUrl?.warnings,
      sampleWorkbenchTab: normalizedRoute.section === 'sample' ? normalizedRoute.tab as SampleWorkbenchTab : sampleWorkbenchTab,
      librarySourceId, libraryLanguage: libraryContext.language, libraryFormat: libraryContext.format,
      libraryQuery: libraryContext.query, libraryContentKind: libraryContext.kind,
      dexSearchMode, dexSearch, dexUnifiedSearch, dexSelectedValue, selectedMy, selectedOpp }
  } catch {
    return null
  }
}

export function syncViewStateToUrl(viewState: ViewState) {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams()
  const routePath = viewState.mainSection === 'quickDamage' ? '/damage' : viewState.mainSection === 'sample' ? viewState.sampleWorkbenchTab === 'library' && viewState.librarySourceId ? `/sample-library/${encodeURIComponent(viewState.librarySourceId)}` : '/sample-builder' : viewState.mainSection === 'single' ? '/single' : viewState.mainSection === 'party' ? '/party' : viewState.mainSection === 'double' ? '/double' : viewState.mainSection === 'dex' ? '/dex' : viewState.mainSection === 'speedLine' ? '/speed-line' : '/'
  if (viewState.mainSection === 'double' && viewState.activeTab) params.set('tab', viewState.activeTab)
  if (viewState.mainSection === 'sample' && viewState.sampleWorkbenchTab && !viewState.librarySourceId) params.set('sampleTab', viewState.sampleWorkbenchTab)
  if (viewState.mainSection === 'sample' && viewState.sampleWorkbenchTab === 'library') writeLibraryContext(params, {
    language: viewState.libraryLanguage ?? 'all', format: viewState.libraryFormat ?? 'all',
    query: viewState.libraryQuery ?? '', kind: viewState.libraryContentKind ?? 'party',
  })
  if (viewState.mainSection === 'dex' && viewState.dexSearchMode) params.set('dexTab', viewState.dexSearchMode)
  if (viewState.mainSection === 'dex' && viewState.dexSearch) params.set('q', viewState.dexSearch)
  if (viewState.mainSection === 'dex' && viewState.dexUnifiedSearch) params.set('uq', viewState.dexUnifiedSearch)
  if (viewState.mainSection === 'dex' && viewState.dexSelectedValue) params.set('sel', viewState.dexSelectedValue)
  if (typeof viewState.selectedMy === 'number') params.set('my', String(viewState.selectedMy))
  if (typeof viewState.selectedOpp === 'number') params.set('opp', String(viewState.selectedOpp))
  if (routePath === '/party') {
    const current = new URL(window.location.hash.replace(/^#/, '') || '/', window.location.href)
    if (current.pathname === '/party' && current.searchParams.get('edit') === String(viewState.selectedMy)) params.set('edit', String(viewState.selectedMy))
  }
  if (viewState.mainSection === 'speedLine' && viewState.speedLineState) writeSpeedLineState(params, viewState.speedLineState)
  const nextHash = `${routePath}${params.toString() ? `?${params.toString()}` : ''}`
  if ((window.location.hash.replace(/^#/, '') || '/') === nextHash) return
  const url = new URL(window.location.href)
  url.hash = nextHash
  window.history.replaceState(window.history.state, '', url)
}
