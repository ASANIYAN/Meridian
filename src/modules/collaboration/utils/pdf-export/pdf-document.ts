import { createElement as h } from 'react'
import { Document, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'
import type { PdfAlign, PdfBlock, PdfInlineRun } from './pdf-content-model'

type TextStyle = Style | Style[]

/**
 * Rebuilt inside the Web Worker (pdf.worker.ts) from the plain JSON produced
 * by pdf-content-model.ts — never imported on the main thread. Uses only
 * @react-pdf/renderer's built-in Helvetica/Courier core fonts, so PDF
 * generation never depends on a font file fetch succeeding inside the worker.
 *
 * Plain `createElement` calls, not JSX: JSX here would pull in React's dev
 * JSX runtime, which in Vite dev mode carries Fast Refresh registration code
 * that assumes `window` exists — fatal inside a Worker's global scope, which
 * only has `self`. Avoiding JSX in this one file sidesteps that dependency
 * entirely, in both dev and production.
 */

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 64,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#0f1a2a',
  },
  // Line-height values mirror the editor's own prose rules (src/index.css,
  // scoped to .meridian-editor): 1.75 for body/prose text, 1.2 for headings
  // — react-pdf doesn't reliably inherit lineHeight down from an ancestor,
  // so each Text-bearing style sets its own rather than relying on that.
  title: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginBottom: 18, lineHeight: 1.2 },
  heading1: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginTop: 14,
    marginBottom: 8,
    lineHeight: 1.2,
  },
  heading2: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginTop: 12,
    marginBottom: 6,
    lineHeight: 1.2,
  },
  heading3: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    marginTop: 10,
    marginBottom: 5,
    lineHeight: 1.2,
  },
  headingRest: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 1.2,
  },
  paragraph: { marginBottom: 8, lineHeight: 1.75 },
  blockquote: {
    marginBottom: 8,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#cda349',
    fontFamily: 'Helvetica-Oblique',
    color: '#4f6072',
    lineHeight: 1.75,
  },
  code: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#eceff3',
    fontFamily: 'Courier',
    fontSize: 10,
    lineHeight: 1.75,
  },
  hr: { borderBottomWidth: 1, borderBottomColor: '#d7dee6', marginVertical: 12 },
  listItem: { flexDirection: 'row', marginBottom: 4 },
  listMarker: { width: 18, lineHeight: 1.75 },
  listContent: { flex: 1, lineHeight: 1.75 },
  table: { marginBottom: 10, borderWidth: 1, borderColor: '#d7dee6' },
  tableRow: { flexDirection: 'row' },
  tableCell: {
    flex: 1,
    padding: 6,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d7dee6',
    fontSize: 10,
    lineHeight: 1.75,
  },
  tableCellHeader: { fontFamily: 'Helvetica-Bold', backgroundColor: '#eceff3' },
})

function headingStyle(level: number) {
  if (level === 1) return styles.heading1
  if (level === 2) return styles.heading2
  if (level === 3) return styles.heading3
  return styles.headingRest
}

function withAlign(base: TextStyle, align?: PdfAlign): TextStyle {
  return align ? [base, { textAlign: align }].flat() : base
}

function runStyle(run: PdfInlineRun) {
  const fontFamily =
    run.bold && run.italic
      ? 'Helvetica-BoldOblique'
      : run.bold
        ? 'Helvetica-Bold'
        : run.italic
          ? 'Helvetica-Oblique'
          : run.code
            ? 'Courier'
            : 'Helvetica'

  return {
    fontFamily,
    fontSize: run.code ? 10 : undefined,
    textDecoration: run.strike
      ? ('line-through' as const)
      : run.href
        ? ('underline' as const)
        : undefined,
    backgroundColor: run.highlight ? '#fef3c7' : undefined,
    color: run.href ? '#2563eb' : undefined,
  }
}

function Runs(key: number | undefined, runs: PdfInlineRun[], style?: TextStyle) {
  return h(
    Text,
    { key, style },
    runs.map((run, index) =>
      run.href
        ? h(Link, { key: index, src: run.href, style: runStyle(run) }, run.text)
        : h(Text, { key: index, style: runStyle(run) }, run.text),
    ),
  )
}

function renderBlock(block: PdfBlock, index: number) {
  switch (block.kind) {
    case 'heading':
      return Runs(index, block.runs, withAlign(headingStyle(block.level), block.align))

    case 'paragraph':
      return Runs(index, block.runs, withAlign(styles.paragraph, block.align))

    case 'blockquote':
      return Runs(index, block.runs, styles.blockquote)

    case 'codeBlock':
      return h(Text, { key: index, style: styles.code }, block.text)

    case 'horizontalRule':
      return h(View, { key: index, style: styles.hr })

    case 'listItem': {
      const marker =
        block.checked !== undefined
          ? block.checked
            ? '☑'
            : '☐'
          : block.ordered
            ? `${block.index}.`
            : '•'
      return h(
        View,
        { key: index, style: [styles.listItem, { marginLeft: block.depth * 18 }] },
        h(Text, { style: styles.listMarker }, marker),
        Runs(undefined, block.runs, styles.listContent),
      )
    }

    case 'table':
      return h(
        View,
        { key: index, style: styles.table },
        block.rows.map((row, rowIndex) =>
          h(
            View,
            { key: rowIndex, style: styles.tableRow },
            row.cells.map((cell, cellIndex) =>
              Runs(
                cellIndex,
                cell.runs,
                cell.header ? [styles.tableCell, styles.tableCellHeader] : styles.tableCell,
              ),
            ),
          ),
        ),
      )

    default:
      return null
  }
}

export function MeridianPdfDocument({ title, blocks }: { title: string; blocks: PdfBlock[] }) {
  return h(
    Document,
    { title },
    h(
      Page,
      { size: 'A4', style: styles.page, wrap: true },
      h(Text, { style: styles.title }, title),
      blocks.map(renderBlock),
    ),
  )
}
