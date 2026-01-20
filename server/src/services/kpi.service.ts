import { prisma } from "../db/client.js";
import { isOverdueUnPaid } from "../utils/date.js";

export async function getKpis() {
  const totalInvoices = await prisma.invoice.count();
  const unpaid = await prisma.invoice.count({
    where: { status: "unpaid" },
  });

  const unpaidInvoices = await prisma.invoice.findMany({
    where: { status: "unpaid" },
    select: { status: true, dueDate: true },
  });

  const overdue = unpaidInvoices.reduce(
    (acc, invoice) => acc + (isOverdueUnPaid(invoice) ? 1 : 0),
    0,
  );

  return {
    totalInvoices,
    unpaid,
    overdue,
  };
}
