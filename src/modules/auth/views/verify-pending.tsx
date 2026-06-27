import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/custom-components/auth-layout'
import { AuthPlate } from '@/components/custom-components/auth-plate'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'
import { AuthNotice } from '../components/auth-notice'

/**
 * Where the guard sends an authenticated-but-unverified user (FE-STATE-5) —
 * a dead end until they verify, with a resend path and a way out.
 */
export function VerifyPendingView() {
  const navigate = useNavigate()
  const email = useAuthStore((s) => s.user?.email)
  const clearSession = useAuthStore((s) => s.clearSession)

  const signOut = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <AuthLayout
      lede={
        <>
          Almost there — one link to <em className="italic text-brass-soft">converge</em>.
        </>
      }
    >
      <AuthPlate>
        <AuthNotice
          tone="sent"
          coordinate="51°28′N · 0°00′W"
          title="Verify email"
          heading="Confirm your email"
          description={
            <>
              We sent a verification link
              {email ? (
                <>
                  {' '}
                  to <span className="text-foreground">{email}</span>
                </>
              ) : null}
              . Open it to reach your documents.
            </>
          }
          footer={
            <Button asChild variant="accent" size="lg" className="w-full">
              <Link to="/resend-verification">Resend link</Link>
            </Button>
          }
        />
        <button
          type="button"
          onClick={signOut}
          className="mx-auto block font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors duration-150 ease-out hover:text-brass-soft"
        >
          Sign out
        </button>
      </AuthPlate>
    </AuthLayout>
  )
}
