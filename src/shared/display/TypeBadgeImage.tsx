import { getTypeBadgeLabel, getTypeBadgeSrc } from './typeBadges'

export function TypeBadgeImage({ type }: { type: string }) {
  const label = getTypeBadgeLabel(type)
  return <img src={getTypeBadgeSrc(type)} alt={label} className="type-badge-image" title={label} />
}
