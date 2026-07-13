import { z } from "zod";
import { ApplicationStatus } from "@prisma/client";

export const createApplicationSchema = z.object({
  body: z.object({
    jobId: z.string().uuid(),
    resumeId: z.string().uuid().optional(),
    status: z.nativeEnum(ApplicationStatus).optional(),
    notes: z.string().max(4000).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateApplicationSchema = z.object({
  body: z.object({
    status: z.nativeEnum(ApplicationStatus).optional(),
    resumeId: z.string().uuid().nullable().optional(),
    notes: z.string().max(4000).optional(),
    appliedAt: z.coerce.date().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

export const applicationIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});
