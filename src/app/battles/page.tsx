import { Suspense } from "react";
import { createPublicClient } from "@/lib/supabase/server";
import BattlesDirectory from "./BattlesDirectory";
import { BattlesSkeleton } from "@/components/PageSkeletons";

// ============================================================================
// Page Export (Server Component)
// ============================================================================

export const revalidate = 86400; // 24 hours (1 day)

export default async function BattlesPage() {
  const supabase = createPublicClient();

  // Fetch initial data on the server
  // Note: We use the same parameters as the default client state
  const response = await supabase
    .from("battles")
    .select("id, title, youtube_id, event_name, event_date, status, url", {
      count: "exact",
    })
    .neq("status", "excluded")
    .order("event_date", { ascending: false, nullsFirst: false });

  if (response.error) {
    console.error("Error fetching battles on server:", response.error);
  }

  const initialBattles = response.data || [];
  const initialCount = response.count || 0;

  // Derive filter data from initial matches to avoid a second heavy query
  // Note: Since this is the default view (no status/year filter applied by default in the server component),
  // this array contains all candidates for common filters.
  const initialYears = Array.from(
    new Set(
      initialBattles
        .filter((d) => d.event_date)
        .map((d) => d.event_date!.split("-")[0]),
    ),
  ).sort((a, b) => b.localeCompare(a));

  const initialEventNames = Array.from(
    new Set(initialBattles.map((d) => d.event_name).filter(Boolean)),
  )
    .sort((a, b) => a!.localeCompare(b!))
    .filter((n): n is string => n !== null);

  return (
    <Suspense fallback={<BattlesSkeleton />}>
      <BattlesDirectory
        initialBattles={initialBattles}
        initialCount={initialCount}
        initialYears={initialYears}
        initialEventNames={initialEventNames}
      />
    </Suspense>
  );
}
