import * as React from 'react'
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

interface ConfirmDialogProps {
  /** The element that opens the dialog (rendered via Radix `asChild`). */
  trigger: React.ReactNode
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  /** Shown on the confirm button while `onConfirm` is in flight. */
  pendingLabel?: string
  cancelLabel?: string
  /** `danger` paints the confirm button coral for genuinely destructive actions. */
  tone?: 'default' | 'danger'
  /**
   * Runs on confirm. If it returns a promise the dialog stays open (confirm
   * button disabled) until it settles — closing on resolve, staying open on
   * reject so the user can retry after the caller's error toast.
   */
  onConfirm: () => void | Promise<unknown>
}

/**
 * The single confirmation surface for destructive / irreversible actions —
 * sign out, delete a document, revoke a share link (CLAUDE.md §8: these wait for
 * a real, server-acknowledged result rather than going optimistic). Manages its
 * own open + pending state so callers only supply copy and an `onConfirm`.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = 'Confirm',
  pendingLabel,
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleConfirm() {
    try {
      setPending(true)
      await onConfirm()
      setOpen(false)
    } catch {
      // The caller surfaces the failure (an error toast); keep the dialog open
      // so the action can be retried rather than silently swallowing it.
    } finally {
      setPending(false)
    }
  }

  function handleOpenChange(next: boolean) {
    // Never let the dialog close out from under an in-flight confirm.
    if (pending) return
    setOpen(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-100">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="flex justify-end gap-2.5">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={tone === 'danger' ? 'danger' : 'primary'}
            disabled={pending}
            onClick={handleConfirm}
          >
            {pending ? (pendingLabel ?? confirmLabel) : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
