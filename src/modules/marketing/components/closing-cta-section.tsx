import { Link } from 'react-router-dom'
import { Graticule } from '@/components/custom-components/graticule'
import { Button } from '@/components/ui/button'

/**
 * The closing bookend — same dark chart register as the hero, but calm:
 * a static graticule (no draw-in, no pulse) so the page ends settled
 * rather than repeating the opening beat.
 */
export function ClosingCtaSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(100% 100% at 50% 50%, #122033, var(--ink) 70%)',
        }}
      />
      {/* Focal point sits above the copy, not behind it — the node is a
          small opaque circle and would otherwise land inside the text. */}
      <Graticule
        state="static"
        focal={{ x: 0.5, y: 0.08 }}
        sweep={Math.PI * 2}
        arcStart={0}
        className="opacity-50"
      />

      <div className="relative mx-auto flex max-w-[40rem] flex-col items-center gap-6 px-6 py-24 text-center">
        <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-normal leading-[1.1] tracking-[-0.015em] text-foreground [font-optical-sizing:auto]">
          Start your first document.
        </h2>
        <p className="max-w-[38ch] text-base leading-relaxed text-muted-foreground">
          Just a document and the people you invite to it.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild variant="accent" size="lg">
            <Link to="/signup">Start writing</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
