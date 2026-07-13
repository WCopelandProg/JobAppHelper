import { z } from "zod";

export const generateCoverLetterSchema = z.object({
  body: z.object({
    jobId: z.string().uuid(),
    resumeId: z.string().uuid().optional(),
    applicationId: z.string().uuid().optional(),
    tone: z.enum(["professional", "enthusiastic", "concise", "formal"]).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateCoverLetterSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(8000),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

export const coverLetterIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});
