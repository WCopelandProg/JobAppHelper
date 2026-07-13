import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma";
import { AppError } from "../utils/AppError";
import {
  generateRefreshTokenValue,
  refreshTokenExpiryDate,
  signAccessToken,
  verifyAccessToken,
} from "../utils/tokens";

const SALT_ROUNDS = 12;

interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  school?: string;
  gradYear?: number;
}

async function issueTokenPair(userId: string, email: string) {
  const accessToken = signAccessToken({ sub: userId, email });
  const refreshToken = generateRefreshTokenValue();

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: refreshTokenExpiryDate(),
    },
  });

  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) {
    throw AppError.conflict("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      fullName: input.fullName,
      school: input.school,
      gradYear: input.gradYear,
      profile: { create: {} },
    },
    include: { profile: true },
  });

  const tokens = await issueTokenPair(user.id, user.email);
  return { user: sanitizeUser(user), ...tokens };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { profile: true },
  });
  if (!user) throw AppError.unauthorized("Invalid email or password");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw AppError.unauthorized("Invalid email or password");

  const tokens = await issueTokenPair(user.id, user.email);
  return { user: sanitizeUser(user), ...tokens };
}

export async function refresh(refreshTokenValue: string) {
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshTokenValue } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw AppError.unauthorized("Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user) throw AppError.unauthorized("Invalid refresh token");

  // Rotate: revoke old, issue new.
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
  const tokens = await issueTokenPair(user.id, user.email);
  return tokens;
}

export async function logout(refreshTokenValue: string) {
  await prisma.refreshToken.updateMany({
    where: { token: refreshTokenValue },
    data: { revoked: true },
  });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!user) throw AppError.notFound("User not found");
  return sanitizeUser(user);
}

export function sanitizeUser<T extends { passwordHash?: string }>(user: T) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// Re-exported for controllers that need to validate an access token outside middleware (rare).
export { verifyAccessToken };
