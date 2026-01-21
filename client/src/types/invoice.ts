export type InvoiceComputedStatus = "paid" | "unpaid" | "overdue";

export interface Invoice {
  id: string;
  clientName: string;
  amountCents: number;
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
