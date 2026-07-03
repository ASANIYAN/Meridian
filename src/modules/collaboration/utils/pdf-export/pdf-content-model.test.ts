import { describe, expect, it } from 'vitest'
import { buildPdfBlocks } from './pdf-content-model'

describe('buildPdfBlocks', () => {
  it('converts headings, mixed marks, nested lists, and a link', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Title' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Subtitle' }] },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hello ' },
            { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' and ' },
            { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
            { type: 'text', text: '.' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Visit ' },
            {
              type: 'text',
              text: 'Meridian',
              marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
            },
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'Top level' }] },
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

    expect(blocks[0]).toMatchObject({ kind: 'heading', level: 1, runs: [{ text: 'Title' }] })
    expect(blocks[1]).toMatchObject({ kind: 'heading', level: 2, runs: [{ text: 'Subtitle' }] })

    const paragraph = blocks[2]
    expect(paragraph.kind).toBe('paragraph')
    if (paragraph.kind === 'paragraph') {
      expect(paragraph.runs).toEqual([
        { text: 'Hello ' },
        { text: 'bold', bold: true },
        { text: ' and ' },
        { text: 'italic', italic: true },
        { text: '.' },
      ])
    }

    const linkParagraph = blocks[3]
    expect(linkParagraph.kind).toBe('paragraph')
    if (linkParagraph.kind === 'paragraph') {
      expect(linkParagraph.runs).toEqual([
        { text: 'Visit ' },
        { text: 'Meridian', href: 'https://example.com' },
      ])
    }

    const topItem = blocks[4]
    const nestedItem = blocks[5]
    expect(topItem).toMatchObject({ kind: 'listItem', depth: 0, ordered: false })
    expect(nestedItem).toMatchObject({ kind: 'listItem', depth: 1, ordered: false })
  })

  it('numbers an ordered list sequentially', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'First' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Second' }] }],
            },
          ],
        },
      ],
    }

    const blocks = buildPdfBlocks(doc)
    expect(blocks).toMatchObject([
      { kind: 'listItem', ordered: true, index: 1 },
      { kind: 'listItem', ordered: true, index: 2 },
    ])
  })

  it('marks a task item checked state', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: true },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Done' }] }],
            },
          ],
        },
      ],
    }

    const blocks = buildPdfBlocks(doc)
    expect(blocks[0]).toMatchObject({ kind: 'listItem', checked: true })
  })

  it('converts a table into header/data rows and cells', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableHeader',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Name' }] }],
                },
                {
                  type: 'tableHeader',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Role' }] }],
                },
              ],
            },
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ada' }] }],
                },
                {
                  type: 'tableCell',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Author' }] }],
                },
              ],
            },
          ],
        },
      ],
    }

    const blocks = buildPdfBlocks(doc)
    expect(blocks[0]).toMatchObject({
      kind: 'table',
      rows: [
        {
          cells: [
            { header: true, runs: [{ text: 'Name' }] },
            { header: true, runs: [{ text: 'Role' }] },
          ],
        },
        {
          cells: [
            { header: false, runs: [{ text: 'Ada' }] },
            { header: false, runs: [{ text: 'Author' }] },
          ],
        },
      ],
    })
  })

  it('extracts code block text verbatim', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'codeBlock',
          content: [{ type: 'text', text: 'const x = 1' }],
        },
      ],
    }

    expect(buildPdfBlocks(doc)[0]).toMatchObject({ kind: 'codeBlock', text: 'const x = 1' })
  })
})
