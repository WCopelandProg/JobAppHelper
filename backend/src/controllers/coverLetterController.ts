import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../utils/AppError";
import { prisma } from "../utils/prisma";
import { generateCoverLetter } from "../services/coverLetterService";

export const generateCoverLetterHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { jobId, resumeId, applicationId, tone } = req.body;

  const [user, profile, job, resume] = await Promise.all([
    prisma.user.findUnique({ where: { id: req.userId! } }),
    prisma.profile.findUnique({ where: { userId: req.userId! } }),
    prisma.job.findUnique({ where: { id: jobId } }),
    resumeId ? prisma.resume.findUnique({ where: { id: resumeId } }) : prisma.resume.findFirst({ where: { userId: req.userId!, isPrimary: true } }),
  ]);

  if (!user) throw AppError.unauthorized();
  if (!job) throw AppError.notFound("Job not found");
  if (resume && resume.userId !== req.userId) throw AppError.forbidden("Resume does not belong to this user");

  const { content, method } = await generateCoverLetter({ user, profile, job, resume, tone });

  const coverLetter = await prisma.coverLetter.create({
    data: {
      userId: req.userId!,
      jobId,
      resumeId: resume?.id,
      applicationId,
      content,
      method,
      tone: tone ?? "professional",
    },
    include: { job: true },
  });

  res.status(201).json({ coverLetter });
});

export const listCoverLettersHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const coverLetters = await prisma.coverLetter.findMany({
    where: { userId: req.userId! },
    include: { job: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ coverLetters });
});

export const getCoverLetterHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const coverLetter = await requireOwnedCoverLetter(req);
  res.json({ coverLetter });
});

export const updateCoverLetterHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await requireOwnedCoverLetter(req);
  const coverLetter = await prisma.coverLetter.update({
    where: { id: req.params.id },
    data: { content: req.body.content },
  });
  res.json({ coverLetter });
});

export const deleteCoverLetterHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await requireOwnedCoverLetter(req);
  await prisma.coverLetter.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

async function requireOwnedCoverLetter(req: AuthenticatedRequest) {
  const coverLetter = await prisma.coverLetter.findUnique({ where: { id: req.params.id }, include: { job: true } });
  if (!coverLetter || coverLetter.userId !== req.userId) throw AppError.notFound("Cover letter not found");
  return coverLetter;
}
