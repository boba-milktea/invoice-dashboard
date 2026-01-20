import { prisma } from "../db/client.js";
import { isOverdueUnPaid } from "../utils/date.js";

export type ComputedStatus = "paid" | "unpaid" | "overdue";

export async function listInvoice(
  sort: "dueDate" | "amountCents",
  order: "asc" | "desc",
) {
  const invoices = await prisma.invoice.findMany({
    orderBy: {
      [sort]: order,
    },
  });

  return invoices.map((invoice) => ({
    id: invoice.id,
    clientName: invoice.clientName,
    amountCents: invoice.amountCents,
    currency: invoice.currency,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    status: invoice.status,
    computedStatus: (isOverdueUnPaid(invoice)
      ? "overdue"
      : invoice.status) as ComputedStatus,
  }));
}
