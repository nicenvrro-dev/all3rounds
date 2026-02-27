"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Mic2,
  Search,
  FileText,
  Filter,
  ArrowUpDown,
  X,
  ListFilter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StatusBadge, STATUS_CONFIG } from "@/components/StatusBadge";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// ============================================================================
// Types
// ============================================================================

type BattleStatus = "raw" | "arranged" | "reviewing" | "reviewed";

type Battle = {
  id: string;
  title: string;
  youtube_id: string;
  event_name: string | null;
  event_date: string | null;
  url: string;
  status: BattleStatus;
};

type EventGroup = {
  name: string;
  date: string | null;
  battles: Battle[];
};

// ============================================================================
// Helpers
// ============================================================================

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatEventDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
  });
}

/** Group battles by event_name, respecting the selected sort order. */
function groupByEvent(
  battles: Battle[],
  sortBy: string = "latest",
): EventGroup[] {
  const groups = new Map<string, EventGroup>();

  for (const battle of battles) {
    const key = battle.event_name || "Other Battles";
    if (!groups.has(key)) {
      groups.set(key, { name: key, date: battle.event_date, battles: [] });
    }
    groups.get(key)!.battles.push(battle);
  }

  // Sort groups: most recent event date first
  return Array.from(groups.values()).sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return sortBy === "latest" ? dateB - dateA : dateA - dateB;
  });
}

// ============================================================================
// Battle Card
// ============================================================================

