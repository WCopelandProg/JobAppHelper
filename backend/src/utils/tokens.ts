import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function generateRefreshTokenValue(): string {
  return crypto.randomBytes(48).toString("hex");
}

export function refreshTokenExpiryDate(): Date {
  const match = /^(\d+)([smhd])$/.exec(env.JWT_REFRESH_EXPIRES_IN);
  const now = Date.now();
  if (!match) return new Date(now + 30 * 24 * 60 * 60 * 1000);
  const value = Number(match[1]);
  const unit = match[2];
  const unitMs: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return new Date(now + value * unitMs[unit]);
}
