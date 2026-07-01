import { useEffect } from 'react'
import { type Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import type * as Y from 'yjs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EditorToolbar } from './editor-toolbar'
import { exportDocument } from '../utils/export-document'

interface DocumentEditorProps {
  /** The already-hydrated shared doc from the route's connection (CLAUDE.md §4). */
  doc: Y.Doc
  /** Best known title, used for client-side export filenames. */
  title?: string
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
export function DocumentEditor({
  doc,
  title = 'Meridian document',
  editable,
}: DocumentEditorProps) {
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
      <div className="sticky top-15 z-20 border-y border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-6xl px-3 sm:px-5">
          <EditorCommandBar editor={editor} title={title} />
          <div className="mx-auto flex min-h-11 w-full max-w-[816px] items-center overflow-x-auto rounded-full bg-muted/60 px-2">
            {editable && editor ? (
              <EditorToolbar editor={editor} />
            ) : (
              <p className="py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Read-only · viewer
              </p>
            )}
          </div>
          <PageRuler />
        </div>
      </div>

      {/* The canvas — a full-bleed grey "desk" that fills the rest of the
          viewport, with the white page sheet floating centered on it (Google-Docs
          structure). flex-1 makes it grow to fill; the page keeps its own
          min-height so the sheet always reads as a page. */}
      <div className="flex-1 bg-muted/60 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto w-full max-w-[816px] border border-border bg-card shadow-[0_1px_2px_rgba(15,26,42,0.05),0_18px_44px_-24px_rgba(15,26,42,0.22)]">
          <div
            className="min-h-[1056px] px-6 py-14 sm:px-14 sm:py-16"
            onClick={() => editor?.chain().focus().run()}
          >
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </>
  )
}

function EditorCommandBar({ editor, title }: { editor: Editor | null; title: string }) {
  const exportAs = (format: 'pdf' | 'docx' | 'txt' | 'md') => {
    if (!editor) return
    exportDocument(editor.getJSON(), title, format, { editorElement: editor.view.dom })
  }

  return (
    <div className="flex h-9 items-center gap-1 overflow-x-auto font-sans text-sm text-foreground">
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded px-3 py-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35">
          File
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-56">
          <DropdownMenuLabel>Download</DropdownMenuLabel>
          <DropdownMenuItem disabled={!editor} onSelect={() => exportAs('pdf')}>
            PDF document
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!editor} onSelect={() => exportAs('docx')}>
            Word document
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!editor} onSelect={() => exportAs('md')}>
            Markdown
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!editor} onSelect={() => exportAs('txt')}>
            Plain text
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger className="rounded px-3 py-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35">
          Edit
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            disabled={!editor?.can().undo()}
            onSelect={() => editor?.chain().focus().undo().run()}
          >
            Undo
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!editor?.can().redo()}
            onSelect={() => editor?.chain().focus().redo().run()}
          >
            Redo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger className="rounded px-3 py-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35">
          Insert
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-48">
          <DropdownMenuItem
            disabled={!editor}
            onSelect={() => editor?.chain().focus().setHorizontalRule().run()}
          >
            Divider
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>Image</DropdownMenuItem>
          <DropdownMenuItem disabled>Table</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger className="rounded px-3 py-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35">
          Format
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-44">
          <DropdownMenuItem
            disabled={!editor}
            onSelect={() => editor?.chain().focus().toggleBold().run()}
          >
            Bold
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!editor}
            onSelect={() => editor?.chain().focus().toggleItalic().run()}
          >
            Italic
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!editor}
            onSelect={() => editor?.chain().focus().toggleHighlight().run()}
          >
            Highlight
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        type="button"
        className="rounded px-3 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
      >
        Tools
      </button>
    </div>
  )
}

function PageRuler() {
  return (
    <div className="mx-auto hidden h-5 w-full max-w-[816px] items-end border-b border-border/80 px-14 text-[10px] text-muted-foreground sm:flex">
      {Array.from({ length: 9 }, (_, index) => (
        <div key={index} className="relative flex-1 border-l border-border/80 pl-1">
          {index + 1}
        </div>
      ))}
    </div>
  )
}
