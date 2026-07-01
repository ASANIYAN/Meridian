import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { renameDocumentSchema } from '../utils/schemas'
import { useRenameDocument } from '../hooks/use-rename-document'

interface DocumentCardTitleProps {
  documentId: string
  title: string
  /** Authors and editors may rename; viewers see a plain, non-interactive title. */
  canEdit: boolean
  /** Lets the card disable its navigation overlay while the title is being edited. */
  onEditingChange?: (editing: boolean) => void
}

const TITLE_CLASS = 'font-display text-[1.25rem] leading-snug text-foreground'

/**
 * The document title inside a list card (FE-DOC-4, list variant). The card is a
 * stretched-link, so the plain title stays `pointer-events-none` and clicks fall
 * through to navigation; only the rename control and the edit input opt back in
 * with `pointer-events-auto`. Rename is optimistic (see useRenameDocument), so
 * the new title shows in the list the instant it's committed.
 */
export function DocumentCardTitle({
  documentId,
  title,
  canEdit,
  onEditingChange,
}: DocumentCardTitleProps) {
  const rename = useRenameDocument(documentId)
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(title)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  function setEditingState(next: boolean) {
    setEditing(next)
    onEditingChange?.(next)
  }

  function startEditing() {
    setValue(title)
    setError(null)
    setEditingState(true)
  }

  function commit() {
    const parsed = renameDocumentSchema.safeParse({ title: value })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid title')
      return
    }
    const next = parsed.data.title
    setEditingState(false)
    setError(null)
    if (next !== title) rename.mutate(next)
  }

  function cancel() {
    setEditingState(false)
    setError(null)
    setValue(title)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancel()
    }
  }

  if (!canEdit) {
    return <h2 className={cn(TITLE_CLASS, 'truncate')}>{title}</h2>
  }

  if (editing) {
    return (
      <div className="pointer-events-auto min-w-0">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          aria-label="Document title"
          aria-invalid={error ? true : undefined}
          className={cn(
            TITLE_CLASS,
            'w-full rounded-sm bg-transparent outline-none',
            'focus-visible:ring-[3px] focus-visible:ring-ring/25',
          )}
        />
        {error && <p className="mt-1 text-[12px] leading-snug text-presence-coral">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex items-start gap-1.5">
      <h2 className={cn(TITLE_CLASS, 'min-w-0 flex-1 truncate')}>{title}</h2>
      <button
        type="button"
        onClick={startEditing}
        aria-label="Rename document"
        title="Rename document"
        className={cn(
          'pointer-events-auto mt-0.5 shrink-0 rounded-sm p-1 text-muted-foreground outline-none',
          'transition-colors duration-150 ease-out',
          'hover:text-brass-soft focus-visible:ring-[3px] focus-visible:ring-ring/35',
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
          aria-hidden="true"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>
    </div>
  )
}
