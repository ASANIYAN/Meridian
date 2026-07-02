import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type Phase = 'a' | 'ab' | 'abc' | 'merging' | 'merged' | 'fading'

const COLLABORATORS = [
  { name: 'Ava', color: 'var(--presence-teal)', text: 'Real-time collaboration means ' },
  { name: 'Priya', color: 'var(--presence-coral)', text: 'everyone edits together ' },
  { name: 'Theo', color: 'var(--presence-violet)', text: 'without losing a word.' },
] as const

const MERGED_TEXT = COLLABORATORS.map((c) => c.text).join('')

const SEQUENCE: { phase: Phase; holdMs: number }[] = [
  // Longer than the others: each line's own clip-path reveal takes 700ms,
  // so the first line needs room to actually finish typing before the
  // second starts — 500ms cut it off mid-reveal, which read as rushed.
  { phase: 'a', holdMs: 850 },
  { phase: 'ab', holdMs: 500 },
  { phase: 'abc', holdMs: 600 },
  { phase: 'merging', holdMs: 900 },
  { phase: 'merged', holdMs: 2800 },
  { phase: 'fading', holdMs: 500 },
]

/**
 * The signature moment: three collaborators typing fragments of one sentence
 * that merge into a single line — the literal rendering of "every edit
 * converges," built from the product's own presence colors, not stock art.
 * JS-driven phase machine using CSS transitions (not keyframes) per element,
 * so each phase change retargets smoothly rather than restarting from zero.
 */
export function ConvergenceDemo({ className }: { className?: string }) {
  const [step, setStep] = useState(0)
  const [prefersReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (prefersReducedMotion) return
    const timer = setTimeout(() => {
      setStep((s) => (s + 1) % SEQUENCE.length)
    }, SEQUENCE[step].holdMs)
    return () => clearTimeout(timer)
  }, [step, prefersReducedMotion])

  const phase: Phase = prefersReducedMotion ? 'merged' : SEQUENCE[step].phase
  const fragmentsRevealed = phase === 'a' ? 1 : phase === 'ab' ? 2 : 3
  const fragmentsHidden = phase === 'merging' || phase === 'merged' || phase === 'fading'
  const mergedVisible = phase === 'merged' || phase === 'fading'
  const cardVisible = phase !== 'fading'
  const blinkCaret = phase === 'merged' && !prefersReducedMotion

  return (
    <div
      className={cn(
        'relative w-full max-w-[30rem] rounded-lg border border-(--seam) bg-card p-6 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.55)] transition-opacity ease-out',
        // Exit is snappier than the entrance — the reset beat is the system
        // settling, not something worth lingering on (asymmetric enter/exit).
        cardVisible ? 'duration-500' : 'duration-300',
        className,
      )}
      style={{ opacity: cardVisible ? 1 : 0 }}
      aria-hidden="true"
    >
      <div className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        <span className="size-1.5 rounded-full bg-brass" />3 people editing
      </div>

      {/* Fixed-height crossfade: the fragments and the merged line occupy
          the same reserved space via absolute positioning and only ever
          animate opacity/clip-path. The card's box size never changes
          across the loop — a layout-affecting transition here (e.g.
          height/grid-rows) would reflow the page on every cycle, which
          triggers the browser's scroll-anchoring correction even while
          this section is scrolled off-screen (it keeps looping in the
          background). See CLAUDE.md's "no flickering connection state"
          bar — the same "don't move things the user didn't touch" idea
          applies to any element that animates outside the viewport. */}
      <div className="relative h-22 overflow-hidden">
        <div
          className="absolute inset-0 space-y-2.5 transition-opacity duration-300 ease-out"
          style={{ opacity: fragmentsHidden ? 0 : 1 }}
        >
          {COLLABORATORS.map((c, i) => {
            // Gated on `fragmentsHidden`, not just the phase's reveal count,
            // so each line resets to closed the instant the block starts
            // fading *out* — while it's still invisible — instead of racing
            // the opacity fade-*in* on the next loop and visibly "un-typing".
            const revealed = !fragmentsHidden && i < fragmentsRevealed
            return (
              <div
                key={c.name}
                className="flex items-baseline gap-2 overflow-hidden text-sm text-card-foreground"
              >
                <span
                  className="inline-block size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span
                  className="inline-block whitespace-nowrap font-mono text-[13px] transition-[clip-path] duration-700 ease-out"
                  style={{ clipPath: revealed ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)' }}
                >
                  {c.text}
                </span>
              </div>
            )
          })}
        </div>

        <div
          className="absolute inset-0 flex items-center border-t border-(--seam) pt-4 transition-opacity duration-300 ease-out"
          style={{ opacity: mergedVisible ? 1 : 0 }}
        >
          <p className="font-display text-[1.05rem] italic leading-snug text-foreground [font-optical-sizing:auto]">
            <span
              className="inline-block transition-[clip-path] duration-700 ease-out"
              style={{ clipPath: mergedVisible ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)' }}
            >
              {MERGED_TEXT}
            </span>
            <span
              className={cn(
                'ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-brass align-middle',
                blinkCaret && 'animate-[caret-blink_1s_steps(2)_infinite]',
              )}
            />
          </p>
        </div>
      </div>
    </div>
  )
}
