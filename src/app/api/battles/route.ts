import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCached, setCached } from "@/lib/cache";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { parseSearchTokens, scoreBattle } from "@/lib/fuzzy-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "all";
  const year = searchParams.get("year") || "all";
  const sort = searchParams.get("sort") || "latest";

  // --- Rate limiting ---
  const rateLimitKey = `battles_dir:${request.headers.get("x-forwarded-for") || "unknown"}`;
  const rateRes = await checkRateLimit(rateLimitKey, "directory");

  if (!rateRes.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      {
        status: 429,
        headers: {
          ...getRateLimitHeaders(rateRes),
          "Retry-After": "60",
        },
      },
    );
  }

  // --- Cache check ---
  const cacheKey = `battles:q:${q || "none"}:status:${status}:year:${year}:sort:${sort}`;

  const cachedData = await getCached(cacheKey);
  if (cachedData) {
    return NextResponse.json(cachedData);
  }

  // --- Database Fetch ---
  try {
    const supabase = await createClient();

    let data, error, count;

    if (q) {
      // 1. Parse search query into meaningful tokens (stripping "vs", etc.)
      const tokens = parseSearchTokens(q);

      if (tokens.length === 0) {
        data = [];
        count = 0;
      } else {
        // 2. Broad Candidate Fetch
        let query = supabase
          .from("battles")
          .select("id, title, youtube_id, event_name, event_date, status, url")
          .neq("status", "excluded");

        if (status !== "all") {
          query = query.eq("status", status);
        }

        if (year !== "all") {
          query = query
            .gte("event_date", `${year}-01-01`)
            .lte("event_date", `${year}-12-31`);
        }

        // Combine all tokens into a single OR query for efficiency
        const orConditions = tokens
          .map((token) => {
            const safeToken = token.replace(/%/g, "\\%").replace(/_/g, "\\_");
            return `title.ilike.%${safeToken}%,event_name.ilike.%${safeToken}%`;
          })
          .join(",");

        query = query.or(orConditions).limit(500);

        const broadResult = await query;
        if (broadResult.error) {
          error = broadResult.error;
        } else {
          // 3. Precision Scoring & Re-ranking
          const candidates = broadResult.data || [];

          const scored = candidates
            .map((battle) => ({
              battle,
              score: scoreBattle(battle, tokens),
            }))
            .filter((b) => b.score > 0)
            .sort((a, b) => {
              if (b.score !== a.score) {
                return b.score - a.score;
              }
              const dateA = a.battle.event_date
                ? new Date(a.battle.event_date).getTime()
                : 0;
              const dateB = b.battle.event_date
                ? new Date(b.battle.event_date).getTime()
                : 0;
              if (sort === "oldest") return dateA - dateB;
              return dateB - dateA;
            });

          count = scored.length;
          data = scored.map((s) => ({ ...s.battle, score: s.score }));
        }
      }
    } else {
      // Standard fetch — return ALL battles matching filters (no per-row pagination)
      let query = supabase
        .from("battles")
        .select("id, title, youtube_id, event_name, event_date, status, url", {
          count: "exact",
        })
        .neq("status", "excluded");

      // Apply Status Filter
      if (status !== "all") {
        query = query.eq("status", status);
      }

      // Apply Year Filter
      if (year !== "all") {
        query = query
          .gte("event_date", `${year}-01-01`)
          .lte("event_date", `${year}-12-31`);
      }

      // Apply Sort
      query = query.order("event_date", {
        ascending: sort === "oldest",
        nullsFirst: false,
      });

      const result = await query;
      data = result.data;
      error = result.error;
      count = result.count;
    }

    if (error) {
      console.error("DB Fetch Error:", error);
      throw error;
    }

    const payload = {
      battles: data || [],
      count: count || 0,
    };

    // --- Cache Save ---
    await setCached(cacheKey, payload, 3600);

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=59",
      },
    });
  } catch (error) {
    console.error("Battles fetch route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch battles." },
      { status: 500 },
    );
  }
}
