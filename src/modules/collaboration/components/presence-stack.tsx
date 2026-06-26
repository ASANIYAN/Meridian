import { useAuthStore } from '@/store/auth-store'
import { useMediaQuery } from '@/lib/use-media-query'
import { useCollaboration } from '../hooks/use-collaboration'
import type { PresentUser } from '../types/collaboration.types'

const HUES = [
  'var(--presence-teal)',
  'var(--presence-coral)',
  'var(--presence-violet)',
  'var(--presence-moss)',
]

/** Deterministic, stable hue per user from the presence palette. */
function hueFor(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return HUES[h % HUES.length]
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// How many avatars to show before collapsing to +N, by viewport — the header
// shares its row with the status readout and user menu, so it tightens on narrow
// widths (Tailwind breakpoints: sm 640px, lg 1024px).
const AVATAR_LIMITS = { base: 2, sm: 3, lg: 4 }

function Avatar({ user }: { user: PresentUser }) {
  return (
    <span
      title={user.displayName}
      className="grid size-8 place-items-center rounded-full font-mono text-[10.5px] font-medium text-white ring-2 ring-background"
      style={{ backgroundColor: hueFor(user.userId) }}
    >
      {initials(user.displayName)}
    </span>
  )
}

/**
 * Presence avatar stack (FE-PRESENCE-2) — reads the roster from useCollaboration,
 * shows everyone else currently viewing, and collapses past a threshold. Display
 * names ride along in the roster, so no separate member-list fetch is needed.
 */
export function PresenceStack() {
  const { presentUsers } = useCollaboration()
  const meId = useAuthStore((s) => s.user?.id)
  const isSm = useMediaQuery('(min-width: 640px)')
  const isLg = useMediaQuery('(min-width: 1024px)')
  const maxAvatars = isLg ? AVATAR_LIMITS.lg : isSm ? AVATAR_LIMITS.sm : AVATAR_LIMITS.base

  const others = presentUsers.filter((u) => u.userId !== meId)

  if (others.length === 0) {
    return (
      <span className="hidden font-mono text-[11px] uppercase tracking-widest text-muted-foreground sm:inline">
        Just you
      </span>
    )
  }

  const shown = others.slice(0, maxAvatars)
  const overflow = others.length - shown.length

  return (
    <div
      className="flex items-center -space-x-2"
      aria-label={`${others.length} other ${others.length === 1 ? 'person' : 'people'} viewing`}
    >
      {shown.map((u) => (
        <Avatar key={u.userId} user={u} />
      ))}
      {overflow > 0 && (
        <span className="grid size-8 place-items-center rounded-full bg-muted font-mono text-[10.5px] font-medium text-muted-foreground ring-2 ring-background">
          +{overflow}
        </span>
      )}
    </div>
  )
}
