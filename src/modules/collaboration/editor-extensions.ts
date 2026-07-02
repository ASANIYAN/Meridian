import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import CharacterCount from '@tiptap/extension-character-count'
import type { Extensions } from '@tiptap/react'
import type * as Y from 'yjs'
import { SearchAndReplace } from './utils/search-and-replace'
import { SlashCommand } from './utils/slash-command'

/**
 * The canonical content schema for Meridian documents — the single source of
 * truth for which nodes/marks a document may contain, and a CONTRACT the backend
 * must mirror when authoring the shared `content` fragment (AI edits, seeding).
 * Every top-level child of the fragment must be a block node, never bare text,
 * or y-tiptap throws `el.toArray is not a function` on mount.
 *
 *   nodes: paragraph, heading(level), bulletList, orderedList, listItem,
 *          blockquote, codeBlock, horizontalRule, hardBreak, taskList,
 *          taskItem, table, tableRow, tableHeader, tableCell (+ doc, text)
 *   marks: bold, italic, strike, code, link, highlight, subscript, superscript
 *   attrs: textAlign on heading + paragraph
 */
export function createEditorExtensions(opts: { doc: Y.Doc; editable: boolean }): Extensions {
  return [
    // undoRedo off → Collaboration owns history; openOnClick off → clicking a
    // link places the cursor for editing rather than navigating away.
    StarterKit.configure({ undoRedo: false, link: { openOnClick: false } }),
    // Bind to the "content" fragment — the root the backend authors. The
    // extension defaults to field "default"; without this, server-pushed updates
    // apply to the Y.Doc but land in a fragment the editor never observes.
    Collaboration.configure({ document: opts.doc, field: 'content' }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Highlight,
    Subscript,
    Superscript,
    TaskList,
    TaskItem.configure({ nested: true }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    CharacterCount,
    SearchAndReplace,
    SlashCommand,
    Placeholder.configure({
      placeholder: opts.editable ? 'Start writing…' : 'This document is empty.',
    }),
  ]
}
