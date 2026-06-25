import { useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/custom-components/app-shell'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'
import { fullName } from '@/types/user'

/**
 * Placeholder documents landing — the post-login destination behind the guard.
 * The real list (TanStack Query, skeleton, document cards, create modal) is
 * FE-DOC-1/2/3; this confirms the session + shell + sign-out flow end to end.
 */
export function DocumentsView() {
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
      <div className="mb-6">
        <h1 className="font-display text-[1.75rem] leading-tight text-foreground">Documents</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          Everything you can write in or read.
        </p>
      </div>

      <div className="grid place-items-center rounded-md border border-dashed border-border py-20 text-center">
        <div className="max-w-[34ch]">
          <h2 className="font-display text-[1.25rem] text-foreground">No documents yet</h2>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            Create one to start writing — collaborators join from a share link.
          </p>
          <Button variant="primary" size="default" className="mt-5" disabled>
            New document
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
