import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/custom-components/confirm-dialog'
import { useDeleteDocument } from '../hooks/use-delete-document'

interface DeleteDocumentDialogProps {
  documentId: string
  title: string
}

/**
 * Soft-delete confirmation (FE-DOC-5). Deliberately non-optimistic — the author
 * waits for the server to confirm before we navigate away (CLAUDE.md §8). The
 * shared ConfirmDialog keeps the dialog open until the mutation settles (it
 * awaits mutateAsync), then the success handler navigates back to the list.
 */
export function DeleteDocumentDialog({ documentId, title }: DeleteDocumentDialogProps) {
  const remove = useDeleteDocument(documentId)

  return (
    <ConfirmDialog
      tone="danger"
      title="Delete this document?"
      description={
        <>
          “{title}” will be removed from your documents. Collaborators lose access immediately. This
          can't be undone from here.
        </>
      }
      confirmLabel="Delete document"
      pendingLabel="Deleting…"
      onConfirm={() => remove.mutateAsync()}
      trigger={
        <Button variant="danger-outline" size="sm">
          Delete
        </Button>
      }
    />
  )
}
