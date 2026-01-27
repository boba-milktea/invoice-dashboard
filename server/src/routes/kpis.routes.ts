import { Router } from "express";
import { getKpis } from "../services/kpi.service.js";
import { parseInvoiceFilters } from "../utils/filters.js";

export const kpisRouter = Router();

kpisRouter.get("/", async (req, res, next) => {
  try {
    const parsed = parseInvoiceFilters(req.query as Record<string, unknown>);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

    const kpis = await getKpis(parsed.filters);
    return res.json(kpis);
  } catch (error) {
    return next(error);
  }
});
