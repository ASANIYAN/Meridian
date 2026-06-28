import { describe, expect, it } from 'vitest'
import { diffChars, type DiffSegment } from './diff-text'

/** Reconstruct the original string from segments — the text must always survive
 *  the diff intact, only the `changed` flags carry the delta. */
function join(segs: DiffSegment[]) {
  return segs.map((s) => s.text).join('')
}

/** Concatenate only the runs marked as the divergence. */
function changed(segs: DiffSegment[]) {
  return segs
    .filter((s) => s.changed)
    .map((s) => s.text)
    .join('')
}

describe('diffChars', () => {
  it('isolates a single missing leading character', () => {
    const { expected, actual } = diffChars('Frontend Engineering', 'rontend Engineering')
    expect(join(expected)).toBe('Frontend Engineering')
    expect(join(actual)).toBe('rontend Engineering')
    expect(changed(expected)).toBe('F')
    expect(changed(actual)).toBe('')
  })

  it('marks an inserted character on the actual side', () => {
    const { expected, actual } = diffChars('cat', 'cart')
    expect(changed(expected)).toBe('')
    expect(changed(actual)).toBe('r')
  })

  it('marks nothing changed for identical strings', () => {
    const { expected, actual } = diffChars('same text', 'same text')
    expect(changed(expected)).toBe('')
    expect(changed(actual)).toBe('')
    expect(expected.every((s) => !s.changed)).toBe(true)
  })

  it('marks everything changed when there is no shared text', () => {
    const { expected, actual } = diffChars('abc', 'xyz')
    expect(changed(expected)).toBe('abc')
    expect(changed(actual)).toBe('xyz')
  })

  it('handles a substitution in the middle', () => {
    const { expected, actual } = diffChars('Frontend Engineering', 'Frontend Enginering')
    // The expected side carries the dropped second "e" of "Engineering".
    expect(join(expected)).toBe('Frontend Engineering')
    expect(join(actual)).toBe('Frontend Enginering')
    expect(changed(expected)).toBe('e')
    expect(changed(actual)).toBe('')
  })

  it('coalesces adjacent changed characters into one segment', () => {
    const { actual } = diffChars('hello', 'hello world')
    const changedSegs = actual.filter((s) => s.changed)
    expect(changedSegs).toHaveLength(1)
    expect(changedSegs[0].text).toBe(' world')
  })

  it('handles empty inputs', () => {
    expect(diffChars('', '')).toEqual({ expected: [], actual: [] })
    expect(changed(diffChars('abc', '').expected)).toBe('abc')
    expect(changed(diffChars('', 'abc').actual)).toBe('abc')
  })
})
