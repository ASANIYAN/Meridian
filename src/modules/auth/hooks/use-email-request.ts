import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { getApiErrorStatus } from '@/lib/api/get-api-error-message'
import { forgotPassword, resendVerification } from '../api/auth-api'
import { emailRequestSchema, type EmailRequestValues } from '../utils/schemas'

/**
 * The generic-response email flow shared by forgot-password (FE-AUTH-5) and
 * resend-verification (FE-AUTH-4). Any submitted email — registered or not —
 * lands on the same confirmation, so the UI never reveals whether an account
 * exists. The one exception is a 429, which shows a friendly retry message
 * instead of the confirmation (CLAUDE.md §9).
 */
function useEmailRequest(request: (email: string) => Promise<void>) {
  const [done, setDone] = useState(false)

  const form = useForm<EmailRequestValues>({
    resolver: zodResolver(emailRequestSchema),
    mode: 'onBlur',
    defaultValues: { email: '' },
  })

  const mutation = useMutation({
    mutationFn: (values: EmailRequestValues) => request(values.email),
    onSuccess: () => setDone(true),
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

export const useForgotPassword = () => useEmailRequest(forgotPassword)
export const useResendVerification = () => useEmailRequest(resendVerification)
