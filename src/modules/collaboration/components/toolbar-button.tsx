import { forwardRef, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ToolbarButtonProps extends ComponentProps<'button'> {
  label: string
  active?: boolean
  children: ReactNode
}

/**
 * One square glyph control in the editor toolbar. forwardRef + prop spread so it
 * can be a Radix Trigger child via `asChild` (the link popover, menus). Idle reads
 * quiet (muted), with the active brass ring as the single bright cue (CLAUDE.md
 * §2 brand: one accent, used meaningfully).
 */
export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton({ label, active, className, children, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        aria-pressed={active}
        title={label}
        className={cn(
          'grid size-7 place-items-center rounded-sm text-muted-foreground transition-colors duration-150 ease-out',
          'hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35',
          'disabled:pointer-events-none disabled:opacity-40',
          active && 'bg-muted text-foreground ring-1 ring-accent/40',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)

export function ToolbarDivider() {
  return <span aria-hidden className="mx-1.5 h-4 w-px bg-border" />
}

/** Small downward caret for menu triggers — kept as a hand-drawn glyph since
 *  it predates the lucide-react adoption and a swap here buys nothing. */
export function Caret() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
