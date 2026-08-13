import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import * as db from "../db";

const REQUIRED = ["DATABASE_URL", "JWT_SECRET", "OAUTH_SERVER_URL"];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) console.error("[startup] Missing env vars:", missing.join(", "));
else console.log("[startup] All env vars present.");

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

registerStorageProxy(app);
registerOAuthRoutes(app);

app.get("/api/health", async (_req, res) => {
  try {
    const database = await db.getDb();
    res.json({ status: "ok", dbConnected: Boolean(database), timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: String(err?.message ?? err) });
  }
});

app.use("/api/trpc", createExpressMiddleware({
  router: appRouter,
  createContext,
  onError({ path, error }) { console.error(`[tRPC] /${path}:`, error.message); },
}));

app.post("/api/scheduled/processQueue", async (_req, res) => {
  try { res.json({ ok: true, result: await db.runQueueWorker(), timestamp: new Date().toISOString() }); }
  catch (e: any) { res.status(500).json({ error: String(e?.message ?? e) }); }
});

app.post("/api/scheduled/digests", async (_req, res) => {
  try { res.json({ ok: true, result: await db.runAllScheduledDigests(), timestamp: new Date().toISOString() }); }
  catch (e: any) { res.status(500).json({ error: String(e?.message ?? e) }); }
});

function handler(req: Request, res: Response) { app(req, res); }
export default handler;
