import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../middleware/validation.ts";

const createReviewSchema = z.object({
  message: z.string().min(5),
  rating: z.number().min(1).max(5),
});

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "reviews" });
});

router.get("/:id", (req, res) => {
  res.json({ message: `got one review: ${req.params.id}` });
});

router.post("/", validateBody(createReviewSchema), (req, res) => {
  res.status(201).json({ message: "created review" });
});

router.delete("/:id", (req, res) => {
  res.json({ message: `deleted review: ${req.params.id}` });
});

router.post("/:id/upvote", (req, res) => {
  res.status(201).json({ message: `upvoted review: ${req.params.id}` });
});

export default router;
