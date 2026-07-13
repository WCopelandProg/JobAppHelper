import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./auth";
import { verifyAccessToken } from "../utils/tokens";

// Like requireAuth, but never rejects — attaches userId when a valid
// token is present so routes can personalize results for logged-in users
// while still serving anonymous visitors.
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = verifyAccessToken(header.slice("Bearer ".length));
      req.userId = payload.sub;
      req.userEmail = payload.email;
    } catch {
      // ignore invalid token, treat as anonymous
    }
  }
  next();
}
