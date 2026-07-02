import { Link } from 'react-router-dom'
import { Wordmark } from '@/components/custom-components/brand-mark'
import { Button } from '@/components/ui/button'

/**
 * Sticky over the dark hero, no scroll-based restyle — the hero's own dark
 * register already gives the wordmark and links enough contrast throughout
 * the visible nav area, so a "solidify on scroll" treatment would just be
 * motion without a job to do.
 */
export function MarketingNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-(--seam) bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[72rem] items-center justify-between px-6">
        <Link to="/" aria-label="Meridian home">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild variant="accent" size="sm">
            <Link to="/signup">Start writing</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
