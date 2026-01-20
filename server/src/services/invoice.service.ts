import { prisma } from "../db/client.js";
import { isOverdueUnPaid } from "../utils/date.js";

export type ComputedStatus = "paid" | "unpaid" | "overdue";

/** we use computed properties. The name of the object properties is calculated at runtime
 * In backend, request paramters are dynamic, so we cannot use static object keys. But libraries like Prisma
 * expect exact object structure.
 * To work around this, we can use computed properties in TypeScript as shown below.
 */

//   const orderByObj: Record<string, "asc" | "desc"> = {};
//   orderByObj[sort] = order;

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
