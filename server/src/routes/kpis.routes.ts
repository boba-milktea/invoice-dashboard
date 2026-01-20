import { Router } from "express";
import { getKpis } from "../services/kpi.service.js";

export const kpisRouter = Router();

kpisRouter.get("/", async (_req, res, next) => {
  try {
    const kpis = await getKpis();
    res.json(kpis);
  } catch (error) {
    next(error);
  }
});
