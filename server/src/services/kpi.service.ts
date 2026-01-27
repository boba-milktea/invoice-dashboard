import { prisma } from "../db/client.js";
import { isOverdueUnpaid } from "../utils/date.js";
import { buildInvoiceWhere } from "../utils/filters.js";
import type { InvoiceFilters } from "../utils/filters.js";

export async function getKpis(filters: InvoiceFilters) {
  const { where, empty } = buildInvoiceWhere(filters);
  if (empty) {
    return { totalInvoices: 0, unpaid: 0, overdue: 0, needsAttention: 0 };
  }

  const totalInvoices = await prisma.invoice.count({ where });

  const unpaid = await prisma.invoice.count({
    where: { ...where, status: "unpaid" },
  });

  const unpaidInvoices = await prisma.invoice.findMany({
    where: { ...where, status: "unpaid" },
    select: { dueDate: true, status: true, amountCents: true },
  });

  const overdue = unpaidInvoices.reduce(
    (acc, invoice) => acc + (isOverdueUnpaid(invoice) ? 1 : 0),
    0,
  );

  const needsAttention = unpaidInvoices.filter(
    (invoice) => isOverdueUnpaid(invoice) || invoice.amountCents >= 200_000,
  ).length;

  return { totalInvoices, unpaid, overdue, needsAttention };
}
