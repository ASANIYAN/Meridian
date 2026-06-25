import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { signup } from '../api/auth-api'
import { signupSchema, type SignupValues } from '../utils/schemas'
import { applyApiErrorsToForm } from '../utils/apply-api-errors'

const KNOWN_FIELDS = ['firstName', 'lastName', 'email', 'password'] as const

/**
 * Signup (FE-AUTH-1). On success the backend issues no JWT — the view swaps to a
 * check-your-email confirmation rather than logging in or redirecting. A
 * duplicate-email response surfaces through the REST error utility.
 */
export function useSignup() {
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    defaultValues: { firstName: '', lastName: '', email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: signup,
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
