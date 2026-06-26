import { getApiErrorMessage, getApiErrorStatus, isApiError } from '@/lib/api/get-api-error-message'
import type { ChatSuccess } from '../api/ai-chat-api'
import type { ChatOutcome } from '../types/ai-chat.types'

/** A `200` body → full success, or partial if any operation was skipped. */
export function toSuccessOutcome(data: ChatSuccess): ChatOutcome {
  if (data.rejected_operations && data.rejected_operations.length > 0) {
    return {
      kind: 'partial',
      operationsApplied: data.operations_applied,
      rejected: data.rejected_operations,
    }
  }
  return { kind: 'applied', operationsApplied: data.operations_applied }
}

/**
 * Map a failed chat request to an outcome by HTTP status (CLAUDE.md §9). Rich
 * `expected_text`/`actual_text` are read only if the body happens to carry them
 * — the GlobalExceptionFilter strips them today, so this is parse-if-present,
 * never assumed. Anything not specifically classified (notably the current
 * generic 500) becomes `kind: 'error'`.
 */
export function toErrorOutcome(error: unknown): ChatOutcome {
  const status = getApiErrorStatus(error)
  const message = getApiErrorMessage(error)
  const body = isApiError(error)
    ? (error.response?.data as Record<string, unknown> | undefined)
    : undefined

  switch (status) {
    case 409:
      return {
        kind: 'content-conflict',
        message,
        operationIndex:
          typeof body?.operation_index === 'number' ? body.operation_index : undefined,
        expectedText: typeof body?.expected_text === 'string' ? body.expected_text : undefined,
        actualText: typeof body?.actual_text === 'string' ? body.actual_text : undefined,
      }
    case 422:
      return { kind: 'scope', message }
    case 400:
      return { kind: 'format', message }
    case 429:
      return { kind: 'rate-limited', message }
    default:
      return { kind: 'error', message }
  }
}
