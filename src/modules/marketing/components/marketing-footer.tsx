import { Link } from 'react-router-dom'
import { Wordmark } from '@/components/custom-components/brand-mark'

export function MarketingFooter() {
  return (
    <footer className="relative border-t border-(--seam)">
      <div className="mx-auto flex max-w-[72rem] flex-col items-center gap-4 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <Wordmark />
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/login" className="hover:text-foreground">
            Sign in
          </Link>
          <span>&copy; {new Date().getFullYear()} Meridian</span>
        </div>
      </div>
    </footer>
  )
}
