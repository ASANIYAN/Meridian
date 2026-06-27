import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import Placeholder from '@tiptap/extension-placeholder'
import type * as Y from 'yjs'
import { EditorToolbar } from './editor-toolbar'

interface DocumentEditorProps {
  /** The already-hydrated shared doc from the route's connection (CLAUDE.md §4). */
  doc: Y.Doc
  /** Viewers get a read-only editor; their edits are dropped server-side anyway. */
  editable: boolean
}

/**
 * The real Tiptap editor (CLAUDE.md §2) — a pure consumer of the shared Y.Doc,
 * never an owner of the connection (§4 ownership rule). The official
 * Collaboration extension binds Tiptap to the doc's default XML fragment, so
 * local edits flow out through the provider's `update` listener and remote
 * updates merge in via the same CRDT path. StarterKit's own undo/redo is
 * disabled because Collaboration provides Yjs-backed history instead — running
 * both would corrupt the shared history.
 */
export function DocumentEditor({ doc, editable }: DocumentEditorProps) {
  const editor = useEditor(
    {
      editable,
      extensions: [
        StarterKit.configure({ undoRedo: false }),
        Collaboration.configure({ document: doc }),
        Placeholder.configure({
          placeholder: editable ? 'Start writing…' : 'This document is empty.',
        }),
      ],
      editorProps: {
        attributes: {
          class: 'meridian-editor focus:outline-none',
          spellcheck: 'true',
        },
      },
    },
    // Rebuild the editor if the doc instance changes (a new document visit).
    [doc],
  )

  // Role can resolve after first paint (deep-links read it from GET /documents/:id).
  useEffect(() => {
    editor?.setEditable(editable)
  }, [editor, editable])

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      {editable && editor && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}
