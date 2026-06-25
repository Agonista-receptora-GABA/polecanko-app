import { db } from "./connection.ts";
import {
  users,
  places,
  placeReviews,
  visits,
  reviews,
  tags,
  placeTags,
  savedPlaces,
} from "./schema.ts";

export async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    console.log("🧹 Clearing existing data...");
    await db.delete(users);
    await db.delete(places);
    await db.delete(placeReviews);
    await db.delete(visits);
    await db.delete(reviews);
    await db.delete(tags);
    await db.delete(placeTags);
    await db.delete(savedPlaces);

    console.log("👯 Creating demo users...");
    const [demoUser] = await db
      .insert(users)
      .values({
        email: "belowelo@gmail.com",
        username: "didnotwant",
        password: "passw0rd",
        firstName: "Adrian",
        lastName: "Niechciał",
        area: "warszawa",
      })
      .returning();

    console.log("🍴 Creating demo places...");
    const [romaPlace] = await db
      .insert(places)
      .values({
        name: "Roma a Roma",
        vibe: "relaxing",
        childMenu: true,
        latitude: 52.321596073706885,
        longitude: 20.970145513017776,
      })
      .returning();

    console.log("📝 Creating place reviews...");
    const [romaOneReview] = await db
      .insert(placeReviews)
      .values({
        userId: demoUser.id,
        placeId: romaPlace.id,
        title: "Idealne miejsce w okolicy",
        body: "Lubimy tutaj przychodzić.",
        status: "published",
        rating: 5,
      })
      .returning();

    console.log("📍 Creating visits...");
    const [romaVisit] = await db
      .insert(visits)
      .values({
        placeId: romaPlace.id,
        userId: demoUser.id,
        visitDate: new Date("2026-06-21"),
        cost: "89.23",
      })
      .returning();

    console.log("📝 Creating reviews...");
    const [romaVisitReview] = await db
      .insert(reviews)
      .values({
        userId: demoUser.id,
        visitId: romaVisit.id,
        title: "Było super",
        body: "Na pewno tu wrócimy, ładny wystrój itp.",
        status: "published",
        rating: 4,
      })
      .returning();

    console.log("🏷️ Creating tags...");
    const [pizzaTag] = await db
      .insert(tags)
      .values({
        title: "Pizza",
      })
      .returning();
    await db.insert(placeTags).values({
      placeId: romaPlace.id,
      tagId: pizzaTag.id,
    });

    console.log("⭐ Creating saved places...");
    const [demoUserRomaFavorite] = await db
      .insert(savedPlaces)
      .values({
        userId: demoUser.id,
        placeId: romaPlace.id,
        personalNote: "Dobra miejscówka w okolicy",
        type: "favorite",
      })
      .returning();

    console.log("✅ DB seeded successfully");
    console.log("Demo user credentials:");
    console.log(`email: ${demoUser.email}`);
    console.log(`username: ${demoUser.username}`);
    console.log(`password: ${demoUser.password}`);
  } catch (e) {
    console.error("❌ DB seed failed", e);
    process.exit(1);
  }
}

if (import.meta.url == `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seed;
