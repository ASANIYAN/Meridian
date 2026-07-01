import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { AiEditDiff, ChatOutcome } from '../types/ai-chat.types'
import { diffChars, type DiffSegment } from '../utils/diff-text'

/** Per-kind label + accent. Tones are deliberately distinct so partial success
 *  (something happened) never reads like scope/conflict (nothing happened). */
const TONE: Record<ChatOutcome['kind'], { label: string; chip: string; rail: string }> = {
  proposal: {
    label: 'Review',
    chip: 'bg-brass/15 text-brass',
    rail: 'border-brass/40',
  },
  declined: {
    label: 'Declined',
    chip: 'bg-muted text-muted-foreground',
    rail: 'border-border',
  },
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
  'proposal-conflict': {
    label: 'Review again',
    chip: 'bg-presence-coral/15 text-presence-coral',
    rail: 'border-presence-coral/40',
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
  gone: {
    label: 'Expired',
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

/** The assistant side of a turn, visually keyed by result state. */
export function ChatOutcomeCard({
  outcome,
  action,
  onAccept,
  onDecline,
}: {
  outcome: ChatOutcome
  action?: 'accepting' | 'declining'
  onAccept: (proposalId: string, confirm?: boolean) => void
  onDecline: (proposalId: string) => void
}) {
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
        <OutcomeBody outcome={outcome} action={action} onAccept={onAccept} onDecline={onDecline} />
      </div>
    </div>
  )
}

function OutcomeBody({
  outcome,
  action,
  onAccept,
  onDecline,
}: {
  outcome: ChatOutcome
  action?: 'accepting' | 'declining'
  onAccept: (proposalId: string, confirm?: boolean) => void
  onDecline: (proposalId: string) => void
}) {
  switch (outcome.kind) {
    case 'proposal':
      return (
        <ReviewProposal
          proposalId={outcome.proposalId}
          diff={outcome.diff}
          expiresAt={outcome.expiresAt}
          action={action}
          onAccept={onAccept}
          onDecline={onDecline}
        />
      )

    case 'declined':
      return <p>{outcome.message}</p>

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

    case 'proposal-conflict':
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <p>
              The document changed since this proposal was generated
              {typeof outcome.operationIndex === 'number'
                ? ` (operation #${outcome.operationIndex})`
                : ''}
              . Review the returned diff before applying it.
            </p>
            {outcome.message && (
              <p className="text-[12.5px] text-muted-foreground">{outcome.message}</p>
            )}
          </div>
          {outcome.diff && <DiffPreview diff={outcome.diff} />}
          {outcome.expectedText !== undefined && outcome.actualText !== undefined && (
            <ConflictDiff expected={outcome.expectedText} actual={outcome.actualText} />
          )}
          <ProposalActions
            proposalId={outcome.proposalId}
            action={action}
            confirm={outcome.requiresConfirmation}
            onAccept={onAccept}
            onDecline={onDecline}
          />
        </div>
      )

    case 'content-conflict':
      return (
        <div className="space-y-2">
          <p>
            The assistant could not safely anchor that edit
            {typeof outcome.operationIndex === 'number'
              ? ` (operation #${outcome.operationIndex})`
              : ''}
            . Nothing was proposed. Ask again with a more specific instruction.
          </p>
          {outcome.message && (
            <p className="text-[12.5px] text-muted-foreground">{outcome.message}</p>
          )}
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

    case 'gone':
      return <p>{outcome.message || 'This proposal no longer exists. Ask the assistant again.'}</p>

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

function ReviewProposal({
  proposalId,
  diff,
  expiresAt,
  action,
  onAccept,
  onDecline,
}: {
  proposalId: string
  diff: AiEditDiff
  expiresAt: string
  action?: 'accepting' | 'declining'
  onAccept: (proposalId: string, confirm?: boolean) => void
  onDecline: (proposalId: string) => void
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <p>Review this AI edit before it changes the document.</p>
        <p className="text-[12.5px] text-muted-foreground">Expires {formatExpiry(expiresAt)}.</p>
      </div>
      <DiffPreview diff={diff} />
      <ProposalActions
        proposalId={proposalId}
        action={action}
        confirm={true}
        onAccept={onAccept}
        onDecline={onDecline}
      />
    </div>
  )
}

function ProposalActions({
  proposalId,
  action,
  confirm = false,
  onAccept,
  onDecline,
}: {
  proposalId: string
  action?: 'accepting' | 'declining'
  confirm?: boolean
  onAccept: (proposalId: string, confirm?: boolean) => void
  onDecline: (proposalId: string) => void
}) {
  const disabled = action !== undefined
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant="primary"
        disabled={disabled}
        onClick={() => onAccept(proposalId, confirm)}
      >
        {action === 'accepting' ? 'Applying…' : confirm ? 'Apply anyway' : 'Accept'}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={() => onDecline(proposalId)}
      >
        {action === 'declining' ? 'Declining…' : 'Decline'}
      </Button>
    </div>
  )
}

function DiffPreview({ diff }: { diff: AiEditDiff }) {
  return (
    <dl className="space-y-2 text-[12.5px]">
      <PreviewRow label="Before" text={diff.before} />
      <PreviewRow label="After" text={diff.after} />
    </dl>
  )
}

function PreviewRow({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-sm bg-muted/60 px-2.5 py-1.5">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 max-h-40 overflow-y-auto whitespace-pre-wrap wrap-break-word text-muted-foreground">
        {text}
      </dd>
    </div>
  )
}

function formatExpiry(expiresAt: string) {
  const time = new Date(expiresAt)
  if (Number.isNaN(time.getTime())) return 'soon'
  return time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
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
