import { prisma } from "../db/client.js";
import { isOverdueUnpaid } from "../utils/date.js";
import { buildInvoiceWhere } from "../utils/filters.js";
import type { InvoiceFilters } from "../utils/filters.js";

export type ComputedStatus = "paid" | "unpaid" | "overdue";
export type Params = {
  sort: "dueDate" | "amountCents";
  order: "asc" | "desc";
  filters: InvoiceFilters;
};

export async function listInvoices({ sort, order, filters }: Params) {
  const { where, empty } = buildInvoiceWhere(filters);
  if (empty) return [];

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { [sort]: order },
  });

  return invoices.map((invoice) => ({
    id: invoice.id,
    clientName: invoice.clientName,
    amount: invoice.amountCents / 100, // presentation value
    currency: invoice.currency,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    status: invoice.status,
    computedStatus: (isOverdueUnpaid(invoice)
      ? "overdue"
      : invoice.status) as ComputedStatus,
  }));
}
