import type { DexSearchMode } from './app/types'

export const DEX_PAGE_SIZE = 24

export type DexPage = { scope: string; count: number }
export type DexScrollRestore = DexPage & { y: number }

export function dexScrollRestoreReady(
  pending: DexScrollRestore | null,
  view: { section: string; selection: string | null; queryPending: boolean; scope: string; visibleCount: number; totalCount: number },
): boolean {
  return pending !== null && view.section === 'dex' && !view.selection && !view.queryPending
    && pending.scope === view.scope && view.visibleCount >= Math.min(pending.count, view.totalCount)
}

export function dexPageScope(category: DexSearchMode, query: string): string {
  return `${category}\u0000${query.trim().normalize('NFKC').toLocaleLowerCase()}`
}

export function dexVisibleCount(page: DexPage, scope: string, total = Infinity): number {
  return Math.min(total, page.scope === scope ? page.count : DEX_PAGE_SIZE)
}

/** Ignore repeated intersection callbacks for one page; a new scope starts at page one. */
export function dexNextPage(page: DexPage, scope: string, total: number, displayed: number): DexPage {
  const current = dexVisibleCount(page, scope, total)
  if (current !== displayed || current >= total) return page
  return { scope, count: Math.min(total, current + DEX_PAGE_SIZE) }
}
