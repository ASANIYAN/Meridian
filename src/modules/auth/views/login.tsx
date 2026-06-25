import { AuthLayout } from '@/components/custom-components/auth-layout'
import { Cartouche } from '@/components/custom-components/cartouche'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Presentational login screen — the design foundation. Form logic (RHF + Zod,
 * the unverified-account 403 handling) lands in FE-AUTH-2; this is the shell.
 */
export function LoginView() {
  return (
    <AuthLayout>
      <form
        className="w-full max-w-[380px] rounded-md border border-border bg-card p-[1.875rem] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_24px_60px_-32px_rgba(0,0,0,0.7)]"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="rise" style={{ animationDelay: '120ms' }}>
          <Cartouche coordinate="51°28′N · 0°00′W" title="Sign in" />
        </div>

        <div className="rise mb-4 space-y-1.5" style={{ animationDelay: '170ms' }}>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@studio.com" autoComplete="email" />
        </div>

        <div className="rise mb-1 space-y-1.5" style={{ animationDelay: '220ms' }}>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••••"
            autoComplete="current-password"
          />
        </div>

        <div className="rise mb-5 flex justify-end" style={{ animationDelay: '270ms' }}>
          <a
            href="#"
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors duration-150 ease-out hover:text-brass-soft"
          >
            Forgot password
          </a>
        </div>

        <div className="rise" style={{ animationDelay: '320ms' }}>
          <Button type="submit" variant="accent" size="lg" className="w-full">
            Continue
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Button>
        </div>

        <p
          className="rise mt-6 text-center text-[13px] text-muted-foreground"
          style={{ animationDelay: '370ms' }}
        >
          New to Meridian?{' '}
          <a
            href="#"
            className="text-foreground underline decoration-[color:color-mix(in_srgb,var(--brass)_50%,transparent)] underline-offset-4"
          >
            Create an account
          </a>
        </p>
      </form>
    </AuthLayout>
  )
}
