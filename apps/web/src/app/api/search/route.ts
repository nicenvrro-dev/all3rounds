import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  if (!query) {
    return NextResponse.json(
      { error: "Missing search query" },
      { status: 400 },
    );
  }

  // --- Rate limiting ---
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rateLimitKey = user
    ? `user:${user.id}`
    : `ip:${request.headers.get("x-forwarded-for") || "unknown"}`;
  const rateLimitConfig = user
    ? RATE_LIMITS.authenticated
    : RATE_LIMITS.anonymous;

  const { allowed, remaining } = checkRateLimit(rateLimitKey, rateLimitConfig);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": remaining.toString() },
      },
    );
  }

  // --- Search ---
  // Using the hybrid search RPC function that combines FTS and Trigrams
  const { data, error, count } = await supabase
    .rpc("search_all_hybrid", { search_term: query }, { count: "exact" })
    .range(offset, offset + limit - 1);

  // Map the flat RPC result back to the expected nested structure for the frontend
  const formattedData = (data as any[])?.map((row) => ({
    id: row.id,
    content: row.content,
    start_time: row.start_time,
    end_time: row.end_time,
    round_number: row.round_number,
    speaker_label: row.speaker_label,
    emcee: row.emcee_id ? { id: row.emcee_id, name: row.emcee_name } : null,
    battle: {
      id: row.battle_id,
      title: row.battle_title,
      youtube_id: row.battle_youtube_id,
      event_name: row.battle_event_name,
      event_date: row.battle_event_date,
      status: row.battle_status,
      // URL is a generated column in battles table, we reconstruct it here or fetch it
      url: `https://www.youtube.com/watch?v=${row.battle_youtube_id}`,
    },
    rank: row.rank,
  }));

  if (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    results: formattedData || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
