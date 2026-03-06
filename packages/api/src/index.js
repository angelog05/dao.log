import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import postsRouter from "./routes/posts.js";
import logger from "./lib/logger.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan('[:date[iso]] :method :url :status :res[content-length]b - :response-time ms'));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "dao-log-api" });
});

// Routes
app.use("/api/posts", postsRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message || err}`);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  logger.info(`dao-log API running on http://localhost:${PORT}`);
  logger.info(`DB driver: ${process.env.DB_DRIVER || 'sqlite'}`);
});
