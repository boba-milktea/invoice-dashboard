export type InvoiceComputedStatus = "paid" | "unpaid" | "overdue";

export interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: "Paid" | "Unpaid";
  computedStatus: InvoiceComputedStatus;
}

export interface Kpis {
  total: number;
  unpaid: number;
  overdue: number;
}

export interface PaidUnPaidChart {
  paid: number;
  unpaid: number;
}

export type StatusFilter = "paid" | "unpaid" | null;
export type SortField = "dueDate" | "amount";
export type SortOrder = "asc" | "desc";

export interface InvoiceApiFilters {
  status?: "paid" | "unpaid";
  overdue?: true;
  minAmount?: number;
  client?: string;
}
