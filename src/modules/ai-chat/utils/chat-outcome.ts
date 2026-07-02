import { getApiErrorMessage, getApiErrorStatus, isApiError } from '@/lib/api/get-api-error-message'
import type { ChatProposal, ChatSuccess } from '../api/ai-chat-api'
import type { AiChatWsEvent, AiErrorWsData } from '@/modules/collaboration/types/ai-chat-ws.types'
import type { AiEditDiff, ChatOutcome } from '../types/ai-chat.types'

/** A `200` body → full success, or partial if any operation was skipped. Also the
 *  shape of a `chat_result` WS frame's payload — see toSuccessOutcomeFromWs. */
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

export function toProposalOutcome(data: ChatProposal): ChatOutcome {
  return {
    kind: 'proposal',
    proposalId: data.proposalId,
    diff: data.diff,
    expiresAt: data.expiresAt,
  }
}

function readDiff(value: unknown): AiEditDiff | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const diff = value as Record<string, unknown>
  return typeof diff.before === 'string' && typeof diff.after === 'string'
    ? { before: diff.before, after: diff.after }
    : undefined
}

interface ErrorShape {
  status: number | undefined
  message: string
  check?: string
  operationIndex?: number
  expectedText?: string
  actualText?: string
}

/**
 * Map an error's HTTP-style status to an outcome by status (CLAUDE.md §9,
 * confirmed against backend PR #48). Shared by the HTTP-error path
 * (`toErrorOutcome`, still used by the synchronous accept/decline endpoints) and
 * the WS `ai_error` path (`toAiErrorOutcome`, used by the now-async chat/propose
 * endpoints) — same status→kind mapping either way. 504 (server job timeout) and
 * 500 (worker crash) — only reachable via the WS path, since a background job has
 * no synchronous HTTP equivalent — fall through to the `default: 'error'` case,
 * using the frame's own message ("AI request timed out" / "AI request could not
 * be completed").
 */
function outcomeFromErrorShape({
  status,
  message,
  check,
  operationIndex,
  expectedText,
  actualText,
}: ErrorShape): ChatOutcome {
  switch (status) {
    case 409:
      return {
        kind: 'content-conflict',
        message:
          check === 'content_existence'
            ? 'The assistant could not safely anchor that edit. Ask again with a more specific instruction.'
            : message,
        operationIndex,
        expectedText,
        actualText,
      }
    case 422:
      return { kind: 'scope', message }
    case 400:
      return { kind: 'format', message }
    case 410:
      return { kind: 'gone', message }
    case 429:
      return { kind: 'rate-limited', message }
    default:
      return { kind: 'error', message }
  }
}

/** A failed `POST` response (still used by the synchronous accept/decline
 *  endpoints — chat/propose errors now arrive via `toAiErrorOutcome` instead). */
export function toErrorOutcome(error: unknown): ChatOutcome {
  const status = getApiErrorStatus(error)
  const message = getApiErrorMessage(error)
  const body = isApiError(error)
    ? (error.response?.data as Record<string, unknown> | undefined)
    : undefined

  return outcomeFromErrorShape({
    status,
    message,
    check: typeof body?.check === 'string' ? body.check : undefined,
    operationIndex: typeof body?.operation_index === 'number' ? body.operation_index : undefined,
    expectedText: typeof body?.expected_text === 'string' ? body.expected_text : undefined,
    actualText: typeof body?.actual_text === 'string' ? body.actual_text : undefined,
  })
}

/** An `ai_error` WS frame (CLAUDE.md §9) — the async counterpart to
 *  `toErrorOutcome`, reading fields directly off the already-parsed frame data
 *  rather than unwrapping an axios error. */
export function toAiErrorOutcome(data: AiErrorWsData): ChatOutcome {
  return outcomeFromErrorShape({
    status: data.status,
    message: data.message,
    check: data.check,
    operationIndex: data.operation_index,
    expectedText: data.expected_text,
    actualText: data.actual_text,
  })
}

/** A `proposal_result` WS frame — same fields as the old synchronous
 *  `ChatProposal` response body, just delivered asynchronously. */
export function toProposalOutcomeFromWs(
  data: AiChatWsEvent & { event: 'proposal_result' },
): ChatOutcome {
  return toProposalOutcome(data.data)
}

/** A `chat_result` WS frame — same fields as the old synchronous `ChatSuccess`
 *  response body, just delivered asynchronously. */
export function toSuccessOutcomeFromWs(
  data: AiChatWsEvent & { event: 'chat_result' },
): ChatOutcome {
  return toSuccessOutcome(data.data)
}

/** Dispatch a `chat_result`/`proposal_result`/`ai_error` WS frame (CLAUDE.md §9)
 *  to the matching outcome converter — what `useChatSession`'s waiter calls. */
export function toOutcomeFromWsEvent(event: AiChatWsEvent): ChatOutcome {
  switch (event.event) {
    case 'chat_result':
      return toSuccessOutcomeFromWs(event)
    case 'proposal_result':
      return toProposalOutcomeFromWs(event)
    case 'ai_error':
      return toAiErrorOutcome(event.data)
  }
}

export function toProposalAcceptErrorOutcome(error: unknown, proposalId: string): ChatOutcome {
  const status = getApiErrorStatus(error)
  if (status === 410) return toErrorOutcome(error)
  if (status !== 409) return toErrorOutcome(error)

  const message = getApiErrorMessage(error)
  const body = isApiError(error)
    ? (error.response?.data as Record<string, unknown> | undefined)
    : undefined

  if (body?.requires_confirmation === true) {
    return {
      kind: 'proposal-conflict',
      proposalId,
      message,
      requiresConfirmation: true,
      diff: readDiff(body.diff),
      operationIndex: typeof body.operation_index === 'number' ? body.operation_index : undefined,
      expectedText: typeof body.expected_text === 'string' ? body.expected_text : undefined,
      actualText: typeof body.actual_text === 'string' ? body.actual_text : undefined,
    }
  }

  return toErrorOutcome(error)
}
