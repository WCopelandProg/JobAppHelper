import { ApplicationStatus } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { AppError } from "../utils/AppError";

export async function listApplications(userId: string) {
  return prisma.application.findMany({
    where: { userId },
    include: { job: true, resume: { select: { id: true, fileName: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createApplication(userId: string, input: { jobId: string; resumeId?: string; status?: ApplicationStatus; notes?: string }) {
  const job = await prisma.job.findUnique({ where: { id: input.jobId } });
  if (!job) throw AppError.notFound("Job not found");

  const status = input.status ?? ApplicationStatus.WISHLIST;

  const application = await prisma.application.upsert({
    where: { userId_jobId: { userId, jobId: input.jobId } },
    create: {
      userId,
      jobId: input.jobId,
      resumeId: input.resumeId,
      status,
      notes: input.notes,
      appliedAt: status === ApplicationStatus.APPLIED ? new Date() : null,
      statusHistory: { create: { status } },
    },
    update: {
      resumeId: input.resumeId,
      notes: input.notes ?? undefined,
    },
    include: { job: true },
  });

  return application;
}

export async function updateApplication(
  userId: string,
  applicationId: string,
  input: { status?: ApplicationStatus; resumeId?: string | null; notes?: string; appliedAt?: Date },
) {
  const existing = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!existing || existing.userId !== userId) throw AppError.notFound("Application not found");

  const statusChanged = input.status && input.status !== existing.status;

  const application = await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: input.status,
      resumeId: input.resumeId,
      notes: input.notes,
      appliedAt:
        input.appliedAt ??
        (input.status === ApplicationStatus.APPLIED && !existing.appliedAt ? new Date() : undefined),
      statusHistory: statusChanged ? { create: { status: input.status! } } : undefined,
    },
    include: { job: true, statusHistory: { orderBy: { createdAt: "asc" } } },
  });

  return application;
}

export async function deleteApplication(userId: string, applicationId: string) {
  const existing = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!existing || existing.userId !== userId) throw AppError.notFound("Application not found");
  await prisma.application.delete({ where: { id: applicationId } });
}

export async function getApplicationStats(userId: string) {
  const grouped = await prisma.application.groupBy({
    by: ["status"],
    where: { userId },
    _count: { _all: true },
  });

  const stats: Record<string, number> = {};
  for (const g of grouped) stats[g.status] = g._count._all;
  return stats;
}
