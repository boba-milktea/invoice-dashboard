import { getPrisma } from "../db/client.js";
import { mockGetPaidUnpaidCounts, isMockMode } from "../mock/invoices.js";

export async function getPaidUnpaidCounts() {
  if (isMockMode()) {
    return mockGetPaidUnpaidCounts();
  }

  const [paid, unpaid] = await Promise.all([
    getPrisma().invoice.count({ where: { status: "paid" } }),
    getPrisma().invoice.count({ where: { status: "unpaid" } }),
  ]);
  return { paid, unpaid };
}
