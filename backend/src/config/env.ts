import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_ACCESS_SECRET: z.string().min(10, "JWT_ACCESS_SECRET must be set to a strong secret"),
  JWT_REFRESH_SECRET: z.string().min(10, "JWT_REFRESH_SECRET must be set to a strong secret"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  ANTHROPIC_API_KEY: z.string().optional().default(""),
  UPLOAD_DIR: z.string().default("uploads"),
  MAX_UPLOAD_MB: z.coerce.number().default(5),
  JOB_SYNC_CRON: z.string().default("0 * * * *"),
  JOB_SYNC_ON_BOOT: z
    .string()
    .default("true")
    .transform((v) => v === "true"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
