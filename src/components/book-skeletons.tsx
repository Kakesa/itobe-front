import { Skeleton } from "@/components/ui/skeleton";

export function BookCardSkeleton({ showPrix = true }: { showPrix?: boolean }) {
  return (
    <div className="block" aria-hidden>
      <Skeleton className="aspect-[2/3] w-full rounded-md" />
      <Skeleton className="mt-3 h-5 w-[92%]" />
      <Skeleton className="mt-2 h-3 w-[65%]" />
      {showPrix && <Skeleton className="mt-2 h-4 w-[40%]" />}
    </div>
  );
}

export function CatalogueLivresSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} showPrix />
      ))}
    </>
  );
}

export function LivreDetailSkeleton() {
  return (
    <div className="fiche-livre-v2" aria-busy="true" aria-label="Chargement de la fiche livre">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-10">
        <div className="fiche-livre-v2__hero">
          <aside className="fiche-livre-v2__preview">
            <Skeleton className="mx-auto aspect-[2/3] w-full max-w-[300px] rounded-lg" />
          </aside>

          <div className="fiche-livre-v2__info space-y-4">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-10 w-full max-w-xl" />
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-10 w-28 rounded-sm" />
              <Skeleton className="h-10 w-24 rounded-sm" />
            </div>
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-4 w-44" />
            <div className="flex flex-wrap gap-3 pt-2">
              <Skeleton className="h-11 w-40 rounded-sm" />
              <Skeleton className="h-11 w-36 rounded-sm" />
            </div>
            <div className="grid gap-3 pt-4 sm:grid-cols-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full max-w-[180px]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-2 border-b border-border pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-sm" />
          ))}
        </div>

        <div className="mt-8 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[94%]" />
          <Skeleton className="h-4 w-[88%]" />
          <Skeleton className="h-4 w-[72%]" />
        </div>

        <div className="mt-12 flex gap-4 rounded-lg border border-border p-6">
          <Skeleton className="size-16 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
