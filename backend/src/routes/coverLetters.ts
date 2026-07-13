import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { coverLetterIdParamSchema, generateCoverLetterSchema, updateCoverLetterSchema } from "./coverLetters.schemas";
import {
  deleteCoverLetterHandler,
  generateCoverLetterHandler,
  getCoverLetterHandler,
  listCoverLettersHandler,
  updateCoverLetterHandler,
} from "../controllers/coverLetterController";

const router = Router();
router.use(requireAuth);

router.get("/", listCoverLettersHandler);
router.post("/generate", validate(generateCoverLetterSchema), generateCoverLetterHandler);
router.get("/:id", validate(coverLetterIdParamSchema), getCoverLetterHandler);
router.put("/:id", validate(updateCoverLetterSchema), updateCoverLetterHandler);
router.delete("/:id", validate(coverLetterIdParamSchema), deleteCoverLetterHandler);

export default router;
