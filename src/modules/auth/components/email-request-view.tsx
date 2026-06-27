import type { FormEventHandler, ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { AuthLayout } from '@/components/custom-components/auth-layout'
import { AuthPlate } from '@/components/custom-components/auth-plate'
import { Cartouche } from '@/components/custom-components/cartouche'
import { FormField } from '@/components/custom-components/form-field'
import { FormError } from '@/components/custom-components/form-error'
import { AuthSubmit } from './auth-submit'
import { AuthNotice } from './auth-notice'
import { MonoLink } from './auth-links'
import type { EmailRequestValues } from '../utils/schemas'

export interface EmailRequestController {
  form: UseFormReturn<EmailRequestValues>
  onSubmit: FormEventHandler<HTMLFormElement>
  isPending: boolean
  submitted: boolean
}

interface EmailRequestViewProps {
  title: string
  description: ReactNode
  submitLabel: string
  hook: EmailRequestController
  sent: { heading: string; description: ReactNode }
  lede?: ReactNode
}

/**
 * The generic-response email form shared by forgot-password and
 * resend-verification. Both reveal nothing about whether the address exists —
 * any submission lands on the same confirmation (CLAUDE.md §9).
 */
export function EmailRequestView({
  title,
  description,
  submitLabel,
  hook,
  sent,
  lede,
}: EmailRequestViewProps) {
  const rootError = hook.form.formState.errors.root?.message

  return (
    <AuthLayout lede={lede}>
      <AuthPlate onSubmit={hook.onSubmit}>
        {hook.submitted ? (
          <AuthNotice
            tone="sent"
            coordinate=""
            title={title}
            heading={sent.heading}
            description={sent.description}
            footer={<MonoLink to="/login">Back to sign in</MonoLink>}
          />
        ) : (
          <>
            <Cartouche coordinate="" title={title} />
            <FormError message={rootError} />
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">{description}</p>

            <FormField
              control={hook.form.control}
              name="email"
              label="Email"
              type="email"
              placeholder="you@studio.com"
              autoComplete="email"
            />

            <AuthSubmit pending={hook.isPending}>{submitLabel}</AuthSubmit>

            <div className="text-center">
              <MonoLink to="/login">Back to sign in</MonoLink>
            </div>
          </>
        )}
      </AuthPlate>
    </AuthLayout>
  )
}
