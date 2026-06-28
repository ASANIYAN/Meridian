import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { AppShell } from '@/components/custom-components/app-shell'
import { useAuthStore } from '@/store/auth-store'
import { useSignOut } from '@/modules/auth/hooks/use-sign-out'
import { fullName } from '@/types/user'
import type { DocumentSummary } from '@/types/document'
import { documentKey, documentsKey } from '@/modules/documents/hooks/use-documents'
import { useDocument } from '@/modules/documents/hooks/use-document'
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
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const signOut = useSignOut()

  const { data: document } = useDocument(id)

  // Role from the list cache first, with the detail query as the refresh/deep-link
  // fallback. The backend still enforces access regardless.
  const role = useMemo(() => {
    const docs = queryClient.getQueryData<DocumentSummary[]>(documentsKey)
    return docs?.find((d) => d.id === id)?.role ?? document?.role
  }, [queryClient, id, document?.role])
  const cachedTitle = useMemo(() => {
    const docs = queryClient.getQueryData<DocumentSummary[]>(documentsKey)
    return (
      queryClient.getQueryData<DocumentSummary>(documentKey(id))?.title ??
      docs?.find((d) => d.id === id)?.title
    )
  }, [queryClient, id])

  const connection = useDocumentConnection(id, role)

  if (!user) return null

  return (
    <CollaborationContext.Provider value={connection}>
      <AppShell
        bleed
        user={{ name: fullName(user), email: user.email }}
        onSignOut={signOut}
        connectionStatus={<ConnectionStatusIndicator />}
        presence={<PresenceStack />}
      >
        {/* Chrome (title, status, actions) stays on the app surface, constrained. */}
        <div className="mx-auto w-full max-w-300 px-5 pt-7 pb-5">
          <DocumentHeader documentId={id} />
        </div>
        {/* The editor owns the rest of the viewport: a full-bleed canvas that the
            page sheet floats on (Google-Docs structure). */}
        <DocumentWorkspace title={document?.title ?? cachedTitle} />
      </AppShell>
      <ChatSidebar />
    </CollaborationContext.Provider>
  )
}
