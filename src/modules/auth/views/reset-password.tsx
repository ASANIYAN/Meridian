import { AuthLayout } from '@/components/custom-components/auth-layout'
import { AuthPlate } from '@/components/custom-components/auth-plate'
import { Cartouche } from '@/components/custom-components/cartouche'
import { FormField } from '@/components/custom-components/form-field'
import { FormError } from '@/components/custom-components/form-error'
import { AuthSubmit } from '../components/auth-submit'
import { AuthNotice } from '../components/auth-notice'
import { MonoLink } from '../components/auth-links'
import { useResetPassword } from '../hooks/use-reset-password'

export function ResetPasswordView() {
  const { form, onSubmit, isPending, hasToken } = useResetPassword()
  const rootError = form.formState.errors.root?.message

  return (
    <AuthLayout lede={<>Set a new <em className="italic text-brass-soft">bearing</em>.</>}>
      <AuthPlate onSubmit={onSubmit}>
        {!hasToken ? (
          <AuthNotice
            tone="error"
            coordinate="51°28′N · 0°00′W"
            title="New password"
            heading="This link didn't work"
            description="This reset link is invalid or has expired. Request a fresh one."
            footer={<MonoLink to="/forgot-password">Request a new link</MonoLink>}
          />
        ) : (
          <>
            <Cartouche coordinate="51°28′N · 0°00′W" title="New password" />
            <FormError message={rootError} />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                label="New password"
                type="password"
                placeholder="8–32 characters"
                autoComplete="new-password"
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                label="Confirm password"
                type="password"
                placeholder="Re-enter password"
                autoComplete="new-password"
              />
            </div>

            <AuthSubmit pending={isPending}>Set password</AuthSubmit>

            <div className="text-center">
              <MonoLink to="/login">Back to sign in</MonoLink>
            </div>
          </>
        )}
      </AuthPlate>
    </AuthLayout>
  )
}
