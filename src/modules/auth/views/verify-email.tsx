import { Link } from 'react-router-dom'
import { AuthLayout } from '@/components/custom-components/auth-layout'
import { AuthPlate } from '@/components/custom-components/auth-plate'
import { Button } from '@/components/ui/button'
import { AuthNotice } from '../components/auth-notice'
import { useVerifyEmail } from '../hooks/use-verify-email'

const COORD = '51°28′N · 0°00′W'

export function VerifyEmailView() {
  const { status } = useVerifyEmail()

  return (
    <AuthLayout lede={<>The last line before you <em className="italic text-brass-soft">converge</em>.</>}>
      <AuthPlate>
        {status === 'pending' && (
          <AuthNotice
            tone="sent"
            coordinate={COORD}
            title="Verify email"
            heading="Verifying…"
            description="One moment while we confirm your email."
          />
        )}

        {status === 'success' && (
          <AuthNotice
            tone="success"
            coordinate={COORD}
            title="Verify email"
            heading="Email verified"
            description="Your account is confirmed. Sign in to start writing."
            footer={
              <Button asChild variant="accent" size="lg" className="w-full">
                <Link to="/login">Continue to sign in</Link>
              </Button>
            }
          />
        )}

        {status === 'already-verified' && (
          <AuthNotice
            tone="success"
            coordinate={COORD}
            title="Verify email"
            heading="Already verified"
            description="This account is already confirmed. You can sign in and start writing."
            footer={
              <Button asChild variant="accent" size="lg" className="w-full">
                <Link to="/login">Continue to sign in</Link>
              </Button>
            }
          />
        )}

        {status === 'error' && (
          <AuthNotice
            tone="error"
            coordinate={COORD}
            title="Verify email"
            heading="This link didn't work"
            description="It may have expired or already been used. Request a fresh verification link."
            footer={
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/resend-verification">Request a new link</Link>
              </Button>
            }
          />
        )}
      </AuthPlate>
    </AuthLayout>
  )
}
