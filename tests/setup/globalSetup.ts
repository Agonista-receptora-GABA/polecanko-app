import { execSync } from "child_process";
import { sql } from "drizzle-orm";
import { db } from "../../src/db/connection.ts";
import {
  users,
  places,
  placeReviews,
  visits,
  reviews,
  tags,
  placeTags,
  savedPlaces,
} from "../../src/db/schema.ts";

async function cleanUpTables() {
  await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS ${places} CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS ${placeReviews} CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS ${visits} CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS ${reviews} CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS ${placeTags} CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS ${savedPlaces} CASCADE`);
}

export default async function setup() {
  console.log("Setting up the test db");
  try {
    await cleanUpTables();

    console.log("Pushing schema using drizzle-kit");
    execSync(
      `npx drizzle-kit push --url="${process.env.DATABASE_URL}" --schema="./src/db/schema.ts" --dialect="postgres"`,
      { stdio: "inherit", cwd: process.cwd() },
    );

    console.log("Test db created");
  } catch (e) {
    console.error("Failed to setup test db", e);
    throw e;
  }

  return async () => {
    try {
      await cleanUpTables();
      process.exit(0);
    } catch (e) {
      console.error("Failed to cleanup test db", e);
      throw e;
    }
  };
}
