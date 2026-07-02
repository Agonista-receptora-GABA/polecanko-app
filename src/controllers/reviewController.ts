import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.ts";
import { db } from "../db/connection.ts";
import { reviews } from "../db/schema.ts";
import { eq, and, desc, inArray } from "drizzle-orm";

export async function createReview(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, body, status, rating, visitId } = req.body;

    const result = await db.transaction(async function handleTransaction(tx) {
      const [newReview] = await tx
        .insert(reviews)
        .values({
          // TODO: Rethink what to do with the userId: because it should be the
          //  same as the one assigned to the visit. Remove from that?
          //  Remove from the visit? Keep in both, but validate?
          userId: req.user!.id,
          visitId,
          title,
          body,
          status,
          rating,
        })
        .returning();

      return newReview;
    });

    res.status(201).json({
      message: "Review created",
      review: result,
    });
  } catch (e) {
    console.error("Create review error", e);
    res.status(500).json({ error: "Failed to create review" });
  }
}
