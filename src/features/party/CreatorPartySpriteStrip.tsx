type SpriteSlot = { id: string; sprite?: string | null }

/** Keep every source member position even when a roster sprite is unavailable. */
export function CreatorPartySpriteStrip({ members }: { members: readonly SpriteSlot[] }) {
  return <span className="creator-library-sprites">{members.map(member =>
    <span key={member.id} className="creator-library-sprite-slot" aria-hidden="true">
      {member.sprite ? <img src={member.sprite} alt="" /> : null}
    </span>)}</span>
}
