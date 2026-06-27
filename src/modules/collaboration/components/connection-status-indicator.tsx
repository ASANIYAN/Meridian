import { cn } from '@/lib/utils'
import { useCollaboration } from '../hooks/use-collaboration'
import type { ConnectionStatus } from '../types/collaboration.types'

const config: Record<ConnectionStatus, { label: string; color: string; pulse: boolean }> = {
  connecting: { label: 'Connecting…', color: 'var(--brass)', pulse: true },
  connected: { label: 'Connected', color: 'var(--presence-moss)', pulse: false },
  reconnecting: { label: 'Reconnecting…', color: 'var(--brass)', pulse: true },
  error: { label: 'Disconnected', color: 'var(--presence-coral)', pulse: false },
}

/**
 * Header readout (FE-COLLAB-8). A transient reconnect reads calm (brass, pulsing);
 * a terminal error reads distinct (coral) — the redirect/toast side effects are
 * owned by useDocumentConnection (FE-ERR-2).
 */
export function ConnectionStatusIndicator() {
  const { status } = useCollaboration()
  const c = config[status]
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
    >
      <span
        aria-hidden="true"
        className={cn('size-1.5 rounded-full', c.pulse && 'motion-safe:animate-pulse')}
        style={{ backgroundColor: c.color }}
      />
      {c.label}
    </div>
  )
}
