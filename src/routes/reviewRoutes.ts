import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "reviews" });
});

router.get("/:id", (req, res) => {
  res.json({ message: `got one review: ${req.params.id}` });
});

router.post("/", (req, res) => {
  res.status(201).json({ message: "created review" });
});

router.delete("/:id", (req, res) => {
  res.json({ message: `deleted review: ${req.params.id}` });
});

router.post("/:id/upvote", (req, res) => {
  res.status(201).json({ message: `upvoted review: ${req.params.id}` });
});

export default router;
