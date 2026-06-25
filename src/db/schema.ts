import {
  pgTable,
  uuid,
  varchar,
  pgEnum,
  text,
  timestamp,
  boolean,
  doublePrecision,
  integer,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const userRankEnum = pgEnum("user_rank", [
  "newbie",
  "member",
  "aspiring_guide",
  "guide",
]);

export const userNearestCityEnum = pgEnum("user_nearest_city", [
  "warszawa",
  "krakow",
  "wroclaw",
  "poznan",
  "gdansk",
  "gdynia",
  "sopot",
  "katowice",
  "szczecin",
  "lodz",
  "bialystok",
  "bydgoszcz",
  "torun",
  "gorzow_wlkp",
  "kielce",
  "lublin",
  "olsztyn",
  "opole",
  "rzeszow",
  "zielona_gora",
]);

export const placeTypeEnum = pgEnum("place_type", [
  "restaurant",
  "bar",
  "cafe",
  "club",
  "other",
]);

export const placeVibeEnum = pgEnum("place_vibe", [
  "elegant",
  "relaxing",
  "family",
  "hipster",
  "modern",
  "retro",
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "needs_clarification",
  "pending",
  "published",
  "resigned_by_user",
]);

export const savedPlaceEnum = pgEnum("saved_place", [
  "favorite",
  "wanna_visit",
  "blacklist",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  rank: userRankEnum("rank").notNull().default("newbie"),
  firstName: varchar("first_name", { length: 50 }),
  lastName: varchar("last_name", { length: 50 }),
  area: userNearestCityEnum("area"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const places = pgTable("places", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerDescription: text("owner_description"),
  type: placeTypeEnum("type").notNull().default("restaurant"),
  vibe: placeVibeEnum("vibe").notNull(),
  petFriendly: boolean("pet_friendly").default(false),
  childMenu: boolean("child_menu").default(false),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const placeReviews = pgTable("place_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  placeId: uuid("place_id")
    .references(() => places.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 100 }),
  body: text("body").notNull(),
  status: reviewStatusEnum("status").notNull().default("pending"),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const visits = pgTable("visits", {
  id: uuid("id").primaryKey().defaultRandom(),
  placeId: uuid("place_id")
    .references(() => places.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  visitDate: timestamp("visit_date").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
  cost: decimal("cost").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  visitId: uuid("visit_id")
    .references(() => visits.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 100 }),
  body: text("body").notNull(),
  status: reviewStatusEnum("status").notNull().default("pending"),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 50 }).notNull().unique(),
  shortDescription: varchar("short_description", { length: 255 }),
  color: varchar("color", { length: 7 }).default("#6b7280"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const placeTags = pgTable("place_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  placeId: uuid("place_id")
    .references(() => places.id, { onDelete: "cascade" })
    .notNull(),
  tagId: uuid("tag_id")
    .references(() => tags.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const savedPlaces = pgTable("saved_places", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  placeId: uuid("place_id")
    .references(() => places.id, { onDelete: "cascade" })
    .notNull(),
  personalNote: varchar("personal_note", { length: 255 }),
  type: savedPlaceEnum("type").notNull().default("favorite"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  reviews: many(reviews),
  visits: many(visits),
  savedPlaces: many(savedPlaces),
  placeReviews: many(placeReviews),
}));

export const tagRelations = relations(tags, ({ many }) => ({
  placeTags: many(placeTags),
}));

export const placeRelations = relations(places, ({ many }) => ({
  savedPlaces: many(savedPlaces),
  visits: many(visits),
  placeReviews: many(placeReviews),
  placeTags: many(placeTags),
}));

export const reviewRelations = relations(reviews, ({ one }) => ({
  visit: one(visits, {
    fields: [reviews.visitId],
    references: [visits.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const visitsRelations = relations(visits, ({ one }) => ({
  user: one(users, {
    fields: [visits.userId],
    references: [users.id],
  }),
  place: one(places, {
    fields: [visits.placeId],
    references: [places.id],
  }),
}));

export const savedPlacesRelations = relations(savedPlaces, ({ one }) => ({
  user: one(users, {
    fields: [savedPlaces.userId],
    references: [users.id],
  }),
  place: one(places, {
    fields: [savedPlaces.placeId],
    references: [places.id],
  }),
}));

export const placeReviewsRelations = relations(placeReviews, ({ one }) => ({
  user: one(users, {
    fields: [placeReviews.userId],
    references: [users.id],
  }),
  place: one(places, {
    fields: [placeReviews.placeId],
    references: [places.id],
  }),
}));

export const placeTagsRelations = relations(placeTags, ({ one }) => ({
  place: one(places, {
    fields: [placeTags.placeId],
    references: [places.id],
  }),
  tag: one(tags, {
    fields: [placeTags.tagId],
    references: [tags.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Place = typeof places.$inferSelect;
export type PlaceReview = typeof placeReviews.$inferSelect;
export type Visit = typeof visits.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type PlaceTag = typeof placeTags.$inferSelect;
export type SavedPlace = typeof savedPlaces.$inferSelect;

export const insertUserSchema = createInsertSchema(users);
export const insertPlaceSchema = createInsertSchema(places);
export const insertPlaceReviewSchema = createInsertSchema(placeReviews);
export const insertVisitSchema = createInsertSchema(visits);
export const insertReviewSchema = createInsertSchema(reviews);
export const insertTagSchema = createInsertSchema(tags);
export const insertPlaceTagSchema = createInsertSchema(placeTags);
export const insertSavedPlaceSchema = createInsertSchema(savedPlaces);

export const selectUserSchema = createSelectSchema(users);
export const selectPlaceSchema = createSelectSchema(places);
export const selectPlaceReviewSchema = createSelectSchema(placeReviews);
export const selectVisitSchema = createSelectSchema(visits);
export const selectReviewSchema = createSelectSchema(reviews);
export const selectTagSchema = createSelectSchema(tags);
export const selectPlaceTagSchema = createSelectSchema(placeTags);
export const selectSavedPlaceSchema = createSelectSchema(savedPlaces);
