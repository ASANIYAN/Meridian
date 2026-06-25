import type { ReactNode } from 'react'
import { Wordmark } from '@/components/custom-components/brand-mark'

/**
 * The public claim surface — a session-less visitor following a share link.
 * Deliberately distinct from AuthLayout: no chart split, no app shell, just a
 * centered card on the chart register. Different audience, different frame
 * (CLAUDE.md §6 — join is a sibling to sharing, not nested in it).
 */
export function JoinLayout({ children }: { children: ReactNode }) {
  return (
    <div className="chart relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-6 py-12 text-foreground">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 55% at 50% 42%, rgba(205,163,73,0.06), transparent 60%), radial-gradient(120% 120% at 50% 0%, #122033, var(--ink) 70%)',
        }}
      />
      <header className="relative mb-10">
        <Wordmark />
      </header>
      <main className="relative w-full max-w-95">{children}</main>
    </div>
  )
}
