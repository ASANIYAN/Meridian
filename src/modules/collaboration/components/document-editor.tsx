import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
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
        // undoRedo off → Collaboration owns history; openOnClick off → clicking a
        // link places the cursor for editing rather than navigating away.
        StarterKit.configure({ undoRedo: false, link: { openOnClick: false } }),
        Collaboration.configure({ document: doc }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Highlight,
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
    <>
      {/* Formatting bar — a full-width band on the app surface that sticks under
          the app header (h-15) as you scroll, controls centered to the page
          column. Viewers get a read-only marker instead. */}
      <div className="sticky top-15 z-20 border-y border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-5xl px-5">
          {editable && editor ? (
            <EditorToolbar editor={editor} />
          ) : (
            <p className="py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Read-only · viewer
            </p>
          )}
        </div>
      </div>

      {/* The canvas — a full-bleed grey "desk" that fills the rest of the
          viewport, with the white page sheet floating centered on it (Google-Docs
          structure). flex-1 makes it grow to fill; the page keeps its own
          min-height so the sheet always reads as a page. */}
      <div className="flex-1 bg-muted/60 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-lg border border-border bg-card shadow-[0_1px_2px_rgba(15,26,42,0.05),0_18px_44px_-24px_rgba(15,26,42,0.22)]">
          <EditorContent editor={editor} />
        </div>
      </div>
    </>
  )
}
