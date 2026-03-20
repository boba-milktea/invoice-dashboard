import "dotenv/config";
import express from "express";
import cors from "cors";
import { invoicesRouter } from "./routes/invoices.routes.js";
import { kpisRouter } from "./routes/kpis.routes.js";
import { chartsRouter } from "./routes/charts.routes.js";

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    process.env.CORS_ORIGIN,
  ].filter((origin): origin is string => Boolean(origin)),
};

app.use(
  cors({
    origin: (origin, callback) => {
        if (!origin || corsOptions.origin.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
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
