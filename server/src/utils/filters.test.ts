import { describe, expect, it } from "vitest";
import { parseInvoiceFilters, buildInvoiceWhere } from "./filters.js";

describe("parseInvoiceFilters", () => {
  it("parses valid status", () => {
    const r = parseInvoiceFilters({ status: "paid" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.filters.status).toBe("paid");
  });

  it("rejects invalid status", () => {
    const r = parseInvoiceFilters({ status: "other" });
    expect(r.ok).toBe(false);
  });

  it("parses overdue=true", () => {
    const r = parseInvoiceFilters({ overdue: "true" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.filters.overdue).toBe(true);
  });

  it("rejects overdue=maybe", () => {
    const r = parseInvoiceFilters({ overdue: "maybe" });
    expect(r.ok).toBe(false);
  });

  it("parses minAmount decimal to cents", () => {
    const r = parseInvoiceFilters({ minAmount: "30.50" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.filters.minAmountCents).toBe(3050);
  });

  it("rejects negative minAmount", () => {
    const r = parseInvoiceFilters({ minAmount: "-1" });
    expect(r.ok).toBe(false);
  });

  it("parses client trimmed", () => {
    const r = parseInvoiceFilters({ client: "  Acme  " });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.filters.client).toBe("Acme");
  });

  it("rejects empty client", () => {
    const r = parseInvoiceFilters({ client: "   " });
    expect(r.ok).toBe(false);
  });
});

describe("buildInvoiceWhere", () => {
  it("returns empty=true for overdue + paid", () => {
    const { empty } = buildInvoiceWhere({ overdue: true, status: "paid" });
    expect(empty).toBe(true);
  });

  it("forces unpaid + dueDate<now when overdue=true", () => {
    const { where, empty } = buildInvoiceWhere({ overdue: true });
    expect(empty).toBe(false);
    expect(where.status).toBe("unpaid");
    expect(where.dueDate).toBeTruthy();
  });
});
