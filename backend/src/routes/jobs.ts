import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { jobIdParamSchema, searchJobsSchema } from "./jobs.schemas";
import {
  getJobHandler,
  getRecommendedJobsHandler,
  listSavedJobsHandler,
  saveJobHandler,
  searchJobsHandler,
  syncJobsHandler,
  unsaveJobHandler,
} from "../controllers/jobController";
import { optionalAuth } from "../middleware/optionalAuth";

const router = Router();

// Browsing is public; match scores/personalization kick in when a token is present.
router.get("/", optionalAuth, validate(searchJobsSchema), searchJobsHandler);
router.get("/recommended", requireAuth, getRecommendedJobsHandler);
router.get("/saved", requireAuth, listSavedJobsHandler);
router.post("/sync", requireAuth, syncJobsHandler);
router.get("/:id", optionalAuth, validate(jobIdParamSchema), getJobHandler);
router.post("/:id/save", requireAuth, validate(jobIdParamSchema), saveJobHandler);
router.delete("/:id/save", requireAuth, validate(jobIdParamSchema), unsaveJobHandler);

export default router;
