import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const connectionString = process.env.DATABASE_URL || "file:./dev.db";
if (!connectionString.startsWith("file:")) {
  throw new Error("DATABASE_URL is not set. Check server/.env");
}

const sqliteFilePath = connectionString.replace("file:", "");

const adapter = new PrismaBetterSqlite3({ url: sqliteFilePath });

export const prisma = new PrismaClient({ adapter });
