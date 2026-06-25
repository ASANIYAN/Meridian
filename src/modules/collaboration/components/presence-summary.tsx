import { useCollaboration } from '../hooks/use-collaboration'

/**
 * Minimal presence readout. The avatar stack (FE-PRESENCE-2) replaces this; for
 * now it confirms the roster is live (initial participants + online/offline).
 */
export function PresenceSummary() {
  const { presentUsers } = useCollaboration()
  if (presentUsers.length === 0) return null
  return (
    <div className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:block">
      {presentUsers.length} present
    </div>
  )
}
