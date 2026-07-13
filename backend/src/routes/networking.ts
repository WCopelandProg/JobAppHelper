import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createLeadSchema, leadIdParamSchema, suggestSearchesSchema, updateLeadSchema } from "./networking.schemas";
import {
  createLeadHandler,
  deleteLeadHandler,
  listLeadsHandler,
  suggestSearchesHandler,
  updateLeadHandler,
} from "../controllers/networkingController";

const router = Router();
router.use(requireAuth);

router.get("/suggestions", validate(suggestSearchesSchema), suggestSearchesHandler);
router.get("/leads", listLeadsHandler);
router.post("/leads", validate(createLeadSchema), createLeadHandler);
router.patch("/leads/:id", validate(updateLeadSchema), updateLeadHandler);
router.delete("/leads/:id", validate(leadIdParamSchema), deleteLeadHandler);

export default router;
