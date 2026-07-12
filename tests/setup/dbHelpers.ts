import { db } from "../../src/db/connection.ts";
import {
  users,
  places,
  placeReviews,
  type NewUser,
  type NewPlace,
  type NewPlaceReview,
} from "../../src/db/schema.ts";
import { generateToken } from "../../src/utils/jwt.ts";
import { hashPassword } from "../../src/utils/password.ts";

export async function createTestUser(userData: Partial<NewUser> = {}) {
  const defaultData: NewUser = {
    email: `test-${Date.now()}-${Math.random()}@example.com`,
    username: `testuser-${Date.now()}-${Math.random()}`,
    password: "adminpassword1234",
    firstName: "Test",
    lastName: "User",
    ...userData,
  };

  const hashedPassword = await hashPassword(defaultData.password);
  const [user] = await db
    .insert(users)
    .values({
      ...defaultData,
      password: hashedPassword,
    })
    .returning();

  const token = await generateToken({
    id: user.id,
    email: user.email,
    username: user.username,
  });

  return { token, user, rawPassword: defaultData.password };
}

export async function createTestPlace(placeData: Partial<NewPlace> = {}) {
  const defaultData: NewPlace = {
    name: `Test place ${Date.now()}`,
    vibe: "hipster",
    ownerDescription: "A test place",
    type: "restaurant",
    petFriendly: true,
    childMenu: false,
    latitude: 52.2663703,
    longitude: 20.9642021,
    ...placeData,
  };

  const [place] = await db
    .insert(places)
    .values({
      ...defaultData,
    })
    .returning();

  return place;
}

export async function createTestPlaceReview(
  userId: string,
  placeId: string,
  placeReviewData: Partial<NewPlaceReview> = {},
) {
  const defaultData: Omit<NewPlaceReview, "userId" | "placeId"> = {
    title: `Test place review ${Date.now()}`,
    body: "Lorem ipsum blah blah",
    status: "published",
    rating: 3,
    ...placeReviewData,
  };

  const [placeReview] = await db.insert(placeReviews).values({
    userId,
    placeId,
    ...defaultData,
  });

  return placeReview;
}

export async function cleanupDatabase() {
  await db.delete(users);
  await db.delete(places);
  await db.delete(placeReviews);
}
