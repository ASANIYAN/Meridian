import { AuthLayout } from '@/components/custom-components/auth-layout'
import { AuthPlate } from '@/components/custom-components/auth-plate'
import { Cartouche } from '@/components/custom-components/cartouche'
import { Field } from '../components/field'
import { AuthSubmit } from '../components/auth-submit'
import { AltPrompt, MonoLink } from '../components/auth-links'

/**
 * Presentational login screen. Form logic (RHF + Zod, the unverified-account
 * 403 handling, the auth store) lands in FE-AUTH-2; this is the shell.
 */
export function LoginView() {
  return (
    <AuthLayout>
      <AuthPlate>
        <Cartouche coordinate="51°28′N · 0°00′W" title="Sign in" />

        <div className="space-y-4">
          <Field id="email" label="Email" type="email" placeholder="you@studio.com" autoComplete="email" />
          <Field
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••••"
            autoComplete="current-password"
          />
        </div>

        <div className="flex justify-end">
          <MonoLink to="/forgot-password">Forgot password</MonoLink>
        </div>

        <AuthSubmit>Continue</AuthSubmit>

        <AltPrompt prompt="New to Meridian?" to="/signup" action="Create an account" />
      </AuthPlate>
    </AuthLayout>
  )
}
