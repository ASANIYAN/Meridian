import { useEffect, useState, type ChangeEvent } from 'react'
import { useCollaboration } from '../hooks/use-collaboration'

/**
 * TEMPORARY sync sanity panel. Gates on `ready` (FE-EDITOR-4 pattern) and binds a
 * Y.Text to a textarea so two clients can confirm the full round-trip — local
 * edit → ack, and a remote binary update → applied — before the real Tiptap
 * editor (FE-EDITOR-1) replaces it on the document's XML fragment.
 */
export function DocumentWorkspace() {
  const { doc, ready, role } = useCollaboration()
  const [value, setValue] = useState('')

  useEffect(() => {
    const ytext = doc.getText('sanity')
    const sync = () => setValue(ytext.toString())
    sync()
    ytext.observe(sync)
    return () => ytext.unobserve(sync)
  }, [doc])

  if (!ready) {
    return (
      <div className="grid place-items-center py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Connecting to the document…
        </p>
      </div>
    )
  }

  const readOnly = role === 'viewer'

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value
    doc.transact(() => {
      const ytext = doc.getText('sanity')
      ytext.delete(0, ytext.length)
      ytext.insert(0, next)
    })
  }

  return (
    <div className="mx-auto max-w-[68ch]">
      <div className="mb-4 rounded-md border border-dashed border-border bg-muted/40 px-4 py-3 text-[13px] leading-relaxed text-muted-foreground">
        Provider connected. This is a temporary sync check — type here and watch it mirror in another
        tab. The Tiptap editor lands next.
      </div>
      <textarea
        value={value}
        onChange={handleChange}
        readOnly={readOnly}
        placeholder={readOnly ? 'Read-only (viewer)' : 'Start typing to test sync…'}
        className="min-h-80 w-full resize-none rounded-md border border-border bg-card p-5 font-sans text-[15px] leading-relaxed text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
      />
    </div>
  )
}
