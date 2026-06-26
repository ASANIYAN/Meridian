import type { ReactNode } from 'react'
import { type Editor, useEditorState } from '@tiptap/react'
import { cn } from '@/lib/utils'

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      // Keep the editor selection while clicking the toolbar.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        'grid size-8 place-items-center rounded-md text-[12px] outline-none transition-colors duration-150 ease-out focus-visible:ring-[3px] focus-visible:ring-ring/35',
        active ? 'bg-brass/15 text-brass' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-border" />
}

/**
 * The fully-custom editor toolbar (FE-EDITOR-2). Tiptap is headless by design —
 * every control is built here. Active state reflects the current selection; each
 * button is keyboard-reachable with a visible focus ring.
 */
export function EditorToolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      h1: e.isActive('heading', { level: 1 }),
      h2: e.isActive('heading', { level: 2 }),
      h3: e.isActive('heading', { level: 3 }),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
    }),
  })

  return (
    <div className="sticky top-15 z-10 -mx-1 mb-2 flex items-center gap-0.5 rounded-md border border-border bg-background/85 px-1.5 py-1 backdrop-blur-sm">
      <ToolbarButton
        active={state.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label="Bold"
      >
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton
        active={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label="Italic"
      >
        <span className="font-serif italic">I</span>
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        active={state.h1}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        label="Heading 1"
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        active={state.h2}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        label="Heading 2"
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        active={state.h3}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        label="Heading 3"
      >
        H3
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        active={state.bullet}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        label="Bullet list"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
          <line x1="9" y1="6" x2="20" y2="6" strokeLinecap="round" />
          <line x1="9" y1="12" x2="20" y2="12" strokeLinecap="round" />
          <line x1="9" y1="18" x2="20" y2="18" strokeLinecap="round" />
          <circle cx="4.5" cy="6" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="4.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="4.5" cy="18" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        active={state.ordered}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        label="Numbered list"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
          <line x1="10" y1="6" x2="20" y2="6" strokeLinecap="round" />
          <line x1="10" y1="12" x2="20" y2="12" strokeLinecap="round" />
          <line x1="10" y1="18" x2="20" y2="18" strokeLinecap="round" />
          <text x="2" y="8" fontSize="7" fill="currentColor" stroke="none" fontFamily="monospace">
            1
          </text>
          <text x="2" y="14.5" fontSize="7" fill="currentColor" stroke="none" fontFamily="monospace">
            2
          </text>
          <text x="2" y="21" fontSize="7" fill="currentColor" stroke="none" fontFamily="monospace">
            3
          </text>
        </svg>
      </ToolbarButton>
    </div>
  )
}
