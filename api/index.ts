import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import * as db from "../server/db";

// Validate required env vars at startup (names only, never values)
const REQUIRED_SERVER_VARS = ["DATABASE_URL", "JWT_SECRET", "OAUTH_SERVER_URL"];
const missing = REQUIRED_SERVER_VARS.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error("[startup] Missing required environment variables:", missing.join(", "));
}

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

registerStorageProxy(app);
registerOAuthRoutes(app);

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    const hasDbUrl = Boolean(process.env.DATABASE_URL);
    const database = await db.getDb();
    res.json({
      status: "ok",
      hasDbUrl,
      dbConnected: Boolean(database),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: String(err?.message ?? err) });
  }
});

// tRPC — mounted at /api/trpc
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ path, error }) {
      console.error(`[tRPC] Error on /${path}:`, error.message);
    },
  })
);

// Scheduled workers
app.post("/api/scheduled/processQueue", async (_req, res) => {
  try {
    const result = await db.runQueueWorker();
    res.json({ ok: true, result, timestamp: new Date().toISOString() });
  } catch (e: any) {
    console.error("[scheduled] processQueue error:", e?.message ?? e);
    res.status(500).json({ error: String(e?.message ?? e), timestamp: new Date().toISOString() });
  }
});

app.post("/api/scheduled/digests", async (_req, res) => {
  try {
    const result = await db.runAllScheduledDigests();
    res.json({ ok: true, result, timestamp: new Date().toISOString() });
  } catch (e: any) {
    console.error("[scheduled] digests error:", e?.message ?? e);
    res.status(500).json({ error: String(e?.message ?? e), timestamp: new Date().toISOString() });
  }
});

// Vercel serverless export — wraps Express as a handler function
export default function handler(req: Request, res: Response) {
  app(req, res);
}
