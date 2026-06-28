import { describe, expect, it } from 'vitest'
import {
  toErrorOutcome,
  toProposalAcceptErrorOutcome,
  toProposalOutcome,
  toSuccessOutcome,
} from './chat-outcome'

/** A minimal axios-style error carrying a parsed response body. */
function apiError(status: number, data: Record<string, unknown>) {
  return { isAxiosError: true, response: { status, data }, message: `Request failed (${status})` }
}

describe('toSuccessOutcome', () => {
  it('is a full success when nothing was rejected', () => {
    expect(toSuccessOutcome({ operations_applied: 3 })).toEqual({
      kind: 'applied',
      operationsApplied: 3,
    })
  })

  it('an empty rejected_operations array is still a full success', () => {
    expect(toSuccessOutcome({ operations_applied: 2, rejected_operations: [] }).kind).toBe(
      'applied',
    )
  })

  it('is a partial success when some operations were skipped', () => {
    const outcome = toSuccessOutcome({
      operations_applied: 1,
      rejected_operations: [{ index: 2, reason: 'no matching text' }],
    })
    expect(outcome).toEqual({
      kind: 'partial',
      operationsApplied: 1,
      rejected: [{ index: 2, reason: 'no matching text' }],
    })
  })
})

describe('toProposalOutcome', () => {
  it('maps a staged proposal into a review outcome', () => {
    expect(
      toProposalOutcome({
        proposalId: 'proposal-1',
        diff: { before: 'old', after: 'new' },
        expiresAt: '2026-06-27T12:15:00.000Z',
      }),
    ).toEqual({
      kind: 'proposal',
      proposalId: 'proposal-1',
      diff: { before: 'old', after: 'new' },
      expiresAt: '2026-06-27T12:15:00.000Z',
    })
  })
})

describe('toErrorOutcome', () => {
  it('409; content-conflict, parsing rich fields when present', () => {
    const outcome = toErrorOutcome(
      apiError(409, {
        check: 'content_existence',
        operation_index: 1,
        expected_text: 'old',
        actual_text: 'new',
      }),
    )
    expect(outcome).toMatchObject({
      kind: 'content-conflict',
      operationIndex: 1,
      expectedText: 'old',
      actualText: 'new',
    })
  })

  it('409 without rich fields still classifies, leaving them undefined', () => {
    const outcome = toErrorOutcome(apiError(409, { message: 'document may have changed' }))
    expect(outcome.kind).toBe('content-conflict')
    if (outcome.kind === 'content-conflict') {
      expect(outcome.expectedText).toBeUndefined()
      expect(outcome.actualText).toBeUndefined()
    }
  })

  it('422; scope, surfacing the reason via message', () => {
    const outcome = toErrorOutcome(
      apiError(422, {
        check: 'scope',
        reason: 'exceeds the instruction',
        message: 'exceeds the instruction',
      }),
    )
    expect(outcome).toEqual({ kind: 'scope', message: 'exceeds the instruction' })
  })

  it('400; format, 429 → rate-limited', () => {
    expect(toErrorOutcome(apiError(400, { reason: 'LLM returned non-JSON' })).kind).toBe('format')
    expect(toErrorOutcome(apiError(429, {})).kind).toBe('rate-limited')
  })

  it('410; gone, surfacing the backend message', () => {
    expect(
      toErrorOutcome(
        apiError(410, { message: 'This proposal no longer exists; ask the AI again' }),
      ),
    ).toEqual({ kind: 'gone', message: 'This proposal no longer exists; ask the AI again' })
  })

  it('an uncategorized 500 falls through to a plain error', () => {
    const outcome = toErrorOutcome(apiError(500, { message: 'Internal server error' }))
    expect(outcome).toEqual({ kind: 'error', message: 'Internal server error' })
  })

  it('a non-API error (e.g. network failure) is a plain error', () => {
    expect(toErrorOutcome(new Error('Network Error')).kind).toBe('error')
  })
})

describe('toProposalAcceptErrorOutcome', () => {
  it('409; keeps the proposal id and updated diff for confirm retry', () => {
    expect(
      toProposalAcceptErrorOutcome(
        apiError(409, {
          message: 'Document has changed since this proposal was generated',
          diff: { before: 'current', after: 'updated' },
          operation_index: 0,
          expected_text: 'old',
          actual_text: 'current',
        }),
        'proposal-1',
      ),
    ).toEqual({
      kind: 'proposal-conflict',
      proposalId: 'proposal-1',
      message: 'Document has changed since this proposal was generated',
      diff: { before: 'current', after: 'updated' },
      operationIndex: 0,
      expectedText: 'old',
      actualText: 'current',
    })
  })

  it('non-409 accept failures reuse the normal chat error mapping', () => {
    expect(toProposalAcceptErrorOutcome(apiError(410, { message: 'Gone' }), 'proposal-1')).toEqual({
      kind: 'gone',
      message: 'Gone',
    })
  })
})
