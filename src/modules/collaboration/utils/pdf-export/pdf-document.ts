import { createElement as h } from 'react'
import { Document, Font, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'
import type { PdfAlign, PdfBlock, PdfInlineRun } from './pdf-content-model'

type TextStyle = Style | Style[]

/**
 * Rebuilt inside the Web Worker (pdf.worker.ts) from the plain JSON produced
 * by pdf-content-model.ts — never imported on the main thread.
 *
 * Plain `createElement` calls, not JSX: JSX here would pull in React's dev
 * JSX runtime, which in Vite dev mode carries Fast Refresh registration code
 * that assumes `window` exists — fatal inside a Worker's global scope, which
 * only has `self`. Avoiding JSX in this one file sidesteps that dependency
 * entirely, in both dev and production.
 *
 * Body/heading text is rendered with the same Geist/Fraunces families the
 * editor itself uses (registered below), not react-pdf's built-in core
 * Helvetica — core fonts only ship approximate AFM metrics, which is what
 * made justified text visibly misspace on short lines.
 *
 * These are the plain variable-font files (default named instance — Geist
 * Regular / Fraunces Regular), not per-weight static files: the static
 * woff2 weight files @fontsource ships (e.g. a real Geist Bold or Fraunces
 * SemiBold instance) hit a live bug in the fontkit version react-pdf bundles
 * (2.0.4) — its TTF subsetter throws `RangeError: Offset is outside the
 * bounds of the DataView` while embedding them, verified directly against
 * fontkit outside of react-pdf too, so it isn't a fluke of this app's setup.
 * The plain variable-font file doesn't hit that bug. Net effect: body text
 * and headings get the *correct family and real glyph metrics* (which is
 * what fixes justify), but not a distinct bold weight from these two
 * families — bold marks and, for now, heading weight still lean on core
 * Helvetica-Bold rather than a true embedded Geist/Fraunces bold. Getting a
 * real bold instance would mean shipping a properly-instanced static TTF
 * (e.g. built once via `fonttools varLib.instancer`), which is a follow-up,
 * not something to hand-roll here.
 */

Font.register({
  family: 'Geist',
  src: new URL('./fonts/geist-variable.ttf', import.meta.url).href,
})

Font.register({
  family: 'Fraunces',
  fonts: [
    { src: new URL('./fonts/fraunces-variable.ttf', import.meta.url).href, fontStyle: 'normal' },
    {
      src: new URL('./fonts/fraunces-italic-variable.ttf', import.meta.url).href,
      fontStyle: 'italic',
    },
  ],
})

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 64,
    fontSize: 11,
    fontFamily: 'Geist',
    color: '#0f1a2a',
  },
  // Line-height values mirror the editor's own prose rules (src/index.css,
  // scoped to .meridian-editor): 1.75 for body/prose text, 1.2 for headings
  // — react-pdf doesn't reliably inherit lineHeight down from an ancestor,
  // so each Text-bearing style sets its own rather than relying on that.
  // Margins are intentionally NOT set here — react-pdf's Yoga layout sums
  // adjacent margins instead of collapsing them the way CSS does, so baking
  // both a marginTop and marginBottom into every block statically double-
  // counts the gap between any two blocks. See collapseMargins() below,
  // which computes each block's actual top/bottom margin from this same
  // data (OWN_MARGINS) the way a browser would.
  heading1: { fontSize: 20, fontFamily: 'Fraunces', lineHeight: 1.2 },
  heading2: { fontSize: 16, fontFamily: 'Fraunces', lineHeight: 1.2 },
  heading3: { fontSize: 13, fontFamily: 'Fraunces', lineHeight: 1.2 },
  headingRest: { fontSize: 11, fontFamily: 'Fraunces', lineHeight: 1.2 },
  paragraph: { lineHeight: 1.75 },
  blockquote: {
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#cda349',
    fontFamily: 'Helvetica-Oblique',
    color: '#4f6072',
    lineHeight: 1.75,
  },
  code: {
    padding: 8,
    backgroundColor: '#eceff3',
    fontFamily: 'Courier',
    fontSize: 10,
    lineHeight: 1.75,
  },
  hr: { borderBottomWidth: 1, borderBottomColor: '#d7dee6' },
  listItem: { flexDirection: 'row' },
  listMarker: { width: 18, lineHeight: 1.75 },
  listContent: { flex: 1, lineHeight: 1.75 },
  table: { borderWidth: 1, borderColor: '#d7dee6' },
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

