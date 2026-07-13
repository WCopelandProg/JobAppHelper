import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../utils/AppError";
import { prisma } from "../utils/prisma";
import * as jobService from "../services/jobService";

export const searchJobsHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  let profile = null;
  if (req.userId) {
    profile = await prisma.profile.findUnique({ where: { userId: req.userId } });
  }
  const result = await jobService.searchJobs(req.query as jobService.JobSearchParams, profile);
  res.json(result);
});

export const getJobHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const job = await jobService.getJobById(req.params.id);
  if (!job) throw AppError.notFound("Job not found");

  let matchScore: number | null = null;
  if (req.userId) {
    const profile = await prisma.profile.findUnique({ where: { userId: req.userId } });
    if (profile) matchScore = jobService.scoreJobForProfile(job, profile);
  }

  res.json({ job, matchScore });
});

export const getRecommendedJobsHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const profile = await prisma.profile.findUnique({ where: { userId: req.userId! } });
  if (!profile) throw AppError.notFound("Complete your profile to get recommendations");
  const recommendations = await jobService.getRecommendedJobs(profile, 12);
  res.json({ recommendations });
});

export const syncJobsHandler = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const results = await jobService.syncAllProviders();
  res.json({ results });
});

export const saveJobHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const job = await jobService.getJobById(req.params.id);
  if (!job) throw AppError.notFound("Job not found");

  const saved = await prisma.savedJob.upsert({
    where: { userId_jobId: { userId: req.userId!, jobId: job.id } },
    create: { userId: req.userId!, jobId: job.id, notes: req.body?.notes },
    update: { notes: req.body?.notes },
  });
  res.status(201).json({ savedJob: saved });
});

export const unsaveJobHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await prisma.savedJob.deleteMany({ where: { userId: req.userId!, jobId: req.params.id } });
  res.status(204).send();
});

export const listSavedJobsHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const saved = await prisma.savedJob.findMany({
    where: { userId: req.userId! },
    include: { job: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ savedJobs: saved });
});
