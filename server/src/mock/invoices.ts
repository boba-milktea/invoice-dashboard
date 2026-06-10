import {
  buildMockInvoices,
  type MockInvoiceRecord,
} from "../data/mockInvoices.js";
import { isOverdueUnpaid } from "../utils/date.js";
import type { InvoiceFilters } from "../utils/filters.js";
type ComputedStatus = "paid" | "unpaid" | "overdue";

const MOCK_DATA = buildMockInvoices();

export function isMockMode(): boolean {
  return process.env.USE_MOCK_DATA === "true";
}

function matchesFilters(
  invoice: MockInvoiceRecord,
  filters: InvoiceFilters,
  now = new Date(),
): boolean {
  if (filters.status && invoice.status !== filters.status) return false;

  if (
    filters.minAmountCents !== undefined &&
    invoice.amountCents < filters.minAmountCents
  ) {
    return false;
  }

  if (
    filters.client &&
    !invoice.clientName.toLowerCase().includes(filters.client.toLowerCase())
  ) {
    return false;
  }

  if (filters.overdue === true) {
    if (filters.status === "paid") return false;
    if (!isOverdueUnpaid(invoice, now)) return false;
  }

  return true;
}

function filterInvoices(
  filters: InvoiceFilters,
  now = new Date(),
): MockInvoiceRecord[] {
  if (filters.overdue === true && filters.status === "paid") return [];
  return MOCK_DATA.filter((invoice) => matchesFilters(invoice, filters, now));
}

function toApiInvoice(invoice: MockInvoiceRecord): {
  id: string;
  clientName: string;
  amount: number;
  currency: string;
  issueDate: Date;
  dueDate: Date;
  status: MockInvoiceRecord["status"];
  computedStatus: ComputedStatus;
} {
  return {
    id: invoice.id,
    clientName: invoice.clientName,
    amount: invoice.amountCents / 100,
    currency: invoice.currency,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    status: invoice.status,
    computedStatus: isOverdueUnpaid(invoice) ? "overdue" : invoice.status,
  };
}

export function mockListInvoices({
  sort,
  order,
  filters,
}: {
  sort: "dueDate" | "amountCents";
  order: "asc" | "desc";
  filters: InvoiceFilters;
}) {
  const filtered = filterInvoices(filters);
  const sorted = [...filtered].sort((a, b) => {
    const field = sort === "amountCents" ? "amountCents" : "dueDate";
    const aVal =
      field === "amountCents" ? a.amountCents : a.dueDate.getTime();
    const bVal =
      field === "amountCents" ? b.amountCents : b.dueDate.getTime();
    return order === "asc" ? aVal - bVal : bVal - aVal;
  });
  return sorted.map(toApiInvoice);
}

export function mockGetKpis(filters: InvoiceFilters) {
  const filtered = filterInvoices(filters);
  const unpaidInvoices = filtered.filter((i) => i.status === "unpaid");
  const overdue = unpaidInvoices.filter((i) => isOverdueUnpaid(i)).length;
  const needsAttention = unpaidInvoices.filter(
    (i) => isOverdueUnpaid(i) || i.amountCents >= 200_000,
  ).length;

  return {
    totalInvoices: filtered.length,
    unpaid: unpaidInvoices.length,
    overdue,
    needsAttention,
  };
}

export function mockGetPaidUnpaidCounts() {
  const paid = MOCK_DATA.filter((i) => i.status === "paid").length;
  const unpaid = MOCK_DATA.filter((i) => i.status === "unpaid").length;
  return { paid, unpaid };
}
