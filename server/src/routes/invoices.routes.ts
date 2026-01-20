import { Router } from "express";
import { parseSortParams } from "../utils/sort.js";
import { listInvoice } from "../services/invoice.service.js";

export const invoicesRouter = Router();

invoicesRouter.get("/", async (req, res, next) => {
  try {
    const { sort, order } = parseSortParams(
      req.query as Record<string, unknown>,
    );
    const invoices = await listInvoice(sort, order);
    res.json(invoices);
  } catch (error) {
    next(error);
  }
});
