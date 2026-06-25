import { Skeleton } from '@/components/custom-components/skeleton'

/** Loading state for the documents grid (FE-DOC-1, FE-DESIGN-4). */
export function DocumentsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-md border border-border bg-card p-5">
          <div className="mb-8">
            <Skeleton className="h-4 w-14" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="mt-2.5 h-3 w-24" />
        </div>
      ))}
    </div>
  )
}
