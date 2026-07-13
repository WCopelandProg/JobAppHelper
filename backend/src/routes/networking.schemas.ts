import { z } from "zod";
import { NetworkingLeadType } from "@prisma/client";

export const suggestSearchesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    company: z.string().min(1).max(200),
  }),
});

export const createLeadSchema = z.object({
  body: z.object({
    company: z.string().min(1).max(200),
    name: z.string().max(200).optional(),
    role: z.string().max(200).optional(),
    type: z.nativeEnum(NetworkingLeadType).optional(),
    linkedinUrl: z.string().url().max(300).optional().or(z.literal("")),
    email: z.string().email().optional().or(z.literal("")),
    notes: z.string().max(2000).optional(),
    searchUrl: z.string().url().max(500).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateLeadSchema = z.object({
  body: z.object({
    name: z.string().max(200).optional(),
    role: z.string().max(200).optional(),
    type: z.nativeEnum(NetworkingLeadType).optional(),
    linkedinUrl: z.string().url().max(300).optional().or(z.literal("")),
    email: z.string().email().optional().or(z.literal("")),
    notes: z.string().max(2000).optional(),
    contacted: z.boolean().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

export const leadIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});
