import { Pool, QueryResultRow } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment variables.");
}

// Define a type for the global object to avoid 'any'
interface GlobalWithPool {
  pool?: Pool;
}

const globalWithPool = global as unknown as GlobalWithPool;

// Singleton pattern configuration
// Supabase free tier has ~60 Supavisor pooler slots total.
// Each Vercel serverless instance gets its own pool, so keep max LOW.
const poolConfig = {
  connectionString,
  max: process.env.NODE_ENV === "production" ? 5 : 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000, // Fail fast, don't hang for 16s
  ssl: {
    rejectUnauthorized: false,
  },
};

if (!globalWithPool.pool) {
  // Use warn to satisfy linting while still logging critical initialization
  console.warn(`[DB] Creating new pool (max: ${poolConfig.max})`);
  globalWithPool.pool = new Pool(poolConfig);
  
  globalWithPool.pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client', err);
  });

  globalWithPool.pool.on('connect', () => {
    if (process.env.NODE_ENV !== "production") {
      console.warn('[DB] New client connected to pool');
    }
  });
}

export const db = {
  query: <T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: (string | number | boolean | null | string[] | number[])[]
  ) => globalWithPool.pool!.query<T>(text, params),
  pool: globalWithPool.pool!,
};