function BattleCard({ battle }: { battle: Battle }) {
  return (
    <Link href={`/battle/${battle.id}`} className="group block">
      <div className="overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-md">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <Image
            src={`https://img.youtube.com/vi/${battle.youtube_id}/mqdefault.jpg`}
            alt={battle.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {/* Top-right scrim for badge legibility */}
          <div className="absolute inset-0 bg-linear-to-bl from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Status Badge Over Image */}
          <div className="absolute right-2 top-2">
            <StatusBadge
              status={battle.status}
              noTooltip
              className="backdrop-blur-xl"
            />
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {battle.title}
          </h3>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            {battle.event_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 shrink-0" />
                {formatDate(battle.event_date)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// Event Section
// ============================================================================

function EventSection({
  group,
  defaultOpen = true,
  onToggle,
}: {
  group: EventGroup;
  defaultOpen?: boolean;
  onToggle?: (name: string, isOpen: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Sync internal state with prop changes (for URL sync)
  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    onToggle?.(group.name, next);
  };

  return (
    <section className="space-y-4">
      {/* Event Header */}
      <Button
        variant="ghost"
        onClick={handleToggle}
        className="group/header h-auto w-full items-center justify-start gap-3 p-0 px-2 py-1 text-left hover:bg-transparent"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-colors group-hover/header:text-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors group-hover/header:text-foreground" />
          )}
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {group.name}
          </h2>
        </div>

        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {group.battles.length}
        </span>

        {group.date && (
          <span className="ml-auto text-xs text-muted-foreground">
            {formatEventDate(group.date)}
          </span>
        )}
      </Button>

      {/* Battle Grid */}
      {isOpen && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {group.battles.map((battle) => (
            <BattleCard key={battle.id} battle={battle} />
          ))}
        </div>
      )}
    </section>
  );
}

// ============================================================================
// Main Component
// ============================================================================

function BattlesDirectory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -- Filter State from URL --
  const filter = searchParams.get("q") || "";
  const statusFilter = searchParams.get("status") || "all";
  const yearFilter = searchParams.get("year") || "all";
  const sortBy = searchParams.get("sort") || "latest";

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Fallback to LocalStorage for "memory" only (No URL sync for expansion)
    const saved = localStorage.getItem("a3r_expanded_groups");
    if (saved) {
      setExpandedGroups(new Set(saved.split("|")));
    }
  }, []);

  useEffect(() => {
    async function fetchBattles() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("battles")
          .select("*")
          .neq("status", "excluded");

        if (error) throw error;
        setBattles(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch battles.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchBattles();
  }, []);

  // Update URL helpers
  const updateSearch = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "all" || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const handleToggleGroup = (name: string, isOpen: boolean) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (isOpen) next.add(name);
      else next.delete(name);

      const nextStr = Array.from(next).join("|");

      // Update LocalStorage for long-term memory
      localStorage.setItem("a3r_expanded_groups", nextStr);

      return next;
    });
  };

  // Derive available years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    battles.forEach((b) => {
      if (b.event_date) {
        years.add(b.event_date.split("-")[0]);
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [battles]);

  // Apply filters and sorting
  const filteredBattles = useMemo(() => {
    let result = [...battles];

    // Search
    if (filter) {
      const q = filter.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.event_name?.toLowerCase().includes(q),
      );
    }

    // Status
    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }

    // Year
    if (yearFilter !== "all") {
      result = result.filter((b) => b.event_date?.startsWith(yearFilter));
    }

    // Sort
    result.sort((a, b) => {
      const dateA = a.event_date ? new Date(a.event_date).getTime() : 0;
      const dateB = b.event_date ? new Date(b.event_date).getTime() : 0;
      return sortBy === "latest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [battles, filter, statusFilter, yearFilter, sortBy]);

  const eventGroups = useMemo(
    () => groupByEvent(filteredBattles, sortBy),
    [filteredBattles, sortBy],
  );

  const clearFilters = () => {
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilters =
    filter ||
    statusFilter !== "all" ||
    yearFilter !== "all" ||
    sortBy !== "latest";

  const FilterContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={cn(
        "flex flex-col gap-6",
        !mobile && "sm:flex-row sm:items-center sm:gap-4",
      )}
    >
      {/* Status Filter */}
      <div className="space-y-2 flex-1">
        {mobile && (
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Status
          </label>
        )}
        <Select
          value={statusFilter}
          onValueChange={(v) => updateSearch({ status: v })}
        >
          <SelectTrigger className="w-full sm:w-[140px] bg-card/50">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([id, config]) => (
              <SelectItem key={id} value={id}>
                <div className="flex items-center gap-2">
                  <config.icon className="h-3.5 w-3.5" />
                  <span>{config.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year Filter */}
      <div className="space-y-2 flex-1 text-white">
        {mobile && (
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Year
          </label>
        )}
        <Select
          value={yearFilter}
          onValueChange={(v) => updateSearch({ year: v })}
        >
          <SelectTrigger className="w-full sm:w-[100px] bg-card/50">
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {availableYears.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort Filter */}
      <div className="space-y-1.5 flex-1">
        {mobile && (
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Sort By
          </label>
        )}
        <Select value={sortBy} onValueChange={(v) => updateSearch({ sort: v })}>
          <SelectTrigger className="w-full sm:w-[130px] bg-card/50">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <SelectValue placeholder="Sort" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9 px-2 text-muted-foreground hover:text-foreground"
        >
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Battles
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider opacity-60">
              {battles.length} battles •{" "}
              {new Set(battles.map((b) => b.event_name).filter(Boolean)).size}{" "}
              events
            </p>
          </div>

          {/* Search & Filters Container */}
          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
            {/* Mobile Filter Trigger (Left Side) */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden h-10 w-10 shrink-0 bg-muted/20 border-border/50"
                >
                  <ListFilter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-[60vh] rounded-t-[2.5rem] border-t border-border/10 bg-background/95 backdrop-blur-xl p-8 pt-10"
              >
                <div className="mx-auto mb-8 h-1.5 w-12 rounded-full bg-muted/40" />
                <SheetHeader className="mb-10 text-left">
                  <SheetTitle className="text-2xl font-black uppercase tracking-tighter italic">
                    Filter Archive
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <FilterContent mobile />
                </div>
              </SheetContent>
            </Sheet>

            {/* Search Input */}
            <div className="relative flex-1 lg:w-[320px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
              <input
                type="text"
                placeholder="Search battles or events..."
                className="w-full h-10 rounded-xl border border-border/50 bg-muted/20 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-all focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/5"
                value={filter}
                onChange={(e) => updateSearch({ q: e.target.value })}
              />
            </div>

            {/* Desktop Filters (Always Right) */}
            <div className="hidden lg:block ml-2">
              <FilterContent />
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-10">
            {[...Array(2)].map((_, gi) => (
              <div key={gi} className="space-y-4">
                <div className="h-6 w-40 animate-pulse rounded bg-muted" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse overflow-hidden rounded-lg border border-border"
                    >
                      <div className="aspect-video w-full bg-muted" />
                      <div className="space-y-2 p-3.5">
                        <div className="h-4 w-3/4 rounded bg-muted" />
                        <div className="h-3 w-1/2 rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filteredBattles.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <Mic2 className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {filter
                ? `No battles found matching "${filter}"`
                : "No battles have been transcribed yet."}
            </p>
          </div>
        ) : (
          /* Event Groups */
          <div className="space-y-10">
            {eventGroups.map((group, idx) => (
              <EventSection
                key={group.name}
                group={group}
                defaultOpen={
                  expandedGroups.has(group.name) ||
                  (expandedGroups.size === 0 && idx === 0)
                }
                onToggle={handleToggleGroup}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// ============================================================================
// Page Export
// ============================================================================

export default function BattlesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <BattlesDirectory />
    </Suspense>
  );
}
