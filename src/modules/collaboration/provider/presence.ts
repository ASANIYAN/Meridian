import type { PresentUser } from '../types/collaboration.types'

/**
 * Presence parsing (FE-PRESENCE-1/3), against the confirmed wire format (CLAUDE.md §4):
 * - the join roster is `initial_state.data.participants`, a MAP `{ userId: displayName }`
 * - live updates are `{ type: 'presence', userId, name, status }` text frames —
 *   keyed by `type` (not `event`), camelCase fields, `status` carries online/offline.
 */

export type PresenceStatus = 'online' | 'offline'

/** A `{ type: 'presence', ... }` frame from the gateway. */
export interface PresenceFrame {
  type: 'presence'
  userId: string
  name: string
  status: PresenceStatus
}

export interface PresenceUpdate {
  user: PresentUser
  status: PresenceStatus
}

/** Flatten the participants map `{ userId: displayName }` into a roster list. */
export function flattenParticipants(participants: unknown): PresentUser[] {
  if (!participants || typeof participants !== 'object') return []
  return Object.entries(participants as Record<string, unknown>).map(([userId, name]) => ({
    userId,
    displayName: String(name ?? 'Someone'),
  }))
}

/** Parse a presence frame into a roster update, or null if it isn't one. */
export function parsePresenceFrame(frame: unknown): PresenceUpdate | null {
  if (!frame || typeof frame !== 'object') return null
  const f = frame as Record<string, unknown>
  if (f.type !== 'presence' || typeof f.userId !== 'string' || !f.userId) return null
  return {
    user: { userId: f.userId, displayName: String(f.name ?? 'Someone') },
    status: f.status === 'offline' ? 'offline' : 'online',
  }
}

/** Apply a presence update to the current roster (add on online, remove on offline). */
export function applyPresenceUpdate(
  roster: PresentUser[],
  update: PresenceUpdate,
): PresentUser[] {
  if (update.status === 'offline') {
    return roster.filter((u) => u.userId !== update.user.userId)
  }
  if (roster.some((u) => u.userId === update.user.userId)) return roster
  return [...roster, update.user]
}
