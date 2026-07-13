import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { verifyAccessToken } from "../utils/tokens";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(AppError.unauthorized("Missing or invalid Authorization header"));
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    req.userEmail = payload.email;
    next();
  } catch {
    next(AppError.unauthorized("Invalid or expired access token"));
  }
}
