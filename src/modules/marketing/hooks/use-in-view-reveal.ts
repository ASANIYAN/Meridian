import { useEffect, useRef, useState } from 'react'

/**
 * Fires once when the element enters the viewport, then disconnects — the
 * scroll-triggered counterpart to the page-load `.stagger`/`.rise` entrance
 * used on the hero. Never re-hides content on scroll-away (CLAUDE.md's
 * "no flickering" bar applies to marketing surfaces too).
 */
export function useInViewReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [revealed, setRevealed] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '-100px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return { ref, revealed }
}
