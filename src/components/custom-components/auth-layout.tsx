import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Graticule } from './graticule'
import { Wordmark } from './brand-mark'

interface AuthLayoutProps {
  /** The instrument plate — typically a form. */
  children: ReactNode
  /** The orienting line under the wordmark; defaults to the brand promise. */
  lede?: ReactNode
}

/**
 * The approach to Meridian. A split: the chart (graticule + brand) on the left,
 * the instrument plate on the right, divided by the prime-meridian brass seam.
 * Runs in the dark `chart` register; collapses to the plate on small screens.
 */
export function AuthLayout({ children, lede }: AuthLayoutProps) {
  return (
    <div className="chart grid min-h-dvh bg-background text-foreground md:grid-cols-[1.08fr_0.92fr]">
      {/* Left — the chart */}
      <section className="relative flex min-h-60 flex-col items-center justify-center gap-6 overflow-hidden border-b border-(--seam) p-9 text-center md:border-r md:border-b-0 md:p-[clamp(2.15rem,4.3vw,3.85rem)]">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 100% 50%, rgba(205,163,73,0.05), transparent 55%), radial-gradient(100% 100% at 30% 30%, #122033, var(--ink) 70%)',
          }}
        />
        <Graticule state="idle" focal={{ x: 0.5, y: 0.36 }} sweep={Math.PI * 2} arcStart={0} />

        <Link
          to="/"
          aria-label="Meridian home"
          className="relative transition-opacity duration-150 ease-out hover:opacity-80"
        >
          <Wordmark />
        </Link>

        <h1 className="relative max-w-[19ch] font-display text-[clamp(2.125rem,4.4vw,3.75rem)] font-normal leading-[1.04] tracking-[-0.015em] text-foreground [font-optical-sizing:auto]">
          {lede ?? (
            <>
              Where every edit&nbsp;<em className="italic text-brass-soft">converges.</em>
            </>
          )}
        </h1>

        <p className="relative max-w-[34ch] text-sm leading-relaxed text-muted-foreground">
          Meridian is a real-time collaborative document editor — write, review, and edit together,
          with every change merging instantly and safely.
        </p>
      </section>

      {/* Right — the instrument plate */}
      <section className="flex items-center justify-center bg-background p-[clamp(1.5rem,3.4vw,3.4rem)]">
        {children}
      </section>
    </div>
  )
}
