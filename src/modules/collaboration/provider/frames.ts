/**
 * Wire framing (FE-COLLAB-2/3, CLAUDE.md §4).
 *
 * Client → server updates are sent as JSON with the Yjs bytes as a number[].
 * Server → client document broadcasts are raw binary (handled directly by the
 * provider). initial_state's snapshot is base64; its delta ops carry bytes in a
 * shape we coerce defensively until confirmed against live frames.
 */

/** Encode a Yjs update as the client→server `update` message (data is the raw bytes). */
export function encodeUpdateMessage(update: Uint8Array): string {
  return JSON.stringify({ event: 'update', data: Array.from(update) })
}

/** Encode the client→server `join` message. */
export function encodeJoinMessage(documentId: string): string {
  return JSON.stringify({ event: 'join', data: { document_id: documentId } })
}

export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/**
 * Coerce a delta-op (or snapshot) value into Yjs bytes. Accepts a base64 string,
 * a number[], a Uint8Array, or an object wrapping one of those under a common
 * key. Returns null if nothing usable is found (logged + skipped by the caller).
 */
export function coerceBytes(value: unknown): Uint8Array | null {
  if (value == null) return null
  if (value instanceof Uint8Array) return value
  if (typeof value === 'string') {
    try {
      return base64ToBytes(value)
    } catch {
      return null
    }
  }
  if (Array.isArray(value) && value.every((n) => typeof n === 'number')) {
    return Uint8Array.from(value as number[])
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    for (const key of ['update', 'payload', 'data', 'bytes']) {
      if (key in obj) {
        const inner = coerceBytes(obj[key])
        if (inner) return inner
      }
    }
  }
  return null
}
