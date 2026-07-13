import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import { prisma } from "../utils/prisma";
import { AppError } from "../utils/AppError";

export const getProfileHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const profile = await prisma.profile.findUnique({ where: { userId: req.userId! } });
  if (!profile) throw AppError.notFound("Profile not found");
  res.json({ profile });
});

export const updateProfileHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const profile = await prisma.profile.upsert({
    where: { userId: req.userId! },
    create: { userId: req.userId!, ...req.body },
    update: req.body,
  });
  res.json({ profile });
});
