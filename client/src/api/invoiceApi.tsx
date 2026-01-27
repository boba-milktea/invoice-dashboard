import type { Invoice, Kpis, PaidUnPaidChart } from "../types/invoice";

export type InvoiceApiFilters = {
  status?: "paid" | "unpaid";
  overdue?: boolean;
  minAmount?: number;
  client?: string;
};

export async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Error fetching ${url}: ${response.statusText}`);
  return response.json() as Promise<T>;
}

export function fetchKpis(filters?: InvoiceApiFilters): Promise<Kpis> {
  const params = new URLSearchParams();

  if (filters?.status) params.set("status", filters.status);
  if (filters?.overdue === true) params.set("overdue", "true");

  if (filters?.minAmount !== undefined) {
    params.set("minAmount", String(filters.minAmount));
  }

  if (filters?.client) params.set("client", filters.client);

  const qs = params.toString();
  return qs.length > 0
    ? getJson<Kpis>(`/api/kpis?${qs}`)
    : getJson<Kpis>("/api/kpis");
}

export function fetchInvoices(
  sort: "dueDate" | "amount" = "dueDate",
  order: "asc" | "desc" = "asc",
  filters?: InvoiceApiFilters,
): Promise<Invoice[]> {
  const params = new URLSearchParams({ sort, order });

  if (filters?.status) params.set("status", filters.status);
  if (filters?.overdue === true) params.set("overdue", "true");

  if (filters?.minAmount !== undefined) {
    params.set("minAmount", String(filters.minAmount));
  }

  if (filters?.client) params.set("client", filters.client);

  return getJson<Invoice[]>(`/api/invoices?${params.toString()}`);
}

export function fetchPaidUnpaidChart(): Promise<PaidUnPaidChart> {
  return getJson<PaidUnPaidChart>("/api/charts/paid-unpaid");
}
