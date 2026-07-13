import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { applicationIdParamSchema, createApplicationSchema, updateApplicationSchema } from "./applications.schemas";
import {
  createApplicationHandler,
  deleteApplicationHandler,
  getApplicationStatsHandler,
  listApplicationsHandler,
  updateApplicationHandler,
} from "../controllers/applicationController";

const router = Router();
router.use(requireAuth);

router.get("/", listApplicationsHandler);
router.get("/stats", getApplicationStatsHandler);
router.post("/", validate(createApplicationSchema), createApplicationHandler);
router.patch("/:id", validate(updateApplicationSchema), updateApplicationHandler);
router.delete("/:id", validate(applicationIdParamSchema), deleteApplicationHandler);

export default router;
