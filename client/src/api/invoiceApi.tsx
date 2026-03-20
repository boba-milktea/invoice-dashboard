import type { Invoice, Kpis, PaidUnPaidChart } from "../types/invoice";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export type InvoiceApiFilters = {
  status?: "paid" | "unpaid";
  overdue?: boolean;
  minAmount?: number;
  client?: string;
};

export async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    throw new Error(`Expected JSON but got: ${text.slice(0, 120)}`);
  }

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
    return getJson<Kpis>( qs ? `${apiBaseUrl}/api/kpis?${qs}` : `${apiBaseUrl}/api/kpis`);
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

  return getJson<Invoice[]>(`${apiBaseUrl}/api/invoices?${params.toString()}`);

}


export function fetchPaidUnpaidChart(): Promise<PaidUnPaidChart> {
    return getJson<PaidUnPaidChart>(`${apiBaseUrl}/api/charts/paid-unpaid`);
}
