import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock dependencies
const mockDbQuery = vi.fn().mockResolvedValue({ rows: [] });

vi.mock("@/lib/db", () => ({
  db: {
    query: (...args: unknown[]) => mockDbQuery(...args),
    pool: { totalCount: 0, idleCount: 0, waitingCount: 0 }
  }
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 29,
    limit: 30,
    reset: Date.now() + 60000,
  }),
  getRateLimitHeaders: vi.fn().mockReturnValue({}),
}));

// No longer needed

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 29,
    limit: 30,
    reset: Date.now() + 60000,
  }),
  getRateLimitHeaders: vi.fn().mockReturnValue({}),
}));

vi.mock("@/lib/cache", () => ({
  getCached: vi.fn().mockResolvedValue(null),
  setCached: vi.fn().mockResolvedValue(undefined),
}));

import { GET } from "@/app/api/search/route";
import { checkRateLimit } from "@/lib/rate-limit";
import { getCached } from "@/lib/cache";

function makeRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL("http://localhost/api/search");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return new NextRequest(url);
}

describe("GET /api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDbQuery.mockResolvedValue({ rows: [] });
  });

  it("returns 400 if query is missing", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/between 2 and 200/);
  });

  it("returns 400 if query is too short", async () => {
    const res = await GET(makeRequest({ q: "a" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if query is too long", async () => {
    const res = await GET(makeRequest({ q: "a".repeat(201) }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if page exceeds max (50)", async () => {
    const res = await GET(makeRequest({ q: "test query", page: "51" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Page number too large/);
  });

  it("returns cached data if available", async () => {
    const cached = { results: [], total: 0, page: 1, totalPages: 0 };
    vi.mocked(getCached).mockResolvedValueOnce(cached);

    const res = await GET(makeRequest({ q: "test query" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(cached);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      limit: 30,
      reset: Date.now() + 60000,
    });

    const res = await GET(makeRequest({ q: "test query" }));
    expect(res.status).toBe(429);
  });

  it("returns search results with correct structure", async () => {
    // The mocked supabase returns empty data, so we get an empty result set
    const res = await GET(makeRequest({ q: "test query" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("results");
    expect(body).toHaveProperty("total");
    expect(body).toHaveProperty("page");
    expect(body).toHaveProperty("totalPages");
  });

  it("defaults page to 1 for invalid page param", async () => {
    const res = await GET(makeRequest({ q: "test query", page: "abc" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.page).toBe(1);
  });

  describe("database errors", () => {
    it("returns 503 on statement timeout (57014)", async () => {
      mockDbQuery.mockRejectedValueOnce({
        code: "57014",
        message: "canceling statement due to statement timeout",
      });

      const res = await GET(makeRequest({ q: "pebrero" }));
      expect(res.status).toBe(503);
      expect(mockDbQuery).toHaveBeenCalledTimes(1);
    });

    it("returns 503 on connection timeout", async () => {
      mockDbQuery.mockRejectedValueOnce({
        message: "timeout exceeded when trying to connect",
      });

      const res = await GET(makeRequest({ q: "pebrero" }));
      expect(res.status).toBe(503);
      expect(mockDbQuery).toHaveBeenCalledTimes(1);
    });

    it("returns 500 on other database errors", async () => {
      mockDbQuery.mockRejectedValueOnce({ code: "42501", message: "permission denied" });

      const res = await GET(makeRequest({ q: "test query" }));
      expect(res.status).toBe(500);
      expect(mockDbQuery).toHaveBeenCalledTimes(1);
    });
  });
});
