import { cn } from '@/lib/utils'

/** Shared mono text trigger for the toolbar dropdown menus (text style, alignment).
 *  Kept in a non-component module so component files stay fast-refresh friendly. */
export const toolbarMenuTriggerClass = cn(
  'inline-flex h-7 items-center gap-1 rounded-sm px-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground',
  'transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 data-[state=open]:bg-muted data-[state=open]:text-foreground',
)
