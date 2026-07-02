import type { AiChatWsEvent } from '../types/ai-chat-ws.types'

/**
 * Parse an AI chat result frame (CLAUDE.md §4/§9). Unlike `parsePresenceFrame`
 * (presence.ts), these frames are flat on the wire — `requestId` and the payload
 * sit directly alongside `event`, not under `frame.data` — so this reads fields
 * off `frame` itself and repackages them into the nested `data` shape the rest
 * of the app expects.
 */
export function parseAiChatEvent(frame: Record<string, unknown>): AiChatWsEvent | null {
  if (typeof frame.requestId !== 'string' || !frame.requestId) return null
  const requestId = frame.requestId

  switch (frame.event) {
    case 'chat_result':
      if (typeof frame.operations_applied !== 'number') return null
      return {
        event: 'chat_result',
        data: {
          requestId,
          operations_applied: frame.operations_applied,
          rejected_operations: Array.isArray(frame.rejected_operations)
            ? (frame.rejected_operations as { index: number; reason: string }[])
            : undefined,
        },
      }
    case 'proposal_result':
      if (typeof frame.proposalId !== 'string' || typeof frame.expiresAt !== 'string') return null
      if (typeof frame.diff !== 'object' || frame.diff === null) return null
      return {
        event: 'proposal_result',
        data: {
          requestId,
          proposalId: frame.proposalId,
          diff: frame.diff as { before: string; after: string },
          expiresAt: frame.expiresAt,
        },
      }
    case 'ai_error':
      if (typeof frame.status !== 'number' || typeof frame.message !== 'string') return null
      return {
        event: 'ai_error',
        data: {
          requestId,
          status: frame.status,
          message: frame.message,
          check:
            frame.check === 'content_existence' || frame.check === 'scope'
              ? frame.check
              : undefined,
          operation_index:
            typeof frame.operation_index === 'number' ? frame.operation_index : undefined,
          expected_text: typeof frame.expected_text === 'string' ? frame.expected_text : undefined,
          actual_text: typeof frame.actual_text === 'string' ? frame.actual_text : undefined,
        },
      }
    default:
      return null
  }
}
