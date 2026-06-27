import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Wordmark } from './brand-mark'
import { UserMenu } from './user-menu'

interface AppShellProps {
  children: ReactNode
  /** Slot for the connection-status indicator (FE-COLLAB-8). */
  connectionStatus?: ReactNode
  /** Slot for the presence avatar stack (FE-PRESENCE-2). */
  presence?: ReactNode
  user: { name: string; email: string }
  onSignOut?: () => void
  /**
   * Full-bleed content: drop the centered max-width + padding so the route can
   * own the whole viewport below the header (the editor canvas, Google-Docs
   * style). The header stays constrained regardless.
   */
  bleed?: boolean
}

/**
 * The authenticated app's persistent shell — header + content outlet, on the
 * light register. Presentational and props-only: it owns no data lifecycle, it
 * only lays out the slots its consumers fill (CLAUDE.md §5 component test).
 */
export function AppShell({
  children,
  connectionStatus,
  presence,
  user,
  onSignOut,
  bleed = false,
}: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex h-15 w-full max-w-300 items-center justify-between gap-4 px-5">
          <Wordmark />
          <div className="flex items-center gap-3 sm:gap-5">
            {connectionStatus}
            {presence}
            <UserMenu name={user.name} email={user.email} onSignOut={onSignOut} />
          </div>
        </div>
      </header>

      <main
        className={cn(bleed ? 'flex flex-1 flex-col' : 'mx-auto w-full max-w-300 flex-1 px-5 py-8')}
      >
        {children}
      </main>
    </div>
  )
}
