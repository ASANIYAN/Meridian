import type { FormEvent, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AuthPlateProps {
  children: ReactNode
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
  className?: string
}

/**
 * The instrument plate — the form card every auth screen sits in. Direct
 * children animate in with a staggered entrance (see `.stagger` in index.css).
 */
export function AuthPlate({ children, onSubmit, className }: AuthPlateProps) {
  return (
    <form
      onSubmit={onSubmit ?? ((e) => e.preventDefault())}
      className={cn(
        'stagger w-full max-w-95 space-y-5 rounded-md border border-border bg-card p-7.5',
        'shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_1px_0_rgba(205,163,73,0.35)_inset,0_32px_72px_-28px_rgba(0,0,0,0.75)]',
        'ring-1 ring-(--seam)/40',
        className,
      )}
    >
      {children}
    </form>
  )
}
