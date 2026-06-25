import { AppShell } from '@/components/custom-components/app-shell'

/**
 * Preview-only — shows the AppShell on the light register with sample slot
 * content. The real connection-status indicator (FE-COLLAB-8), presence stack
 * (FE-PRESENCE-2), and documents list (FE-DOC-1) replace these stand-ins.
 */

function ConnectionStatusDemo() {
  return (
    <div className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:flex">
      <span className="size-1.5 rounded-full bg-presence-moss" />
      Connected · 3 present
    </div>
  )
}

function PresenceDemo() {
  const people = [
    { initials: 'AL', color: 'var(--presence-teal)' },
    { initials: 'GH', color: 'var(--presence-coral)' },
    { initials: 'RN', color: 'var(--presence-violet)' },
  ]
  return (
    <div className="flex -space-x-2">
      {people.map((p) => (
        <span
          key={p.initials}
          className="grid size-8 place-items-center rounded-full font-mono text-[10.5px] font-medium text-white ring-2 ring-background"
          style={{ backgroundColor: p.color }}
        >
          {p.initials}
        </span>
      ))}
    </div>
  )
}

const docs = [
  { title: 'Q2 Field Notes', role: 'Author', updated: '2h ago' },
  { title: 'Onboarding Rewrite', role: 'Editor', updated: 'Yesterday' },
  { title: 'Release Notes — 0.4', role: 'Viewer', updated: '3d ago' },
]

export function AppShellPreview() {
  return (
    <AppShell
      user={{ name: 'Ada Lovelace', email: 'ada@studio.com' }}
      connectionStatus={<ConnectionStatusDemo />}
      presence={<PresenceDemo />}
    >
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-[1.75rem] leading-tight text-foreground">Documents</h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            Everything you can write in or read. Collaborators join from a share link.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((d) => (
          <article
            key={d.title}
            className="rounded-md border border-border bg-card p-5 transition-shadow duration-150 ease-out hover:shadow-[0_12px_30px_-18px_rgba(15,26,42,0.3)]"
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                {d.role}
              </span>
              <span className="size-1.5 rounded-full bg-mist" />
            </div>
            <h2 className="font-display text-[1.25rem] leading-snug text-foreground">{d.title}</h2>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              Updated {d.updated}
            </p>
          </article>
        ))}
      </div>
    </AppShell>
  )
}
