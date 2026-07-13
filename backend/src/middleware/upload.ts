import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR, "resumes");
fs.mkdirSync(uploadRoot, { recursive: true });

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const resumeUpload = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(AppError.badRequest("Only PDF or Word documents are allowed for resumes"));
      return;
    }
    cb(null, true);
  },
});

export { uploadRoot };
