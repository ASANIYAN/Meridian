import { createElement } from 'react'
import { pdf } from '@react-pdf/renderer'
import { describe, expect, it } from 'vitest'
import { buildPdfBlocks } from './pdf-content-model'
import { MeridianPdfDocument } from './pdf-document'

/**
 * Exercises the exact same code path the Web Worker runs (pdf.worker.ts),
 * just off the main thread of the test runner instead of a real worker —
 * confirms @react-pdf/renderer actually produces valid PDF bytes from the
 * converted content tree, not just that the converter's data shape is right.
 */
describe('PDF generation pipeline', () => {
  it('renders headings, mixed marks, a nested list, and a link into a valid PDF', async () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Meridian' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Overview' }] },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'This is ' },
            { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' and ' },
            { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
            { type: 'text', text: '.' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'See ' },
            {
              type: 'text',
              text: 'the docs',
              marks: [{ type: 'link', attrs: { href: 'https://example.com/docs' } }],
            },
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'Top' }] },
                {
                  type: 'bulletList',
                  content: [
                    {
                      type: 'listItem',
                      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nested' }] }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }

    const blocks = buildPdfBlocks(doc)
    const blob = await pdf(
      createElement(MeridianPdfDocument, { title: 'Meridian document', blocks }),
    ).toBlob()

    expect(blob.size).toBeGreaterThan(0)
    const header = new TextDecoder().decode(new Uint8Array(await blob.arrayBuffer()).slice(0, 5))
    expect(header).toBe('%PDF-')
  })

  it('renders a long document (many paragraphs) without throwing', async () => {
    const paragraphs = Array.from({ length: 500 }, (_, i) => ({
      type: 'paragraph',
      content: [
        { type: 'text', text: `Paragraph number ${i} with some representative body text.` },
      ],
    }))
    const blocks = buildPdfBlocks({ type: 'doc', content: paragraphs })

    const blob = await pdf(
      createElement(MeridianPdfDocument, { title: 'Long document', blocks }),
    ).toBlob()
    expect(blob.size).toBeGreaterThan(0)
  })
})
