type TiptapNode = {
  type?: string
  text?: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  marks?: { type?: string; attrs?: Record<string, unknown> }[]
}

type ExportFormat = 'pdf' | 'docx' | 'txt' | 'md'

interface TextBlock {
  type: 'paragraph' | 'heading' | 'bullet' | 'numbered' | 'quote' | 'code'
  text: string
  level?: number
}

export function exportDocument(json: TiptapNode, title: string, format: ExportFormat) {
  const safeTitle = slugify(title || 'Meridian document')
  const blocks = getTextBlocks(json)

  if (format === 'txt') {
    downloadBlob(`${safeTitle}.txt`, new Blob([blocksToPlainText(blocks)], { type: 'text/plain' }))
    return
  }

  if (format === 'md') {
    downloadBlob(`${safeTitle}.md`, new Blob([blocksToMarkdown(blocks)], { type: 'text/markdown' }))
    return
  }

  if (format === 'pdf') {
    downloadBlob(`${safeTitle}.pdf`, createPdf(blocks), 'application/pdf')
    return
  }

  downloadBlob(
    `${safeTitle}.docx`,
    createDocx(blocks),
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )
}

function getTextBlocks(root: TiptapNode): TextBlock[] {
  const blocks: TextBlock[] = []

  function visit(node: TiptapNode, listKind?: 'bullet' | 'numbered') {
    if (node.type === 'paragraph') {
      blocks.push({ type: listKind ?? 'paragraph', text: getText(node) })
      return
    }

    if (node.type === 'heading') {
      blocks.push({
        type: 'heading',
        text: getText(node),
        level: typeof node.attrs?.level === 'number' ? node.attrs.level : 1,
      })
      return
    }

    if (node.type === 'blockquote') {
      blocks.push({ type: 'quote', text: getText(node) })
      return
    }

    if (node.type === 'codeBlock') {
      blocks.push({ type: 'code', text: getText(node) })
      return
    }

    if (node.type === 'bulletList' || node.type === 'orderedList') {
      node.content?.forEach((child) =>
        visit(child, node.type === 'bulletList' ? 'bullet' : 'numbered'),
      )
      return
    }

    if (node.type === 'listItem') {
      const paragraph = node.content?.find((child) => child.type === 'paragraph')
      blocks.push({
        type: listKind ?? 'bullet',
        text: paragraph ? getText(paragraph) : getText(node),
      })
      return
    }

    node.content?.forEach((child) => visit(child, listKind))
  }

  visit(root)
  return blocks.filter((block) => block.text.trim().length > 0)
}

function getText(node: TiptapNode): string {
  if (node.text) return node.text
  return node.content?.map(getText).join('') ?? ''
}

function blocksToPlainText(blocks: TextBlock[]) {
  return blocks
    .map((block, index) => {
      if (block.type === 'bullet') return `- ${block.text}`
      if (block.type === 'numbered') return `${index + 1}. ${block.text}`
      return block.text
    })
    .join('\n\n')
}

function blocksToMarkdown(blocks: TextBlock[]) {
  let orderedIndex = 1

  return blocks
    .map((block) => {
      if (block.type !== 'numbered') orderedIndex = 1
      if (block.type === 'heading') return `${'#'.repeat(block.level ?? 1)} ${block.text}`
      if (block.type === 'bullet') return `- ${block.text}`
      if (block.type === 'numbered') return `${orderedIndex++}. ${block.text}`
      if (block.type === 'quote') return `> ${block.text}`
      if (block.type === 'code') return ['```', block.text, '```'].join('\n')
      return block.text
    })
    .join('\n\n')
}

