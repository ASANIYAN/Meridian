/**
 * Walks a Tiptap JSON document (see editor-extensions.ts's content-schema
 * contract) into a plain, serializable block tree that a Web Worker can
 * receive via postMessage and turn into @react-pdf/renderer elements without
 * ever crossing the structured-clone boundary with React elements/functions.
 */

type TiptapNode = {
  type?: string
  text?: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  marks?: { type?: string; attrs?: Record<string, unknown> }[]
}

export type PdfAlign = 'left' | 'center' | 'right' | 'justify'

export interface PdfInlineRun {
  text: string
  bold?: boolean
  italic?: boolean
  strike?: boolean
  code?: boolean
  highlight?: boolean
  href?: string
}

export interface PdfTableCell {
  runs: PdfInlineRun[]
  header: boolean
}

export interface PdfTableRow {
  cells: PdfTableCell[]
}

export type PdfBlock =
  | { kind: 'heading'; level: number; runs: PdfInlineRun[]; align?: PdfAlign }
  | { kind: 'paragraph'; runs: PdfInlineRun[]; align?: PdfAlign }
  | { kind: 'blockquote'; runs: PdfInlineRun[] }
  | { kind: 'codeBlock'; text: string }
  | { kind: 'horizontalRule' }
  | {
      kind: 'listItem'
      runs: PdfInlineRun[]
      depth: number
      ordered: boolean
      index?: number
      checked?: boolean
    }
  | { kind: 'table'; rows: PdfTableRow[] }

/** Entry point — call with `editor.getJSON()`'s root ("doc") node. */
export function buildPdfBlocks(root: TiptapNode): PdfBlock[] {
  return collectBlocks(root, 0)
}

function collectBlocks(node: TiptapNode, depth: number): PdfBlock[] {
  const blocks: PdfBlock[] = []

  for (const child of node.content ?? []) {
    switch (child.type) {
      case 'paragraph':
        blocks.push({ kind: 'paragraph', runs: getRuns(child), align: readAlign(child) })
        break

      case 'heading':
        blocks.push({
          kind: 'heading',
          level: typeof child.attrs?.level === 'number' ? (child.attrs.level as number) : 1,
          runs: getRuns(child),
          align: readAlign(child),
        })
        break

      case 'blockquote':
        blocks.push({ kind: 'blockquote', runs: getRuns(child) })
        break

      case 'codeBlock':
        blocks.push({ kind: 'codeBlock', text: getText(child) })
        break

      case 'horizontalRule':
        blocks.push({ kind: 'horizontalRule' })
        break

      case 'bulletList':
      case 'orderedList': {
        const ordered = child.type === 'orderedList'
        let orderedIndex = 1
        for (const item of child.content ?? []) {
          blocks.push(...listItemBlocks(item, depth, ordered, ordered ? orderedIndex : undefined))
          if (ordered) orderedIndex += 1
        }
        break
      }

      case 'taskList':
        for (const item of child.content ?? []) {
          blocks.push(
            ...listItemBlocks(item, depth, false, undefined, Boolean(item.attrs?.checked)),
          )
        }
        break

      case 'table':
        blocks.push({ kind: 'table', rows: buildTableRows(child) })
        break

      default:
        // Unknown/container node (e.g. the root "doc") — recurse without
        // emitting a block of its own.
        blocks.push(...collectBlocks(child, depth))
    }
  }

  return blocks
}

function listItemBlocks(
  item: TiptapNode,
  depth: number,
  ordered: boolean,
  index?: number,
  checked?: boolean,
): PdfBlock[] {
  const blocks: PdfBlock[] = []
  const paragraph = item.content?.find((child) => child.type === 'paragraph')

  blocks.push({
    kind: 'listItem',
    runs: paragraph ? getRuns(paragraph) : getRuns(item),
    depth,
    ordered,
    index,
    checked,
  })

  // Nested lists inside a list item render at depth + 1, directly after it.
  for (const child of item.content ?? []) {
    if (child.type === 'bulletList' || child.type === 'orderedList' || child.type === 'taskList') {
      blocks.push(...collectBlocks({ content: [child] }, depth + 1))
    }
  }

  return blocks
}

function buildTableRows(table: TiptapNode): PdfTableRow[] {
  return (table.content ?? [])
    .filter((row) => row.type === 'tableRow')
    .map((row) => ({
      cells: (row.content ?? [])
        .filter((cell) => cell.type === 'tableCell' || cell.type === 'tableHeader')
        .map((cell) => ({
          header: cell.type === 'tableHeader',
          runs: mergeCellRuns(cell),
        })),
    }))
}

function mergeCellRuns(cell: TiptapNode): PdfInlineRun[] {
  const paragraphs = (cell.content ?? []).filter((child) => child.type === 'paragraph')
  const runsPerParagraph = paragraphs.length > 0 ? paragraphs.map(getRuns) : [getRuns(cell)]
  const merged: PdfInlineRun[] = []
  runsPerParagraph.forEach((runs, index) => {
    if (index > 0) merged.push({ text: '\n' })
    merged.push(...runs)
  })
  return merged
}

function getText(node: TiptapNode): string {
  if (node.text) return node.text
  return (node.content ?? []).map(getText).join('')
}

function getRuns(node: TiptapNode): PdfInlineRun[] {
  if (node.text) return [{ text: node.text, ...marksToRun(node.marks) }]
  return compactRuns((node.content ?? []).flatMap(getRuns))
}

function marksToRun(marks: TiptapNode['marks']): Omit<PdfInlineRun, 'text'> {
  const run: Omit<PdfInlineRun, 'text'> = {}
  marks?.forEach((mark) => {
    if (mark.type === 'bold') run.bold = true
    if (mark.type === 'italic') run.italic = true
    if (mark.type === 'strike') run.strike = true
    if (mark.type === 'code') run.code = true
    if (mark.type === 'highlight') run.highlight = true
    if (mark.type === 'link' && typeof mark.attrs?.href === 'string') {
      run.href = mark.attrs.href as string
    }
  })
  return run
}

function compactRuns(runs: PdfInlineRun[]): PdfInlineRun[] {
  const compact: PdfInlineRun[] = []
  runs.forEach((run) => {
    const previous = compact.at(-1)
    if (previous && sameRunStyle(previous, run)) previous.text += run.text
    else compact.push({ ...run })
  })
  return compact
}

function sameRunStyle(a: PdfInlineRun, b: PdfInlineRun) {
  return (
    a.bold === b.bold &&
    a.italic === b.italic &&
    a.strike === b.strike &&
    a.code === b.code &&
    a.highlight === b.highlight &&
    a.href === b.href
  )
}

function readAlign(node: TiptapNode): PdfAlign | undefined {
  const align = node.attrs?.textAlign
  return align === 'center' || align === 'right' || align === 'justify' ? align : undefined
}
