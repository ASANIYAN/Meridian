import { useToastStore, type ToastVariant } from '@/store/toast-store'

const accent: Record<ToastVariant, string> = {
  default: 'var(--brass)',
  success: 'var(--presence-moss)',
  error: 'var(--presence-coral)',
  warning: 'var(--brass)',
}

/**
 * Renders the Zustand toast queue (CLAUDE.md §3). Mounted once at the app root so
 * any module can push a toast through the store with no prop drilling (FE-DESIGN-3).
 */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismissToast = useToastStore((s) => s.dismissToast)

  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-90 flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="toast-in pointer-events-auto flex items-start gap-3 rounded-md border border-border bg-card p-3.5 shadow-[0_16px_40px_-20px_rgba(15,26,42,0.4)]"
        >
          <span
            className="mt-1.5 size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: accent[toast.variant] }}
          />
          <p className="flex-1 text-[13px] leading-snug text-foreground">{toast.message}</p>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss"
            className="-m-1 rounded-sm p-1 text-muted-foreground outline-none transition-colors duration-150 ease-out hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/35"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="size-3.5"
              aria-hidden="true"
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
