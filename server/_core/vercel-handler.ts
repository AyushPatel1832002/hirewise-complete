import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";

let initError: string | null = null;
let appRouter: any = null;
let createContext: any = null;
let db: any = null;
let registerOAuthRoutes: any = null;
let registerStorageProxy: any = null;
let createExpressMiddleware: any = null;

// Lazy-load everything to capture exact init errors
async function init() {
  if (appRouter) return true;
  try {
    const trpc = await import("@trpc/server/adapters/express");
    createExpressMiddleware = trpc.createExpressMiddleware;
    const oauth = await import("./oauth");
    registerOAuthRoutes = oauth.registerOAuthRoutes;
    const storage = await import("./storageProxy");
    registerStorageProxy = storage.registerStorageProxy;
    const routers = await import("../routers");
    appRouter = routers.appRouter;
    const ctx = await import("./context");
    createContext = ctx.createContext;
    db = await import("../db");
    return true;
  } catch (e: any) {
    initError = e?.message ?? String(e);
    console.error("[INIT ERROR]", initError);
    return false;
  }
}

const REQUIRED = ["DATABASE_URL", "JWT_SECRET", "OAUTH_SERVER_URL"];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("[startup] Missing env vars:", missing.join(", "));
  initError = `Missing env vars: ${missing.join(", ")}`;
} else {
  console.log("[startup] All env vars present.");
}

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Diagnostic endpoint — always responds, reports exact error
app.get("/api/health", async (_req, res) => {
  const ok = await init();
  if (!ok) {
    return res.status(500).json({ status: "init_error", error: initError, timestamp: new Date().toISOString() });
  }
  try {
    const count = await db.prisma.$queryRaw`SELECT COUNT(*)::int AS n FROM "jobs"`;
    res.json({ status: "ok", jobCount: count[0]?.n, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ status: "db_error", error: String(err?.message ?? err) });
  }
});

// All other requests go through lazy-init Express middleware
app.use(async (req: Request, res: Response, next: any) => {
  const ok = await init();
  if (!ok) {
    return res.status(500).json({ error: "Server initialization failed", detail: initError });
  }

  if (req.path.startsWith("/api/trpc")) {
    return createExpressMiddleware({
      router: appRouter,
      createContext,
      onError({ path, error }: any) { console.error(`[tRPC] /${path}:`, error.message); },
    })(req, res, next);
  }

  if (req.method === "POST" && req.path === "/api/scheduled/processQueue") {
    try { res.json({ ok: true, result: await db.runQueueWorker(), timestamp: new Date().toISOString() }); }
    catch (e: any) { res.status(500).json({ error: String(e?.message ?? e) }); }
    return;
  }

  if (req.method === "POST" && req.path === "/api/scheduled/digests") {
    try { res.json({ ok: true, result: await db.runAllScheduledDigests(), timestamp: new Date().toISOString() }); }
    catch (e: any) { res.status(500).json({ error: String(e?.message ?? e) }); }
    return;
  }

  // Register oauth + storage once
  if (!registerOAuthRoutes._registered) {
    registerOAuthRoutes._registered = true;
    registerOAuthRoutes(app);
    registerStorageProxy(app);
  }

  next();
});

function handler(req: Request, res: Response) { app(req, res); }
export default handler;
