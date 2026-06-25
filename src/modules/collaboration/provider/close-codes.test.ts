import { describe, expect, it } from 'vitest'
import { classifyClose } from './close-codes'

describe('classifyClose', () => {
  it('4001 with an auth reason redirects to login', () => {
    expect(classifyClose(4001, 'Token has been revoked').kind).toBe('redirect-login')
    expect(classifyClose(4001, 'Authentication failed').kind).toBe('redirect-login')
  })

  it('4001 with a missing-document-id reason is a fatal protocol bug, not a login redirect', () => {
    expect(classifyClose(4001, 'No document id found').kind).toBe('fatal')
  })

  it('4003 redirects to the documents list (forbidden, still authenticated)', () => {
    expect(classifyClose(4003, '').kind).toBe('redirect-documents')
  })

  it('4029 and 1011 retry with backoff', () => {
    expect(classifyClose(4029, 'Connection rate limit exceeded').kind).toBe('retry')
    expect(classifyClose(1011, 'Failed to initialize document channel').kind).toBe('retry')
  })

  it('clean closes take no action', () => {
    expect(classifyClose(1000, '').kind).toBe('closed')
    expect(classifyClose(1001, '').kind).toBe('closed')
  })

  it('unknown abnormal closes attempt to reconnect', () => {
    expect(classifyClose(1006, '').kind).toBe('retry')
  })
})
