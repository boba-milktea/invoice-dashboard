import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const useMockData = process.env.USE_MOCK_DATA === "true";

if (!connectionString && !useMockData) {
  throw new Error("DATABASE_URL is not set. Check server/.env");
}

function createPrismaClient(): PrismaClient | null {
  if (!connectionString) return null;

  const ssl =
    process.env.DATABASE_SSL === "true"
      ? {
          rejectUnauthorized:
            process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
        }
      : undefined;

  const adapter = new PrismaPg({ connectionString, ssl });
  return new PrismaClient({ adapter });
}

export const prisma = createPrismaClient();

export function getPrisma(): PrismaClient {
  if (!prisma) {
    throw new Error("Database client is not available. Set DATABASE_URL.");
  }
  return prisma;
}
