import { Response } from "express";
import fs from "fs/promises";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../utils/AppError";
import { prisma } from "../utils/prisma";
import { extractSkillsFromText, parseResumeFile } from "../services/resumeParserService";

export const uploadResumeHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) throw AppError.badRequest("No resume file was uploaded");

  // Text extraction is a best-effort enhancement — an unusual/corrupted PDF
  // producer shouldn't block the user from storing and using their resume.
  let parsedText = "";
  try {
    parsedText = await parseResumeFile(req.file.path, req.file.mimetype);
  } catch (err) {
    console.warn(`Resume text extraction failed for ${req.file.originalname}:`, err instanceof Error ? err.message : err);
  }
  const parsedSkills = extractSkillsFromText(parsedText);

  const existingCount = await prisma.resume.count({ where: { userId: req.userId! } });

  const resume = await prisma.resume.create({
    data: {
      userId: req.userId!,
      fileName: req.file.originalname,
      storagePath: req.file.path,
      mimeType: req.file.mimetype,
      fileSizeBytes: req.file.size,
      parsedText: parsedText || null,
      parsedSkills,
      isPrimary: existingCount === 0,
    },
  });

  res.status(201).json({ resume: sanitizeResume(resume) });
});

export const listResumesHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const resumes = await prisma.resume.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: "desc" },
  });
  res.json({ resumes: resumes.map(sanitizeResume) });
});

export const getResumeHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const resume = await requireOwnedResume(req);
  res.json({ resume });
});

export const deleteResumeHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const resume = await requireOwnedResume(req);
  await prisma.resume.delete({ where: { id: resume.id } });
  await fs.unlink(resume.storagePath).catch(() => undefined);
  res.status(204).send();
});

export const setPrimaryResumeHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const resume = await requireOwnedResume(req);
  await prisma.$transaction([
    prisma.resume.updateMany({ where: { userId: req.userId! }, data: { isPrimary: false } }),
    prisma.resume.update({ where: { id: resume.id }, data: { isPrimary: true } }),
  ]);
  res.json({ success: true });
});

export const downloadResumeHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const resume = await requireOwnedResume(req);
  res.download(resume.storagePath, resume.fileName);
});

async function requireOwnedResume(req: AuthenticatedRequest) {
  const resume = await prisma.resume.findUnique({ where: { id: req.params.id } });
  if (!resume || resume.userId !== req.userId) throw AppError.notFound("Resume not found");
  return resume;
}

function sanitizeResume<T extends { storagePath?: string }>(resume: T) {
  const { storagePath, ...rest } = resume;
  return rest;
}
