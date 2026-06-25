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
import { FormField } from '@/components/custom-components/form-field'
import { FormError } from '@/components/custom-components/form-error'
import { useCreateDocument } from '../hooks/use-create-document'

/**
 * Create-document modal (FE-DOC-2). Title-only form; on success the hook
 * invalidates the list, closes this modal, and navigates into the new document.
 */
export function CreateDocumentModal({ triggerLabel = 'New document' }: { triggerLabel?: string }) {
  const [open, setOpen] = useState(false)
  const { form, onSubmit, isPending } = useCreateDocument(() => setOpen(false))
  const rootError = form.formState.errors.root?.message

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="primary">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New document</DialogTitle>
          <DialogDescription>Give it a title. You can rename it any time.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <FormError message={rootError} />
          <FormField
            control={form.control}
            name="title"
            label="Title"
            autoFocus
            placeholder="Untitled meridian"
            autoComplete="off"
          />
          <div className="flex justify-end gap-2.5">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending ? 'Creating…' : 'Create document'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
