import { useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/custom-components/app-shell'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'
import { fullName } from '@/types/user'
import { useDocuments } from '../hooks/use-documents'
import { DocumentCard } from '../components/document-card'
import { DocumentsSkeleton } from '../components/documents-skeleton'
import { CreateDocumentModal } from '../components/create-document-modal'

/** The documents list (FE-DOC-1) — the post-login home, behind the route guard. */
export function DocumentsView() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const clearSession = useAuthStore((s) => s.clearSession)
  const { data, isLoading, isError, refetch } = useDocuments()

  if (!user) return null

  const signOut = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <AppShell user={{ name: fullName(user), email: user.email }} onSignOut={signOut}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.75rem] leading-tight text-foreground">Documents</h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            Everything you can write in or read.
          </p>
        </div>
        <CreateDocumentModal />
      </div>

      {isLoading ? (
        <DocumentsSkeleton />
      ) : isError ? (
        <div className="grid place-items-center rounded-md border border-dashed border-border py-20 text-center">
          <div className="max-w-[34ch]">
            <h2 className="font-display text-[1.25rem] text-foreground">
              We couldn't load your documents
            </h2>
            <p className="mt-1.5 text-[13.5px] text-muted-foreground">
              Check your connection and try again.
            </p>
            <Button variant="outline" className="mt-5" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      ) : (
        <div className="grid place-items-center rounded-md border border-dashed border-border py-20 text-center">
          <div className="max-w-[36ch]">
            <h2 className="font-display text-[1.25rem] text-foreground">No documents yet</h2>
            <p className="mt-1.5 text-[13.5px] text-muted-foreground">
              Create one to start writing — collaborators join from a share link.
            </p>
            <div className="mt-5 flex justify-center">
              <CreateDocumentModal triggerLabel="Create your first document" />
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
