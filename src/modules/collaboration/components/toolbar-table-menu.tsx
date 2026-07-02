import { type Editor } from '@tiptap/react'
import { Table } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ToolbarButton } from './toolbar-button'

/** Insert-table + contextual row/column actions. The destructive actions only
 *  render while the selection is inside a table — there's nothing sensible for
 *  "delete row" to do otherwise, so don't show a dead menu item for it. */
export function ToolbarTableMenu({ editor, active }: { editor: Editor; active: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ToolbarButton label="Table" active={active}>
          <Table className="size-4" />
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        <DropdownMenuItem
          onSelect={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          Insert table
        </DropdownMenuItem>
        {active && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => editor.chain().focus().addRowAfter().run()}>
              Add row below
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().addColumnAfter().run()}>
              Add column after
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().deleteRow().run()}>
              Delete row
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().deleteColumn().run()}>
              Delete column
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => editor.chain().focus().deleteTable().run()}
            >
              Delete table
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
