import { useInViewReveal } from '../hooks/use-in-view-reveal'

const ROLES = [
  {
    name: 'Author',
    description:
      'Creates the document, sets who can join, and is the only one who can ask the AI assistant to edit on their behalf.',
  },
  {
    name: 'Editor',
    description: 'Writes and edits the document in real time, right alongside everyone else.',
  },
  {
    name: 'Viewer',
    description: 'Reads the live document as it changes, without changing it themselves.',
  },
] as const

export function RolesSection() {
  const { ref, revealed } = useInViewReveal<HTMLDivElement>()

  return (
    <section className="bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-[40ch] text-center">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Who's in the document
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-normal leading-[1.1] tracking-[-0.015em] text-foreground [font-optical-sizing:auto]">
            One document, three ways in.
          </h2>
        </div>

        <div
          ref={ref}
          data-revealed={revealed}
          className="reveal-group mt-14 grid gap-6 md:grid-cols-3"
        >
          {ROLES.map((role) => (
            <div key={role.name} className="rounded-lg border border-border bg-card p-7">
              <h3 className="font-display text-xl font-normal text-foreground [font-optical-sizing:auto]">
                {role.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {role.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
