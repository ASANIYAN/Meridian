import * as Y from 'yjs'
import type { Role } from '@/types/document'
import { classifyClose, type CloseAction } from './close-codes'
import { base64ToBytes, coerceBytes, encodeJoinMessage, encodeUpdateMessage } from './frames'
import { applyPresenceUpdate, flattenParticipants, parsePresenceFrame } from './presence'
import type { ConnectionStatus, PresentUser } from '../types/collaboration.types'

interface ProviderCallbacks {
  onStatus: (status: ConnectionStatus) => void
  onPresence: (users: PresentUser[]) => void
  /** A terminal close that needs navigation (login / documents / fatal). */
  onTerminalClose: (action: CloseAction) => void
  onRateLimitWarning: (message: string) => void
  /** An edit failed to persist after the bounded retries — surface a toast. */
  onAckRetriesExhausted: () => void
}

export interface MeridianProviderOptions extends ProviderCallbacks {
  url: string
  token: string
  documentId: string
  doc: Y.Doc
  role?: Role
}

const MAX_RECONNECT_ATTEMPTS = 6
const MAX_ACK_RETRIES = 3
const BASE_BACKOFF_MS = 600
const MAX_BACKOFF_MS = 10_000

interface PendingUpdate {
  bytes: Uint8Array
  retries: number
}

type Json = Record<string, unknown>
function asRecord(value: unknown): Json {
  return value && typeof value === 'object' ? (value as Json) : {}
}

/**
 * A thin custom Yjs provider for Meridian's mixed JSON/binary gateway (CLAUDE.md
 * §2/§4). It reuses Yjs's CRDT primitives wholesale — Y.applyUpdate and the doc
 * update event — and only owns the wire: connect with ?token=, join, hydrate
 * from initial_state, dispatch the two frame kinds, send local updates with
 * bounded-retry ack handling, and translate close codes into actions. The
 * Lamport clock is server-side; this client never tracks or sends one.
 */
export class MeridianProvider {
  private ws: WebSocket | null = null
  private destroyed = false
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private presentUsers: PresentUser[] = []
  private readonly pending: PendingUpdate[] = []
  private readonly isViewer: boolean
  private readonly opts: MeridianProviderOptions

  constructor(opts: MeridianProviderOptions) {
    this.opts = opts
    this.isViewer = opts.role === 'viewer'
    this.opts.doc.on('update', this.handleLocalUpdate)
    this.connect()
  }

  destroy() {
    this.destroyed = true
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.opts.doc.off('update', this.handleLocalUpdate)
    this.teardownSocket(1000, 'client navigated away')
  }

  // ── connection ──────────────────────────────────────────────────────────

