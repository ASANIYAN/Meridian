import { useInViewReveal } from '../hooks/use-in-view-reveal'

const STEPS = [
  { label: 'Create a document', description: 'Start a new document — you’re its author.' },
  {
    label: 'Invite your team',
    description: 'Share a link scoped to a role and an expiry, and they’re in.',
  },
  {
    label: 'Write together',
    description: 'Every edit lands for everyone at once, merged safely in real time.',
  },
] as const

/**
 * The one legitimate numbered sequence on the page — order genuinely
 * matters here (you invite after creating, not before).
 */
export function HowItWorksSection() {
  const { ref, revealed } = useInViewReveal<HTMLOListElement>()

  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-[40ch] text-center">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            How it works
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-normal leading-[1.1] tracking-[-0.015em] text-foreground [font-optical-sizing:auto]">
            From blank page to shared page.
          </h2>
        </div>

        <ol
          ref={ref}
          data-revealed={revealed}
          className="reveal-group mt-14 grid gap-8 md:grid-cols-3"
        >
          {STEPS.map((step, i) => (
            <li key={step.label} className="flex flex-col gap-3">
              <span className="font-mono text-sm font-medium text-brass">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-lg font-normal text-foreground [font-optical-sizing:auto]">
                {step.label}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