function createPdf(blocks: TextBlock[]) {
  const pageWidth = 612
  const pageHeight = 792
  const margin = 72
  const lineHeight = 16
  const maxChars = 86
  const pages: string[][] = [[]]
  let y = pageHeight - margin

  blocksToPlainText(blocks)
    .split('\n')
    .flatMap((line) => (line ? wrapLine(line, maxChars) : ['']))
    .forEach((line) => {
      if (y < margin) {
        pages.push([])
        y = pageHeight - margin
      }
      pages[pages.length - 1].push(line)
      y -= line ? lineHeight : lineHeight / 2
    })

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${pages.map((_, i) => `${3 + i * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`,
  ]

  pages.forEach((lines, index) => {
    const pageObject = 3 + index * 2
    const contentObject = pageObject + 1
    const stream = [
      'BT',
      '/F1 11 Tf',
      `1 0 0 1 ${margin} ${pageHeight - margin} Tm`,
      `${lineHeight} TL`,
      ...lines.map((line) => `(${escapePdf(line)}) Tj T*`),
      'ET',
    ].join('\n')

    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >> >> >> /Contents ${contentObject} 0 R >>`,
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    )
  })

  const chunks = ['%PDF-1.4\n']
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(chunks.join('').length)
    chunks.push(`${index + 1} 0 obj\n${object}\nendobj\n`)
  })
  const xrefOffset = chunks.join('').length
  chunks.push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`)
  offsets
    .slice(1)
    .forEach((offset) => chunks.push(`${String(offset).padStart(10, '0')} 00000 n \n`))
  chunks.push(
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
  )

  return new Blob(chunks, { type: 'application/pdf' })
}

function createDocx(blocks: TextBlock[]) {
  const files = new Map<string, string>()
  files.set(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
  )
  files.set(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
  )
  files.set(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${blocks.map(blockToDocxParagraph).join('')}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`,
  )

  return new Blob([zipStore(files)], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}

function blockToDocxParagraph(block: TextBlock) {
  const text =
    block.type === 'bullet'
      ? `• ${block.text}`
      : block.type === 'numbered'
        ? `1. ${block.text}`
        : block.text
  const style =
    block.type === 'heading'
      ? `<w:pPr><w:pStyle w:val="Heading${Math.min(block.level ?? 1, 3)}"/></w:pPr>`
      : ''
  return `<w:p>${style}<w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`
}

function zipStore(files: Map<string, string>) {
  const encoder = new TextEncoder()
  const parts: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0

  files.forEach((content, name) => {
    const nameBytes = encoder.encode(name)
    const contentBytes = encoder.encode(content)
    const crc = crc32(contentBytes)
    const local = concat([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(contentBytes.length),
      u32(contentBytes.length),
      u16(nameBytes.length),
      u16(0),
      nameBytes,
      contentBytes,
    ])
    parts.push(local)

    central.push(
      concat([
        u32(0x02014b50),
        u16(20),
        u16(20),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(crc),
        u32(contentBytes.length),
        u32(contentBytes.length),
        u16(nameBytes.length),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(0),
        u32(offset),
        nameBytes,
      ]),
    )

    offset += local.length
  })

  const centralStart = offset
  const centralDirectory = concat(central)
  const end = concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.size),
    u16(files.size),
    u32(centralDirectory.length),
    u32(centralStart),
    u16(0),
  ])

  return concat([...parts, centralDirectory, end])
}

function crc32(bytes: Uint8Array) {
  let crc = -1
  for (const byte of bytes) {
    crc ^= byte
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (crc ^ -1) >>> 0
}

function u16(value: number) {
  return new Uint8Array([value & 0xff, (value >>> 8) & 0xff])
}

function u32(value: number) {
  return new Uint8Array([
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  ])
}

function concat(parts: Uint8Array[]) {
  const merged = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0))
  let offset = 0
  parts.forEach((part) => {
    merged.set(part, offset)
    offset += part.length
  })
  return merged
}

function wrapLine(line: string, maxChars: number) {
  const words = line.split(/\s+/)
  const lines: string[] = []
  let current = ''

  words.forEach((word) => {
    if (`${current} ${word}`.trim().length > maxChars) {
      if (current) lines.push(current)
      current = word
    } else {
      current = `${current} ${word}`.trim()
    }
  })

  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

function downloadBlob(filename: string, blob: Blob, type = blob.type) {
  const url = URL.createObjectURL(type === blob.type ? blob : new Blob([blob], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function escapePdf(value: string) {
  return value.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)')
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'meridian-document'
  )
}
