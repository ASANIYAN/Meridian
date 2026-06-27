import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCollaboration } from '@/modules/collaboration/hooks/use-collaboration'
import { useChatSession } from '../hooks/use-chat-session'
import { ChatThread } from './chat-thread'
import { ChatComposer } from './chat-composer'

/**
 * The AI assistant sidebar (FE-CHAT-1) — author-only. Gates on `role` from
 * useCollaboration (read, never re-fetched, CLAUDE.md §3/§6): a non-author never
 * sees the trigger, and the backend independently 403s the endpoint. The thread
 * state lives here so it survives opening and closing the panel.
 */
export function ChatSidebar() {
  const { id = '' } = useParams()
  const { role } = useCollaboration()
  const session = useChatSession(id)
  const [open, setOpen] = useState(false)
  // Stays mounted through the close animation; `open` drives the data-state the
  // CSS reads, and the panel's animationend unmounts it once the exit finishes.
  const [rendered, setRendered] = useState(false)

  // Centralized close: normally the panel's exit animation drives the unmount via
  // onAnimationEnd, but under prefers-reduced-motion no animation fires, so unmount
  // immediately to avoid the panel sticking around forever.
  const close = useCallback(() => {
    setOpen(false)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRendered(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  if (role !== 'author') return null

  return (
    <>
      {!rendered && (
        <button
          type="button"
          onClick={() => {
            setRendered(true)
            setOpen(true)
          }}
          className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-[13px] font-semibold text-primary-foreground shadow-[0_16px_40px_-16px_rgba(15,26,42,0.5)] outline-none transition-transform duration-150 ease-out hover:scale-[1.02] focus-visible:ring-[3px] focus-visible:ring-ring/35 active:scale-[0.98]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="size-4"
            aria-hidden="true"
          >
            <path d="M12 3a9 9 0 1 0 4.5 16.8L21 21l-1.2-4.5A9 9 0 0 0 12 3Z" />
          </svg>
          Assistant
        </button>
      )}

      {rendered && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={close}
            data-state={open ? 'open' : 'closed'}
            className="chat-overlay fixed inset-0 z-40 cursor-default bg-ink/20 backdrop-blur-[1px] sm:bg-transparent sm:backdrop-blur-0"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="AI assistant"
            data-state={open ? 'open' : 'closed'}
            onAnimationEnd={(e) => {
              // Only the panel's own exit animation should unmount it (animation
              // events from children bubble up to this handler otherwise).
              if (e.target === e.currentTarget && !open) setRendered(false)
            }}
            className="chat-panel fixed inset-y-0 right-0 z-50 flex w-full max-w-100 flex-col border-l border-border bg-background shadow-[-24px_0_60px_-30px_rgba(15,26,42,0.45)]"
          >
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="font-display text-[1.05rem] leading-tight text-foreground">
                  Assistant
                </h2>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Author only
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close assistant"
                className="grid size-8 place-items-center rounded-sm text-muted-foreground outline-none transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/35"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="size-4"
                  aria-hidden="true"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </header>

            <ChatThread turns={session.turns} />
            <ChatComposer onSend={session.send} disabled={session.isSending} />
          </aside>
        </>
      )}
    </>
  )
}