// Each block's own top/bottom margin, exactly as previously baked into
// `styles` above — pulled out on its own so collapseMargins() can compare a
// block's own top margin against its predecessor's own bottom margin and
// keep only the larger one, the same rule CSS uses for adjacent margins.
const OWN_MARGINS: Record<string, { top: number; bottom: number }> = {
  heading1: { top: 14, bottom: 8 },
  heading2: { top: 12, bottom: 6 },
  heading3: { top: 10, bottom: 5 },
  headingRest: { top: 8, bottom: 4 },
  paragraph: { top: 0, bottom: 8 },
  blockquote: { top: 0, bottom: 8 },
  codeBlock: { top: 0, bottom: 8 },
  horizontalRule: { top: 12, bottom: 12 },
  listItem: { top: 0, bottom: 4 },
  table: { top: 0, bottom: 10 },
}

function headingMarginKey(level: number) {
  if (level === 1) return 'heading1'
  if (level === 2) return 'heading2'
  if (level === 3) return 'heading3'
  return 'headingRest'
}

function headingStyle(level: number) {
  if (level === 1) return styles.heading1
  if (level === 2) return styles.heading2
  if (level === 3) return styles.heading3
  return styles.headingRest
}

function ownMarginsFor(block: PdfBlock) {
  const key = block.kind === 'heading' ? headingMarginKey(block.level) : block.kind
  return OWN_MARGINS[key] ?? { top: 0, bottom: 0 }
}

type Margin = { marginTop: number; marginBottom: number }

/**
 * Computes a collapsed marginTop/marginBottom per block, index-aligned with
 * `blocks`. Mirrors CSS's adjacent-margin collapse: the gap between any two
 * elements is the larger of "this element's own top margin" and "the
 * previous element's own bottom margin", not the sum of both.
 */
function collapseMargins(blocks: PdfBlock[]): Margin[] {
  const ownMargins = blocks.map(ownMarginsFor)
  return ownMargins.map((own, index) => ({
    marginTop: index === 0 ? 0 : Math.max(own.top, ownMargins[index - 1].bottom),
    marginBottom: index === ownMargins.length - 1 ? own.bottom : 0,
  }))
}

function withAlign(base: TextStyle, align?: PdfAlign): TextStyle {
  return align ? [base, { textAlign: align }].flat() : base
}

function withMargin(base: TextStyle, margin: Margin): TextStyle {
  return [base, margin].flat()
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
            : // No override — inherit the block's own family (Geist body /
              // Fraunces heading). A previous version of this function
              // always forced 'Helvetica' here, which silently overrode
              // every heading's bold family on any run without an inline
              // mark (i.e. nearly every heading), rendering them in regular
              // weight instead of the heading's intended weight.
              undefined

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

function renderBlock(block: PdfBlock, index: number, margin: Margin) {
  switch (block.kind) {
    case 'heading':
      return Runs(
        index,
        block.runs,
        withMargin(withAlign(headingStyle(block.level), block.align), margin),
      )

    case 'paragraph':
      return Runs(index, block.runs, withMargin(withAlign(styles.paragraph, block.align), margin))

    case 'blockquote':
      return Runs(index, block.runs, withMargin(styles.blockquote, margin))

    case 'codeBlock':
      return h(Text, { key: index, style: withMargin(styles.code, margin) }, block.text)

    case 'horizontalRule':
      return h(View, { key: index, style: withMargin(styles.hr, margin) })

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
        { key: index, style: [styles.listItem, { marginLeft: block.depth * 18 }, margin] },
        h(Text, { style: styles.listMarker }, marker),
        Runs(undefined, block.runs, styles.listContent),
      )
    }

    case 'table':
      return h(
        View,
        { key: index, style: withMargin(styles.table, margin) },
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
  const margins = collapseMargins(blocks)
  return h(
    Document,
    { title },
    h(
      Page,
      { size: 'A4', style: styles.page, wrap: true },
      blocks.map((block, index) => renderBlock(block, index, margins[index])),
    ),
  )
}
