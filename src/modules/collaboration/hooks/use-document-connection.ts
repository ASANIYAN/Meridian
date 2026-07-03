import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Y from 'yjs'
import { Awareness } from 'y-protocols/awareness'
import { env } from '@/config/env'
import { useAuthStore } from '@/store/auth-store'
import { useToastStore } from '@/store/toast-store'
import type { Role } from '@/types/document'
import { MeridianProvider } from '../provider/meridian-provider'
import type { CollaborationContextValue } from '../context/collaboration-context'
import type { ConnectionStatus, PresentUser } from '../types/collaboration.types'
import type { AiChatWsEvent } from '../types/ai-chat-ws.types'

/**
 * Heavy hook (FE-COLLAB-6) — the single instantiation point for the Y.Doc,
 * Awareness, provider, and presence roster per document visit. Called exactly
 * once at the route level; its output feeds CollaborationContext. Calling this
 * from multiple components would open duplicate connections (CLAUDE.md §3/§4).
 */
export function useDocumentConnection(documentId: string, role?: Role): CollaborationContextValue {
  const token = useAuthStore((s) => s.token)
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)

  // A fresh Y.Doc + Awareness for this document's lifetime.
  const { doc, awareness } = useMemo(() => {
    const nextDoc = new Y.Doc()
    return { doc: nextDoc, awareness: new Awareness(nextDoc) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId])

  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const [presentUsers, setPresentUsers] = useState<PresentUser[]>([])
  const [ready, setReady] = useState(false)

  // One-shot waiters keyed by requestId (AI chat's async 202+WS results,
  // CLAUDE.md §9) — a ref, not state: firing one shouldn't re-render every
  // Context consumer, only the specific chat turn that registered it.
  const aiChatWaiters = useRef(new Map<string, (event: AiChatWsEvent) => void>())

  const registerAiChatWaiter = useCallback(
    (requestId: string, handler: (event: AiChatWsEvent) => void) => {
      aiChatWaiters.current.set(requestId, handler)
      return () => aiChatWaiters.current.delete(requestId)
    },
    [],
  )

  // Kept live so the provider can always read the freshest token (a rotation
  // shouldn't tear down and rejoin an otherwise-healthy connection — see
  // MeridianProviderOptions.getToken).
  const tokenRef = useRef(token)
  useEffect(() => {
    tokenRef.current = token
  }, [token])

  // Gate on *whether* a token exists, not its value — a rotation must not
  // retrigger this effect (that would tear down and rejoin a healthy
  // connection just to hand it a new string it can already read live via
  // tokenRef/getToken above). Only a token appearing/disappearing entirely
  // (login/logout) should recreate the provider.
  const hasToken = token != null
  useEffect(() => {
    if (!tokenRef.current) return

    const provider = new MeridianProvider({
      url: env.wsUrl,
      getToken: () => tokenRef.current ?? '',
      documentId,
      doc,
      role,
      onStatus: (next) => {
        setStatus(next)
        if (next === 'connected') setReady(true)
      },
      onPresence: setPresentUsers,
      onRateLimitWarning: (message) => addToast({ message, variant: 'warning' }),
      onAckRetriesExhausted: () =>
        addToast({
          message: "An edit couldn't be saved — your changes are still here locally.",
          variant: 'error',
        }),
      onTerminalClose: (action) => {
        addToast({ message: action.message, variant: 'error' })
        if (action.kind === 'redirect-login') navigate('/login?session=expired', { replace: true })
        else if (action.kind === 'redirect-documents') navigate('/documents', { replace: true })
      },
      onAiChatEvent: (event) => {
        const waiter = aiChatWaiters.current.get(event.data.requestId)
        if (!waiter) return // abandoned/already-timed-out request — drop silently
        aiChatWaiters.current.delete(event.data.requestId)
        waiter(event)
      },
    })

    return () => provider.destroy()
  }, [documentId, hasToken, doc, role, navigate, addToast])

  // Discard the doc when leaving — no stale state leaks into the next document.
  useEffect(() => {
    return () => {
      awareness.destroy()
      doc.destroy()
    }
  }, [doc, awareness])

  return useMemo(
    () => ({ doc, awareness, status, presentUsers, role, ready, registerAiChatWaiter }),
    [doc, awareness, status, presentUsers, role, ready, registerAiChatWaiter],
  )
}
