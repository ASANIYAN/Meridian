import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

/**
 * Catch-all 404 for any unmatched route. Public (no auth chrome) so it renders
 * for signed-in and signed-out visitors alike; the CTA points home to the
 * documents list, where the route guard takes over for unauthenticated users.
 */
export function NotFoundView() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6 text-center text-foreground">
      <div className="flex flex-col items-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          404 — off the chart
        </span>
        <h1 className="mt-5 max-w-[18ch] font-display text-[clamp(2rem,6vw,3.25rem)] font-normal leading-[1.05] tracking-[-0.015em]">
          This page isn't on the <em className="italic text-brass-soft">map</em>.
        </h1>
        <p className="mx-auto mt-3 max-w-[42ch] text-[13.5px] leading-relaxed text-muted-foreground">
          The link may be broken, or the page may have moved. Let's get you back to solid ground.
        </p>
        <Button asChild variant="accent" size="lg" className="mt-8">
          <Link to="/documents">Back to your documents</Link>
        </Button>
      </div>
    </div>
  )
}
