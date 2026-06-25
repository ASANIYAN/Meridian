import { cn } from '@/lib/utils'
import type { Role } from '@/types/document'

// Distinct per role, drawn only from the established palette — no new colour.
const styles: Record<Role, string> = {
  author: 'text-brass border-brass/35',
  editor: 'text-foreground border-border',
  viewer: 'text-muted-foreground border-border',
}

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em]',
        styles[role],
      )}
    >
      {role}
    </span>
  )
}
