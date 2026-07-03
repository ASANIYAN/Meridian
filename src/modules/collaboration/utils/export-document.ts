type TiptapNode = {
  type?: string
  text?: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  marks?: { type?: string; attrs?: Record<string, unknown> }[]
}

type ExportFormat = 'docx' | 'txt' | 'md'

interface TextBlock {
  type: 'paragraph' | 'heading' | 'bullet' | 'numbered' | 'quote' | 'code'
  runs: TextRun[]
  level?: number
  align?: 'left' | 'center' | 'right' | 'justify'
}

interface TextRun {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strike?: boolean
  code?: boolean
  highlight?: boolean
  link?: boolean
  color?: string
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
      blocks.push({
        type: listKind ?? 'paragraph',
        runs: getRuns(node),
        align: readAlign(node),
      })
      return
    }

    if (node.type === 'heading') {
      blocks.push({
        type: 'heading',
        runs: getRuns(node),
        level: typeof node.attrs?.level === 'number' ? node.attrs.level : 1,
        align: readAlign(node),
      })
      return
    }

    if (node.type === 'blockquote') {
      blocks.push({ type: 'quote', runs: getRuns(node) })
      return
    }

    if (node.type === 'codeBlock') {
      blocks.push({ type: 'code', runs: [{ text: getText(node), code: true }] })
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
        runs: paragraph ? getRuns(paragraph) : getRuns(node),
        align: paragraph ? readAlign(paragraph) : readAlign(node),
      })
      return
    }

    node.content?.forEach((child) => visit(child, listKind))
  }

  visit(root)
  return blocks.filter((block) => blockText(block).trim().length > 0)
}

function getText(node: TiptapNode): string {
  if (node.text) return node.text
  return node.content?.map(getText).join('') ?? ''
}

function getRuns(node: TiptapNode): TextRun[] {
  if (node.text) return [{ text: node.text, ...marksToRun(node.marks) }]
  return compactRuns(node.content?.flatMap(getRuns) ?? [])
}

function marksToRun(marks: TiptapNode['marks']): Omit<TextRun, 'text'> {
  const run: Omit<TextRun, 'text'> = {}
  marks?.forEach((mark) => {
    if (mark.type === 'bold') run.bold = true
    if (mark.type === 'italic') run.italic = true
    if (mark.type === 'underline') run.underline = true
    if (mark.type === 'strike') run.strike = true
    if (mark.type === 'code') run.code = true
    if (mark.type === 'highlight') run.highlight = true
    if (mark.type === 'link') {
      run.link = true
      run.underline = true
    }
    if (mark.type === 'textStyle' && typeof mark.attrs?.color === 'string') {
      run.color = mark.attrs.color
    }
  })
  return run
}

function compactRuns(runs: TextRun[]) {
  const compact: TextRun[] = []
  runs.forEach((run) => {
    const previous = compact.at(-1)
    if (previous && sameRunStyle(previous, run)) previous.text += run.text
    else compact.push({ ...run })
  })
  return compact
}

function sameRunStyle(a: TextRun, b: TextRun) {
  return (
    a.bold === b.bold &&
    a.italic === b.italic &&
    a.underline === b.underline &&
    a.strike === b.strike &&
    a.code === b.code &&
    a.highlight === b.highlight &&
    a.link === b.link &&
    a.color === b.color
  )
}

function readAlign(node: TiptapNode): TextBlock['align'] {
  const align = node.attrs?.textAlign
  return align === 'center' || align === 'right' || align === 'justify' ? align : undefined
}

function blockText(block: TextBlock) {
  return block.runs.map((run) => run.text).join('')
}

function blocksToPlainText(blocks: TextBlock[]) {
  return blocks
    .map((block, index) => {
      const text = blockText(block)
      if (block.type === 'bullet') return `- ${text}`
      if (block.type === 'numbered') return `${index + 1}. ${text}`
      return text
    })
    .join('\n\n')
}

function blocksToMarkdown(blocks: TextBlock[]) {
  let orderedIndex = 1

  return blocks
    .map((block) => {
      if (block.type !== 'numbered') orderedIndex = 1
      const text = blockText(block)
      if (block.type === 'heading') return `${'#'.repeat(block.level ?? 1)} ${text}`
      if (block.type === 'bullet') return `- ${text}`
      if (block.type === 'numbered') return `${orderedIndex++}. ${text}`
      if (block.type === 'quote') return `> ${text}`
      if (block.type === 'code') return ['```', text, '```'].join('\n')
      return text
    })
    .join('\n\n')
}

function createDocx(blocks: TextBlock[]) {
  const files = new Map<string, string>()
  let orderedIndex = 1
  const paragraphs = blocks
    .map((block) => {
      if (block.type !== 'numbered') orderedIndex = 1
      const paragraph = blockToDocxParagraph(block, orderedIndex)
      if (block.type === 'numbered') orderedIndex += 1
      return paragraph
    })
    .join('')
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
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`,
  )

  return new Blob([zipStore(files)], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}

function blockToDocxParagraph(block: TextBlock, orderedIndex: number) {
  const prefix =
    block.type === 'bullet' ? '• ' : block.type === 'numbered' ? `${orderedIndex}. ` : ''
  const paragraphProps = [
    block.type === 'heading' ? `<w:pStyle w:val="Heading${Math.min(block.level ?? 1, 3)}"/>` : '',
    block.type === 'quote' ? '<w:ind w:left="360"/><w:i/>' : '',
    block.align ? `<w:jc w:val="${block.align}"/>` : '',
  ].join('')
  const runs = [{ text: prefix }, ...block.runs].filter((run) => run.text.length > 0)
  return `<w:p>${paragraphProps ? `<w:pPr>${paragraphProps}</w:pPr>` : ''}${runs
    .map((run) => runToDocx(run, block.type === 'code'))
    .join('')}</w:p>`
}

function runToDocx(run: TextRun, forceCode = false) {
  const color = normalizeHexColor(run.link ? (run.color ?? '#2563eb') : run.color)
  const props = [
    run.bold ? '<w:b/>' : '',
    run.italic ? '<w:i/>' : '',
    run.underline ? '<w:u w:val="single"/>' : '',
    run.strike ? '<w:strike/>' : '',
    run.highlight ? '<w:highlight w:val="yellow"/>' : '',
    run.code || forceCode ? '<w:rStyle w:val="Code"/><w:rFonts w:ascii="Courier New"/>' : '',
    color ? `<w:color w:val="${color}"/>` : '',
  ].join('')
  return `<w:r>${props ? `<w:rPr>${props}</w:rPr>` : ''}<w:t xml:space="preserve">${escapeXml(
    run.text,
  )}</w:t></w:r>`
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

export function downloadBlob(filename: string, blob: Blob, type = blob.type) {
  const url = URL.createObjectURL(type === blob.type ? blob : new Blob([blob], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function normalizeHexColor(value?: string) {
  if (!value) return undefined
  const color = value.trim()
  if (/^#[0-9a-f]{6}$/i.test(color)) return color.slice(1)
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    const [, r, g, b] = color
    return `${r}${r}${g}${g}${b}${b}`
  }
  return undefined
}

export function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'meridian-document'
  )
}
