import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient; schedulerStarted: boolean };

// Initialize connection pool with fallback connection string to prevent compiler validation failures at build time
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/ai_news_hub?schema=public";

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Auto-run background ingestion locally to keep content fresh
const isServer = typeof window === "undefined";
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const isPrismaCli = !!(process.env.PRISMA_CLI_BINARY_TARGETS || process.env.PRISMA_GENERATE_FORCE);
const isScript = process.env.IS_SCRIPT === "true";
const isDev = process.env.NODE_ENV === "development";

if (isServer && !isBuildPhase && !isPrismaCli && !isScript && !isDev && !globalForPrisma.schedulerStarted) {
  globalForPrisma.schedulerStarted = true;
  console.log("Initializing automated RSS background refresher...");
  
  import("../services/ingestRunner").then(({ runIngestion }) => {
    // Run initial ingestion on startup after 10 seconds to allow dev server to spin up
    setTimeout(async () => {
      console.log("Executing initial automated RSS refresh...");
      try {
        await runIngestion();
      } catch (e) {
        console.error("Initial RSS refresh failed:", e);
      }
    }, 10000);

    // Run every 30 minutes
    setInterval(async () => {
      console.log("Executing periodic automated RSS refresh...");
      try {
        await runIngestion();
      } catch (e) {
        console.error("Periodic RSS refresh failed:", e);
      }
    }, 30 * 60 * 1000);
  });
}
