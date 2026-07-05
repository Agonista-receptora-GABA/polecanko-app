import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.ts";
import { db } from "../db/connection.ts";
import {
  reviews,
  type Place,
  type Review,
  type ReviewWithVisitAndPlace,
  type Visit,
} from "../db/schema.ts";
import { eq, and, desc, inArray } from "drizzle-orm";
import {
  formatBoolean,
  formatDate,
  formatString,
  type CustomDate,
} from "../utils/response.ts";

export type ReviewResponse = {
  title: Review["title"];
  body: Review["body"];
  status: Review["status"];
  rating: Review["rating"];
  cost: Visit["cost"] | null;
  visitDate: CustomDate | null;
  confirmed: boolean | null;
  placeName: Place["name"] | null;
};

export async function createReview(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, body, status, rating, visitId } = req.body;

    if (req.user!.id !== visitId) {
      console.warn(
        `Violation: User of ID ${req.user!.id} wanted to add review to a visit which isn't their own. Visit ID: ${visitId}`,
      );
      return res.status(401).end();
    }

    const result = await db.transaction(async function handleTransaction(tx) {
      const [newReview] = await tx
        .insert(reviews)
        .values({
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

export async function getUserReviewsWithVisits(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userReviewsWithVisit: ReviewWithVisitAndPlace[] =
      await db.query.reviews.findMany({
        where: eq(reviews.userId, req.user!.id),
        with: {
          visit: {
            with: {
              place: true,
            },
          },
        },
        orderBy: [desc(reviews.createdAt)],
      });

    const reviewsWithVisit: ReviewResponse[] = userReviewsWithVisit.map(
      (review) => ({
        title: review.title,
        body: review.body,
        status: review.status,
        rating: review.rating,
        cost: formatString(review?.visit?.cost),
        visitDate: formatDate(review?.visit?.visitDate),
        confirmed: formatBoolean(review?.visit?.confirmedAt),
        placeName: formatString(review?.visit?.place?.name),
      }),
    );

    res.status(200).json(reviewsWithVisit);
  } catch (e) {
    console.error("Error getting user's reviews", e);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
}

export async function updateReview(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.params.id;
    const { ...updates } = req.body;

    const result = await db.transaction(async (tx) => {
      const [updatedReview] = await tx
        .update(reviews)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(reviews.id, id), eq(reviews.userId, req.user!.id)))
        .returning();

      if (!updatedReview) {
        console.error(
          `Couldn't update review of ID ${id} by user of ID ${req.user!.id}`,
        );
        return res.status(401).end();
      }

      return updatedReview;
    });

    res.json({
      message: "Review was updated",
      review: result,
    });
  } catch (e) {
    console.error("Update review error", e);
    res.status(500).json({ error: "Failed to update review" });
  }
}
