import type { Prisma } from "../generated/prisma/client.js";

export type InvoiceFilters = {
  status?: "paid" | "unpaid";
  overdue?: boolean;
  minAmountCents?: number;
  client?: string;
};

export type ParseResult =
  | { ok: true; filters: InvoiceFilters }
  | { ok: false; error: string };

export function parseInvoiceFilters(
  query: Record<string, unknown>,
): ParseResult {
  const filters: InvoiceFilters = {};

  // status
  if (query.status !== undefined) {
    if (typeof query.status !== "string") {
      return { ok: false, error: "status must be a string" };
    }
    if (query.status !== "paid" && query.status !== "unpaid") {
      return { ok: false, error: 'status must be "paid" or "unpaid"' };
    }
    filters.status = query.status;
  }

  // overdue
  if (query.overdue !== undefined) {
    if (typeof query.overdue !== "string") {
      return { ok: false, error: "overdue must be a string" };
    }
    if (query.overdue !== "true" && query.overdue !== "false") {
      return { ok: false, error: 'overdue must be "true" or "false"' };
    }
    if (query.overdue === "true") filters.overdue = true;
  }

  // minAmount (decimal in major units) -> cents
  if (query.minAmount !== undefined) {
    if (typeof query.minAmount !== "string") {
      return { ok: false, error: "minAmount must be a string" };
    }
    const amount = Number(query.minAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      return { ok: false, error: "minAmount must be a number >= 0" };
    }
    filters.minAmountCents = Math.round(amount * 100);
  }

  // client
  if (query.client !== undefined) {
    if (typeof query.client !== "string") {
      return { ok: false, error: "client must be a string" };
    }
    const trimmed = query.client.trim();
    if (trimmed.length === 0) {
      return { ok: false, error: "client must be non-empty if provided" };
    }
    filters.client = trimmed;
  }

  return { ok: true, filters };
}

/**
 * Build Prisma where clause from filters.
 * Note: This returns the where for the "filtered view".
 * For overdue=true we force unpaid + dueDate < now (and return empty if status=paid).
 */
export function buildInvoiceWhere(
  filters: InvoiceFilters,
  now: Date = new Date(),
): {
  where: Prisma.InvoiceWhereInput;
  empty: boolean;
} {
  const where: Prisma.InvoiceWhereInput = {};

  if (filters.status) where.status = filters.status;

  if (filters.minAmountCents !== undefined) {
    where.amountCents = { gte: filters.minAmountCents };
  }

  if (filters.client) {
    where.clientName = { contains: filters.client };
  }

  if (filters.overdue === true) {
    if (filters.status === "paid") {
      return { where, empty: true };
    }
    where.dueDate = { lt: new Date() };
    where.status = "unpaid";
  }

  return { where, empty: false };
}
