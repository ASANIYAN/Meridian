import type { ReactNode } from 'react'
import { type Editor, useEditorState } from '@tiptap/react'
import { cn } from '@/lib/utils'

/**
 * The editor's formatting toolbar (CLAUDE.md §2/§5 — fully custom, no shadcn
 * primitive). Presentational: it reads the active-mark state off the passed
 * editor instance and dispatches Tiptap commands, owning no lifecycle of its
 * own. `useEditorState` subscribes to just the flags it renders so it re-renders
 * on selection changes without re-rendering the whole editor on every keystroke.
 */
export function EditorToolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      strike: e.isActive('strike'),
      code: e.isActive('code'),
      h1: e.isActive('heading', { level: 1 }),
      h2: e.isActive('heading', { level: 2 }),
      bulletList: e.isActive('bulletList'),
      orderedList: e.isActive('orderedList'),
      blockquote: e.isActive('blockquote'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  })

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5"
    >
      <ToolbarButton
        label="Heading 1"
        active={state.h1}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <span className="font-display text-[13px] font-semibold leading-none">H1</span>
      </ToolbarButton>
      <ToolbarButton
        label="Heading 2"
        active={state.h2}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <span className="font-display text-[13px] font-semibold leading-none">H2</span>
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Bold"
        active={state.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <span className="text-[13px] font-bold leading-none">B</span>
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="text-[13px] italic leading-none">I</span>
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={state.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <span className="text-[13px] leading-none underline underline-offset-2">U</span>
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={state.strike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <span className="text-[13px] leading-none line-through">S</span>
      </ToolbarButton>
      <ToolbarButton
        label="Inline code"
        active={state.code}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <span className="font-mono text-[12px] leading-none">{'</>'}</span>
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Bullet list"
        active={state.bulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <span className="text-[14px] leading-none">•</span>
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={state.orderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <span className="font-mono text-[11px] leading-none">1.</span>
      </ToolbarButton>
      <ToolbarButton
        label="Quote"
        active={state.blockquote}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <span className="font-display text-[15px] leading-none">&ldquo;</span>
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Undo"
        disabled={!state.canUndo}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <span className="text-[14px] leading-none">↶</span>
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        disabled={!state.canRedo}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <span className="text-[14px] leading-none">↷</span>
      </ToolbarButton>
    </div>
  )
}

interface ToolbarButtonProps {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}

function ToolbarButton({ label, active, disabled, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        'grid size-8 place-items-center rounded-md text-foreground transition-colors duration-150 ease-out',
        'hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35',
        'disabled:pointer-events-none disabled:opacity-40',
        active && 'bg-muted text-accent-foreground ring-1 ring-accent/40',
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-border" />
}
