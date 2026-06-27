import { type Editor, useEditorState } from '@tiptap/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Caret } from './toolbar-button'
import { toolbarMenuTriggerClass } from './toolbar-styles'

const ITEMS = [
  { label: 'Paragraph', level: 0 },
  { label: 'Heading 1', level: 1 },
  { label: 'Heading 2', level: 2 },
  { label: 'Heading 3', level: 3 },
] as const

/** Block-type picker — consolidates the old H1/H2 buttons and adds H3/Paragraph.
 *  The trigger shows the current block type, so it doubles as active feedback. */
export function ToolbarHeadingMenu({ editor }: { editor: Editor }) {
  const current = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (e.isActive('heading', { level: 1 })) return 'H1'
      if (e.isActive('heading', { level: 2 })) return 'H2'
      if (e.isActive('heading', { level: 3 })) return 'H3'
      return 'Text'
    },
  })

  function apply(level: number) {
    const chain = editor.chain().focus()
    if (level === 0) chain.setParagraph().run()
    else chain.toggleHeading({ level: level as 1 | 2 | 3 }).run()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={toolbarMenuTriggerClass} aria-label="Text style">
        <span className="min-w-7 text-left">{current}</span>
        <Caret />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-40">
        {ITEMS.map((it) => (
          <DropdownMenuItem key={it.label} onSelect={() => apply(it.level)}>
            {it.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
