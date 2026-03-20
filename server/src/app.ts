import "dotenv/config";
import express from "express";
import cors from "cors";
import { invoicesRouter } from "./routes/invoices.routes.js";
import { kpisRouter } from "./routes/kpis.routes.js";
import { chartsRouter } from "./routes/charts.routes.js";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
}));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "OK" });
});

app.use("/api/invoices", invoicesRouter);
app.use("/api/kpis", kpisRouter);
app.use("/api/charts", chartsRouter);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ error: err.message });
  },
);

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
