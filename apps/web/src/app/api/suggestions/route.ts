import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";

export async function POST(request: NextRequest) {
  // ── Auth & Permission Check ──
  const auth = await requirePermission("suggestions:create");
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error.message },
      { status: auth.error.status },
    );
  }
  const { user } = auth;

  const adminClient = createAdminClient();
  const body = await request.json();
  const { line_id, suggested_content } = body;

  if (!line_id || !suggested_content) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 },
    );
  }

  // 1. Fetch current line content snapshot
  const { data: line, error: lineError } = await adminClient
    .from("lines")
    .select("content")
    .eq("id", line_id)
    .single();

  if (lineError || !line) {
    return NextResponse.json({ error: "Line not found." }, { status: 404 });
  }

  // 2. Insert suggestion
  const { error: insertError } = await adminClient.from("suggestions").insert({
    line_id,
    user_id: user.id,
    suggested_content,
    original_content: line.content,
    status: "pending",
  });

  if (insertError) {
    console.error("Insert suggestion error:", insertError);
    return NextResponse.json(
      { error: "Failed to submit suggestion." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  // ── Auth & Permission Check (reviewers only) ──
  const auth = await requirePermission("suggestions:review");
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error.message },
      { status: auth.error.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";

  const adminClient = createAdminClient();

  // Fetch suggestions with line context and suggester info
  // Note: user_profiles is joined via user_id
  const { data, error } = await adminClient
    .from("suggestions")
    .select(
      `
      *,
      lines (
        content,
        start_time,
        end_time,
        battle:battles ( id, title, youtube_id )
      ),
      user:user_profiles!suggestions_user_id_fkey ( display_name )
    `,
    )
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch suggestions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions." },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}
