import { describe, expect, it } from 'vitest'
import { base64ToBytes, coerceBytes, encodeJoinMessage, encodeUpdateMessage } from './frames'

describe('encode messages', () => {
  it('encodes a join message', () => {
    expect(JSON.parse(encodeJoinMessage('doc-1'))).toEqual({
      event: 'join',
      data: { document_id: 'doc-1' },
    })
  })

  it('encodes an update with data as the raw number[]', () => {
    const parsed = JSON.parse(encodeUpdateMessage(Uint8Array.from([1, 2, 255])))
    expect(parsed).toEqual({ event: 'update', data: [1, 2, 255] })
  })
})

describe('base64ToBytes', () => {
  it('round-trips with btoa', () => {
    const b64 = btoa(String.fromCharCode(0, 10, 200, 255))
    expect(Array.from(base64ToBytes(b64))).toEqual([0, 10, 200, 255])
  })
})

describe('coerceBytes', () => {
  it('accepts a Uint8Array as-is', () => {
    const u = Uint8Array.from([1, 2, 3])
    expect(coerceBytes(u)).toBe(u)
  })

  it('accepts a number[]', () => {
    const bytes = coerceBytes([4, 5, 6])
    expect(bytes && Array.from(bytes)).toEqual([4, 5, 6])
  })

  it('accepts a base64 string', () => {
    const b64 = btoa(String.fromCharCode(7, 8, 9))
    expect(Array.from(coerceBytes(b64)!)).toEqual([7, 8, 9])
  })

  it('unwraps a common key like { update }', () => {
    expect(Array.from(coerceBytes({ update: [1, 2] })!)).toEqual([1, 2])
  })

  it('returns null for nothing usable', () => {
    expect(coerceBytes(null)).toBeNull()
    expect(coerceBytes(42)).toBeNull()
    expect(coerceBytes({ nope: true })).toBeNull()
  })
})
