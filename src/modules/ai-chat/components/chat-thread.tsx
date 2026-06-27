import { useEffect, useRef } from 'react'
import type { ChatTurn } from '../types/ai-chat.types'
import { ChatOutcomeCard } from './chat-outcome'

/** The scrollable message thread (FE-CHAT-2). Each turn is the author's prompt
 *  followed by a pending indicator or the resolved outcome card. */
export function ChatThread({ turns }: { turns: ChatTurn[] }) {
  const endRef = useRef<HTMLDivElement>(null)

  // Keep the latest turn in view as the thread grows.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [turns])

  if (turns.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center">
        <p className="max-w-[30ch] text-[13px] leading-relaxed text-muted-foreground">
          Ask the assistant to draft, revise, or restructure the document. Edits appear live in the
          editor.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4">
      {turns.map((turn) => (
        <div key={turn.id} className="space-y-2">
          <div className="flex justify-end">
            <p className="max-w-[85%] rounded-md rounded-br-sm bg-primary px-3 py-2 text-[13.5px] leading-relaxed text-primary-foreground">
              {turn.prompt}
            </p>
          </div>

          {turn.status === 'pending' ? (
            <p
              className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
              aria-live="polite"
            >
              Thinking…
            </p>
          ) : (
            turn.outcome && <ChatOutcomeCard outcome={turn.outcome} />
          )}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  )
}
