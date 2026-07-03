import { useCallback, useRef, useState } from 'react'
import { useToastStore } from '@/store/toast-store'
import { buildPdfBlocks } from '../utils/pdf-export/pdf-content-model'
import { downloadBlob, slugify } from '../utils/export-document'
import type { PdfWorkerRequest, PdfWorkerResponse } from '../utils/pdf-export/pdf.worker'

type TiptapDocNode = Parameters<typeof buildPdfBlocks>[0]

/**
 * Generates a PDF for the current document off the main thread — see
 * pdf.worker.ts. A fresh worker is spun up per download and terminated once
 * it resolves (success, error, or a low-level worker crash), so a failed run
 * can never leave the button permanently stuck in a loading state.
 */
export function useDownloadPdf() {
  const [isGenerating, setIsGenerating] = useState(false)
  const workerRef = useRef<Worker | null>(null)
  const addToast = useToastStore((state) => state.addToast)

  const downloadPdf = useCallback(
    (json: TiptapDocNode, title: string) => {
      if (isGenerating) return

      setIsGenerating(true)
      const worker = new Worker(new URL('../utils/pdf-export/pdf.worker.ts', import.meta.url), {
        type: 'module',
      })
      workerRef.current = worker

      const finish = () => {
        worker.terminate()
        if (workerRef.current === worker) workerRef.current = null
        setIsGenerating(false)
      }

      worker.onmessage = (event: MessageEvent<PdfWorkerResponse>) => {
        if (event.data.status === 'success') {
          downloadBlob(
            `${slugify(title || 'Meridian document')}.pdf`,
            event.data.blob,
            'application/pdf',
          )
        } else {
          addToast({
            message: event.data.message || 'Could not generate the PDF.',
            variant: 'error',
          })
        }
        finish()
      }

      worker.onerror = () => {
        addToast({ message: 'Could not generate the PDF.', variant: 'error' })
        finish()
      }

      const request: PdfWorkerRequest = { title, blocks: buildPdfBlocks(json) }
      worker.postMessage(request)
    },
    [isGenerating, addToast],
  )

  return { downloadPdf, isGenerating }
}
