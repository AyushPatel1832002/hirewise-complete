import { PrismaClient } from "@prisma/client";

// Singleton pattern for Prisma — safe for Vercel serverless and local dev with hot reload.
// In development, reuse the global instance to avoid exhausting DB connections.

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
