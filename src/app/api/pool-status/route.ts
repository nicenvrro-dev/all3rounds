import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requirePermission("users:manage");
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error.message },
      { status: auth.error.status },
    );
  }

  const pool = db.pool;

  const status = {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
    time: new Date().toISOString(),
    env: process.env.NODE_ENV,
  };

  return NextResponse.json(status);
}
