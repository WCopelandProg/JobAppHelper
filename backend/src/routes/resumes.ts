import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { resumeUpload } from "../middleware/upload";
import {
  deleteResumeHandler,
  downloadResumeHandler,
  getResumeHandler,
  listResumesHandler,
  setPrimaryResumeHandler,
  uploadResumeHandler,
} from "../controllers/resumeController";

const router = Router();
router.use(requireAuth);

router.get("/", listResumesHandler);
router.post("/", resumeUpload.single("resume"), uploadResumeHandler);
router.get("/:id", getResumeHandler);
router.get("/:id/download", downloadResumeHandler);
router.post("/:id/primary", setPrimaryResumeHandler);
router.delete("/:id", deleteResumeHandler);

export default router;
