import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import { useCollaboration } from '../../hooks/use-collaboration'
import { EditorToolbar } from './editor-toolbar'

/**
 * Tiptap bound to the provider's Y.Doc via the official collaboration extension
 * (FE-EDITOR-1). Yjs owns history, so StarterKit's undo/redo is disabled. The
 * viewer role gets a non-editable surface with no toolbar — defense in depth, not
 * relying on the backend's silent rejection alone (FE-EDITOR-3).
 */
export function DocumentEditor() {
  const { doc, role } = useCollaboration()
  const editable = role !== 'viewer'

  const editor = useEditor({
    editable,
    extensions: [
      StarterKit.configure({ undoRedo: false }),
      Collaboration.configure({ document: doc }),
    ],
    editorProps: { attributes: { spellcheck: 'true' } },
  })

  if (!editor) return null

  return (
    <div className="meridian-editor">
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}
