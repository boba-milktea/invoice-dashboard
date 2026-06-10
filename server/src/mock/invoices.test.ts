import { describe, expect, it } from "vitest";
import {
  mockGetKpis,
  mockGetPaidUnpaidCounts,
  mockListInvoices,
} from "./invoices.js";

describe("mock invoices", () => {
  it("returns 25 invoices by default", () => {
    const invoices = mockListInvoices({
      sort: "dueDate",
      order: "asc",
      filters: {},
    });
    expect(invoices).toHaveLength(25);
  });

  it("filters by status paid", () => {
    const invoices = mockListInvoices({
      sort: "dueDate",
      order: "asc",
      filters: { status: "paid" },
    });
    expect(invoices.every((i) => i.status === "paid")).toBe(true);
    expect(invoices).toHaveLength(16);
  });

  it("filters overdue unpaid only", () => {
    const invoices = mockListInvoices({
      sort: "dueDate",
      order: "asc",
      filters: { overdue: true },
    });
    expect(invoices.length).toBeGreaterThan(0);
    expect(invoices.every((i) => i.computedStatus === "overdue")).toBe(true);
  });

  it("returns empty for overdue + paid filter", () => {
    const invoices = mockListInvoices({
      sort: "dueDate",
      order: "asc",
      filters: { overdue: true, status: "paid" },
    });
    expect(invoices).toHaveLength(0);
  });

  it("filters by client name substring", () => {
    const invoices = mockListInvoices({
      sort: "dueDate",
      order: "asc",
      filters: { client: "Acme" },
    });
    expect(invoices.length).toBeGreaterThan(0);
    expect(invoices.every((i) => i.clientName.includes("Acme"))).toBe(true);
  });

  it("filters by minAmount", () => {
    const invoices = mockListInvoices({
      sort: "dueDate",
      order: "asc",
      filters: { minAmountCents: 200_000 },
    });
    expect(invoices.every((i) => i.amount >= 2000)).toBe(true);
  });

  it("sorts by amount descending", () => {
    const invoices = mockListInvoices({
      sort: "amountCents",
      order: "desc",
      filters: {},
    });
    for (let i = 1; i < invoices.length; i++) {
      expect(invoices[i - 1].amount).toBeGreaterThanOrEqual(invoices[i].amount);
    }
  });

  it("computes KPIs for filtered set", () => {
    const kpis = mockGetKpis({ status: "unpaid" });
    expect(kpis.totalInvoices).toBe(9);
    expect(kpis.unpaid).toBe(9);
    expect(kpis.overdue).toBe(4);
  });

  it("returns chart counts for full dataset", () => {
    const chart = mockGetPaidUnpaidCounts();
    expect(chart.paid).toBe(16);
    expect(chart.unpaid).toBe(9);
  });
});
