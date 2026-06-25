import { Link } from 'react-router-dom'
import { AuthLayout } from '@/components/custom-components/auth-layout'
import { AuthPlate } from '@/components/custom-components/auth-plate'
import { Button } from '@/components/ui/button'
import { AuthNotice } from '../components/auth-notice'

/**
 * Presentational verify-email screen. The real page (FE-AUTH-3) reads the token
 * from the URL, fires the verify mutation on mount, and swaps between three
 * states: a pending spinner, this success notice, and a deliberately generic
 * failure notice (tone="error") that leaks nothing about why it failed.
 */
export function VerifyEmailView() {
  return (
    <AuthLayout lede={<>The last line before you <em className="italic text-brass-soft">converge</em>.</>}>
      <AuthPlate>
        <AuthNotice
          tone="success"
          coordinate="51°28′N · 0°00′W"
          title="Verify email"
          heading="Email verified"
          description="Your account is confirmed. Sign in to start writing — and to bring collaborators in from a share link."
          footer={
            <Button asChild variant="accent" size="lg" className="w-full">
              <Link to="/login">Continue to sign in</Link>
            </Button>
          }
        />
      </AuthPlate>
    </AuthLayout>
  )
}
