import type { ReactNode } from 'react'
import { UiIcon, type UiIconName } from './UiIcon'

/** One title/action hierarchy shared by the home and every work area. */
export function PageHeading({ title, icon, actions }: { title: string; icon?: UiIconName; actions?: ReactNode }) {
  return <div className="page-heading">
    {icon ? <UiIcon name={icon} size={22} /> : null}
    <h2>{title}</h2>
    {actions ? <div className="page-heading-actions">{actions}</div> : null}
  </div>
}
