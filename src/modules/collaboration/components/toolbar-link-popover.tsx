import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { Link as LinkIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ToolbarButton } from './toolbar-button'

/** Add/edit/remove a link on the current selection. The Link mark ships in
 *  StarterKit; this only drives setLink/unsetLink. extendMarkRange lets the
 *  author edit an existing link without first re-selecting its whole span. */
export function ToolbarLinkPopover({ editor, active }: { editor: Editor; active: boolean }) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')

  function onOpenChange(next: boolean) {
    if (next) setUrl((editor.getAttributes('link').href as string) ?? '')
    setOpen(next)
  }

  function apply() {
    const href = url.trim()
    const chain = editor.chain().focus().extendMarkRange('link')
    if (href) chain.setLink({ href }).run()
    else chain.unsetLink().run()
    setOpen(false)
  }

  function remove() {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <ToolbarButton label="Link" active={active}>
          <LinkIcon className="size-4" />
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            apply()
          }}
          className="space-y-2.5"
        >
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            autoFocus
            className="h-9"
          />
          <div className="flex justify-end gap-2">
            {active && (
              <Button type="button" variant="ghost" size="sm" onClick={remove}>
                Remove
              </Button>
            )}
            <Button type="submit" size="sm">
              Apply
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
