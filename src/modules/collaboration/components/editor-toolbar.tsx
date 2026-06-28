import { type Editor, useEditorState } from '@tiptap/react'
import { ToolbarButton, ToolbarDivider } from './toolbar-button'
import { ToolbarHeadingMenu } from './toolbar-heading-menu'
import { ToolbarAlignMenu } from './toolbar-align-menu'
import { ToolbarLinkPopover } from './toolbar-link-popover'

/**
 * The editor's formatting toolbar (CLAUDE.md §2/§5 — fully custom, no shadcn
 * primitive for it). Controls share one brand vocabulary: letterforms for marks
 * (B/I/U/S), matched-weight glyphs for blocks, and mono text triggers for the
 * block-type and alignment menus — deliberately not a third-party icon set.
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
      bulletList: e.isActive('bulletList'),
      orderedList: e.isActive('orderedList'),
      blockquote: e.isActive('blockquote'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
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
        <span className="font-mono text-[12px] leading-none">{'</>'}</span>
      </ToolbarButton>
      <ToolbarLinkPopover editor={editor} active={state.link} />

      <ToolbarDivider />

      <ToolbarButton
        label="Bullet list"
        active={state.bulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <span className="text-[15px] leading-none">•</span>
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
        <span className="font-display text-[16px] leading-none">&ldquo;</span>
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarAlignMenu editor={editor} />

      <ToolbarDivider />

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
