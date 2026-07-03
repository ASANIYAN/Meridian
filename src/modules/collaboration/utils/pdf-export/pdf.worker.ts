import { createElement } from 'react'
import { pdf } from '@react-pdf/renderer'
import { MeridianPdfDocument } from './pdf-document'
import type { PdfBlock } from './pdf-content-model'

/**
 * Runs entirely off the main thread (Vite native module worker — see
 * use-download-pdf.ts for the `new Worker(new URL(...))` call site). React's
 * DOM renderer never loads here: @react-pdf/renderer uses its own
 * react-reconciler targeting PDF primitives, so nothing in this file touches
 * `window`/`document`.
 */

export interface PdfWorkerRequest {
  title: string
  blocks: PdfBlock[]
}

export type PdfWorkerResponse =
  | { status: 'success'; blob: Blob }
  | { status: 'error'; message: string }

self.onmessage = async (event: MessageEvent<PdfWorkerRequest>) => {
  const { title, blocks } = event.data

  try {
    const blob = await pdf(createElement(MeridianPdfDocument, { title, blocks })).toBlob()
    const response: PdfWorkerResponse = { status: 'success', blob }
    self.postMessage(response)
  } catch (error) {
    const response: PdfWorkerResponse = {
      status: 'error',
      message: error instanceof Error ? error.message : 'PDF generation failed.',
    }
    self.postMessage(response)
  }
}
