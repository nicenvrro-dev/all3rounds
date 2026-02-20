"use client";

import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users } from "lucide-react";

// Type based on our DB schema
type Battle = {
  id: string;
  title: string;
  youtube_id: string;
  event_name: string | null;
  event_date: string | null;
  url: string;
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Unknown Date";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function BattlesDirectory() {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    async function fetchBattles() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("battles")
          .select("*")
          .order("event_date", { ascending: false });

        if (error) throw error;
        setBattles(data || []);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || "Failed to fetch battles.");
        } else {
          setError("Failed to fetch battles.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchBattles();
  }, []);

  const filteredBattles = battles.filter(
    (b) =>
      b.title.toLowerCase().includes(filter.toLowerCase()) ||
      b.event_name?.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-primary drop-shadow-[2px_2px_0px_var(--color-secondary)]">
              All Battles
            </h1>
            <p className="text-muted-foreground font-medium">
              Explore the entire FlipTop verse directory.
            </p>
          </div>
          <div className="w-full max-w-xs">
            <input
              type="text"
              placeholder="Filter by emcee or event..."
              className="w-full rounded-lg border-2 border-border bg-card px-4 py-2 text-sm shadow-sm transition-all focus:border-primary outline-none focus:ring-2 focus:ring-primary/20"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-lg border-2 border-red-500/50 bg-red-500/10 p-4 text-center text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse overflow-hidden">
                <div className="aspect-video w-full bg-muted" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-6 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredBattles.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">
              No battles found matching &quot;{filter}&quot;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBattles.map((battle) => (
              <Link key={battle.id} href={`/battle/${battle.id}`}>
                <Card className="group h-full overflow-hidden border-2 border-border bg-card transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[4px_4px_0_var(--color-primary)]">
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {/* Fallback image style while loading, using YouTube's maxresdefault (or hqdefault if max doesn't exist) */}
                    <div className="relative h-full w-full">
                      <Image
                        src={`https://img.youtube.com/vi/${battle.youtube_id}/mqdefault.jpg`}
                        alt={battle.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-transparent" />
                  </div>
                  <CardContent className="flex flex-col justify-between p-4 h-[120px]">
                    <h2 className="line-clamp-2 text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
                      {battle.title}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
                      {battle.event_name && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {battle.event_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(battle.event_date)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function BattlesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <BattlesDirectory />
    </Suspense>
  );
}
