import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import * as db from "../server/db";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

registerStorageProxy(app);
registerOAuthRoutes(app);

// Health check route for testing DB connection & environment variables on Vercel
app.get(["/api/health", "/health"], async (_req, res) => {
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
    res.status(500).json({
      status: "error",
      message: String(err?.message ?? err),
    });
  }
});

const trpcHandler = createExpressMiddleware({
  router: appRouter,
  createContext,
});

// tRPC API middleware: Handles /api/trpc/*, /trpc/*, or any tRPC request
app.use((req, res, next) => {
  const path = req.originalUrl || req.url;
  if (path.includes("/trpc")) {
    const idx = path.indexOf("/trpc");
    req.url = path.substring(idx + 5) || "/";
    return trpcHandler(req, res, next);
  }
  return trpcHandler(req, res, next);
});

app.post(["/api/scheduled/processQueue", "/scheduled/processQueue"], async (_req, res) => {
  try {
    const result = await db.runQueueWorker();
    res.json({ ok: true, result, timestamp: new Date().toISOString() });
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message ?? e), timestamp: new Date().toISOString() });
  }
});

app.post(["/api/scheduled/digests", "/scheduled/digests"], async (_req, res) => {
  try {
    const result = await db.runAllScheduledDigests();
    res.json({ ok: true, result, timestamp: new Date().toISOString() });
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message ?? e), timestamp: new Date().toISOString() });
  }
});

export default app;
