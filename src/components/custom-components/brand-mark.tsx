import { cn } from '@/lib/utils'

/** The ◇ graticule glyph — a meridian, a parallel, and the convergence ring. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      className={cn('size-5', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--brass)"
      strokeWidth={1.2}
      aria-hidden="true"
    >
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <circle cx="12" cy="12" r="7" />
    </svg>
  )
}

/** Wordmark: the mark plus the name, set in tracked mono. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 font-mono text-[13px] font-medium uppercase tracking-[0.28em] text-foreground',
        className,
      )}
    >
      <BrandMark />
      Meridian
    </div>
  )
}
