import type { Invoice, Kpis, PaidUnPaidChart } from "../types/invoice";

export async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Error fetching ${url}: ${response.statusText}`);
  return response.json() as Promise<T>;
}

export function fetchKpis(): Promise<Kpis> {
  return getJson<Kpis>("/api/kpis");
}

export function fetchInvoices(
  sort: "dueDate" | "amountCents" = "dueDate",
  order: "asc" | "desc" = "asc",
): Promise<Invoice[]> {
  const params = new URLSearchParams({ sort, order });
  return getJson<Invoice[]>(`/api/invoices?${params.toString()}`);
}

export function fetchPaidUnpaidChart(): Promise<PaidUnPaidChart> {
  return getJson<PaidUnPaidChart>("/api/charts/paid-unpaid");
}
