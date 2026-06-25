import { Link } from 'react-router-dom'
import { AuthPlate } from '@/components/custom-components/auth-plate'
import { Cartouche } from '@/components/custom-components/cartouche'
import { Button } from '@/components/ui/button'
import { JoinLayout } from '../components/join-layout'

/**
 * Presentational claim screen. The real flow (FE-SHARE-5) validates the token,
 * preserves it through signup/login for a session-less visitor, handles the
 * revoked / expired / already-claimed failures with distinct copy, and on a
 * valid claim redirects straight into the document with the granted role.
 */
export function ClaimView() {
  // Stand-in invite details; the real values come from the token validation.
  const documentTitle = 'Q2 Field Notes'
  const role = 'Editor'

  return (
    <JoinLayout>
      <AuthPlate className="text-center">
        <Cartouche coordinate="SHARE LINK" title="Invitation" />

        <p className="text-[13.5px] leading-relaxed text-muted-foreground">
          You've been invited to a document on Meridian as
          <span className="ml-1.5 inline-flex items-center rounded-full border border-[color:color-mix(in_srgb,var(--brass)_35%,transparent)] px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-brass-soft">
            {role}
          </span>
        </p>

        <h2 className="font-display text-[1.625rem] leading-tight text-foreground">{documentTitle}</h2>

        <div className="space-y-2.5">
          <Button asChild variant="accent" size="lg" className="w-full">
            <Link to="/login">Sign in to accept</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to="/signup">Create an account</Link>
          </Button>
        </div>

        <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground/70">
          Editors can write · viewers can read
        </p>
      </AuthPlate>
    </JoinLayout>
  )
}
