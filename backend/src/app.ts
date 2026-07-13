import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import jobRoutes from "./routes/jobs";
import resumeRoutes from "./routes/resumes";
import applicationRoutes from "./routes/applications";
import coverLetterRoutes from "./routes/coverLetters";
import networkingRoutes from "./routes/networking";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api", apiLimiter);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/jobs", jobRoutes);
  app.use("/api/resumes", resumeRoutes);
  app.use("/api/applications", applicationRoutes);
  app.use("/api/cover-letters", coverLetterRoutes);
  app.use("/api/networking", networkingRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
