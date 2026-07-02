import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { cn } from '@/lib/utils'
import type { SlashCommandItem } from '../utils/slash-command-items'

export interface SlashCommandMenuHandle {
  onKeyDown: (event: KeyboardEvent) => boolean
}

interface SlashCommandMenuProps {
  items: SlashCommandItem[]
  command: (item: SlashCommandItem) => void
}

/** The floating list itself — mounted imperatively via ReactRenderer from the
 *  Suggestion plugin's render() lifecycle (slash-command.ts), since Suggestion's
 *  positioning is imperative and doesn't map to a declarative Radix trigger. */
export const SlashCommandMenu = forwardRef<SlashCommandMenuHandle, SlashCommandMenuProps>(
  function SlashCommandMenu({ items, command }, ref) {
    const [selected, setSelected] = useState(0)

    useEffect(() => setSelected(0), [items])

    useImperativeHandle(ref, () => ({
      onKeyDown(event) {
        if (event.key === 'ArrowDown') {
          setSelected((prev) => (prev + 1) % items.length)
          return true
        }
        if (event.key === 'ArrowUp') {
          setSelected((prev) => (prev - 1 + items.length) % items.length)
          return true
        }
        if (event.key === 'Enter') {
          if (items[selected]) command(items[selected])
          return true
        }
        return false
      },
    }))

    if (!items.length) {
      return (
        <div className="rounded-md border border-border bg-card p-2 text-sm text-muted-foreground shadow-[0_18px_44px_-24px_rgba(15,26,42,0.45)]">
          No results
        </div>
      )
    }

    return (
      <div className="min-w-48 rounded-md border border-border bg-card p-1 shadow-[0_18px_44px_-24px_rgba(15,26,42,0.45)]">
        {items.map((item, index) => (
          <button
            key={item.label}
            type="button"
            onClick={() => command(item)}
            className={cn(
              'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors duration-150 ease-out',
              index === selected
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </button>
        ))}
      </div>
    )
  },
)
