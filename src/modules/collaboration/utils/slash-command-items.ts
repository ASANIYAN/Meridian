import type { Editor } from '@tiptap/react'
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Quote,
  Table,
  type LucideIcon,
} from 'lucide-react'

export interface SlashCommandItem {
  label: string
  icon: LucideIcon
  command: (editor: Editor) => void
}

/** Menu items mirror existing toolbar commands (editor-toolbar.tsx,
 *  toolbar-heading-menu.tsx, toolbar-table-menu.tsx) — same `chain().focus()`
 *  calls, no duplicated command logic. Kept in a non-component module so
 *  slash-command-menu.tsx stays fast-refresh friendly. */
export const SLASH_COMMAND_ITEMS: SlashCommandItem[] = [
  {
    label: 'Heading 1',
    icon: Heading1,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    label: 'Heading 2',
    icon: Heading2,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: 'Heading 3',
    icon: Heading3,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: 'Bullet list',
    icon: List,
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    label: 'Numbered list',
    icon: ListOrdered,
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    label: 'Task list',
    icon: ListTodo,
    command: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    label: 'Quote',
    icon: Quote,
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    label: 'Table',
    icon: Table,
    command: (editor) =>
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    label: 'Divider',
    icon: Minus,
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
]
