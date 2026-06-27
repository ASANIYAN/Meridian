import { StatusBadge } from '@/components/custom-components/status-badge'
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
 * owned by useDocumentConnection (FE-ERR-2). Uses the shared StatusBadge so it
 * matches the document-status treatment exactly (one status system).
 */
export function ConnectionStatusIndicator() {
  const { status } = useCollaboration()
  const c = config[status]
  return (
    <StatusBadge role="status" ariaLive="polite" label={c.label} color={c.color} pulse={c.pulse} />
  )
}
