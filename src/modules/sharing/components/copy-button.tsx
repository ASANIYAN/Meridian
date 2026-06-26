import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  value: string
  /** Accessible label, e.g. "Copy share link". */
  label: string
  disabled?: boolean
}

/**
 * Copy-to-clipboard (FE-SHARE-6). Flips to a "Copied" confirmation for ~1.6s.
 * Falls back gracefully if the Clipboard API is unavailable (older/insecure
 * contexts) — the button simply does nothing rather than throwing.
 */
export function CopyButton({ value, label, disabled }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard unavailable — no-op rather than surfacing a confusing error.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      disabled={disabled}
      aria-label={copied ? 'Copied' : label}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-[11px] uppercase tracking-[0.1em] outline-none transition-colors duration-150 ease-out',
        'focus-visible:ring-[3px] focus-visible:ring-ring/35 disabled:opacity-50',
        copied
          ? 'text-presence-moss'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="size-3.5"
        aria-hidden="true"
      >
        {copied ? (
          <polyline points="20 6 9 17 4 12" />
        ) : (
          <>
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </>
        )}
      </svg>
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
