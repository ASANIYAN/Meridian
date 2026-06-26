import { useState, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'

interface ChatComposerProps {
  onSend: (prompt: string) => void
  disabled: boolean
}

/** The instruction input (FE-CHAT-2). Enter sends; Shift+Enter inserts a newline. */
export function ChatComposer({ onSend, disabled }: ChatComposerProps) {
  const [value, setValue] = useState('')

  function submit() {
    const prompt = value.trim()
    if (!prompt || disabled) return
    onSend(prompt)
    setValue('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="border-t border-border p-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        aria-label="Ask the assistant to edit the document"
        placeholder="Ask the assistant to edit the document…"
        className="max-h-40 w-full resize-none rounded-md border border-border bg-card px-3 py-2 text-[13.5px] leading-relaxed text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
      />
      <div className="mt-2 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          Enter to send
        </p>
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={disabled || value.trim() === ''}
          onClick={submit}
        >
          {disabled ? 'Working…' : 'Send'}
        </Button>
      </div>
    </div>
  )
}
