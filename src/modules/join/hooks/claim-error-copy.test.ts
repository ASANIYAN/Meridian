import { describe, expect, it } from 'vitest'
import { claimErrorCopy } from './use-claim-link'

function apiError(status: number) {
  return { isAxiosError: true, response: { status, data: {} }, message: `failed ${status}` }
}

describe('claimErrorCopy', () => {
  it('403 reads as a revoked/expired/used link', () => {
    expect(claimErrorCopy(apiError(403)).title).toMatch(/no longer valid/i)
  })

  it('404 reads as an invite that points nowhere', () => {
    expect(claimErrorCopy(apiError(404)).title).toMatch(/not found/i)
  })

  it('anything else is a generic failure', () => {
    expect(claimErrorCopy(apiError(500)).title).toMatch(/something went wrong/i)
    expect(claimErrorCopy(new Error('network')).title).toMatch(/something went wrong/i)
  })
})
