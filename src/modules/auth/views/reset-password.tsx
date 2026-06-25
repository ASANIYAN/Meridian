import { AuthLayout } from '@/components/custom-components/auth-layout'
import { AuthPlate } from '@/components/custom-components/auth-plate'
import { Cartouche } from '@/components/custom-components/cartouche'
import { Field } from '../components/field'
import { AuthSubmit } from '../components/auth-submit'
import { MonoLink } from '../components/auth-links'

/**
 * Presentational reset-password screen. The token rides in the URL; the real
 * form (FE-AUTH-6) validates password === confirm locally and submits only
 * { token, new_password } — confirm_password never leaves the client.
 */
export function ResetPasswordView() {
  return (
    <AuthLayout lede={<>Set a new <em className="italic text-brass-soft">bearing</em>.</>}>
      <AuthPlate>
        <Cartouche coordinate="51°28′N · 0°00′W" title="New password" />

        <div className="space-y-4">
          <Field
            id="password"
            label="New password"
            type="password"
            placeholder="8–32 characters"
            autoComplete="new-password"
          />
          <Field
            id="confirmPassword"
            label="Confirm password"
            type="password"
            placeholder="Re-enter password"
            autoComplete="new-password"
          />
        </div>

        <AuthSubmit>Set password</AuthSubmit>

        <div className="text-center">
          <MonoLink to="/login">Back to sign in</MonoLink>
        </div>
      </AuthPlate>
    </AuthLayout>
  )
}
