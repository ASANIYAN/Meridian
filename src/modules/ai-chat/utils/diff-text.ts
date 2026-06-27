/** One contiguous run of text in a diffed string. `changed` marks the run as the
 *  part that diverges from the other side (present here, absent there). */
export interface DiffSegment {
  text: string
  changed: boolean
}

/**
 * Character-level diff of `expected` vs `actual`, returned as two segment lists
 * ready to render side by side. `expected` segments mark the characters that were
 * expected but are missing from `actual`; `actual` segments mark the characters
 * that are present but weren't expected. Shared characters are `changed: false`
 * in both.
 *
 * Used by the 409 content-conflict card (CLAUDE.md §9) so the author sees *what*
 * drifted, not two near-identical strings to eyeball. Inputs are short text
 * snippets straight from the backend, so the O(n·m) LCS table is fine.
 */
export function diffChars(
  expected: string,
  actual: string,
): { expected: DiffSegment[]; actual: DiffSegment[] } {
  const a = [...expected]
  const b = [...actual]
  const n = a.length
  const m = b.length

  // LCS length table.
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1])
    }
  }

  const expectedSegs: DiffSegment[] = []
  const actualSegs: DiffSegment[] = []
  let i = 0
  let j = 0
  while (i < n || j < m) {
    if (i < n && j < m && a[i] === b[j]) {
      push(expectedSegs, a[i], false)
      push(actualSegs, b[j], false)
      i++
      j++
    } else if (j >= m || (i < n && lcs[i + 1][j] >= lcs[i][j + 1])) {
      // Character in expected but not actual → an omission.
      push(expectedSegs, a[i], true)
      i++
    } else {
      // Character in actual but not expected → an addition.
      push(actualSegs, b[j], true)
      j++
    }
  }

  return { expected: expectedSegs, actual: actualSegs }
}

/** Append a char to the last segment when its `changed` flag matches, else start
 *  a new run — keeps the output as a small number of contiguous spans. */
function push(segs: DiffSegment[], char: string, changed: boolean) {
  const last = segs[segs.length - 1]
  if (last && last.changed === changed) last.text += char
  else segs.push({ text: char, changed })
}
