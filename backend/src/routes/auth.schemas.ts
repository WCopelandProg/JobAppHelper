import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("A valid email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    fullName: z.string().min(1, "Full name is required").max(120),
    school: z.string().max(200).optional(),
    gradYear: z.coerce.number().int().min(1950).max(2100).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "refreshToken is required"),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
