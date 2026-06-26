import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { renameDocumentSchema } from '../utils/schemas'
import { useRenameDocument } from '../hooks/use-rename-document'

interface InlineDocumentTitleProps {
  documentId: string
  title: string
  /** Authors and editors may rename; viewers see a plain, non-interactive title. */
  canEdit: boolean
}

const TITLE_CLASS = 'font-display text-[1.5rem] leading-tight text-foreground sm:text-[1.75rem]'

/**
 * The editable document title in the editor header (FE-DOC-4). A click (or
 * Enter/Space) swaps the heading for an input; Enter or blur commits, Escape
 * cancels. The rename itself is optimistic (see useRenameDocument), so the new
 * title is visible the instant it's committed.
 */
export function InlineDocumentTitle({ documentId, title, canEdit }: InlineDocumentTitleProps) {
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

  function startEditing() {
    if (!canEdit) return
    setValue(title)
    setError(null)
    setEditing(true)
  }

  function commit() {
    const parsed = renameDocumentSchema.safeParse({ title: value })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid title')
      return
    }
    const next = parsed.data.title
    setEditing(false)
    setError(null)
    if (next !== title) rename.mutate(next)
  }

  function cancel() {
    setEditing(false)
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
    return <h1 className={cn(TITLE_CLASS, 'truncate')}>{title}</h1>
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={startEditing}
        title="Rename document"
        className={cn(
          TITLE_CLASS,
          'max-w-full truncate rounded-sm text-left outline-none',
          'transition-colors duration-150 ease-out hover:text-foreground/70',
          'focus-visible:ring-[3px] focus-visible:ring-ring/35',
        )}
      >
        {title}
      </button>
    )
  }

  return (
    <div className="min-w-0 flex-1">
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
