import { useInViewReveal } from '../hooks/use-in-view-reveal'

/**
 * A stylized mockup, not the live editor — the real `.meridian-editor` type
 * rules (src/index.css) are reused here for visual authenticity, so what a
 * visitor sees actually matches what they'll write in.
 */
export function ProseSection() {
  const { ref, revealed } = useInViewReveal<HTMLDivElement>()

  return (
    <section className="bg-background py-24">
      <div
        ref={ref}
        data-revealed={revealed}
        className="reveal mx-auto grid max-w-[72rem] gap-12 px-6 md:grid-cols-[0.85fr_1.15fr] md:items-center"
      >
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Continuous prose
          </p>
          <h2 className="mt-3 max-w-[16ch] font-display text-[clamp(1.75rem,3vw,2.5rem)] font-normal leading-[1.1] tracking-[-0.015em] text-foreground [font-optical-sizing:auto]">
            A document, not a grid of blocks.
          </h2>
          <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-muted-foreground">
            Meridian reads and writes like Google Docs, not a stack of draggable tiles. Headings,
            quotes, and lists flow as one continuous page, so the document looks the way it will
            when someone actually reads it.
          </p>
        </div>

        <div className="meridian-editor rounded-lg border border-border bg-card p-8 shadow-[0_20px_50px_-25px_rgba(15,26,42,0.35)]">
          <h2>The lighthouse keeper&apos;s log</h2>
          <p>
            Wind out of the northwest, steady since dawn. Visibility holding past the outer buoy —
            good enough to log the passage without a second read.
          </p>
          <blockquote>&ldquo;Keep the lamp trimmed before the fog rolls in.&rdquo;</blockquote>
          <p>Logged and confirmed by two hands, same page, same minute.</p>
        </div>
      </div>
    </section>
  )
}
