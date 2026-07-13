import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateProfileSchema } from "./profile.schemas";
import { getProfileHandler, updateProfileHandler } from "../controllers/profileController";

const router = Router();

router.use(requireAuth);
router.get("/", getProfileHandler);
router.put("/", validate(updateProfileSchema), updateProfileHandler);

export default router;
