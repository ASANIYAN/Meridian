import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { AppShell } from '@/components/custom-components/app-shell'
import { useAuthStore } from '@/store/auth-store'
import { fullName } from '@/types/user'
import type { DocumentSummary } from '@/types/document'
import { documentsKey } from '@/modules/documents/hooks/use-documents'
import { DocumentHeader } from '@/modules/documents/components/document-header'
import { ChatSidebar } from '@/modules/ai-chat/components/chat-sidebar'
import { useDocumentConnection } from '../hooks/use-document-connection'
import { CollaborationContext } from '../context/collaboration-context'
import { ConnectionStatusIndicator } from '../components/connection-status-indicator'
import { PresenceStack } from '../components/presence-stack'
import { DocumentWorkspace } from '../components/document-workspace'

/**
 * The document route — the single owner of the connection lifecycle (CLAUDE.md
 * §4). useDocumentConnection runs once here; its output feeds the Context that
 * wraps the subtree. React unmounts the Provider on navigation away, which tears
 * the connection down automatically — no manual disconnect.
 */
export function DocumentRoute() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const clearSession = useAuthStore((s) => s.clearSession)

  // Role from the documents cache when we have it; deep-links may not (the
  // backend still enforces access regardless).
  const role = useMemo(() => {
    const docs = queryClient.getQueryData<DocumentSummary[]>(documentsKey)
    return docs?.find((d) => d.id === id)?.role
  }, [queryClient, id])

  const connection = useDocumentConnection(id, role)

  if (!user) return null

  const signOut = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <CollaborationContext.Provider value={connection}>
      <AppShell
        user={{ name: fullName(user), email: user.email }}
        onSignOut={signOut}
        connectionStatus={<ConnectionStatusIndicator />}
        presence={<PresenceStack />}
      >
        <DocumentHeader documentId={id} />
        <div className="mt-8">
          <DocumentWorkspace />
        </div>
      </AppShell>
      <ChatSidebar />
    </CollaborationContext.Provider>
  )
}
