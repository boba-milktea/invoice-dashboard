import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { invoicesRouter } from "./routes/invoices.routes.js";
import { kpisRouter } from "./routes/kpis.routes.js";
import { chartsRouter } from "./routes/charts.routes.js";
import { createApiKeyMiddleware } from "./middleware/apiKey.js";

const app = express();
const isDev = process.env.NODE_ENV !== "production";

const corsOptions = {
  origin: [
    "http://localhost:5173",
    process.env.CORS_ORIGIN,
  ].filter((origin): origin is string => Boolean(origin)),
};

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin && isDev) {
        callback(null, true);
        return;
      }
      if (!origin) {
        callback(new Error("Origin required"));
        return;
      }
      if (corsOptions.origin.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
  }),
);
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/health", (_req, res) => {
  res.json({ status: "OK" });
});

app.use("/api", apiLimiter, createApiKeyMiddleware(process.env.API_KEY));
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
    const message = isDev ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  },
);

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  if (process.env.USE_MOCK_DATA === "true") {
    console.log("Using mock data (no database)");
  }
});
