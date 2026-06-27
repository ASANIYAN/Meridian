import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  /** Short uppercase label, e.g. "Active" or "Connected". */
  label: string
  /** Dot color — a CSS color string (brand token via var(), or any color). */
  color: string
  /** Pulse the dot for transient/in-flight states (reconnecting, connecting). */
  pulse?: boolean
  /** Pass 'status' for live regions (connection); omit for static metadata. */
  role?: 'status'
  /** aria-live, only meaningful with role="status". */
  ariaLive?: 'polite' | 'off'
  className?: string
}

/**
 * One status treatment used everywhere status is shown — a colored dot plus a
 * mono uppercase label (CLAUDE.md §3 metadata voice). Unifies the previously
 * divergent connection-status and document-status patterns so "status" reads as
 * one system across the app. Presentational only.
 */
export function StatusBadge({
  label,
  color,
  pulse = false,
  role,
  ariaLive,
  className,
}: StatusBadgeProps) {
  return (
    <div
      role={role}
      aria-live={role === 'status' ? ariaLive : undefined}
      className={cn(
        'inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('size-1.5 rounded-full', pulse && 'motion-safe:animate-pulse')}
        style={{ backgroundColor: color }}
      />
      {label}
    </div>
  )
}
