import { Router } from "express";
import { login, register, me } from "../controllers/authController.ts";
import { authenticateToken } from "../middleware/auth.ts";
import { validateBody } from "../middleware/validation.ts";
import { insertUserSchema } from "../db/schema.ts";
import { z } from "zod";
import { noCache } from "../middleware/noCache.ts";

const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const router = Router();

router.post("/register", validateBody(insertUserSchema), register);

router.post("/login", validateBody(loginSchema), login);

router.get("/me", authenticateToken, noCache, me);

export default router;
