/** Form-level (root) error banner — generic messages that aren't tied to a field. */
export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="rounded-md border border-presence-coral/30 bg-presence-coral/10 px-3.5 py-2.5 text-[13px] leading-snug text-foreground"
    >
      {message}
    </div>
  )
}
