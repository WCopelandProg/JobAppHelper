import { z } from "zod";
import { JobCategory, RemotePreference, SeniorityLevel } from "@prisma/client";

export const searchJobsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    q: z.string().max(200).optional(),
    category: z.nativeEnum(JobCategory).optional(),
    seniority: z.nativeEnum(SeniorityLevel).optional(),
    remoteType: z.nativeEnum(RemotePreference).optional(),
    location: z.string().max(200).optional(),
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(50).optional(),
    sort: z.enum(["recent", "match"]).optional(),
  }),
});

export const jobIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});
