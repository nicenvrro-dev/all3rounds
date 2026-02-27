import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  // --- Rate limiting ---
  const rateLimitKey = `emcees:${request.headers.get("x-forwarded-for") || "unknown"}`;
  const { allowed } = checkRateLimit(rateLimitKey, RATE_LIMITS.anonymous);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 },
    );
  }

  const supabase = await createClient();

  let dbQuery = supabase.from("emcees").select("id, name").order("name");

  if (query) {
    // Escape special ILIKE characters (%) and (_) to prevent pattern injection
    const safeQ = query.replace(/%/g, "\\%").replace(/_/g, "\\_");
    dbQuery = dbQuery.ilike("name", `%${safeQ}%`);
  }

  const { data, error } = await dbQuery;

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch emcees." },
      { status: 500 },
    );
  }

  return NextResponse.json(data || []);
}
