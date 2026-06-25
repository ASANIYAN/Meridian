import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '@/components/custom-components/app-shell'
import { useAuthStore } from '@/store/auth-store'
import { fullName } from '@/types/user'

/**
 * Placeholder for the document route. The real surface — useDocumentConnection,
 * the custom Yjs provider, the Tiptap editor, presence, and the AI chat — is the
 * collaboration epic (FE-COLLAB-*, FE-EDITOR-*). This stub lets create + card
 * navigation land somewhere real in the meantime.
 */
export function DocumentRoute() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const clearSession = useAuthStore((s) => s.clearSession)

  if (!user) return null

  const signOut = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <AppShell user={{ name: fullName(user), email: user.email }} onSignOut={signOut}>
      <Link
        to="/documents"
        className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground"
      >
        ← Back to documents
      </Link>

      <div className="mt-10 grid place-items-center rounded-md border border-dashed border-border py-24 text-center">
        <div className="max-w-[42ch]">
          <h1 className="font-display text-[1.5rem] text-foreground">The editor lands soon</h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
            The collaborative editor for this document is the next epic — the custom Yjs provider,
            the wire protocol, and the Tiptap surface.
          </p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground/70">
            Document · {id}
          </p>
        </div>
      </div>
    </AppShell>
  )
}
