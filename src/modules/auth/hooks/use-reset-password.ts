import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useToastStore } from '@/store/toast-store'
import { resetPassword } from '../api/auth-api'
import { resetPasswordSchema, type ResetPasswordValues } from '../utils/schemas'

/**
 * Reset-password (FE-AUTH-6). The token rides in the URL; confirmPassword is
 * validated locally and stripped — only { token, new_password } reaches the API.
 * On success, redirect to /login with a confirmation toast; on failure, one
 * generic invalid-or-expired message.
 */
export function useResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
    defaultValues: { password: '', confirmPassword: '' },
  })

  const mutation = useMutation({
    mutationFn: (values: ResetPasswordValues) =>
      resetPassword({ token: token ?? '', new_password: values.password }),
    onSuccess: () => {
      addToast({ message: 'Password updated. Sign in with your new password.', variant: 'success' })
      navigate('/login', { replace: true })
    },
    onError: () => {
      form.setError('root', { message: 'This link is invalid or has expired. Request a new one.' })
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors('root')
    mutation.mutate(values)
  })

  return { form, onSubmit, isPending: mutation.isPending, hasToken: !!token }
}
