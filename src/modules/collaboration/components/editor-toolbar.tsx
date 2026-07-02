import { type Editor, useEditorState } from '@tiptap/react'
import {
  Code,
  IndentDecrease,
  IndentIncrease,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Quote,
  Redo2,
  Search,
  Subscript,
  Superscript,
  Undo2,
} from 'lucide-react'
import { ToolbarButton, ToolbarDivider } from './toolbar-button'
import { ToolbarHeadingMenu } from './toolbar-heading-menu'
import { ToolbarAlignMenu } from './toolbar-align-menu'
import { ToolbarLinkPopover } from './toolbar-link-popover'
import { ToolbarTableMenu } from './toolbar-table-menu'
import { ToolbarFindReplacePopover } from './toolbar-find-replace-popover'

/**
 * The editor's formatting toolbar (CLAUDE.md §2/§5 — fully custom, no shadcn
 * primitive for it). Controls mix two vocabularies by deliberate choice: legible
 * letterforms for marks that read fine as text (B/I/U/S, highlight A), and
 * `lucide-react` icons for anything that isn't self-explanatory as a glyph
 * (lists, undo/redo, link, tables, indent) — the ambiguous bullet/numbered-list
 * glyphs were the original reason for adopting an icon set here.
 *
 * `useEditorState` subscribes to just the flags rendered here, so the toolbar
 * re-renders on selection changes without re-rendering on every keystroke.
 */
export function EditorToolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      strike: e.isActive('strike'),
      highlight: e.isActive('highlight'),
      code: e.isActive('code'),
      link: e.isActive('link'),
      subscript: e.isActive('subscript'),
      superscript: e.isActive('superscript'),
      bulletList: e.isActive('bulletList'),
      orderedList: e.isActive('orderedList'),
      taskList: e.isActive('taskList'),
      blockquote: e.isActive('blockquote'),
      table: e.isActive('table'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
      canSink: e.can().sinkListItem('listItem'),
      canLift: e.can().liftListItem('listItem'),
    }),
  })

  return (
    <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-px py-1">
      <ToolbarHeadingMenu editor={editor} />

      <ToolbarDivider />

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
        <span className="font-display text-[14px] italic leading-none">I</span>
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
        label="Highlight"
        active={state.highlight}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      >
        <span className="border-b-3 border-brass/65 px-0.5 text-[12px] font-semibold leading-none text-foreground">
          A
        </span>
      </ToolbarButton>
      <ToolbarButton
        label="Inline code"
        active={state.code}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Subscript"
        active={state.subscript}
        onClick={() => editor.chain().focus().toggleSubscript().run()}
      >
        <Subscript className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Superscript"
        active={state.superscript}
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
      >
        <Superscript className="size-4" />
      </ToolbarButton>
      <ToolbarLinkPopover editor={editor} active={state.link} />

      <ToolbarDivider />

      <ToolbarButton
        label="Bullet list"
        active={state.bulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={state.orderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Task list"
        active={state.taskList}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      >
        <ListTodo className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Quote"
        active={state.blockquote}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Horizontal rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Indent"
        disabled={!state.canSink}
        onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
      >
        <IndentIncrease className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Outdent"
        disabled={!state.canLift}
        onClick={() => editor.chain().focus().liftListItem('listItem').run()}
      >
        <IndentDecrease className="size-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarAlignMenu editor={editor} />
      <ToolbarTableMenu editor={editor} active={state.table} />

      <ToolbarDivider />

      <ToolbarFindReplacePopover editor={editor}>
        <ToolbarButton label="Find and replace">
          <Search className="size-4" />
        </ToolbarButton>
      </ToolbarFindReplacePopover>

      <ToolbarDivider />

      <ToolbarButton
        label="Undo"
        disabled={!state.canUndo}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        disabled={!state.canRedo}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 className="size-4" />
      </ToolbarButton>
    </div>
  )
}
