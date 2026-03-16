import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
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
