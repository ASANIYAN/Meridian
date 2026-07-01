import { useEffect, useMemo, useState } from 'react'
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

  useEffect(() => {
    if (!token) return

    const provider = new MeridianProvider({
      url: env.wsUrl,
      token,
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
    })

    return () => provider.destroy()
  }, [documentId, token, doc, role, navigate, addToast])

  // Discard the doc when leaving — no stale state leaks into the next document.
  useEffect(() => {
    return () => {
      awareness.destroy()
      doc.destroy()
    }
  }, [doc, awareness])

  return useMemo(
    () => ({ doc, awareness, status, presentUsers, role, ready }),
    [doc, awareness, status, presentUsers, role, ready],
  )
}
