import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-11 w-full rounded-md border border-input bg-muted px-3.5 py-2.5 text-[14.5px] text-foreground shadow-none transition-[border-color,box-shadow] duration-150 ease-out',
        'placeholder:text-muted-foreground/70',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
