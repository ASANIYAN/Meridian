/** Suspense fallback for lazily-loaded routes. */
export function RouteFallback() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background">
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        Loading…
      </p>
    </div>
  )
}
