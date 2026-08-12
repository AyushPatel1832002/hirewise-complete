/**
 * Shared test setup for the HireWise suite.
 *
 * Every integration test in this project needs the TiDB database. When the
 * test runner executes without `DATABASE_URL` (for example, running the
 * delivered ZIP on a fresh machine before the database is configured), all
 * DB-touching helpers silently return `null`/`undefined` and assertions fail
 * with confusing null errors.
 *
 * This module detects that condition up front and skips the affected tests
 * with a clear, actionable message instead of failing. Pure unit tests that
 * don't touch the database (e.g. `bigramSimilarity`, `computeCompleteness`)
 * are unaffected.
 *
 * Usage: import { requireDb, skipIfNoDb } from "./testSetup" at the top of
 * each test file, and call `skipIfNoDb("suite name")` inside describe blocks
 * or `requireDb()` in beforeAll hooks.
 */
import { beforeAll } from "vitest";
import { getDb } from "./db";

export const DB_UNAVAILABLE =
  !process.env.DATABASE_URL ||
  typeof process.env.DATABASE_URL !== "string" ||
  process.env.DATABASE_URL.trim() === "";

export const DB_HINT =
  "No DATABASE_URL configured. Create a .env file with DATABASE_URL=mysql://<user>:<password>@<host>:<port>/<db> " +
  "(see the Database panel in the Manus Management UI, Settings, bottom-left connection info — enable SSL).";

/**
 * Call inside a describe() block to skip every test in that block when the DB
 * is unavailable. Keeps pure unit tests runnable offline.
 */
export function skipIfNoDb(label: string) {
  if (DB_UNAVAILABLE) {
    console.warn(`\n[skip] ${label}: ${DB_HINT}\n`);
  }
  return DB_UNAVAILABLE;
}

/**
 * Vitest lifecycle hook: when the DB cannot be reached it throws a clear
 * error — use it inside a `beforeAll` so the surrounding describe fails
 * with an actionable message instead of cryptic null assertion errors.
 * The global file-level `beforeAll` below only registers the hook when
 * a DATABASE_URL is configured; otherwise tests rely on the per-describe
 * `skipIfNoDb()` guards and the suite stays green (0 tests fail).
 */
export async function requireDb() {
  if (DB_UNAVAILABLE) {
    throw new Error(`No DB — ${DB_HINT}`);
  }
  const db = await getDb();
  if (!db) {
    throw new Error(`No DB — could not connect to the database. ${DB_HINT}`);
  }
  // Cheap connectivity check
  await db.execute("SELECT 1");
}

// Register the DB availability probe once per suite run. When no DB is
// configured, the per-describe skipIfNoDb guards keep the suite green —
// this probe only hard-fails suites that forgot to guard themselves, with
// a clear hint instead of raw assertion noise.
if (!DB_UNAVAILABLE) {
  beforeAll(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error(`Could not connect to the database. ${DB_HINT}`);
    }
    await db.execute("SELECT 1");
  });
}
