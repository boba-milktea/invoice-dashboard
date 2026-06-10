import type {
  Invoice,
  InvoiceApiFilters,
  Kpis,
  PaidUnPaidChart,
} from "../types/invoice";
import {
  mockFetchInvoices,
  mockFetchKpis,
  mockFetchPaidUnpaidChart,
} from "./mockData";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
const apiKey = import.meta.env.VITE_API_KEY;
const useMock = import.meta.env.VITE_USE_MOCK_DATA === "true";

function buildHeaders(): HeadersInit {
  const headers: HeadersInit = {};
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }
  return headers;
}

function userFacingError(status: number, body?: string): string {
  if (status === 400 && body) {
    try {
      const parsed = JSON.parse(body) as { error?: string };
      if (typeof parsed.error === "string") return parsed.error;
    } catch {
      // fall through
    }
  }
  if (status === 401) return "Unauthorized. Check your API key configuration.";
  if (status === 429) return "Too many requests. Please try again later.";
  return "Failed to load data. Please try again.";
}

export type { InvoiceApiFilters };

export async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: buildHeaders() });

  if (!response.ok) {
    const text = await response.text();
    console.error(`API error ${response.status} for ${url}:`, text);
    throw new Error(userFacingError(response.status, text));
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    console.error(`Non-JSON response for ${url}:`, text.slice(0, 120));
    throw new Error("Failed to load data. Please try again.");
  }

  return response.json() as Promise<T>;
}

export function fetchKpis(filters?: InvoiceApiFilters): Promise<Kpis> {
  if (useMock) return mockFetchKpis(filters);

  const params = new URLSearchParams();

  if (filters?.status) params.set("status", filters.status);
  if (filters?.overdue === true) params.set("overdue", "true");

  if (filters?.minAmount !== undefined) {
    params.set("minAmount", String(filters.minAmount));
  }

  if (filters?.client) params.set("client", filters.client);

  const qs = params.toString();
  const url = qs ? `${apiBaseUrl}/api/kpis?${qs}` : `${apiBaseUrl}/api/kpis`;

  return getJson<{
    totalInvoices: number;
    unpaid: number;
    overdue: number;
  }>(url).then((data) => ({
    total: data.totalInvoices,
    unpaid: data.unpaid,
    overdue: data.overdue,
  }));
}

export function fetchInvoices(
  sort: "dueDate" | "amount" = "dueDate",
  order: "asc" | "desc" = "asc",
  filters?: InvoiceApiFilters,
): Promise<Invoice[]> {
  if (useMock) return mockFetchInvoices(sort, order, filters);

  const params = new URLSearchParams({ sort, order });
  if (filters?.status) params.set("status", filters.status);
  if (filters?.overdue === true) params.set("overdue", "true");

  if (filters?.minAmount !== undefined) {
    params.set("minAmount", String(filters.minAmount));
  }

  if (filters?.client) params.set("client", filters.client);

  return getJson<Invoice[]>(
    `${apiBaseUrl}/api/invoices?${params.toString()}`,
  );
}

export function fetchPaidUnpaidChart(): Promise<PaidUnPaidChart> {
  if (useMock) return mockFetchPaidUnpaidChart();
  return getJson<PaidUnPaidChart>(`${apiBaseUrl}/api/charts/paid-unpaid`);
}
