import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * A native <select> styled to match Input's visual weight (same height,
 * border, background, and focus ring) — the browser's default select styling
 * otherwise reads as a different, less-polished control next to Input/Button.
 */
export const SelectField = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(
  function SelectField({ className, children, ...props }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          data-slot="select"
          className={cn(
            'h-11 w-full appearance-none rounded-md border border-input bg-muted py-2.5 pl-3.5 pr-8 text-[14.5px] text-foreground shadow-none transition-[border-color,box-shadow] duration-150 ease-out',
            'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    )
  },
)
