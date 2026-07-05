import { Router } from "express";
import { z } from "zod";
import { insertReviewSchema } from "../db/schema.ts";
import { validateBody, validateParams } from "../middleware/validation.ts";
import { authenticateToken } from "../middleware/auth.ts";
import {
  createReview,
  getUserReviewsWithVisits,
  updateReview,
} from "../controllers/reviewController.ts";

const upvoteReviewSchema = z.object({
  id: z.string().min(1).max(10),
});

const router = Router();

router.use(authenticateToken);

router.get("/", getUserReviewsWithVisits);

router.get("/:id", (req, res) => {
  res.json({ message: `got one review: ${req.params.id}` });
});

router.post("/", validateBody(insertReviewSchema), createReview);

router.delete("/:id", (req, res) => {
  res.json({ message: `deleted review: ${req.params.id}` });
});

router.patch("/:id", updateReview);

router.post("/:id/upvote", validateParams(upvoteReviewSchema), (req, res) => {
  res.status(201).json({ message: `upvoted review: ${req.params.id}` });
});

export default router;
