import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

/** Full-width brass submit with the forward chevron — the progression action. */
export function AuthSubmit({ children }: { children: ReactNode }) {
  return (
    <Button type="submit" variant="accent" size="lg" className="w-full">
      {children}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </Button>
  )
}
