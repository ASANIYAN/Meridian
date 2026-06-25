import { AuthLayout } from '@/components/custom-components/auth-layout'
import { AuthPlate } from '@/components/custom-components/auth-plate'
import { Cartouche } from '@/components/custom-components/cartouche'
import { Field } from '../components/field'
import { AuthSubmit } from '../components/auth-submit'
import { AltPrompt } from '../components/auth-links'

/**
 * Presentational signup screen. On a real submit (FE-AUTH-1) the backend issues
 * no JWT — success swaps this plate for the check-your-email notice (AuthNotice,
 * tone="sent"), it does not log the user in or redirect to /documents.
 */
export function SignupView() {
  return (
    <AuthLayout lede={<>Start where your <em className="italic text-brass-soft">drafts</em> converge.</>}>
      <AuthPlate>
        <Cartouche coordinate="51°28′N · 0°00′W" title="Create account" />

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field id="firstName" label="First name" placeholder="Ada" autoComplete="given-name" />
            <Field id="lastName" label="Last name" placeholder="Lovelace" autoComplete="family-name" />
          </div>
          <Field id="email" label="Email" type="email" placeholder="you@studio.com" autoComplete="email" />
          <Field
            id="password"
            label="Password"
            type="password"
            placeholder="8–32 characters"
            autoComplete="new-password"
          />
        </div>

        <AuthSubmit>Create account</AuthSubmit>

        <AltPrompt prompt="Already have an account?" to="/login" action="Sign in" />
      </AuthPlate>
    </AuthLayout>
  )
}
