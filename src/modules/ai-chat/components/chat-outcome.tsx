import { cn } from '@/lib/utils'
import type { ChatOutcome } from '../types/ai-chat.types'
import { diffChars, type DiffSegment } from '../utils/diff-text'

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
            <ConflictDiff expected={outcome.expectedText} actual={outcome.actualText} />
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

/** The Expected/Found diff for a content-existence conflict. Shared text is muted;
 *  the diverging run is highlighted — coral for what the assistant expected but
 *  didn't find, moss for what's actually there instead — so the delta is visible
 *  at a glance rather than something to eyeball character by character. */
function ConflictDiff({ expected, actual }: { expected: string; actual: string }) {
  const diff = diffChars(expected, actual)
  return (
    <dl className="space-y-1.5 text-[12.5px]">
      <DiffRow
        label="Expected"
        segments={diff.expected}
        changedClass="bg-presence-coral/20 text-presence-coral"
      />
      <DiffRow
        label="Found"
        segments={diff.actual}
        changedClass="bg-presence-moss/20 text-presence-moss"
      />
    </dl>
  )
}

function DiffRow({
  label,
  segments,
  changedClass,
}: {
  label: string
  segments: DiffSegment[]
  changedClass: string
}) {
  return (
    <div className="rounded-sm bg-muted/60 px-2.5 py-1.5">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 whitespace-pre-wrap wrap-break-word text-muted-foreground">
        {segments.map((seg, i) =>
          seg.changed ? (
            <span key={i} className={cn('rounded-[2px]', changedClass)}>
              {seg.text}
            </span>
          ) : (
            <span key={i} className="text-foreground">
              {seg.text}
            </span>
          ),
        )}
      </dd>
    </div>
  )
}
