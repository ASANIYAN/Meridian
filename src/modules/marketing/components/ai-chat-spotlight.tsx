import { useInViewReveal } from '../hooks/use-in-view-reveal'

/**
 * A single feature callout, not a card grid — this is one differentiator
 * (author-only AI editing) that deserves its own beat, not a tile among many.
 */
export function AiChatSpotlight() {
  const { ref, revealed } = useInViewReveal<HTMLDivElement>()

  return (
    <section className="bg-background py-24">
      <div
        ref={ref}
        data-revealed={revealed}
        className="reveal mx-auto flex max-w-[54rem] flex-col items-center gap-5 px-6 text-center"
      >
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          For authors
        </p>
        <h2 className="max-w-[20ch] font-display text-[clamp(1.75rem,3vw,2.5rem)] font-normal leading-[1.1] tracking-[-0.015em] text-foreground [font-optical-sizing:auto]">
          Ask the assistant to make the edit for you.
        </h2>
        <p className="max-w-[48ch] text-base leading-relaxed text-muted-foreground">
          As the author, you can describe a change in plain language and the AI assistant edits the
          document directly — the same document your collaborators are looking at, updated the same
          way a person&apos;s edit would be.
        </p>
      </div>
    </section>
  )
}
