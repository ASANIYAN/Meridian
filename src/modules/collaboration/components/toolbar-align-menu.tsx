import { type Editor, useEditorState } from '@tiptap/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Caret } from './toolbar-button'
import { toolbarMenuTriggerClass } from './toolbar-styles'

const ALIGN = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
  { label: 'Justify', value: 'justify' },
] as const

/** Paragraph/heading alignment. Trigger shows the current alignment (left when
 *  none is set), matching the heading menu's at-a-glance-feedback pattern. */
export function ToolbarAlignMenu({ editor }: { editor: Editor }) {
  const current = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      ALIGN.find((a) => e.isActive({ textAlign: a.value }))?.label ?? 'Left',
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={toolbarMenuTriggerClass} aria-label="Alignment">
        <span className="min-w-12 text-left">{current}</span>
        <Caret />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-32">
        {ALIGN.map((a) => (
          <DropdownMenuItem
            key={a.value}
            onSelect={() => editor.chain().focus().setTextAlign(a.value).run()}
          >
            {a.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
