import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Graticule, type GraticuleState } from '@/components/custom-components/graticule'
import { Button } from '@/components/ui/button'
import { ConvergenceDemo } from './convergence-demo'

export function HeroSection() {
  const [graticuleState, setGraticuleState] = useState<GraticuleState>('idle')

  useEffect(() => {
    const timer = setTimeout(() => setGraticuleState('converging'), 1600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 20%, rgba(205,163,73,0.06), transparent 55%), radial-gradient(100% 100% at 30% 20%, #122033, var(--ink) 70%)',
        }}
      />

      <Graticule
        state={graticuleState}
        focal={{ x: 0.5, y: 0.12 }}
        sweep={Math.PI * 2}
        arcStart={0}
      />

      <div className="stagger relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-24 text-center md:py-32">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          Real-time · Multiplayer · Prose
        </p>

        <h1 className="max-w-[22ch] font-display text-[clamp(2.5rem,5.5vw,4.5rem)] font-normal leading-[1.05] tracking-[-0.02em] text-foreground [font-optical-sizing:auto]">
          Where every edit&nbsp;<em className="italic text-brass-soft">converges</em>, instantly.
        </h1>

        <p className="max-w-[46ch] text-balance text-base leading-relaxed text-muted-foreground md:text-lg">
          Meridian is a real-time collaborative document editor — continuous prose, not blocks.
          Write together, watch every change merge safely, never lose a word.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild variant="accent" size="lg">
            <Link to="/signup">Start writing</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>

        <div className="mt-6 w-full max-w-120">
          <ConvergenceDemo />
        </div>
      </div>
    </section>
  )
}
