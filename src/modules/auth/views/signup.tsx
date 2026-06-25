import { AuthLayout } from '@/components/custom-components/auth-layout'
import { AuthPlate } from '@/components/custom-components/auth-plate'
import { Cartouche } from '@/components/custom-components/cartouche'
import { FormField } from '@/components/custom-components/form-field'
import { FormError } from '@/components/custom-components/form-error'
import { AuthSubmit } from '../components/auth-submit'
import { AltPrompt, MonoLink } from '../components/auth-links'
import { AuthNotice } from '../components/auth-notice'
import { useSignup } from '../hooks/use-signup'

export function SignupView() {
  const { form, onSubmit, isPending, submitted, email } = useSignup()
  const rootError = form.formState.errors.root?.message

  return (
    <AuthLayout lede={<>Start where your <em className="italic text-brass-soft">drafts</em> converge.</>}>
      <AuthPlate onSubmit={onSubmit}>
        {submitted ? (
          <AuthNotice
            tone="sent"
            coordinate="51°28′N · 0°00′W"
            title="Check your email"
            heading="Confirm your email"
            description={
              <>
                We sent a confirmation link to <span className="text-foreground">{email}</span>. Open
                it to start writing.
              </>
            }
            footer={<MonoLink to="/login">Back to sign in</MonoLink>}
          />
        ) : (
          <>
            <Cartouche coordinate="51°28′N · 0°00′W" title="Create account" />
            <FormError message={rootError} />

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  label="First name"
                  placeholder="Ada"
                  autoComplete="given-name"
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  label="Last name"
                  placeholder="Lovelace"
                  autoComplete="family-name"
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                label="Email"
                type="email"
                placeholder="you@studio.com"
                autoComplete="email"
              />
              <FormField
                control={form.control}
                name="password"
                label="Password"
                type="password"
                placeholder="8–32 characters"
                autoComplete="new-password"
              />
            </div>

            <AuthSubmit pending={isPending}>Create account</AuthSubmit>

            <AltPrompt prompt="Already have an account?" to="/login" action="Sign in" />
          </>
        )}
      </AuthPlate>
    </AuthLayout>
  )
}
