import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { getApiErrorStatus } from '@/lib/api/get-api-error-message'
import { useToastStore } from '@/store/toast-store'
import { forgotPassword, resendVerification } from '../api/auth-api'
import { emailRequestSchema, type EmailRequestValues } from '../utils/schemas'

/**
 * The generic-response email flow shared by forgot-password (FE-AUTH-5) and
 * resend-verification (FE-AUTH-4). Any submitted email — registered or not —
 * lands on the same confirmation, so the UI never reveals whether an account
 * exists. The one exception is a 429, which shows a friendly retry message
 * instead of the confirmation (CLAUDE.md §9).
 */
function useEmailRequest(request: (email: string) => Promise<void>, successToast: string) {
  const [done, setDone] = useState(false)
  const [params] = useSearchParams()
  const addToast = useToastStore((s) => s.addToast)

  const form = useForm<EmailRequestValues>({
    resolver: zodResolver(emailRequestSchema),
    mode: 'onBlur',
    // Prefilled when arriving from the signup "resend" link (?email=…).
    defaultValues: { email: params.get('email') ?? '' },
  })

  const mutation = useMutation({
    mutationFn: (values: EmailRequestValues) => request(values.email),
    onSuccess: () => {
      setDone(true)
      // Only on a real 200 — the error path below also shows the confirmation
      // (to never leak whether an account exists), but isn't a genuine success.
      addToast({ message: successToast, variant: 'success' })
    },
    onError: (error) => {
      const status = getApiErrorStatus(error)
      if (status === 429) {
        form.setError('root', { message: 'Please wait a minute before trying again.' })
      } else {
        // Any other outcome shows the same confirmation — never leak.
        setDone(true)
      }
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors('root')
    mutation.mutate(values)
  })

  return { form, onSubmit, isPending: mutation.isPending, submitted: done }
}

export const useForgotPassword = () =>
  useEmailRequest(forgotPassword, 'Check your email for a reset link.')
export const useResendVerification = () =>
  useEmailRequest(resendVerification, 'Check your email for a new verification link.')
