import { Router } from "express";
import { getPaidUnpaidCounts } from "../services/chart.service.js";

export const chartsRouter = Router();

chartsRouter.get("/paid-unpaid", async (_req, res, next) => {
  try {
    const data = await getPaidUnpaidCounts();
    res.json(data);
  } catch (error) {
    next(error);
  }
});
