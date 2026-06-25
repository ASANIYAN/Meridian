import { cn } from '@/lib/utils'

interface CartoucheProps {
  /** The coordinate readout, e.g. a meridian reference. */
  coordinate: string
  /** The screen's title, e.g. "Sign in". */
  title: string
  className?: string
}

/**
 * The title block on a chart — a mono coordinate paired with the screen title,
 * ruled off from the form below. Heads every auth plate.
 */
export function Cartouche({ coordinate, title, className }: CartoucheProps) {
  return (
    <div
      className={cn(
        'mb-6 flex items-center justify-between border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground',
        className,
      )}
    >
      <span>{coordinate}</span>
      <span className="font-medium text-foreground">{title}</span>
    </div>
  )
}
