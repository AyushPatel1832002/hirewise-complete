import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import * as db from "../server/db";

const REQUIRED_SERVER_VARS = ["DATABASE_URL", "JWT_SECRET", "OAUTH_SERVER_URL"];
const missing = REQUIRED_SERVER_VARS.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error("[startup] Missing required environment variables:", missing.join(", "));
} else {
  console.log("[startup] All required environment variables present.");
}

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

registerStorageProxy(app);
registerOAuthRoutes(app);

app.get("/api/health", async (_req, res) => {
  try {
    const database = await db.getDb();
    res.json({
      status: "ok",
      dbConnected: Boolean(database),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: String(err?.message ?? err) });
  }
});

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ path, error }) {
      console.error(`[tRPC] /${path}:`, error.message);
    },
  })
);

app.post("/api/scheduled/processQueue", async (_req, res) => {
  try {
    const result = await db.runQueueWorker();
    res.json({ ok: true, result, timestamp: new Date().toISOString() });
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message ?? e) });
  }
});

app.post("/api/scheduled/digests", async (_req, res) => {
  try {
    const result = await db.runAllScheduledDigests();
    res.json({ ok: true, result, timestamp: new Date().toISOString() });
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message ?? e) });
  }
});

export default function handler(req: Request, res: Response) {
  app(req, res);
}
