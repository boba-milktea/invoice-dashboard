import {
  buildMockInvoices,
  type MockInvoiceRecord,
} from "../../../server/src/data/mockInvoices.ts";
import type {
  Invoice,
  InvoiceApiFilters,
  Kpis,
  PaidUnPaidChart,
} from "../types/invoice";

const MOCK_DATA = buildMockInvoices();

function isOverdueUnpaid(invoice: MockInvoiceRecord, now = new Date()): boolean {
  if (invoice.status !== "unpaid") return false;
  return invoice.dueDate.getTime() < now.getTime();
}

function matchesFilters(
  invoice: MockInvoiceRecord,
  filters: InvoiceApiFilters,
  now = new Date(),
): boolean {
  if (filters.status && invoice.status !== filters.status) return false;

  if (filters.minAmount !== undefined) {
    const minCents = Math.round(filters.minAmount * 100);
    if (invoice.amountCents < minCents) return false;
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
  filters: InvoiceApiFilters,
  now = new Date(),
): MockInvoiceRecord[] {
  if (filters.overdue === true && filters.status === "paid") return [];
  return MOCK_DATA.filter((invoice) => matchesFilters(invoice, filters, now));
}

function toInvoice(invoice: MockInvoiceRecord): Invoice {
  const computedStatus = isOverdueUnpaid(invoice)
    ? "overdue"
    : invoice.status;

  return {
    id: invoice.id,
    clientName: invoice.clientName,
    amount: invoice.amountCents / 100,
    currency: invoice.currency,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    status: invoice.status === "paid" ? "Paid" : "Unpaid",
    computedStatus,
  };
}

export function mockFetchKpis(filters?: InvoiceApiFilters): Promise<Kpis> {
  const f = filters ?? {};
  const filtered = filterInvoices(f);
  const unpaidInvoices = filtered.filter((i) => i.status === "unpaid");
  const overdue = unpaidInvoices.filter((i) => isOverdueUnpaid(i)).length;

  return Promise.resolve({
    total: filtered.length,
    unpaid: unpaidInvoices.length,
    overdue,
  });
}

export function mockFetchInvoices(
  sort: "dueDate" | "amount" = "dueDate",
  order: "asc" | "desc" = "asc",
  filters?: InvoiceApiFilters,
): Promise<Invoice[]> {
  const f = filters ?? {};
  const filtered = filterInvoices(f);
  const sorted = [...filtered].sort((a, b) => {
    const aVal =
      sort === "amount" ? a.amountCents : a.dueDate.getTime();
    const bVal =
      sort === "amount" ? b.amountCents : b.dueDate.getTime();
    return order === "asc" ? aVal - bVal : bVal - aVal;
  });
  return Promise.resolve(sorted.map(toInvoice));
}

export function mockFetchPaidUnpaidChart(): Promise<PaidUnPaidChart> {
  const paid = MOCK_DATA.filter((i) => i.status === "paid").length;
  const unpaid = MOCK_DATA.filter((i) => i.status === "unpaid").length;
  return Promise.resolve({ paid, unpaid });
}
