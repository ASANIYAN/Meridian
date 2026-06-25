import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { extractFieldErrors, getApiErrorMessage } from '@/lib/api/get-api-error-message'

/**
 * Map a REST error onto an RHF form: best-effort per-field messages where the
 * backend named the field, otherwise a single form-level (`root`) message
 * (CLAUDE.md §9, FE-ERR-1).
 */
export function applyApiErrorsToForm<T extends FieldValues>(
  setError: UseFormSetError<T>,
  error: unknown,
  knownFields: readonly Path<T>[],
) {
  const fieldErrors = extractFieldErrors(error)
  const matched = Object.keys(fieldErrors).filter((f) => knownFields.includes(f as Path<T>))

  if (matched.length > 0) {
    for (const field of matched) {
      setError(field as Path<T>, { message: fieldErrors[field] })
    }
    return
  }

  setError('root' as Path<T>, { message: getApiErrorMessage(error) })
}
