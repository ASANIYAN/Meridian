import { useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteDocument } from '../hooks/use-delete-document'

interface DeleteDocumentDialogProps {
  documentId: string
  title: string
}

/**
 * Soft-delete confirmation (FE-DOC-5). Deliberately non-optimistic — the author
 * waits for the server to confirm before we navigate away (CLAUDE.md §8), so the
 * dialog stays open with a pending button until the mutation resolves.
 */
export function DeleteDocumentDialog({ documentId, title }: DeleteDocumentDialogProps) {
  const [open, setOpen] = useState(false)
  const remove = useDeleteDocument(documentId)

  function handleOpenChange(next: boolean) {
    // Don't let the dialog close out from under an in-flight delete.
    if (remove.isPending) return
    setOpen(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this document?</DialogTitle>
          <DialogDescription>
            “{title}” will be removed from your documents. Collaborators lose access immediately.
            This can't be undone from here.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2.5">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={remove.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="primary"
            disabled={remove.isPending}
            onClick={() => remove.mutate()}
          >
            {remove.isPending ? 'Deleting…' : 'Delete document'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
