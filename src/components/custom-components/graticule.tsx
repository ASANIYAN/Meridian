import { useId, useMemo } from 'react'
import { cn } from '@/lib/utils'

export type GraticuleState = 'idle' | 'converging' | 'static'

interface GraticuleProps {
  /** Whether the lines draw in once ('idle'), pulse at the node ('converging'),
   *  or render fully converged with no motion ('static'). */
  state?: GraticuleState
  meridians?: number
  rings?: number
  className?: string
  /** Focal point as a fraction of the viewBox (0–1). Defaults to the right seam. */
  focal?: { x: number; y: number }
  /** Angular sweep (radians) the lines/arcs cover, starting at `arcStart`.
   *  Defaults to a sweep aimed away from the right edge. Pass a full turn
   *  (Math.PI * 2) for a focal point away from any edge, so the pattern
   *  radiates symmetrically instead of favoring one side. */
  sweep?: number
  /** Angle (radians) the sweep starts from. */
  arcStart?: number
}

const W = 900
const H = 1000

/**
 * The convergence graticule — meridians and parallels that converge to a single
 * brass node, the literal rendering of "where every edit converges". A radial
 * mask fades the linework away from the node so the convergence reads first.
 */
export function Graticule({
  state = 'idle',
  meridians = 15,
  rings = 7,
  className,
  focal = { x: 1, y: 0.5 },
  sweep = Math.PI * 0.8,
  arcStart = Math.PI * 0.6,
}: GraticuleProps) {
  const maskId = useId()
  const FX = W * focal.x
  const FY = H * focal.y
  const maskCx = `${focal.x * 100}%`
  const maskCy = `${focal.y * 100}%`

  const lines = useMemo(() => {
    const out: { x2: number; y2: number; opacity: number; delay: number }[] = []
    for (let i = 0; i <= meridians; i++) {
      const t = i / meridians
      const angle = arcStart + t * sweep
      const len = W * 1.5
      const near = 1 - Math.abs(t - 0.5) * 2
      out.push({
        x2: FX + Math.cos(angle) * len,
        y2: FY + Math.sin(angle) * len,
        opacity: 0.06 + near * 0.1,
        delay: i * 40,
      })
    }
    return out
  }, [meridians, FX, FY, arcStart, sweep])

  const arcs = useMemo(() => {
    const out: { d: string; opacity: number; delay: number }[] = []
    for (let r = 1; r <= rings; r++) {
      const rad = (W / rings) * r * 0.92
      const a0 = arcStart
      const a1 = arcStart + sweep
      const x0 = FX + Math.cos(a0) * rad
      const y0 = FY + Math.sin(a0) * rad
      const x1 = FX + Math.cos(a1) * rad
      const y1 = FY + Math.sin(a1) * rad
      const largeArc = sweep > Math.PI ? 1 : 0
      out.push({
        d: `M ${x0} ${y0} A ${rad} ${rad} 0 ${largeArc} 1 ${x1} ${y1}`,
        opacity: 0.05 + (r / rings) * 0.05,
        delay: 140 + r * 55,
      })
    }
    return out
  }, [rings, FX, FY, arcStart, sweep])

  const animate = state !== 'static'

  return (
    <svg
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        {/* Fade everything away from the focal node so convergence reads first. */}
        <radialGradient id={`${maskId}-grad`} cx={maskCx} cy={maskCy} r="78%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="55%" stopColor="#888" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        <mask id={maskId}>
          <rect x="0" y="0" width={W} height={H} fill={`url(#${maskId}-grad)`} />
        </mask>
      </defs>

      <g mask={`url(#${maskId})`} stroke="var(--mist)" fill="none">
        {lines.map((l, i) => (
          <line
            key={`m-${i}`}
            x1={FX}
            y1={FY}
            x2={l.x2}
            y2={l.y2}
            strokeWidth={1}
            style={{ opacity: l.opacity, animationDelay: `${l.delay}ms` }}
            className={animate ? 'graticule-line' : undefined}
          />
        ))}
        {arcs.map((a, i) => (
          <path
            key={`p-${i}`}
            d={a.d}
            strokeWidth={1}
            style={{ opacity: a.opacity, animationDelay: `${a.delay}ms` }}
            className={animate ? 'graticule-line' : undefined}
          />
        ))}
      </g>

      {/* The convergence node — always visible, pulses while converging. */}
      <circle
        cx={FX}
        cy={FY}
        r={3}
        fill="var(--brass)"
        opacity={0.9}
        className={state === 'converging' ? 'graticule-node-converging' : undefined}
      />
    </svg>
  )
}
