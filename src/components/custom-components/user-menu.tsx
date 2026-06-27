import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/custom-components/confirm-dialog'

interface UserMenuProps {
  name: string
  email: string
  onSignOut?: () => void
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** Header account control — avatar trigger with a small sign-out menu. */
export function UserMenu({ name, email, onSignOut }: UserMenuProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [open])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full p-0.5 pr-2 outline-none transition-colors duration-150 ease-out hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/35"
      >
        <span className="grid size-8 place-items-center rounded-full bg-primary font-mono text-[11px] font-medium text-primary-foreground">
          {initials(name)}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="size-4 text-muted-foreground"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className={cn(
              'absolute right-0 top-[calc(100%+0.5rem)] z-20 w-56 origin-top-right rounded-md border border-border bg-card p-1.5 shadow-[0_16px_40px_-20px_rgba(15,26,42,0.35)]',
            )}
          >
            <div className="px-2.5 py-2">
              <p className="truncate text-[13px] font-medium text-foreground">{name}</p>
              <p className="truncate text-[12px] text-muted-foreground">{email}</p>
            </div>
            <div className="my-1 h-px bg-border" />
            <ConfirmDialog
              title="Sign out?"
              description="You'll need to sign in again to get back to your documents."
              confirmLabel="Sign out"
              pendingLabel="Signing out…"
              onConfirm={() => onSignOut?.()}
              trigger={
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center rounded-sm px-2.5 py-2 text-[13px] text-foreground outline-none transition-colors duration-150 ease-out hover:bg-muted focus-visible:bg-muted"
                >
                  Sign out
                </button>
              }
            />
          </div>
        </>
      )}
    </div>
  )
}
