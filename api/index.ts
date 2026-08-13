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

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.post("/api/scheduled/processQueue", async (_req, res) => {
  try {
    const result = await db.runQueueWorker();
    res.json({ ok: true, result, timestamp: new Date().toISOString() });
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message ?? e), timestamp: new Date().toISOString() });
  }
});

app.post("/api/scheduled/digests", async (_req, res) => {
  try {
    const result = await db.runAllScheduledDigests();
    res.json({ ok: true, result, timestamp: new Date().toISOString() });
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message ?? e), timestamp: new Date().toISOString() });
  }
});

export default app;
