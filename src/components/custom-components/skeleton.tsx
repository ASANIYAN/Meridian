import { cn } from '@/lib/utils'

/**
 * Loading placeholder (FE-DESIGN-4). Shimmers by default; under
 * prefers-reduced-motion the pulse drops to a flat fill, but loading is still
 * clearly communicated (motion-safe gates the animation).
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('rounded-md bg-muted motion-safe:animate-pulse', className)} />
}
