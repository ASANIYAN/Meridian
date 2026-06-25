import type { ReactNode } from 'react'
import { AuthLayout } from '@/components/custom-components/auth-layout'
import { AuthPlate } from '@/components/custom-components/auth-plate'
import { Cartouche } from '@/components/custom-components/cartouche'
import { Field } from './field'
import { AuthSubmit } from './auth-submit'
import { MonoLink } from './auth-links'

interface EmailRequestViewProps {
  title: string
  description: ReactNode
  submitLabel: string
  lede?: ReactNode
}

/**
 * The generic-response email form shared by forgot-password and
 * resend-verification. Both deliberately reveal nothing about whether the
 * address exists — the real submit always lands on the same confirmation
 * (AuthNotice, tone="sent"), per the security pattern in CLAUDE.md §9.
 */
export function EmailRequestView({ title, description, submitLabel, lede }: EmailRequestViewProps) {
  return (
    <AuthLayout lede={lede}>
      <AuthPlate>
        <Cartouche coordinate="51°28′N · 0°00′W" title={title} />

        <p className="text-[13.5px] leading-relaxed text-muted-foreground">{description}</p>

        <Field id="email" label="Email" type="email" placeholder="you@studio.com" autoComplete="email" />

        <AuthSubmit>{submitLabel}</AuthSubmit>

        <div className="text-center">
          <MonoLink to="/login">Back to sign in</MonoLink>
        </div>
      </AuthPlate>
    </AuthLayout>
  )
}
