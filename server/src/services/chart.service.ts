import { prisma } from "../db/client.js";

export async function getPaidUnpaidCounts() {
  const [paid, unpaid] = await Promise.all([
    prisma.invoice.count({ where: { status: "paid" } }),
    prisma.invoice.count({ where: { status: "unpaid" } }),
  ]);
  return { paid, unpaid };
}
