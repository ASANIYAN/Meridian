import { cn } from '@/lib/utils'
import type { ChatOutcome } from '../types/ai-chat.types'

/** Per-kind label + accent. Tones are deliberately distinct so partial success
 *  (something happened) never reads like scope/conflict (nothing happened). */
const TONE: Record<ChatOutcome['kind'], { label: string; chip: string; rail: string }> = {
  applied: {
    label: 'Applied',
    chip: 'bg-presence-moss/15 text-presence-moss',
    rail: 'border-presence-moss/40',
  },
  partial: {
    label: 'Partly applied',
    chip: 'bg-brass/15 text-brass',
    rail: 'border-brass/40',
  },
  'content-conflict': {
    label: 'Document changed',
    chip: 'bg-presence-coral/15 text-presence-coral',
    rail: 'border-presence-coral/40',
  },
  scope: {
    label: 'Out of scope',
    chip: 'bg-presence-coral/15 text-presence-coral',
    rail: 'border-presence-coral/40',
  },
  format: {
    label: "Couldn't process",
    chip: 'bg-muted text-muted-foreground',
    rail: 'border-border',
  },
  'rate-limited': {
    label: 'Slow down',
    chip: 'bg-muted text-muted-foreground',
    rail: 'border-border',
  },
  error: {
    label: 'Failed',
    chip: 'bg-muted text-muted-foreground',
    rail: 'border-border',
  },
}

function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`
}

/** The assistant side of a turn — one of the five §9 outcomes, visually keyed. */
export function ChatOutcomeCard({ outcome }: { outcome: ChatOutcome }) {
  const tone = TONE[outcome.kind]

  return (
    <div className={cn('rounded-md border-l-2 bg-card px-3.5 py-3', tone.rail)}>
      <span
        className={cn(
          'inline-flex rounded-sm px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]',
          tone.chip,
        )}
      >
        {tone.label}
      </span>

      <div className="mt-2 text-[13.5px] leading-relaxed text-foreground">
        <OutcomeBody outcome={outcome} />
      </div>
    </div>
  )
}

function OutcomeBody({ outcome }: { outcome: ChatOutcome }) {
  switch (outcome.kind) {
    case 'applied':
      return <p>Applied {plural(outcome.operationsApplied, 'change')} to the document.</p>

    case 'partial':
      return (
        <div className="space-y-2">
          <p>
            Applied {plural(outcome.operationsApplied, 'change')}, but skipped{' '}
            {plural(outcome.rejected.length, 'edit')}:
          </p>
          <ul className="space-y-1.5">
            {outcome.rejected.map((r) => (
              <li
                key={r.index}
                className="rounded-sm bg-muted/60 px-2.5 py-1.5 text-[12.5px] text-muted-foreground"
              >
                <span className="font-mono text-[11px] text-foreground">#{r.index}</span> {r.reason}
              </li>
            ))}
          </ul>
        </div>
      )

    case 'content-conflict':
      return (
        <div className="space-y-2">
          <p>
            The document changed between when the assistant read it and when it tried to edit
            {typeof outcome.operationIndex === 'number'
              ? ` (operation #${outcome.operationIndex})`
              : ''}
            . Nothing was applied — review the change and try again.
          </p>
          {outcome.expectedText !== undefined && outcome.actualText !== undefined && (
            <dl className="space-y-1.5 text-[12.5px]">
              <div className="rounded-sm bg-muted/60 px-2.5 py-1.5">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Expected
                </dt>
                <dd className="mt-0.5 text-foreground">{outcome.expectedText}</dd>
              </div>
              <div className="rounded-sm bg-muted/60 px-2.5 py-1.5">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Found
                </dt>
                <dd className="mt-0.5 text-foreground">{outcome.actualText}</dd>
              </div>
            </dl>
          )}
        </div>
      )

    case 'scope':
      return (
        <div className="space-y-1.5">
          <p>
            That instruction was out of scope, so{' '}
            <strong className="font-semibold">nothing was changed</strong>. Try a more specific
            edit.
          </p>
          {outcome.message && (
            <p className="text-[12.5px] text-muted-foreground">{outcome.message}</p>
          )}
        </div>
      )

    case 'format':
      return <p>The assistant couldn't turn that into an edit. Try rephrasing your instruction.</p>

    case 'rate-limited':
      return <p>You're sending messages too quickly. Wait a moment, then try again.</p>

    case 'error':
      return (
        <p>
          Something went wrong on our end and the assistant couldn't finish. Your document is
          untouched — please try again in a moment.
        </p>
      )
  }
}