  private connect() {
    if (this.destroyed) return
    this.opts.onStatus(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting')

    const base = this.opts.url.replace(/\/$/, '')
    const ws = new WebSocket(`${base}/?token=${encodeURIComponent(this.opts.token)}`)
    ws.binaryType = 'arraybuffer'
    ws.onopen = this.handleOpen
    ws.onmessage = this.handleMessage
    ws.onclose = this.handleClose
    ws.onerror = () => {
      /* a close event always follows an error; handle it there */
    }
    this.ws = ws
  }

  private handleOpen = () => {
    // Status stays 'connecting' until initial_state hydrates the doc.
    this.send(encodeJoinMessage(this.opts.documentId))
  }

  private teardownSocket(code: number, reason: string) {
    if (!this.ws) return
    this.ws.onopen = null
    this.ws.onmessage = null
    this.ws.onclose = null
    this.ws.onerror = null
    try {
      this.ws.close(code, reason)
    } catch {
      /* already closing */
    }
    this.ws = null
  }

  // ── inbound frames ──────────────────────────────────────────────────────

  private handleMessage = (event: MessageEvent) => {
    if (typeof event.data === 'string') {
      this.handleTextFrame(event.data)
      return
    }
    // Binary is always a Yjs document update — no sniffing (CLAUDE.md §4).
    const bytes = new Uint8Array(event.data as ArrayBuffer)
    Y.applyUpdate(this.opts.doc, bytes, this)
  }

  private handleTextFrame(raw: string) {
    let frame: { type?: string; event?: string; data?: unknown }
    try {
      frame = JSON.parse(raw)
    } catch {
      console.warn('[meridian] non-JSON text frame', raw)
      return
    }

    // Presence is keyed by `type`, not `event` — a distinct branch, checked first
    // (CLAUDE.md §4). A dispatcher that only switches on `event` never sees it.
    if (frame.type === 'presence') {
      const update = parsePresenceFrame(frame)
      if (update) {
        this.presentUsers = applyPresenceUpdate(this.presentUsers, update)
        this.opts.onPresence(this.presentUsers)
      }
      return
    }

    switch (frame.event) {
      case 'initial_state':
        this.hydrate(frame.data)
        break
      case 'ack':
        this.handleAck(frame.data)
        break
      case 'rate_limit_warning':
        this.opts.onRateLimitWarning(
          String(asRecord(frame.data).message ?? 'You are approaching the rate limit.'),
        )
        break
      default:
        console.warn('[meridian] unrecognized frame', frame.event)
    }
  }

  private hydrate(data: unknown) {
    const d = asRecord(data)

    this.opts.doc.transact(() => {
      if (typeof d.snapshot === 'string') {
        Y.applyUpdate(this.opts.doc, base64ToBytes(d.snapshot), this)
      }
      const delta = Array.isArray(d.delta) ? d.delta : []
      for (const op of delta) {
        const bytes = coerceBytes(op)
        if (bytes) Y.applyUpdate(this.opts.doc, bytes, this)
      }
    }, this)

    if (import.meta.env.DEV) this.logDocStructure()

    // participants is a MAP { userId: displayName }, not an array (CLAUDE.md §4).
    this.presentUsers = flattenParticipants(d.participants)
    this.opts.onPresence(this.presentUsers)

    this.reconnectAttempts = 0
    this.opts.onStatus('connected')
    // Re-send anything left unacked from before a reconnect.
    this.flushPending()
  }

  /**
   * DEV-only: dump each root shared type and the constructor names of its
   * top-level children. Reveals whether the server sent ProseMirror-shaped
   * content (top-level children all `YXmlElement`) or bare text at the root
   * (which y-tiptap can't render — `el.toArray is not a function`).
   */
  private logDocStructure() {
    this.opts.doc.share.forEach((type, name) => {
      const anyType = type as unknown as {
        toArray?: () => Array<{ constructor?: { name?: string } }>
      }
      const children =
        typeof anyType.toArray === 'function'
          ? anyType.toArray().map((n) => n?.constructor?.name ?? typeof n)
          : `(no toArray — ${type.constructor?.name})`
      console.debug(`[meridian] root "${name}" →`, children)
    })
  }

  private handleAck(data: unknown) {
    const front = this.pending[0]
    if (!front) return

    if (asRecord(data).status === 'ok') {
      this.pending.shift()
      return
    }

    // status === 'error' (no operation_sequence): bounded resend (CLAUDE.md §9).
    if (front.retries < MAX_ACK_RETRIES) {
      front.retries += 1
      this.send(encodeUpdateMessage(front.bytes))
    } else {
      this.pending.shift()
      this.opts.onAckRetriesExhausted()
    }
  }

  // ── outbound updates ────────────────────────────────────────────────────

  private handleLocalUpdate = (update: Uint8Array, origin: unknown) => {
    if (origin === this) return // applied from remote/hydration — never echo back
    if (this.isViewer) return // viewer updates are silently dropped server-side
    this.pending.push({ bytes: update, retries: 0 })
    this.send(encodeUpdateMessage(update))
  }

  private flushPending() {
    if (!this.isSocketOpen()) return
    for (const item of this.pending) {
      this.send(encodeUpdateMessage(item.bytes))
    }
  }

  // ── close handling ──────────────────────────────────────────────────────

  private handleClose = (event: CloseEvent) => {
    this.ws = null
    if (this.destroyed) return

    const action = classifyClose(event.code, event.reason)
    switch (action.kind) {
      case 'closed':
        return
      case 'retry':
        this.scheduleReconnect()
        return
      case 'redirect-login':
      case 'redirect-documents':
      case 'fatal':
        this.opts.onStatus('error')
        this.opts.onTerminalClose(action)
        return
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      this.opts.onStatus('error')
      this.opts.onTerminalClose({ kind: 'retry', message: 'Unable to reconnect. Please refresh.' })
      return
    }
    this.reconnectAttempts += 1
    this.opts.onStatus('reconnecting')
    const delay = Math.min(BASE_BACKOFF_MS * 2 ** (this.reconnectAttempts - 1), MAX_BACKOFF_MS)
    this.reconnectTimer = setTimeout(() => this.connect(), delay)
  }

  // ── socket helpers ──────────────────────────────────────────────────────

  private send(data: string) {
    if (this.isSocketOpen()) this.ws?.send(data)
  }

  private isSocketOpen() {
    return this.ws != null && this.ws.readyState === WebSocket.OPEN
  }
}
