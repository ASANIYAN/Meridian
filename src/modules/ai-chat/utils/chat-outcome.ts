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
 * Map a failed chat request to an outcome by HTTP status (CLAUDE.md §9, confirmed
 * against backend PR #48). 409 carries `operation_index`/`expected_text`/
 * `actual_text` (forwarded intact by the GlobalExceptionFilter); 422 and 400
 * carry a `reason` surfaced via `message`. `check` (content_existence vs scope)
 * is a redundant confirmation of the status code, so we key off status alone.
 * Anything uncategorized (e.g. a 500 or a network failure) becomes `kind: 'error'`.
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
