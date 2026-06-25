import type { ReactNode } from 'react'
import { Cartouche } from '@/components/custom-components/cartouche'

type NoticeTone = 'sent' | 'success' | 'error'

interface AuthNoticeProps {
  coordinate: string
  title: string
  heading: string
  description: ReactNode
  /** Action area — typically a link back to sign in. */
  footer?: ReactNode
  tone?: NoticeTone
}

function NoticeMark({ tone }: { tone: NoticeTone }) {
  const stroke = tone === 'error' ? 'var(--muted-foreground)' : 'var(--brass)'
  return (
    <span
      className="mb-5 inline-flex size-11 items-center justify-center rounded-full border"
      style={{ borderColor: 'color-mix(in srgb, var(--brass) 30%, transparent)' }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        {tone === 'sent' && (
          <>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </>
        )}
        {tone === 'success' && <polyline points="4 12 10 18 20 6" />}
        {tone === 'error' && <line x1="5" y1="12" x2="19" y2="12" />}
      </svg>
    </span>
  )
}

/**
 * The message state shared by signup's check-email, forgot/resend confirmations,
 * and verify-email's success/failure — all the auth moments that show a result
 * rather than a form. Copy gives direction; tone is restrained on purpose so
 * security states never leak whether an account exists.
 */
export function AuthNotice({
  coordinate,
  title,
  heading,
  description,
  footer,
  tone = 'sent',
}: AuthNoticeProps) {
  return (
    <>
      <Cartouche coordinate={coordinate} title={title} />
      <div className="text-center">
        <NoticeMark tone={tone} />
        <h2 className="font-display text-[1.5rem] leading-tight text-foreground">{heading}</h2>
        <p className="mx-auto mt-2 max-w-[34ch] text-[13.5px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {footer && <div className="text-center">{footer}</div>}
    </>
  )
}
