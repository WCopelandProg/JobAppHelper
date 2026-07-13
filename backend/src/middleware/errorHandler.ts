import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.originalUrl}` } });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { message: err.message, details: err.details },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: { message: "Validation failed", details: err.flatten() },
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        error: { message: "A record with these unique fields already exists", details: err.meta },
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: { message: "Record not found" } });
    }
  }

  console.error("Unhandled error:", err);
  const message = err instanceof Error ? err.message : "Internal server error";
  return res.status(500).json({ error: { message: process.env.NODE_ENV === "production" ? "Internal server error" : message } });
}
