import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'
import { getApiErrorMessage, getApiErrorStatus } from '@/lib/api/get-api-error-message'
import { login } from '../api/auth-api'
import { loginSchema, type LoginValues } from '../utils/schemas'

/**
 * Login (FE-AUTH-2). On success, stores the session and lands on /documents.
 * The unverified-account 403 carries the backend's *specific* message (which
 * differs by whether a fresh link was just sent) and is surfaced verbatim with
 * a resend path — distinct from the invalid-credentials 401, which shows one
 * generic message that never reveals whether the email exists.
 */
export function useLogin() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [unverifiedMessage, setUnverifiedMessage] = useState<string | null>(null)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ user, token }) => {
      setSession({ user, token })
      navigate('/documents', { replace: true })
    },
    onError: (error) => {
      const status = getApiErrorStatus(error)
      if (status === 403) {
        setUnverifiedMessage(getApiErrorMessage(error))
      } else {
        form.setError('root', { message: 'Email or password is incorrect.' })
      }
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    setUnverifiedMessage(null)
    form.clearErrors('root')
    mutation.mutate(values)
  })

  return { form, onSubmit, isPending: mutation.isPending, unverifiedMessage }
}
