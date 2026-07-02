import { useInViewReveal } from '../hooks/use-in-view-reveal'

const PRESENT = [
  { initial: 'A', color: 'var(--presence-teal)' },
  { initial: 'P', color: 'var(--presence-coral)' },
  { initial: 'T', color: 'var(--presence-violet)' },
] as const

/**
 * A quiet, real trust signal — reuses the same presence hues as the hero
 * demo and the in-app presence indicator, rather than inventing a new
 * "trust badge" visual language for the marketing page alone.
 */
export function TrustSection() {
  const { ref, revealed } = useInViewReveal<HTMLDivElement>()

  return (
    <section className="bg-muted/40 py-24">
      <div
        ref={ref}
        data-revealed={revealed}
        className="reveal-group mx-auto grid max-w-[72rem] gap-6 px-6 md:grid-cols-2"
      >
        <div className="rounded-lg border border-border bg-card p-8">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {PRESENT.map((p) => (
                <span
                  key={p.initial}
                  className="flex size-6 items-center justify-center rounded-full border-2 border-card text-[10px] font-semibold text-white"
                  style={{ backgroundColor: p.color }}
                >
                  {p.initial}
                </span>
              ))}
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-presence-moss" />
              Synced
            </span>
          </div>
          <h3 className="mt-5 font-display text-xl font-normal text-foreground [font-optical-sizing:auto]">
            Nothing is lost, even in a bad connection.
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Every edit merges safely, even when several people write the same line at once. If your
            connection drops, your own changes stay put and rejoin the document when you're back.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-8">
          <h3 className="font-display text-xl font-normal text-foreground [font-optical-sizing:auto]">
            Invite links you control.
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Share a document with a link scoped to a role — Editor or Viewer — and an expiry you
            set. When the link expires, it stops working. No standing access left behind.
          </p>
        </div>
      </div>
    </section>
  )
}
