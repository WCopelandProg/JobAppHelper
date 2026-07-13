import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schemas";
import {
  loginHandler,
  logoutHandler,
  meHandler,
  refreshHandler,
  registerHandler,
} from "../controllers/authController";

const router = Router();

// Modest brute-force protection on credential endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, validate(registerSchema), registerHandler);
router.post("/login", authLimiter, validate(loginSchema), loginHandler);
router.post("/refresh", authLimiter, validate(refreshSchema), refreshHandler);
router.post("/logout", validate(refreshSchema), logoutHandler);
router.get("/me", requireAuth, meHandler);

export default router;
