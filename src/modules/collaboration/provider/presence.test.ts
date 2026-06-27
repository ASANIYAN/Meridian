import { describe, expect, it } from 'vitest'
import { applyPresenceUpdate, flattenParticipants, parsePresenceFrame } from './presence'

describe('flattenParticipants', () => {
  it('flattens the { userId: displayName } map into a list', () => {
    expect(flattenParticipants({ u1: 'Ada Lovelace', u2: 'Grace Hopper' })).toEqual([
      { userId: 'u1', displayName: 'Ada Lovelace' },
      { userId: 'u2', displayName: 'Grace Hopper' },
    ])
  })

  it('returns an empty list for a missing or non-object map', () => {
    expect(flattenParticipants(undefined)).toEqual([])
    expect(flattenParticipants(null)).toEqual([])
    expect(flattenParticipants([])).toEqual([])
  })
})

describe('parsePresenceFrame', () => {
  it('parses a presence frame (type/userId/name/status)', () => {
    expect(
      parsePresenceFrame({ type: 'presence', userId: 'u1', name: 'Ada', status: 'online' }),
    ).toEqual({
      user: { userId: 'u1', displayName: 'Ada' },
      status: 'online',
    })
  })

  it('defaults a missing/odd status to online', () => {
    expect(parsePresenceFrame({ type: 'presence', userId: 'u1', name: 'Ada' })?.status).toBe(
      'online',
    )
    expect(
      parsePresenceFrame({ type: 'presence', userId: 'u1', name: 'Ada', status: 'offline' })
        ?.status,
    ).toBe('offline')
  })

  it('rejects non-presence frames and missing userId', () => {
    expect(parsePresenceFrame({ event: 'ack', data: {} })).toBeNull()
    expect(parsePresenceFrame({ type: 'presence', name: 'x' })).toBeNull()
    expect(parsePresenceFrame(null)).toBeNull()
  })
})

describe('applyPresenceUpdate', () => {
  const ada = { userId: 'u1', displayName: 'Ada' }
  const grace = { userId: 'u2', displayName: 'Grace' }

  it('adds a user coming online, once', () => {
    const r1 = applyPresenceUpdate([ada], { user: grace, status: 'online' })
    expect(r1).toEqual([ada, grace])
    // idempotent — already present
    expect(applyPresenceUpdate(r1, { user: grace, status: 'online' })).toEqual(r1)
  })

  it('removes a user going offline', () => {
    expect(applyPresenceUpdate([ada, grace], { user: grace, status: 'offline' })).toEqual([ada])
  })
})
