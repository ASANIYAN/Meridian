import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { applyApiErrorsToForm } from '@/lib/forms/apply-api-errors'
import { createDocument } from '../api/documents-api'
import { createDocumentSchema, type CreateDocumentValues } from '../utils/schemas'
import { documentsKey } from './use-documents'

/**
 * Create-document (FE-DOC-2). On success, invalidate the list so it refreshes
 * with no manual refetch (CLAUDE.md §8) and navigate straight into the new
 * document. `onCreated` lets the modal close itself.
 */
export function useCreateDocument(onCreated?: () => void) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const form = useForm<CreateDocumentValues>({
    resolver: zodResolver(createDocumentSchema),
    mode: 'onBlur',
    defaultValues: { title: '' },
  })

  const mutation = useMutation({
    mutationFn: (values: CreateDocumentValues) => createDocument(values.title),
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: documentsKey })
      onCreated?.()
      navigate(`/documents/${doc.id}`)
    },
    onError: (error) => applyApiErrorsToForm(form.setError, error, ['title']),
  })

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors('root')
    mutation.mutate(values)
  })

  return { form, onSubmit, isPending: mutation.isPending }
}
