import { Router } from "express";
import { parseSortParams } from "../utils/sort.js";
import { listInvoices } from "../services/invoice.service.js";
import { parseInvoiceFilters } from "../utils/filters.js";

export const invoicesRouter = Router();

invoicesRouter.get("/", async (req, res, next) => {
  try {
    const { sort, order } = parseSortParams(
      req.query as Record<string, unknown>,
    );

    const parsed = parseInvoiceFilters(req.query as Record<string, unknown>);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

    const invoices = await listInvoices({
      sort,
      order,
      filters: parsed.filters,
    });

    return res.json(invoices);
  } catch (error) {
    return next(error);
  }
});
