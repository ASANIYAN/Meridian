import { Button } from '@/components/ui/button'
import type { WireDocumentStatus } from '@/types/document'
import { useDocumentStatus } from '../hooks/use-document-status'

interface DocumentStatusToggleProps {
  documentId: string
  status: WireDocumentStatus
}

/**
 * Author-only active/inactive toggle (FE-DOC-6). A `draft` document activates on
 * first toggle. The mutation is optimistic, so the button's own label flips the
 * moment it's clicked (its `status` prop comes from the optimistically-patched
 * cache).
 */
export function DocumentStatusToggle({ documentId, status }: DocumentStatusToggleProps) {
  const mutation = useDocumentStatus(documentId)
  const isActive = status === 'active'

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate(isActive ? 'inactive' : 'active')}
    >
      {isActive ? 'Set inactive' : 'Set active'}
    </Button>
  )
}
