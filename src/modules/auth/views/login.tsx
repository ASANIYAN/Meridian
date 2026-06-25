import { AuthLayout } from '@/components/custom-components/auth-layout'
import { AuthPlate } from '@/components/custom-components/auth-plate'
import { Cartouche } from '@/components/custom-components/cartouche'
import { FormField } from '@/components/custom-components/form-field'
import { FormError } from '@/components/custom-components/form-error'
import { AuthSubmit } from '../components/auth-submit'
import { AltPrompt, MonoLink } from '../components/auth-links'
import { useLogin } from '../hooks/use-login'

export function LoginView() {
  const { form, onSubmit, isPending, unverifiedMessage } = useLogin()
  const rootError = form.formState.errors.root?.message

  return (
    <AuthLayout>
      <AuthPlate onSubmit={onSubmit}>
        <Cartouche coordinate="51°28′N · 0°00′W" title="Sign in" />

        {unverifiedMessage ? (
          <div className="space-y-2 rounded-md border border-border bg-muted/40 px-3.5 py-3 text-[13px] leading-snug text-foreground">
            <p>{unverifiedMessage}</p>
            <MonoLink to="/resend-verification">Resend verification</MonoLink>
          </div>
        ) : (
          <FormError message={rootError} />
        )}

        <div className="space-y-4">
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
            placeholder="••••••••••"
            autoComplete="current-password"
          />
        </div>

        <div className="flex justify-end">
          <MonoLink to="/forgot-password">Forgot password</MonoLink>
        </div>

        <AuthSubmit pending={isPending}>Continue</AuthSubmit>

        <AltPrompt prompt="New to Meridian?" to="/signup" action="Create an account" />
      </AuthPlate>
    </AuthLayout>
  )
}
