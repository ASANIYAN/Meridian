import type { ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { AuthPlate } from '@/components/custom-components/auth-plate'
import { Cartouche } from '@/components/custom-components/cartouche'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'
import { getApiErrorStatus } from '@/lib/api/get-api-error-message'
import { JoinLayout } from '../components/join-layout'
import { claimErrorCopy, useClaimLink } from '../hooks/use-claim-link'

/**
 * Public share-link claim screen (FE-SHARE-5). The real link is
 * /join/:id?token= — the document id is the path segment, the token the query
 * param — which maps 1:1 onto POST /documents/:id/links/validate?token=.
 *
 * Claiming is authenticated (membership is granted to the JWT's user), so a
 * signed-out visitor authenticates first and is returned here via `?redirect=`,
 * at which point they can accept. There is no preview endpoint — validating *is*
 * claiming — so the invite copy is deliberately generic until the user accepts.
 */
export function ClaimView() {
  const { id = '' } = useParams()
  const [search] = useSearchParams()
  const token = search.get('token') ?? ''
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))
  const claim = useClaimLink(id, token)

  // A malformed link — missing either half — can never be claimed.
  if (!id || !token) {
    return (
      <ClaimPlate coordinate="SHARE LINK" title="Invalid invite">
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">
          This invite link is incomplete. Ask the author to send you a fresh one.
        </p>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link to="/documents">Go to Meridian</Link>
        </Button>
      </ClaimPlate>
    )
  }

  // Signed-out visitor: authenticate first, then return here to accept.
  if (!isAuthenticated) {
    const claimUrl = `/join/${id}?token=${encodeURIComponent(token)}`
    const redirect = encodeURIComponent(claimUrl)
    return (
      <ClaimPlate coordinate="SHARE LINK" title="You're invited">
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">
          You've been invited to collaborate on a Meridian document. Sign in or create an account to
          accept.
        </p>
        <div className="space-y-2.5">
          <Button asChild variant="accent" size="lg" className="w-full">
            <Link to={`/login?redirect=${redirect}`}>Sign in to accept</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to={`/signup?redirect=${redirect}`}>Create an account</Link>
          </Button>
        </div>
      </ClaimPlate>
    )
  }

  // Authenticated, but the claim failed for a real reason (409 already-member is
  // handled in the hook by navigating straight in, so it never lands here).
  if (claim.isError && getApiErrorStatus(claim.error) !== 409) {
    const copy = claimErrorCopy(claim.error)
    return (
      <ClaimPlate coordinate="SHARE LINK" title={copy.title}>
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">{copy.body}</p>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link to="/documents">Back to documents</Link>
        </Button>
      </ClaimPlate>
    )
  }

  // Authenticated and ready: explicit accept (validating is claiming).
  return (
    <ClaimPlate coordinate="SHARE LINK" title="Accept invitation">
      <p className="text-[13.5px] leading-relaxed text-muted-foreground">
        Joining adds this document to your Meridian library with the role the author chose for you.
      </p>
      <div className="space-y-2.5">
        <Button
          variant="accent"
          size="lg"
          className="w-full"
          disabled={claim.isPending}
          onClick={() => claim.mutate()}
        >
          {claim.isPending ? 'Joining…' : 'Accept & open document'}
        </Button>
        <Button asChild variant="ghost" size="lg" className="w-full">
          <Link to="/documents">Not now</Link>
        </Button>
      </div>
    </ClaimPlate>
  )
}

/** Shared plate chrome for every claim state. */
function ClaimPlate({
  coordinate,
  title,
  children,
}: {
  coordinate: string
  title: string
  children: ReactNode
}) {
  return (
    <JoinLayout>
      <AuthPlate className="space-y-5 text-center">
        <Cartouche coordinate={coordinate} title={title} />
        {children}
      </AuthPlate>
    </JoinLayout>
  )
}
