import type { LibraryFormat, LibraryLanguage } from './creatorSampleLibrary'

export type LibraryViewContext = {
  language: LibraryLanguage | 'all'
  format: LibraryFormat | 'all'
  query: string
  kind: 'party' | 'pokemon'
}

export function parseLibraryContext(params: URLSearchParams, sourceId?: string | null): LibraryViewContext {
  const language = params.get('libRegion')
  const format = params.get('libFormat')
  const kind = params.get('libKind')
  return {
    language: language === 'ko' || language === 'ja' ? language : 'all',
    format: format === 'singles' || format === 'doubles' ? format : 'all',
    query: (params.get('libQuery') ?? '').slice(0, 200),
    kind: kind === 'pokemon' || kind === 'party' ? kind : sourceId?.startsWith('individual:') ? 'pokemon' : 'party',
  }
}

export function writeLibraryContext(params: URLSearchParams, context: LibraryViewContext) {
  if (context.language !== 'all') params.set('libRegion', context.language)
  if (context.format !== 'all') params.set('libFormat', context.format)
  if (context.query) params.set('libQuery', context.query)
  if (context.kind !== 'party') params.set('libKind', context.kind)
}

export function libraryListHref(context: LibraryViewContext) {
  const params = new URLSearchParams({ sampleTab: 'library' })
  writeLibraryContext(params, context)
  return `#/sample-builder?${params}`
}

export function libraryDetailHref(id: string, context: LibraryViewContext) {
  const params = new URLSearchParams()
  writeLibraryContext(params, context)
  return `#/sample-library/${encodeURIComponent(id)}${params.size ? `?${params}` : ''}`
}
