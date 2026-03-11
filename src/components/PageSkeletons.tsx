import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export function BattlesSkeleton() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="border-border/10 bg-background/95 sticky top-14 z-30 -mx-4 mb-8 border-b px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>

            <div className="flex w-full items-center gap-2 sm:gap-3 lg:w-auto">
              <div className="relative flex-1 lg:w-[320px]">
                <Skeleton className="h-11 w-full rounded-2xl" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-11 w-11 rounded-2xl lg:hidden" />
                <div className="hidden items-center gap-4 lg:flex">
                  <Skeleton className="h-10 w-32 rounded-xl" />
                  <Skeleton className="h-10 w-32 rounded-xl" />
                  <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {[...Array(3)].map((_, gi) => (
            <div key={gi} className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="border-border overflow-hidden rounded-lg border"
                  >
                    <Skeleton className="aspect-video w-full rounded-none" />
                    <div className="space-y-2 p-3.5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function EmceesSkeleton() {
  return (
    <div className="selection:bg-primary/20 min-h-screen bg-[#09090b] text-[#fafafa]">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="border-border/10 bg-background/95 sticky top-14 z-30 -mx-4 mb-8 border-b px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-md">
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-40 rounded-xl" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="relative flex min-h-40 flex-col justify-between rounded-3xl border border-white/5 bg-[#141417] p-6"
            >
              <div className="flex items-start justify-between">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
