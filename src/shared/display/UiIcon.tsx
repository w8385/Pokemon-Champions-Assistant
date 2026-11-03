/* Small original geometric marks; never an icon font or SF Symbols asset. */
export type UiIconName = 'home' | 'party' | 'battle' | 'calculator' | 'speed' | 'library' | 'lab' | 'dex' | 'globe' | 'settings' | 'chevron' | 'search' | 'plus' | 'trash' | 'edit' | 'close' | 'swap' | 'info' | 'upload' | 'download' | 'check' | 'warning'

export function UiIcon({ name, size = 20, className }: { name: UiIconName; size?: number; className?: string }) {
  const paths: Record<UiIconName, React.ReactNode> = {
    home: <><path d="m3 11 9-7 9 7v9H3z"/><path d="M9 20v-6h6v6"/></>,
    party: <><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 20v-2a5.5 5.5 0 0 1 11 0v2zM15 15a4 4 0 0 1 6 3v2h-5"/></>,
    battle: <><path d="M4 5 19 20M20 5 5 20M3 3l4 1-3 4M21 3l-4 1 3 4M3 21l4-1-3-4M21 21l-4-1 3-4"/></>,
    calculator: <><rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M8 7h8M8 12h2m4 0h2M8 17h2m4 0h2"/></>,
    speed: <><path d="M4 18a9 9 0 1 1 16 0H4Z"/><path d="m12 15 4-6M12 6v1M6 12l1 1m11-1-1 1"/></>,
    library: <><path d="M4 4h7v16H4zM13 4h7v16h-7zM7 8h1m8 0h1M7 12h1m8 0h1"/></>,
    lab: <><path d="M9 3h6M10 3v7l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3M8 16h8"/></>,
    dex: <><path d="M3 5a3 3 0 0 1 3-3h12v17H6a3 3 0 0 0-3 3V5Zm0 14a3 3 0 0 1 3-3h12M8 7h6m-6 4h8"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-3 3-4 6-4 9s1 6 4 9m0-18c3 3 4 6 4 9s-1 6-4 9"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m10 2-.6 2.4-2 1.2-2.4-.7-2 3.5 1.8 1.8v2.4L3 14.4l2 3.5 2.4-.7 2 1.2L10 21h4l.6-2.6 2-1.2 2.4.7 2-3.5-1.8-1.8v-2.4L21 8.4l-2-3.5-2.4.7-2-1.2L14 2z"/></>,
    chevron: <path d="m9 5 7 7-7 7"/>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></>,
    plus: <path d="M12 4v16M4 12h16"/>,
    trash: <><path d="M4 6h16M9 6V4h6v2M6 6l1 15h10l1-15M10 10v7m4-7v7"/></>,
    edit: <><path d="m4 17 12-12 3 3L7 20l-4 1 1-4ZM14 7l3 3"/></>,
    close: <path d="M5 5 19 19M19 5 5 19"/>,
    swap: <><path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/></>,
    upload: <><path d="M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5"/></>,
    download: <><path d="M12 3v13m-5-5 5 5 5-5M4 16v4h16v-4"/></>,
    check: <path d="m4 12 5 5L20 6"/>,
    warning: <><path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5m0 3v1"/></>,
  }
  return <svg className={className ?? 'ui-icon'} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>
}
