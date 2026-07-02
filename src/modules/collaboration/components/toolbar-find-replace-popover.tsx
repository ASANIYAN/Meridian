import { useState, type ReactNode } from 'react'
import type { Editor } from '@tiptap/react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

/** Find & replace — backed by the custom `searchAndReplace` extension
 *  (utils/search-and-replace.ts), since no free Tiptap v3 extension exists
 *  for this. Search state lives in the extension's storage, not here, so
 *  match highlighting stays in sync even if this popover unmounts. */
export function ToolbarFindReplacePopover({
  editor,
  children,
}: {
  editor: Editor
  children: ReactNode
}) {
  const [term, setTerm] = useState('')
  const [replacement, setReplacement] = useState('')

  function onTermChange(next: string) {
    setTerm(next)
    editor.commands.setSearchTerm(next)
  }

  function onOpenChange(open: boolean) {
    if (!open) editor.commands.setSearchTerm('')
  }

  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            editor.commands.nextSearchResult()
          }}
          className="space-y-2"
        >
          <div className="flex items-center gap-1">
            <Input
              value={term}
              onChange={(e) => onTermChange(e.target.value)}
              placeholder="Find"
              autoFocus
              className="h-9"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Previous match"
              onClick={() => editor.commands.previousSearchResult()}
            >
              <ChevronUp className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Next match"
              onClick={() => editor.commands.nextSearchResult()}
            >
              <ChevronDown className="size-4" />
            </Button>
          </div>
          <Input
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder="Replace with"
            className="h-9"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.commands.replaceActiveResult(replacement)}
            >
              Replace
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => editor.commands.replaceAllResults(replacement)}
            >
              Replace all
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
