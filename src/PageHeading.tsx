import type { ReactNode } from 'react'

/** One title/action hierarchy shared by the home and every work area. */
export function PageHeading({ title, actions }: { title: string; actions?: ReactNode }) {
  return <div className="page-heading">
    <h2>{title}</h2>
    {actions ? <div className="page-heading-actions">{actions}</div> : null}
  </div>
}
