import { z } from "zod";
import { JobCategory, RemotePreference } from "@prisma/client";

export const updateProfileSchema = z.object({
  body: z.object({
    headline: z.string().max(200).optional(),
    location: z.string().max(200).optional(),
    remotePref: z.nativeEnum(RemotePreference).optional(),
    yearsExperience: z.coerce.number().int().min(0).max(60).optional(),
    targetRoles: z.array(z.string().max(100)).max(20).optional(),
    targetCategories: z.array(z.nativeEnum(JobCategory)).max(20).optional(),
    skills: z.array(z.string().max(50)).max(50).optional(),
    interests: z.array(z.string().max(50)).max(50).optional(),
    linkedinUrl: z.string().url().max(300).optional().or(z.literal("")),
    githubUrl: z.string().url().max(300).optional().or(z.literal("")),
    portfolioUrl: z.string().url().max(300).optional().or(z.literal("")),
    phone: z.string().max(30).optional(),
    bio: z.string().max(2000).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
