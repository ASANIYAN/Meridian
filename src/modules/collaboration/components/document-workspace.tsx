import { Skeleton } from '@/components/custom-components/skeleton'
import { useCollaboration } from '../hooks/use-collaboration'
import { DocumentEditor } from './editor/document-editor'

/**
 * Gates the editor behind hydration (FE-EDITOR-4): the editor must not mount
 * before the join sequence has produced a hydrated Y.Doc, or it would bind to an
 * empty/incorrect document. React destroys the editor cleanly on unmount.
 */
export function DocumentWorkspace() {
  const { ready } = useCollaboration()

  return (
    <div className="mx-auto max-w-[68ch]">
      {ready ? <DocumentEditor /> : <EditorLoading />}
    </div>
  )
}

function EditorLoading() {
  return (
    <div className="space-y-3 py-4" aria-busy="true" aria-label="Loading document">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className="h-4 w-10/12" />
      <Skeleton className="h-4 w-8/12" />
    </div>
  )
}
