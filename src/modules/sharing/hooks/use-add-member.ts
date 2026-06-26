import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage, getApiErrorStatus } from '@/lib/api/get-api-error-message'
import { addMember } from '../api/sharing-api'
import { addMemberSchema, type AddMemberValues } from '../utils/schemas'
import { membersKey } from './use-members'

/**
 * Add a member by email (FE-SHARE-3). On success, invalidate the member list and
 * reset the form. The two expected failures get friendly field-level messages
 * rather than a raw backend sentence: 404 (no such user) and 409 (already a
 * member) both attach to the email field.
 */
export function useAddMember(documentId: string) {
  const queryClient = useQueryClient()

  const form = useForm<AddMemberValues>({
    resolver: zodResolver(addMemberSchema),
    mode: 'onBlur',
    defaultValues: { email: '', role: 'viewer' },
  })

  const mutation = useMutation({
    mutationFn: (values: AddMemberValues) => addMember(documentId, values.email, values.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey(documentId) })
      form.reset({ email: '', role: form.getValues('role') })
    },
    onError: (error) => {
      const status = getApiErrorStatus(error)
      if (status === 404) {
        form.setError('email', { message: 'No Meridian account uses that email.' })
      } else if (status === 409) {
        form.setError('email', { message: 'They already have access to this document.' })
      } else {
        form.setError('root', { message: getApiErrorMessage(error) })
      }
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors('root')
    mutation.mutate(values)
  })

  return { form, onSubmit, isPending: mutation.isPending }
}
