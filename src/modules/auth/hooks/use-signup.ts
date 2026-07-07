import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { signup } from '../api/auth-api'
import { signupSchema, type SignupValues } from '../utils/schemas'
import { applyApiErrorsToForm } from '@/lib/forms/apply-api-errors'
import { useToastStore } from '@/store/toast-store'
import { warmUpServer } from '@/lib/api/warm-up-server'

const KNOWN_FIELDS = ['firstName', 'lastName', 'email', 'password'] as const

/**
 * Signup (FE-AUTH-1). On success the backend issues no JWT — the view swaps to a
 * check-your-email confirmation rather than logging in or redirecting. A
 * duplicate-email response surfaces through the REST error utility.
 */
export function useSignup() {
  const addToast = useToastStore((s) => s.addToast)

  // Re-arm in case the app-boot ping (main.tsx) succeeded long ago and the
  // Render instance has since spun back down while this tab sat idle.
  useEffect(() => {
    void warmUpServer()
  }, [])

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    defaultValues: { firstName: '', lastName: '', email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: () =>
      addToast({ message: 'Account created — check your email.', variant: 'success' }),
    onError: (error) => applyApiErrorsToForm(form.setError, error, KNOWN_FIELDS),
  })

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors('root')
    mutation.mutate(values)
  })

  return {
    form,
    onSubmit,
    isPending: mutation.isPending,
    submitted: mutation.isSuccess,
    email: form.getValues('email'),
  }
}
